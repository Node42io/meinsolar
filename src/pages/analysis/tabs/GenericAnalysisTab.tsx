/**
 * GenericAnalysisTab — Renders any analysis JSON as formatted tables + text sections.
 *
 * Used for new analysis types (APPENG, SIZE, BMC, GTM, VCHAIN, WCAP, FIN, COMP,
 * FEASIBILITY, PROD) that don't have custom visualizations yet.
 *
 * Reads from the json_exporter output format:
 *   { sections: [{title, content}], tables: [{headers, rows}], entities: [...] }
 */

import { useEffect, useState } from "react";
import ExecutiveSummary from "@/components/ExecutiveSummary";

/* ── Types ──────────────────────────────────────────────────────────────── */

interface Section {
  title: string;
  content: string;
}

interface TableData {
  headers: string[];
  rows: Record<string, string>[];
}

interface GenericData {
  id: string;
  title: string;
  type: string;
  sections: Section[];
  tables: TableData[];
  entities: any[];
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

/** Convert markdown-ish content to basic HTML */
function renderContent(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/^### (.+)$/gm, '<h4 class="generic-h4">$1</h4>')
    .replace(/^#### (.+)$/gm, '<h5 class="generic-h5">$1</h5>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");
}

/** Human-readable label for analysis type */
const TYPE_LABELS: Record<string, string> = {
  application_engineering: "Application Engineering",
  market_sizing: "Market Sizing (TAM/SAM/SOM)",
  business_model_canvas: "Business Model Canvas",
  go_to_market: "Go-to-Market Strategy",
  competitive_intel: "Competitive Intelligence",
  product_design_feasibility: "Product Design Feasibility",
  value_chain_construction: "Value Chain Construction",
  working_capital_simulation: "Working Capital Simulation",
  financial_scenarios: "Financial Scenarios",
  product_decomposition: "Product Decomposition",
  constraint_compatibility: "Constraint Compatibility",
  feature_market_fit: "Feature-Market Fit",
};

/* ── Component ──────────────────────────────────────────────────────────── */

export default function GenericAnalysisTab({
  marketSlug,
  analysisType,
}: {
  marketSlug: string;
  analysisType: string;
}) {
  const [data, setData] = useState<GenericData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to load the JSON file dynamically from the data directory
    // The json_exporter produces files like: APPENG_elevator_guide_rails.json
    const prefixMap: Record<string, string> = {
      value_network: "VN",
      product_bom: "BOM",
      jtbd_analysis: "JTBD",
      odi_matrix: "ODI",
      feature_market_fit: "FIT",
      constraint_compatibility: "COMPAT",
      application_engineering: "APPENG",
      market_sizing: "SIZE",
      business_model_canvas: "BMC",
      go_to_market: "GTM",
      competitive_intel: "COMP",
      product_design_feasibility: "FEASIBILITY",
      value_chain_construction: "VCHAIN",
      working_capital_simulation: "WCAP",
      financial_scenarios: "FIN",
      product_decomposition: "PROD",
    };

    const prefix = prefixMap[analysisType] || analysisType.toUpperCase();
    const filename = `${prefix}_${marketSlug}.json`;

    fetch(`./data/${filename}`)
      .then((res) => {
        if (!res.ok) throw new Error(`${filename} not found`);
        return res.json();
      })
      .then(setData)
      .catch(() => setError(`No ${TYPE_LABELS[analysisType] || analysisType} data available for this market.`));
  }, [marketSlug, analysisType]);

  if (error) {
    return (
      <div style={{ padding: "32px 0", color: "var(--text-gray, #888)" }}>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: "32px 0", color: "var(--text-gray, #888)" }}>
        Loading {TYPE_LABELS[analysisType] || analysisType}…
      </div>
    );
  }

  const label = TYPE_LABELS[analysisType] || data.title || analysisType;

  return (
    <div className="generic-analysis">
      {/* Title */}
      <h2 style={{ marginBottom: 8 }}>{label}</h2>

      {/* Executive summary from first section if it looks like one */}
      {data.sections.length > 0 && (data.sections[0].title || "").toLowerCase().includes("summary") && (
        <ExecutiveSummary kicker={label}>
          <p className="answer">{data.sections[0].content.slice(0, 500)}</p>
        </ExecutiveSummary>
      )}

      {/* Tables first — most valuable for quick scanning */}
      {data.tables.length > 0 && (
        <div className="generic-tables" style={{ marginTop: 24 }}>
          {data.tables.map((table, i) => (
            <div key={i} style={{ marginBottom: 32, overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                <thead>
                  <tr>
                    {table.headers.map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "8px 12px",
                          borderBottom: "2px solid var(--border, #e2e8f0)",
                          fontWeight: 600,
                          fontSize: 12,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "var(--text-muted, #64748b)",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, ri) => (
                    <tr
                      key={ri}
                      style={{
                        borderBottom: "1px solid var(--border-light, #f1f5f9)",
                      }}
                    >
                      {table.headers.map((h) => (
                        <td
                          key={h}
                          style={{
                            padding: "8px 12px",
                            verticalAlign: "top",
                          }}
                          dangerouslySetInnerHTML={{
                            __html: renderContent(row[h] || "—"),
                          }}
                        />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Sections as formatted text blocks */}
      {data.sections
        .filter((s) => !(s.title || "").toLowerCase().includes("structured data"))
        .map((section, i) => (
          <div key={i} style={{ marginBottom: 28 }}>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 8,
                borderBottom: "1px solid var(--border-light, #f1f5f9)",
                paddingBottom: 4,
              }}
            >
              {section.title}
            </h3>
            <div
              style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text, #334155)" }}
              dangerouslySetInnerHTML={{ __html: renderContent(section.content) }}
            />
          </div>
        ))}

      {/* Entities (structured data) — show as compact JSON if present */}
      {data.entities.length > 0 && (
        <details style={{ marginTop: 24, fontSize: 13 }}>
          <summary style={{ cursor: "pointer", fontWeight: 600, color: "var(--text-muted, #64748b)" }}>
            Structured Data ({data.entities.length} entities)
          </summary>
          <pre
            style={{
              background: "var(--bg-code, #1e293b)",
              color: "var(--text-code, #e2e8f0)",
              padding: 16,
              borderRadius: 8,
              overflow: "auto",
              fontSize: 12,
              marginTop: 8,
            }}
          >
            {JSON.stringify(data.entities, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
