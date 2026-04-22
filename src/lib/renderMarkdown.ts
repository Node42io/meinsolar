/**
 * Shared markdown-to-HTML renderer for all pages.
 * Handles pipe tables, headers, lists, blockquotes, bold/italic/code.
 */

/** Format inline markdown: bold, italic, code */
function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-white)">$1</strong>')
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.06);border-radius:3px;padding:1px 4px;font-size:11px;font-family:var(--font-mono)">$1</code>');
}

/** Convert markdown content to HTML — line-by-line for robust pipe table handling */
export function renderMarkdown(content: string): string {
  if (!content) return "";

  const lines = content.split("\n");
  const out: string[] = [];
  let inTable = false;
  let isFirstTableRow = true;
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // ── Pipe table row ──
    if (trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.split("|").length > 2) {
      const cells = trimmed.split("|").slice(1, -1);
      if (cells.every(c => /^[\s\-:]+$/.test(c))) continue; // separator

      if (!inTable) {
        if (inList) { out.push("</ul>"); inList = false; }
        out.push('<table style="width:100%;border-collapse:collapse;margin:12px 0;background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:8px;overflow:hidden">');
        inTable = true;
        isFirstTableRow = true;
      }

      const tag = isFirstTableRow ? "th" : "td";
      const style = isFirstTableRow
        ? 'style="padding:8px 12px;font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-gray-dark);border-bottom:1px solid var(--border-subtle);text-align:left"'
        : 'style="padding:8px 12px;font-size:12px;color:var(--text-gray-light);border-bottom:1px solid rgba(255,255,255,0.04)"';

      out.push(`<tr>${cells.map(c => `<${tag} ${style}>${inlineFormat(c.trim())}</${tag}>`).join("")}</tr>`);
      isFirstTableRow = false;
      continue;
    }

    if (inTable && !trimmed.startsWith("|")) {
      out.push("</table>");
      inTable = false;
    }

    // ── Headers ──
    if (trimmed.startsWith("#### ")) {
      if (inList) { out.push("</ul>"); inList = false; }
      out.push(`<h5 style="font-size:13px;font-weight:600;color:var(--text-white);margin:16px 0 6px">${inlineFormat(trimmed.slice(5))}</h5>`);
      continue;
    }
    if (trimmed.startsWith("### ")) {
      if (inList) { out.push("</ul>"); inList = false; }
      out.push(`<h4 style="font-size:14px;font-weight:600;color:var(--text-white);margin:20px 0 8px">${inlineFormat(trimmed.slice(4))}</h4>`);
      continue;
    }
    if (trimmed.startsWith("## ")) {
      if (inList) { out.push("</ul>"); inList = false; }
      out.push(`<h3 style="font-size:16px;font-weight:700;color:var(--accent-yellow);margin:24px 0 10px">${inlineFormat(trimmed.slice(3))}</h3>`);
      continue;
    }

    // ── Horizontal rule ──
    if (/^-{3,}$/.test(trimmed)) {
      if (inList) { out.push("</ul>"); inList = false; }
      out.push('<hr style="border:none;border-top:1px solid var(--border-subtle);margin:20px 0">');
      continue;
    }

    // ── Blockquote ──
    if (trimmed.startsWith("> ")) {
      if (inList) { out.push("</ul>"); inList = false; }
      out.push(`<blockquote style="border-left:3px solid var(--accent-yellow);padding:8px 16px;margin:12px 0;background:rgba(253,255,152,0.04);font-style:italic;color:var(--text-gray-light)">${inlineFormat(trimmed.slice(2))}</blockquote>`);
      continue;
    }

    // ── List item ──
    if (/^[-*] /.test(trimmed) || /^\d+\. /.test(trimmed)) {
      if (!inList) { out.push('<ul style="padding-left:1.2rem;margin:8px 0">'); inList = true; }
      const text = trimmed.replace(/^[-*] /, "").replace(/^\d+\. /, "");
      out.push(`<li style="margin-bottom:4px;font-size:13px;color:var(--text-gray-light);line-height:1.6">${inlineFormat(text)}</li>`);
      continue;
    }

    if (inList && trimmed !== "" && !/^[-*] /.test(trimmed) && !/^\d+\. /.test(trimmed)) {
      out.push("</ul>");
      inList = false;
    }

    // ── Empty line ──
    if (trimmed === "") {
      out.push("<br/>");
      continue;
    }

    // ── Normal text ──
    out.push(`<p style="margin:4px 0;font-size:13px;color:var(--text-gray-light);line-height:1.7">${inlineFormat(trimmed)}</p>`);
  }

  if (inTable) out.push("</table>");
  if (inList) out.push("</ul>");

  return out.join("\n");
}
