/**
 * StrategicSynthesis — Page 08
 *
 * Executive summary of ALL findings across 26 markets:
 *   1. Executive Summary (key numbers + top move)
 *   2. Top 15 Opportunities (ranked, color-coded by tier)
 *   3. 4 Capability Themes (cross-market patterns)
 *   4. Market Classification (PURSUE / INVESTIGATE / DEFER / NO-GO)
 *   5. Vertical Integration Feasibility (coverage bars)
 *   6. Investment Priorities (ranked by ROI)
 *   7. Revenue Scenarios (3×3 Tier × Scenario)
 */

import PageHeader from "@/components/PageHeader";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import SectionAnchor from "@/components/SectionAnchor";
import data from "@/data/strategicSynthesis.json";

/* ---- Tier color helpers ---- */

const TIER_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: "rgba(111, 213, 155, 0.12)", text: "#6fd59b",  label: "Tier 1 — Immediate" },
  2: { bg: "rgba(213, 169, 111, 0.12)", text: "#d5a96f",  label: "Tier 2 — Near-Term" },
  3: { bg: "rgba(213, 111, 111, 0.12)", text: "#d56f6f",  label: "Tier 3 — Strategic" },
};

const VERDICT_COLORS: Record<string, string> = {
  "Most feasible":             "#6fd59b",
  "Highly attractive":         "#6fd59b",
  "Viable but capital-intensive": "#d5a96f",
  "Feasible via bundled supply":  "#d5a96f",
  "Easiest":                   "#6fd59b",
  "Moderate":                  "#d5a96f",
  "Capital-intensive":         "#d56f6f",
  "Partial":                   "#d56f6f",
  "No":                        "#787a7d",
};

const CLASSIFICATION_STYLES: Record<string, { header: string; border: string; badge: string }> = {
  pursue:      { header: "#6fd59b", border: "rgba(111, 213, 155, 0.25)", badge: "#2d5a3c" },
  investigate: { header: "#d5a96f", border: "rgba(213, 169, 111, 0.25)", badge: "#5a3c2d" },
  defer:       { header: "#787a7d", border: "rgba(120, 122, 125, 0.25)", badge: "#303030" },
  noGo:        { header: "#d56f6f", border: "rgba(213, 111, 111, 0.25)", badge: "#5a2d2d" },
};

const THEME_COLORS: Record<string, string> = {
  green:  "rgba(111, 213, 155, 0.10)",
  yellow: "rgba(253, 255, 152, 0.10)",
  orange: "rgba(213, 111, 111, 0.10)",
};

const THEME_BORDER: Record<string, string> = {
  green:  "rgba(111, 213, 155, 0.30)",
  yellow: "rgba(253, 255, 152, 0.30)",
  orange: "rgba(213, 111, 111, 0.30)",
};

const THEME_TEXT: Record<string, string> = {
  green:  "#6fd59b",
  yellow: "#fdff98",
  orange: "#d56f6f",
};

/* ---- Sub-components ---- */

function TierBadge({ tier }: { tier: number }) {
  const c = TIER_COLORS[tier];
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 8px",
      borderRadius: 5,
      background: c.bg,
      color: c.text,
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      whiteSpace: "nowrap",
    }}>
      T{tier}
    </span>
  );
}

function CoverageBars({ current, potential }: { current: number; potential: number }) {
  return (
    <div style={{ minWidth: 140 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
        <div style={{ flex: 1, height: 6, background: "var(--surface-dark)", borderRadius: 3, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${current}%`, background: "var(--text-gray)", borderRadius: 3 }} />
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-gray)", width: 32, textAlign: "right" }}>
          {current}%
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ flex: 1, height: 6, background: "var(--surface-dark)", borderRadius: 3, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${potential}%`, background: "var(--status-high)", borderRadius: 3 }} />
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--status-high)", width: 32, textAlign: "right" }}>
          {potential}%
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-gray-dark)" }}>current</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-gray-dark)" }}>potential</span>
      </div>
    </div>
  );
}

function ClassificationCard({
  title,
  styleKey,
  items,
  fieldKey,
}: {
  title: string;
  styleKey: keyof typeof CLASSIFICATION_STYLES;
  items: Array<{ market: string; type: string; topAction?: string; keyQuestion?: string; reason?: string }>;
  fieldKey: "topAction" | "keyQuestion" | "reason";
}) {
  const s = CLASSIFICATION_STYLES[styleKey];
  return (
    <div style={{
      background: "var(--bg-card)",
      border: `1px solid ${s.border}`,
      borderRadius: 12,
      overflow: "hidden",
    }}>
      <div style={{
        padding: "12px 16px",
        background: `${s.badge}55`,
        borderBottom: `1px solid ${s.border}`,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: s.header,
          textTransform: "uppercase",
        }}>
          {title}
        </span>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--text-gray-dark)",
          marginLeft: "auto",
        }}>
          {items.length} markets
        </span>
      </div>
      <div>
        {items.map((item, i) => (
          <div key={item.market} style={{
            padding: "12px 16px",
            borderBottom: i < items.length - 1 ? "1px solid var(--divider)" : undefined,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: item[fieldKey] ? 4 : 0 }}>
              <span style={{
                display: "inline-block",
                padding: "2px 6px",
                borderRadius: 3,
                background: item.type === "NEW" ? "rgba(253,255,152,0.1)" : "var(--surface-dark)",
                color: item.type === "NEW" ? "var(--accent-yellow)" : "var(--text-gray)",
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                flexShrink: 0,
              }}>
                {item.type}
              </span>
              <span style={{ fontSize: 13, color: "var(--text-white)", fontWeight: 500 }}>
                {item.market}
              </span>
            </div>
            {item[fieldKey] && (
              <p style={{ fontSize: 11, color: "var(--text-gray)", margin: 0, paddingLeft: 44, lineHeight: 1.45 }}>
                {item[fieldKey]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Main component ---- */

export default function StrategicSynthesis() {
  const {
    meta,
    top15Opportunities,
    capabilityThemes,
    verticalIntegrationSummary,
    marketClassification,
  } = data;

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <PageHeader
        kicker="Step 09+10 / Cross-Market Synthesis / Capability Market Expansion"
        title="Strategic Synthesis & Roadmap"
        description="Executive summary of all 26 markets, 90+ opportunities, 4 capability themes, and the investment roadmap that transforms ZOLLERN Steel Profiles from structural decline to growth platform."
      />

      {/* ── 1. Executive Summary ─────────────────────────────────────── */}
      <section id="syn-executive" className="container">
        <SectionAnchor id="syn-executive" title="Executive Summary" />
        <div className="md">
          <ExecutiveSummary title="The Strategic Conclusion">
            <p className="answer">
              ZOLLERN Steel Profiles has analyzed <strong>{meta.marketsAnalyzed} markets</strong> ({meta.existingMarkets} existing + {meta.newMarkets} new) and identified <strong>90+ adjacency opportunities</strong> across three capability tracks. The analysis reveals a clear growth path: ZOLLERN's existing manufacturing capabilities — especially induction hardening (C3) and mechanical processing (C7) — are systematically undermonetized across markets already served and adjacent markets waiting to be entered.
            </p>
            <p className="answer">
              <strong>The single most impactful move:</strong> Launch a <strong>catalog profile program</strong> (20–30 standard geometries on stock) for €100–300K. This eliminates the #1 customer objection — die cost and 6–12 week lead time — across all 26 markets simultaneously. No new capability required; only a commercial commitment.
            </p>
            <p className="answer">
              <strong>Revenue potential:</strong> {meta.conservativeScenario} conservative · <strong>{meta.baseScenario} base</strong> · {meta.optimisticScenario} optimistic. Against ZOLLERN Group revenue of ~{meta.zollernGroupRevenue}, the base scenario represents <strong>{meta.baseScenarioUplift} incremental revenue</strong> for the Steel Profiles division — a transformative growth path.
            </p>
            <p className="answer">
              <strong>Investment required:</strong> Tier 1 opportunities (7 moves) require near-zero investment and generate €8–24M/yr immediately. Total investment across all three tiers is €7.5–21M.
            </p>
          </ExecutiveSummary>
        </div>

        {/* KPI stat row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 14,
          marginTop: 28,
          marginBottom: 16,
        }}>
          {[
            { label: "Markets Analyzed", value: "26", sub: "12 existing + 14 new" },
            { label: "Opportunities", value: "90+", sub: "across 3 tracks" },
            { label: "Base Scenario", value: "€103M", sub: "~27% revenue uplift" },
            { label: "Zero-Capex Wins", value: "7", sub: "Tier 1, immediate" },
            { label: "Vertical Int. Paths", value: "7", sub: "feasible routes" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 10,
              padding: "18px 20px",
            }}>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--text-gray-dark)",
                marginBottom: 10,
              }}>
                {s.label}
              </div>
              <div style={{
                fontSize: 28,
                fontWeight: 500,
                color: "var(--accent-yellow)",
                letterSpacing: "-0.02em",
                marginBottom: 4,
              }}>
                {s.value}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-gray)" }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 2. Top 15 Opportunities ──────────────────────────────────── */}
      <section id="syn-opportunities" className="container" style={{ paddingTop: 48 }}>
        <SectionAnchor id="syn-opportunities" title="Top 15 Opportunities" kicker="Ranked by Impact × Feasibility" />
        <div className="md">
          <p style={{ marginBottom: 16 }}>
            Tier 1 (green) = zero/minimal investment, immediate revenue. Tier 2 (amber) = €100K–500K, 6–18 months. Tier 3 (red) = strategic bets, €500K+, 18–36 months.
          </p>

          {/* Tier legend */}
          <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
            {[1, 2, 3].map((t) => {
              const c = TIER_COLORS[t];
              return (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: c.text }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-gray-light)" }}>
                    {c.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 12,
            overflow: "hidden",
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border-subtle)" }}>
                  {["#", "Opportunity", "Market(s)", "Track", "Investment", "Time", "Revenue Potential"].map((h) => (
                    <th key={h} style={{
                      padding: "12px 14px",
                      textAlign: "left",
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--text-gray-dark)",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {top15Opportunities.map((opp, i) => {
                  const tc = TIER_COLORS[opp.tier];
                  return (
                    <tr key={opp.rank} style={{
                      borderBottom: i < top15Opportunities.length - 1 ? "1px solid var(--divider)" : undefined,
                      background: opp.tier === 1
                        ? "rgba(111,213,155,0.025)"
                        : opp.tier === 2
                        ? "rgba(213,169,111,0.02)"
                        : "transparent",
                    }}>
                      <td style={{
                        padding: "13px 14px",
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                        fontWeight: 700,
                        color: tc.text,
                        textAlign: "center",
                        width: 36,
                      }}>
                        {opp.rank}
                      </td>
                      <td style={{ padding: "13px 14px", maxWidth: 260 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                          <TierBadge tier={opp.tier} />
                          <div>
                            <span style={{ color: "var(--text-white)", fontWeight: 500, lineHeight: 1.4, display: "block" }}>
                              {opp.opportunity}
                            </span>
                            <span style={{ fontSize: 11, color: "var(--text-gray)", display: "block", marginTop: 2, lineHeight: 1.4 }}>
                              {opp.strategicValue}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "13px 14px", color: "var(--text-gray-light)", fontSize: 12 }}>
                        {opp.markets}
                      </td>
                      <td style={{ padding: "13px 14px", textAlign: "center" }}>
                        <span style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--accent-yellow)",
                          background: "rgba(253,255,152,0.08)",
                          padding: "3px 7px",
                          borderRadius: 4,
                        }}>
                          {opp.track}
                        </span>
                      </td>
                      <td style={{ padding: "13px 14px", fontFamily: "var(--font-mono)", fontSize: 11, color: opp.investment === "Zero" ? "#6fd59b" : "var(--text-gray-light)" }}>
                        {opp.investment}
                      </td>
                      <td style={{ padding: "13px 14px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-gray-light)", whiteSpace: "nowrap" }}>
                        {opp.timeToRevenue}
                      </td>
                      <td style={{ padding: "13px 14px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-white)", fontWeight: 500, whiteSpace: "nowrap" }}>
                        {opp.revenuePotential}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 3. Capability Themes ─────────────────────────────────────── */}
      <section id="syn-themes" className="container" style={{ paddingTop: 48 }}>
        <SectionAnchor id="syn-themes" title="4 Cross-Market Capability Themes" kicker="Strategic Patterns" />
        <div className="md">
          <p style={{ marginBottom: 24 }}>
            Four recurring patterns emerge across all 12 existing markets. Each theme maps existing ZOLLERN capabilities to a monetization lever — from zero-investment repositioning to strategic moat-building.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {capabilityThemes.map((theme, i) => (
              <div key={theme.id} style={{
                background: THEME_COLORS[theme.color],
                border: `1px solid ${THEME_BORDER[theme.color]}`,
                borderRadius: 12,
                padding: "24px 28px",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <div style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: THEME_TEXT[theme.color],
                      marginBottom: 6,
                    }}>
                      Theme {i + 1} / {theme.subtitle}
                    </div>
                    <h3 style={{
                      fontSize: 17,
                      fontWeight: 500,
                      color: "var(--text-white)",
                      margin: 0,
                      lineHeight: 1.3,
                    }}>
                      {theme.title}
                    </h3>
                  </div>
                  <span style={{
                    padding: "4px 9px",
                    borderRadius: 5,
                    background: `${THEME_BORDER[theme.color].replace("0.30", "0.15")}`,
                    color: THEME_TEXT[theme.color],
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    flexShrink: 0,
                    marginLeft: 12,
                  }}>
                    {theme.impact}
                  </span>
                </div>

                <p style={{
                  fontSize: 13,
                  color: "var(--text-gray-light)",
                  lineHeight: 1.55,
                  marginBottom: 16,
                }}>
                  {theme.pattern}
                </p>

                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-gray-dark)", marginBottom: 3 }}>
                      Investment
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: THEME_TEXT[theme.color] }}>
                      {theme.investment}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-gray-dark)", marginBottom: 3 }}>
                      Timeframe
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-gray-light)" }}>
                      {theme.timeframe}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${THEME_BORDER[theme.color]}` }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-gray-dark)", marginBottom: 6 }}>
                    Markets
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {theme.markets.map((m) => (
                      <span key={m} style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: "var(--surface-dark)",
                        color: "var(--text-gray-light)",
                        fontSize: 11,
                        fontFamily: "var(--font-mono)",
                      }}>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Market Classification ─────────────────────────────────── */}
      <section id="syn-classification" className="container" style={{ paddingTop: 48 }}>
        <SectionAnchor id="syn-classification" title="Market Classification" kicker="26 Markets Across 4 Buckets" />
        <div className="md">
          <p style={{ marginBottom: 24 }}>
            All 26 markets classified by strategic priority. NEW = new market identified in Phase 2; Existing = market already served by ZOLLERN Steel Profiles.
          </p>

          {/* Summary bar */}
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            {[
              { key: "PURSUE", count: 8, color: "#6fd59b" },
              { key: "INVESTIGATE", count: 6, color: "#d5a96f" },
              { key: "DEFER", count: 6, color: "#787a7d" },
              { key: "NO-GO", count: 4, color: "#d56f6f" },
            ].map((b) => (
              <div key={b.key} style={{
                flex: 1,
                background: "var(--bg-card)",
                border: `1px solid ${b.color}40`,
                borderRadius: 10,
                padding: "14px 16px",
                textAlign: "center",
              }}>
                <div style={{
                  fontSize: 26,
                  fontWeight: 500,
                  color: b.color,
                  letterSpacing: "-0.02em",
                  marginBottom: 4,
                }}>
                  {b.count}
                </div>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: b.color,
                }}>
                  {b.key}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            <ClassificationCard
              title="PURSUE — Enter/Expand Immediately"
              styleKey="pursue"
              items={marketClassification.pursue}
              fieldKey="topAction"
            />
            <ClassificationCard
              title="INVESTIGATE — Promising, Needs Validation"
              styleKey="investigate"
              items={marketClassification.investigate}
              fieldKey="keyQuestion"
            />
            <ClassificationCard
              title="DEFER — Lower Priority, Pursue Opportunistically"
              styleKey="defer"
              items={marketClassification.defer}
              fieldKey="reason"
            />
            <ClassificationCard
              title="NO-GO — Not Recommended"
              styleKey="noGo"
              items={marketClassification.noGo}
              fieldKey="reason"
            />
          </div>
        </div>
      </section>

      {/* ── 5. Vertical Integration Feasibility ──────────────────────── */}
      <section id="syn-vertical" className="container" style={{ paddingTop: 48 }}>
        <SectionAnchor id="syn-vertical" title="Vertical Integration Feasibility" kicker="Coverage Depth per Market" />
        <div className="md">
          <p style={{ marginBottom: 20 }}>
            Coverage bars show current value-network coverage (gray) vs. achievable coverage (green) after investment. 7 markets have viable vertical integration paths; 3 are not recommended due to capability gaps or business model mismatch.
          </p>
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 12,
            overflow: "hidden",
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border-subtle)" }}>
                  {["Market", "Coverage (Current → Potential)", "Investment", "Verdict"].map((h) => (
                    <th key={h} style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--text-gray-dark)",
                      fontWeight: 500,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {verticalIntegrationSummary.map((row, i) => {
                  const vColor = VERDICT_COLORS[row.verdict] ?? "var(--text-gray)";
                  return (
                    <tr key={row.market} style={{ borderBottom: i < verticalIntegrationSummary.length - 1 ? "1px solid var(--divider)" : undefined }}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 500, color: "var(--text-white)" }}>{row.market}</div>
                      </td>
                      <td style={{ padding: "14px 16px", width: 200 }}>
                        <CoverageBars current={row.current} potential={row.potential} />
                      </td>
                      <td style={{
                        padding: "14px 16px",
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: row.investment === "Not recommended" ? "var(--text-gray-dark)" : "var(--text-gray-light)",
                      }}>
                        {row.investment}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: vColor }}>
                          {row.verdict}
                        </div>
                        {row.verdictDetail && (
                          <div style={{ fontSize: 11, color: "var(--text-gray)", marginTop: 2 }}>
                            {row.verdictDetail}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Strategic Conclusion ─────────────────────────────────── */}
      <section id="syn-conclusion" className="container" style={{ paddingTop: 48, paddingBottom: 64 }}>
        <div className="md">
          <div style={{
            background: "linear-gradient(135deg, rgba(253,255,152,0.04) 0%, rgba(111,213,155,0.04) 100%)",
            border: "1px solid rgba(253,255,152,0.15)",
            borderRadius: 12,
            padding: "24px 28px",
          }}>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--accent-yellow)",
              marginBottom: 10,
            }}>
              Strategic Conclusion
            </div>
            <p style={{ fontSize: 14, color: "var(--text-gray-light)", lineHeight: 1.6, margin: 0 }}>
              The capability platform is already built. ZOLLERN Steel Profiles possesses the induction hardening, mechanical processing, and precision rolling capabilities needed to serve all identified markets today. The gap is not manufacturing — it is{" "}
              <strong style={{ color: "var(--text-white)" }}>commercial positioning</strong>,{" "}
              <strong style={{ color: "var(--text-white)" }}>catalog availability</strong>, and{" "}
              <strong style={{ color: "var(--text-white)" }}>selective certification</strong>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
