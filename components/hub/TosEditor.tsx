"use client";

import { useEffect, useRef } from "react";
import { markdownToHtml } from "@/lib/tos-html";

const HEADING_TAGS = new Set(["H1", "H2", "H3"]);

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

export function TosEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const primed = useRef(false);

  useEffect(() => {
    if (!ref.current || primed.current) return;
    ref.current.innerHTML = markdownToHtml(value) || "<p><br></p>";
    primed.current = true;
  }, [value]);

  const emit = () => onChange(ref.current?.innerHTML ?? "");

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

  const tools: { label: string; title: string; action: () => void; className?: string }[] = [
    { label: "B", title: "Bold", action: () => run("bold"), className: "font-semibold" },
    { label: "I", title: "Italic", action: () => run("italic"), className: "italic" },
    { label: "U", title: "Underline", action: () => run("underline"), className: "underline" },
    { label: "S", title: "Strikethrough", action: () => run("strikeThrough"), className: "line-through" },
    { label: "H", title: "Header (click again for normal text)", action: toggleHeader },
    { label: "• List", title: "Bullet list", action: () => run("insertUnorderedList") },
    { label: "1. List", title: "Numbered list", action: () => run("insertOrderedList") },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {tools.map((tool) => (
          <button
            key={tool.title}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={tool.action}
            className={`btn-ghost text-sm px-2.5 py-1.5 ${tool.className ?? ""}`}
            title={tool.title}
          >
            {tool.label}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        role="textbox"
        aria-multiline
        aria-label="Terms of service"
        suppressContentEditableWarning
        onInput={emit}
        className="field-input w-full min-h-[240px] resize-y overflow-auto text-sm leading-relaxed [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:text-navy [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-navy [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-navy [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
      />
    </div>
  );
}
