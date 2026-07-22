import type { ReactNode } from "react";

/** Minimal markdown: paragraphs + **bold**. Escapes HTML. */
export function renderSimpleMarkdown(source: string): ReactNode {
  const text = source?.trim() ?? "";
  if (!text) return null;

  const blocks = text.split(/\n{2,}/);

  return blocks.map((block, i) => {
    const lines = block.split("\n");
    return (
      <p key={i} className="mb-3 last:mb-0 leading-relaxed whitespace-pre-wrap">
        {lines.map((line, li) => (
          <span key={li}>
            {li > 0 && <br />}
            {renderInline(line)}
          </span>
        ))}
      </p>
    );
  });
}

function renderInline(line: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = re.exec(line)) !== null) {
    if (match.index > last) {
      parts.push(escapeText(line.slice(last, match.index)));
    }
    parts.push(
      <strong key={`b-${key++}`} className="font-semibold text-navy">
        {escapeText(match[1])}
      </strong>
    );
    last = match.index + match[0].length;
  }

  if (last < line.length) {
    parts.push(escapeText(line.slice(last)));
  }

  return parts.length ? parts : [escapeText(line)];
}

function escapeText(value: string): string {
  return value;
}
