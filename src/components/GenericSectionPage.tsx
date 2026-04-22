/**
 * GenericSectionPage — Renders any page from the json_exporter format:
 *   { sections: [{title, content}], tables: [{headers, rows}], entities: [...] }
 *
 * Used by all home pages (Product, FP, Constraints, Home Market) to render
 * orchestrator output without hardcoded fields.
 */

import ExecutiveSummary from "@/components/ExecutiveSummary";
import { renderMarkdown } from "@/lib/renderMarkdown";

interface Section {
  title: string;
  content: string;
}

interface TableData {
  headers?: string[];
  rows?: Record<string, string>[];
}

interface GenericData {
  id?: string;
  title?: string;
  type?: string;
  sections?: Section[];
  tables?: TableData[];
  entities?: any[];
  [key: string]: any;
}

/** Convert markdown content to HTML — line-by-line for robust pipe table handling */
function renderContent(content: string): string {
  if (!content) return "";

  const lines = content.split("\n");
  const out: string[] = [];
  let inTable = false;
  let isFirstTableRow = true;
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // ── Pipe table row ──
    if (trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.includes("|")) {
      const cells = trimmed.split("|").slice(1, -1); // drop empty first/last from split
      // Skip separator rows (|---|---|)
      if (cells.every(c => /^[\s\-:]+$/.test(c))) continue;

      if (!inTable) {
        // Close any open list
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

    // Close table if we left table rows
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

    // Close list if we're no longer in one
    if (inList && trimmed !== "" && !/^[-*] /.test(trimmed) && !/^\d+\. /.test(trimmed)) {
      out.push("</ul>");
      inList = false;
    }

    // ── Empty line = paragraph break ──
    if (trimmed === "") {
      out.push("<br/>");
      continue;
    }

    // ── Normal text ──
    out.push(`<p style="margin:4px 0;font-size:13px;color:var(--text-gray-light);line-height:1.7">${inlineFormat(trimmed)}</p>`);
  }

  // Close any open elements
  if (inTable) out.push("</table>");
  if (inList) out.push("</ul>");

  return out.join("\n");
}

/** Format inline markdown: bold, italic, code */
function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-white)">$1</strong>')
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.06);border-radius:3px;padding:1px 4px;font-size:11px;font-family:var(--font-mono)">$1</code>');
}

export default function GenericSectionPage({
  data,
  stepNumber,
  stepLabel,
  summaryText,
}: {
  data: GenericData;
  stepNumber: string;
  stepLabel: string;
  summaryText?: string;
}) {
  const sections = data?.sections ?? [];
  const tables = data?.tables ?? [];
  const title = data?.title ?? stepLabel;

  return (
    <section className="container">
      {/* Breadcrumb */}
      <div className="section-meta">
        <span>Step {stepNumber}</span>
        <span className="sep">/</span>
        <span>{stepLabel}</span>
        <span className="sep">/</span>
        <span>New Markets for an Existing Product</span>
      </div>

      <div className="md">
        <h1 className="section-title">{stepNumber} {stepLabel}</h1>

        {/* Executive Summary */}
        {summaryText && (
          <ExecutiveSummary kicker={`${stepNumber} / Summary`}>
            <p className="answer">{summaryText}</p>
          </ExecutiveSummary>
        )}

        {/* Sections */}
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 28 }}>
            {s.title && (
              <>
                {i > 0 && <hr style={{ border: "none", borderTop: "1px solid var(--border-subtle)", margin: "24px 0" }} />}
                <h2 style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--accent-yellow)",
                  letterSpacing: "-0.01em",
                  marginBottom: 12,
                }}>
                  {s.title}
                </h2>
              </>
            )}
            <div
              style={{ fontSize: 13, color: "var(--text-gray-light)", lineHeight: 1.75 }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(s.content) }}
            />
          </div>
        ))}

        {/* Standalone tables (if any outside sections) */}
        {tables.length > 0 && tables.map((t, i) => (
          <div key={`t-${i}`} style={{ marginBottom: 20, overflowX: "auto" }}>
            {t.headers && t.rows && (
              <table>
                <thead>
                  <tr>
                    {t.headers.map((h, hi) => (
                      <th key={hi}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.rows.map((row, ri) => (
                    <tr key={ri}>
                      {t.headers!.map((h, ci) => (
                        <td key={ci}>{row[h] ?? ""}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
