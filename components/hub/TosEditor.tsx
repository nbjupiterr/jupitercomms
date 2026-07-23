"use client";

import { useEffect, useRef } from "react";
import { markdownToHtml } from "@/lib/tos-html";

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

  const run = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    onChange(ref.current?.innerHTML ?? "");
  };

  const toggleHeader = () => {
    ref.current?.focus();
    const block = document.queryCommandValue("formatBlock").replace(/[<>]/g, "").toLowerCase();
    const next = block === "h1" || block === "h2" || block === "h3" ? "p" : "h2";
    document.execCommand("formatBlock", false, next);
    onChange(ref.current?.innerHTML ?? "");
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
        onInput={() => onChange(ref.current?.innerHTML ?? "")}
        className="field-input w-full min-h-[240px] resize-y overflow-auto text-sm leading-relaxed [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:text-navy [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-navy [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-navy [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
      />
    </div>
  );
}
