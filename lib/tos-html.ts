import sanitizeHtml from "sanitize-html";
import { markdownToHtml } from "@/lib/tos-markdown";

export { markdownToHtml } from "@/lib/tos-markdown";

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "s", "h1", "h2", "h3", "ul", "ol", "li", "div", "span"],
  allowedAttributes: {},
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
};

/** Strip unsafe tags/attrs for TOS HTML rendering (prefer calling on the server). */
export function sanitizeTosHtml(html: string): string {
  if (!html) return "";
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}

/** Prepare stored TOS (HTML or markdown) into safe HTML for public display. */
export function prepareTosHtml(source: string | null | undefined): string | null {
  const text = source?.trim() ?? "";
  if (!text) return null;
  const html = /<[a-z][\s\S]*>/i.test(text) ? text : markdownToHtml(text);
  return sanitizeTosHtml(html);
}
