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

const ALLOWED = new Set(["P", "BR", "STRONG", "B", "EM", "I", "U", "S", "H1", "H2", "H3", "UL", "OL", "LI", "DIV", "SPAN"]);

/** Strip unsafe tags/attrs for TOS HTML rendering. */
export function sanitizeTosHtml(html: string): string {
  if (!html) return "";
  if (typeof DOMParser === "undefined") {
    return html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/\son\w+="[^"]*"/gi, "")
      .replace(/\son\w+='[^']*'/gi, "")
      .replace(/javascript:/gi, "");
  }

  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild;
  if (!root) return "";

  const walk = (node: Node) => {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === 1) {
        const el = child as Element;
        if (!ALLOWED.has(el.tagName)) {
          while (el.firstChild) node.insertBefore(el.firstChild, el);
          node.removeChild(el);
          continue;
        }
        for (const attr of Array.from(el.attributes)) {
          el.removeAttribute(attr.name);
        }
        walk(el);
      }
    }
  };
  walk(root);
  return root.innerHTML;
}
