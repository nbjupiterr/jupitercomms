import sanitizeHtml from "sanitize-html";
import { markdownToHtml } from "@/lib/tos-markdown";

export { markdownToHtml } from "@/lib/tos-markdown";

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "strike",
    "del",
    "h1",
    "h2",
    "h3",
    "ul",
    "ol",
    "li",
    "div",
    "span",
  ],
  allowedAttributes: {},
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
  transformTags: {
    strike: "s",
    del: "s",
  },
};

/** Strip unsafe tags/attrs for TOS HTML rendering (prefer calling on the server). */
export function sanitizeTosHtml(html: string): string {
  if (!html) return "";
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}

/** True when the editor HTML has no visible text. */
export function isTosHtmlEmpty(html: string | null | undefined): boolean {
  const text = (html ?? "")
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/<[^>]+>/g, "")
    .trim();
  return text.length === 0;
}

/** Prepare stored TOS (HTML or markdown) into safe HTML for public display. */
export function prepareTosHtml(source: string | null | undefined): string | null {
  const text = source?.trim() ?? "";
  if (!text) return null;
  const html = /<[a-z][\s\S]*>/i.test(text) ? text : markdownToHtml(text);
  const sanitized = sanitizeTosHtml(html);
  return isTosHtmlEmpty(sanitized) ? null : sanitized;
}
