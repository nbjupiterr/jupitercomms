"use client";

import { useRef } from "react";

export function TosEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const wrapBold = () => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || "bold text";
    const next = `${value.slice(0, start)}**${selected}**${value.slice(end)}`;
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + 2 + selected.length;
      el.setSelectionRange(start + 2, caret);
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button type="button" onClick={wrapBold} className="btn-ghost text-sm px-3 py-1.5 font-semibold">
          B
        </button>
        <span className="text-xs text-text-muted">Select text, then Bold — uses **markdown**</span>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={14}
        className="field-input w-full resize-y font-mono text-sm leading-relaxed min-h-[240px]"
        placeholder={"**GENERAL T.O.S**\n\ni prefer to work on my own pace…"}
      />
    </div>
  );
}
