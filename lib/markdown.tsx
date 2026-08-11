import type { ReactNode } from "react";

/** Render pre-sanitized TOS HTML (sanitize on the server before passing). */
export function renderTosHtml(html: string): ReactNode {
  const text = html?.trim() ?? "";
  if (!text) return null;
  return (
    <div
      className="tos-content text-sm"
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
}
