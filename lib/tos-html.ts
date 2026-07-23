import sanitizeHtml from "sanitize-html";

/** Convert simple markdown leftovers into HTML for the rich editor. */
export function markdownToHtml(source: string): string {
  const text = source?.trim() ?? "";
  if (!text) return "";
  if (/<[a-z][\s\S]*>/i.test(text)) return text;

  return text
    .split(/\n{2,}/)
    .map((block) => {
      const header = block.match(/^(#{1,3})\s+([\s\S]+)$/);
      if (header) {
        const level = header[1].length;
        return `<h${level}>${inlineMd(header[2].trim())}</h${level}>`;
      }
      const lines = block.split("\n").map((line) => {
        const h = line.match(/^(#{1,3})\s+(.+)$/);
        if (h) return `<h${h[1].length}>${inlineMd(h[2])}</h${h[1].length}>`;
        return inlineMd(line);
      });
      return `<p>${lines.join("<br>")}</p>`;
    })
    .join("");
}

function inlineMd(line: string): string {
  return line
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "s", "h1", "h2", "h3", "ul", "ol", "li", "div", "span"],
  allowedAttributes: {},
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
};

/** Strip unsafe tags/attrs for TOS HTML rendering (works on server and client). */
export function sanitizeTosHtml(html: string): string {
  if (!html) return "";
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}
