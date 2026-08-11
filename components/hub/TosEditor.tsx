"use client";

import { useCallback, useEffect, useRef, useState, type ClipboardEvent } from "react";
import { isTosHtmlEmpty, markdownToHtml, sanitizeTosHtml } from "@/lib/tos-html";

const HEADING_TAGS = new Set(["H1", "H2", "H3"]);

type ToolId =
  | "bold"
  | "italic"
  | "underline"
  | "strikeThrough"
  | "header"
  | "ul"
  | "ol";

type SectionTemplate = {
  id: string;
  label: string;
  html: string;
};

const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: "payment",
    label: "Payment",
    html: `<h2>Payment</h2><ul><li>A deposit is required before work begins.</li><li>The remaining balance is due before final files are delivered.</li><li>Prices are listed on my prices page and may change for future slots.</li></ul>`,
  },
  {
    id: "revisions",
    label: "Revisions",
    html: `<h2>Revisions</h2><ul><li>Each commission includes a set number of revision rounds (see your invoice / agreement).</li><li>Major changes after approval may be quoted as an add-on.</li><li>Please gather feedback in one message when you can.</li></ul>`,
  },
  {
    id: "turnaround",
    label: "Turnaround",
    html: `<h2>Turnaround</h2><ul><li>Estimated finish dates are shown on the queue when available.</li><li>Complex pieces, illness, or holidays can shift timelines — I’ll update you if that happens.</li><li>Rush slots, if offered, are priced separately.</li></ul>`,
  },
  {
    id: "cancellation",
    label: "Cancellation",
    html: `<h2>Cancellation &amp; refunds</h2><ul><li>If you cancel before work starts, the deposit may be refundable minus any payment fees.</li><li>If work has started, the deposit is generally non-refundable.</li><li>I may cancel and refund unused work if communication stalls for a long time.</li></ul>`,
  },
  {
    id: "rights",
    label: "Usage rights",
    html: `<h2>Usage rights</h2><ul><li>Personal use is included unless we agree otherwise in writing.</li><li>Commercial / merch / AI training rights need a separate license.</li><li>I may showcase the work in my portfolio and socials unless you request privacy.</li></ul>`,
  },
  {
    id: "communication",
    label: "Communication",
    html: `<h2>Communication</h2><ul><li>Please keep commission chat in the channel we agreed on.</li><li>Check your queue link for progress updates.</li><li>Be respectful — harassment or bad-faith behavior can end the commission.</li></ul>`,
  },
];

function closestBlock(node: Node | null, root: HTMLElement): HTMLElement | null {
  let current: Node | null = node;
  while (current && current !== root) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const el = current as HTMLElement;
      const display = window.getComputedStyle(el).display;
      if (display === "block" || display === "list-item" || HEADING_TAGS.has(el.tagName)) {
        return el;
      }
    }
    current = current.parentNode;
  }
  return null;
}

function replaceTag(el: HTMLElement, tagName: string) {
  const next = document.createElement(tagName);
  while (el.firstChild) next.appendChild(el.firstChild);
  if (!next.childNodes.length) next.appendChild(document.createElement("br"));
  el.replaceWith(next);
  return next;
}

function initialEditorHtml(value: string) {
  const prepared = sanitizeTosHtml(markdownToHtml(value) || "");
  if (!prepared || isTosHtmlEmpty(prepared)) return "<p><br></p>";
  return prepared;
}

export function TosEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const primed = useRef(false);
  const [active, setActive] = useState<Partial<Record<ToolId, boolean>>>({});
  const [empty, setEmpty] = useState(() => isTosHtmlEmpty(value));

  const syncActive = useCallback(() => {
    const root = ref.current;
    if (!root) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !root.contains(selection.anchorNode)) {
      setActive({});
      return;
    }

    const block = closestBlock(selection.anchorNode, root);
    setActive({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      header: Boolean(block && HEADING_TAGS.has(block.tagName)),
      ul: document.queryCommandState("insertUnorderedList"),
      ol: document.queryCommandState("insertOrderedList"),
    });
  }, []);

  const emit = useCallback(() => {
    const html = ref.current?.innerHTML ?? "";
    setEmpty(isTosHtmlEmpty(html));
    onChange(html);
    syncActive();
  }, [onChange, syncActive]);

  useEffect(() => {
    if (!ref.current || primed.current) return;
    ref.current.innerHTML = initialEditorHtml(value);
    primed.current = true;
    setEmpty(isTosHtmlEmpty(ref.current.innerHTML));
  }, [value]);

  useEffect(() => {
    const onSelectionChange = () => syncActive();
    document.addEventListener("selectionchange", onSelectionChange);
    return () => document.removeEventListener("selectionchange", onSelectionChange);
  }, [syncActive]);

  const run = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  };

  /** Toggle heading ↔ paragraph by rewriting the DOM (execCommand is unreliable here). */
  const toggleHeader = () => {
    const root = ref.current;
    if (!root) return;
    root.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const blocks = new Set<HTMLElement>();

    if (!range.collapsed) {
      const walker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_ELEMENT);
      let node: Node | null = walker.currentNode;
      while (node) {
        if (node instanceof HTMLElement && HEADING_TAGS.has(node.tagName) && range.intersectsNode(node)) {
          blocks.add(node);
        }
        node = walker.nextNode();
      }
    }

    const startBlock = closestBlock(range.startContainer, root);
    const endBlock = closestBlock(range.endContainer, root);
    if (startBlock) blocks.add(startBlock);
    if (endBlock) blocks.add(endBlock);

    const headings = [...blocks].filter((el) => HEADING_TAGS.has(el.tagName) && root.contains(el));

    if (headings.length > 0) {
      let focus: HTMLElement | null = null;
      for (const heading of headings) {
        focus = replaceTag(heading, "p");
      }
      if (focus) {
        const nextRange = document.createRange();
        nextRange.selectNodeContents(focus);
        nextRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(nextRange);
      }
    } else {
      const block = startBlock && root.contains(startBlock) ? startBlock : null;
      if (block && block !== root && !HEADING_TAGS.has(block.tagName) && block.tagName !== "LI") {
        const heading = replaceTag(block, "h2");
        const nextRange = document.createRange();
        nextRange.selectNodeContents(heading);
        nextRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(nextRange);
      } else {
        document.execCommand("formatBlock", false, "h2");
      }
    }

    emit();
  };

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");
    const cleaned = html
      ? sanitizeTosHtml(html)
      : sanitizeTosHtml(
          text
            .split(/\n+/)
            .map((line) => `<p>${line.replace(/&/g, "&amp;").replace(/</g, "&lt;") || "<br>"}</p>`)
            .join("")
        );
    if (!cleaned) return;
    document.execCommand("insertHTML", false, cleaned);
    emit();
  };

  const insertTemplate = (template: SectionTemplate) => {
    const root = ref.current;
    if (!root) return;
    root.focus();

    const chunk = sanitizeTosHtml(template.html);
    if (!chunk) return;

    if (isTosHtmlEmpty(root.innerHTML)) {
      root.innerHTML = chunk;
    } else {
      document.execCommand("insertHTML", false, chunk);
    }
    emit();
  };

  const tools: {
    id: ToolId;
    label: string;
    title: string;
    action: () => void;
    className?: string;
  }[] = [
    { id: "bold", label: "B", title: "Bold", action: () => run("bold"), className: "font-semibold" },
    { id: "italic", label: "I", title: "Italic", action: () => run("italic"), className: "italic" },
    {
      id: "underline",
      label: "U",
      title: "Underline",
      action: () => run("underline"),
      className: "underline",
    },
    {
      id: "strikeThrough",
      label: "S",
      title: "Strikethrough",
      action: () => run("strikeThrough"),
      className: "line-through",
    },
    { id: "header", label: "H", title: "Header (click again for normal text)", action: toggleHeader },
    { id: "ul", label: "• List", title: "Bullet list", action: () => run("insertUnorderedList") },
    { id: "ol", label: "1. List", title: "Numbered list", action: () => run("insertOrderedList") },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-glass-border bg-bg-secondary/50 p-2.5 flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {tools.map((tool) => {
            const isOn = Boolean(active[tool.id]);
            return (
              <button
                key={tool.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={tool.action}
                aria-pressed={isOn}
                className={`btn-ghost text-sm px-2.5 py-1.5 ${tool.className ?? ""} ${
                  isOn ? "bg-navy-soft text-navy border-navy/20" : ""
                }`}
                title={tool.title}
              >
                {tool.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-1.5 border-t border-glass-border pt-2.5">
          <p className="text-[11px] uppercase tracking-wide text-text-muted px-0.5">
            Insert section
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SECTION_TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertTemplate(template)}
                className="btn-ghost text-xs px-2.5 py-1"
                title={`Insert “${template.label}” starter section`}
              >
                + {template.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative rounded-[var(--radius-control)] border border-glass-border bg-bg-secondary focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgba(43,43,43,0.14)]">
        {empty ? (
          <div
            className="pointer-events-none absolute inset-0 z-0 px-4 py-3 text-sm text-text-muted leading-relaxed"
            aria-hidden
          >
            Write your terms here — or insert a section above to start.
            <br />
            Clients see this on your public page.
          </div>
        ) : null}
        <div
          ref={ref}
          contentEditable
          role="textbox"
          aria-multiline
          aria-label="Terms of service"
          suppressContentEditableWarning
          onInput={emit}
          onBlur={syncActive}
          onKeyUp={syncActive}
          onMouseUp={syncActive}
          onPaste={handlePaste}
          className="tos-content relative z-10 w-full min-h-[280px] max-h-[560px] overflow-auto px-4 py-3 text-sm outline-none"
        />
      </div>
    </div>
  );
}
