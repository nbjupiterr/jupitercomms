import type { ReactNode } from "react";
import { markdownToHtml, sanitizeTosHtml } from "@/lib/tos-html";

/** Render TOS: prefers HTML (rich editor), falls back to simple markdown. */
export function renderSimpleMarkdown(source: string): ReactNode {
  const text = source?.trim() ?? "";
  if (!text) return null;

  const html = sanitizeTosHtml(
    /<[a-z][\s\S]*>/i.test(text) ? text : markdownToHtml(text)
  );

  return (
    <div
      className="tos-content text-sm text-text-secondary [&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-navy [&_h1]:mb-2 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-navy [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-medium [&_h3]:text-navy [&_h3]:mb-2 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-navy [&_em]:italic [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
