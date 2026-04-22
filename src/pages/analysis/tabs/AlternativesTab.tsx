/**
 * AlternativesTab — Competing technologies / feature-market fit.
 * Extracts alternatives and feature scores from generic JSON, renders Marquardt-style cards.
 */
import { getMarket } from "@/data";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import { renderMarkdown } from "@/lib/renderMarkdown";

export default function AlternativesTab({ marketSlug }: { marketSlug: string }) {
  let rawData: any = {};
  try { rawData = getMarket(marketSlug).alternatives; } catch { /* */ }

  const sections: any[] = rawData?.sections ?? [];
  const tables: any[] = rawData?.tables ?? [];
  const entity = rawData?.entities?.[0] ?? {};
  const marketName = entity.market_name ?? rawData?.marketName ?? marketSlug;

  // Extract alternatives from tables (look for Alternative/Technology/Name + tradeoffs/strengths)
  const alternatives: any[] = [];
  for (const t of tables) {
    const h = t.headers ?? [];
    if (h.includes("Alternative") || h.includes("Technology") || h.includes("Feature")) {
      for (const r of t.rows ?? []) {
        alternatives.push(r);
      }
    }
  }

  // Extract feature-fit scores
  const featureScores: any[] = [];
  for (const t of tables) {
    const h = t.headers ?? [];
    if ((h.includes("Score") || h.includes("Fit")) && (h.includes("Feature") || h.includes("Dimension"))) {
      for (const r of t.rows ?? []) {
        featureScores.push(r);
      }
    }
  }

  if (sections.length === 0 && tables.length === 0) {
    return (
      <div className="section">
        <div className="section__eyebrow">Alternatives · {marketName}</div>
        <h2 className="section__title">Alternative Solutions & Feature-Market Fit</h2>
        <p className="section__sub" style={{ fontStyle: "italic" }}>
          Alternatives data pending for this market.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="section">
        <div className="section__eyebrow">Feature-Market Fit · {marketName}</div>
        <h2 className="section__title">Alternative Solutions & Feature-Market Fit</h2>
        <p className="section__sub">
          This section maps competing technologies and alternative solutions available in this
          market, and scores how well each product feature fits the market's needs.
        </p>
        <ExecutiveSummary kicker="Alternatives · Summary">
          <p className="answer">
            Analysis of <strong>{marketName}</strong>
            {alternatives.length > 0 && <> identified <strong>{alternatives.length} alternatives</strong></>}
            {featureScores.length > 0 && <> and scored <strong>{featureScores.length} feature dimensions</strong></>}
            .
          </p>
        </ExecutiveSummary>
      </div>

      {/* Feature scores table */}
      {featureScores.length > 0 && (
        <div className="section">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--accent-yellow)", marginBottom: 12 }}>Feature-Market Fit Scores</h3>
          <table>
            <thead>
              <tr>
                {Object.keys(featureScores[0]).map((k, i) => <th key={i}>{k}</th>)}
              </tr>
            </thead>
            <tbody>
              {featureScores.map((r, i) => (
                <tr key={i}>
                  {Object.values(r).map((v: any, ci) => {
                    const num = parseFloat(String(v));
                    const isScore = !isNaN(num) && num >= 0 && num <= 10;
                    return (
                      <td key={ci} style={{
                        fontSize: 12,
                        fontWeight: isScore ? 600 : 400,
                        color: isScore ? (num >= 7 ? "var(--status-high)" : num >= 5 ? "var(--accent-yellow)" : "var(--status-low)") : undefined,
                        fontFamily: isScore ? "var(--font-mono)" : undefined,
                      }}>{String(v)}</td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Alternative cards */}
      {alternatives.length > 0 && (
        <div className="section">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--accent-yellow)", marginBottom: 12 }}>Competing Alternatives</h3>
          <div style={{ display: "grid", gap: 12 }}>
            {alternatives.map((a, i) => {
              const name = a["Alternative"] ?? a["Technology"] ?? a["Name"] ?? `Alternative ${i + 1}`;
              const tradeoffs = a["Inherent trade-offs"] ?? a["Tradeoffs"] ?? a["Weaknesses"] ?? "";
              const unspsc = a["UNSPSC (neutral)"] ?? a["UNSPSC"] ?? "";
              const category = a["Category"] ?? "";
              return (
                <div key={i} style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 10,
                  padding: "16px 20px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-gray-dark)" }}>A{i + 1}</span>
                    <strong style={{ fontSize: 14, color: "var(--text-white)" }}>{name}</strong>
                    {category && <span className="badge badge--neutral" style={{ fontSize: 9 }}>{category}</span>}
                  </div>
                  {unspsc && (
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-gray-dark)", marginBottom: 6 }}>UNSPSC: {unspsc}</div>
                  )}
                  {tradeoffs && (
                    <p style={{ fontSize: 12, color: "var(--text-gray-light)", lineHeight: 1.6, margin: 0 }}>{tradeoffs}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Remaining sections as prose */}
      {sections.filter(s => !s.title?.includes("Structured Data") && !s.title?.includes("Neo4j") && !s.title?.includes("QA")).map((s: any, i: number) => (
        <div key={i} className="section">
          {s.title && <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--accent-yellow)", marginBottom: 8 }}>{s.title}</h3>}
          <div
            style={{ fontSize: 13, color: "var(--text-gray-light)", lineHeight: 1.75 }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(s.content) }}
          />
        </div>
      ))}
    </div>
  );
}

