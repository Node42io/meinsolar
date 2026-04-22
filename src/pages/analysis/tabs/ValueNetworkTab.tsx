/**
 * ValueNetworkTab — Value Network analysis. Renders from generic {sections, tables} JSON.
 */
import { getMarket } from "@/data";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import { renderMarkdown } from "@/lib/renderMarkdown";

export default function ValueNetworkTab({ marketSlug }: { marketSlug: string }) {
  let rawData: any = {};
  try { rawData = getMarket(marketSlug).valueNetwork; } catch { /* */ }

  const sections: any[] = rawData?.sections ?? [];
  const tables: any[] = rawData?.tables ?? [];
  const entity = rawData?.entities?.[0] ?? {};
  const marketName = entity.market_name ?? rawData?.marketName ?? marketSlug;

  if (sections.length === 0 && tables.length === 0) {
    return (
      <div className="section">
        <div className="section__eyebrow">Value Network · {marketName}</div>
        <h2 className="section__title">Position in the Value Network</h2>
        <p className="section__sub" style={{ fontStyle: "italic" }}>
          Value network data pending for this market.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="section">
        <div className="section__eyebrow">Value Network · {marketName}</div>
        <h2 className="section__title">Position in the Value Network</h2>
        <p className="section__sub">
          How the output in this market gets made — from raw inputs through transformation
          to the final deliverable. Shows where Mein Solar's BESS EPC service sits in the chain.
        </p>
        <ExecutiveSummary kicker="Value Network · What you're reading">
          <p className="answer">
            The value network maps the complete production and delivery chain for
            <strong> {marketName}</strong>. Each level (L1–L6) represents a stage of
            value creation. The product's entry point is highlighted to show where the
            EPC service integrates.
            {tables.length > 0 && <> Contains <strong>{tables.length}</strong> data tables.</>}
          </p>
        </ExecutiveSummary>
      </div>

      {sections.filter(s =>
        !s.title?.includes("Structured Data") &&
        !s.title?.includes("Neo4j") &&
        !s.title?.includes("QA Checklist")
      ).map((s: any, i: number) => (
        <div key={i} className="section">
          {s.title && <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--accent-yellow)", marginBottom: 8 }}>{s.title}</h3>}
          <div
            style={{ fontSize: 13, color: "var(--text-gray-light)", lineHeight: 1.75 }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(s.content) }}
          />
        </div>
      ))}

      {tables.filter(t => t.headers && t.rows?.length > 0).map((t: any, i: number) => (
        <div key={`t-${i}`} className="section" style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                {t.headers.map((h: string, hi: number) => <th key={hi}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {t.rows.map((r: any, ri: number) => (
                <tr key={ri}>
                  {t.headers.map((h: string, ci: number) => (
                    <td key={ci} style={{ fontSize: 12 }}>{r[h] ?? ""}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
