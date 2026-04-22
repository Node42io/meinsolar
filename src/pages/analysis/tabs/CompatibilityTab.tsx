/**
 * CompatibilityTab — Constraint × market compatibility.
 * Extracts constraint assessments from generic JSON, renders as cards.
 */
import { getMarket } from "@/data";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import { renderMarkdown } from "@/lib/renderMarkdown";

export default function CompatibilityTab({ marketSlug }: { marketSlug: string }) {
  let rawData: any = {};
  try { rawData = getMarket(marketSlug).compatibility; } catch { /* */ }

  const sections: any[] = rawData?.sections ?? [];
  const tables: any[] = rawData?.tables ?? [];
  const entity = rawData?.entities?.[0] ?? {};
  const marketName = entity.market_name ?? rawData?.marketName ?? marketSlug;

  // Extract constraint assessments from tables
  const assessments: any[] = [];
  for (const t of tables) {
    const h = t.headers ?? [];
    if ((h.includes("Constraint") || h.includes("Name")) && (h.includes("Verdict") || h.includes("Status") || h.includes("Compatibility"))) {
      for (const r of t.rows ?? []) assessments.push(r);
    }
  }

  // Also check entities for structured assessments
  for (const a of entity.assessments ?? entity.constraint_assessments ?? []) {
    assessments.push({
      Constraint: a.constraint_name ?? a.name ?? "",
      Verdict: a.verdict ?? a.status ?? "",
      Rationale: a.rationale ?? a.description ?? "",
    });
  }

  function verdictColor(v: string): string {
    const lv = (v || "").toLowerCase();
    if (lv.includes("pass") || lv.includes("compatible") || lv.includes("✅") || lv.includes("green")) return "var(--status-high, #4ade80)";
    if (lv.includes("conditional") || lv.includes("partial") || lv.includes("⚠") || lv.includes("amber") || lv.includes("mitigable")) return "var(--accent-yellow, #fdff98)";
    if (lv.includes("fail") || lv.includes("incompatible") || lv.includes("❌") || lv.includes("red") || lv.includes("knockout")) return "var(--status-low, #ef4444)";
    return "var(--text-gray-light)";
  }

  if (sections.length === 0 && tables.length === 0 && assessments.length === 0) {
    return (
      <div className="section">
        <div className="section__eyebrow">Compatibility · {marketName}</div>
        <h2 className="section__title">Compatibility & Constraint Analysis</h2>
        <p className="section__sub" style={{ fontStyle: "italic" }}>
          Compatibility data pending for this market.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="section">
        <div className="section__eyebrow">Compatibility · {marketName}</div>
        <h2 className="section__title">Compatibility & Constraint Analysis</h2>
        <p className="section__sub">
          Each product constraint from Chapter 03 is tested against this market.
          Absolute constraints that fail eliminate the market; conditional constraints require adaptation.
        </p>
        <ExecutiveSummary kicker="Compatibility · Summary">
          <p className="answer">
            Tested constraints against <strong>{marketName}</strong>.
            {assessments.length > 0 && <> <strong>{assessments.length}</strong> constraints assessed.</>}
          </p>
        </ExecutiveSummary>
      </div>

      {/* Constraint assessment cards */}
      {assessments.length > 0 && (
        <div className="section">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--accent-yellow)", marginBottom: 12 }}>Constraint Assessments</h3>
          <div style={{ display: "grid", gap: 12 }}>
            {assessments.map((a, i) => {
              const name = a["Constraint"] ?? a["Name"] ?? a["constraint_name"] ?? `Constraint ${i + 1}`;
              const verdict = a["Verdict"] ?? a["Status"] ?? a["Compatibility"] ?? a["verdict"] ?? "";
              const rationale = a["Rationale"] ?? a["rationale"] ?? a["Notes"] ?? a["Description"] ?? "";
              return (
                <div key={i} style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderLeft: `3px solid ${verdictColor(verdict)}`,
                  borderRadius: 8,
                  padding: "16px 20px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <strong style={{ fontSize: 13, color: "var(--text-white)" }}>{name}</strong>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: verdictColor(verdict) }}>{verdict}</span>
                  </div>
                  {rationale && (
                    <p style={{ fontSize: 12, color: "var(--text-gray-light)", lineHeight: 1.6, margin: 0 }}>{rationale}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Remaining sections */}
      {sections.filter(s =>
        !s.title?.includes("Structured Data") &&
        !s.title?.includes("Neo4j") &&
        !s.title?.includes("QA")
      ).map((s: any, i: number) => (
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
