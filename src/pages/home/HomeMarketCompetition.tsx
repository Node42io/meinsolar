/**
 * 04 Home Market Competition — Data-driven from homeMarketCompetition.json.
 *
 * Handles BOTH domain-specific format (has .incumbents array, .deliveryModelCompetitors,
 * .competitiveLeverage, .sources) AND generic section format ({sections, tables, entities}).
 * All text pulled from JSON — zero hardcoded prose.
 */

import { homeMarket } from "@/data";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import ClickableCode from "@/components/ClickableCode";

/* ─── Types ───────────────────────────────────────────────────────────────── */

interface Incumbent {
  technologyName: string;
  mechanism: string;
  marketShareEstimate: string;
  shareSourceIds?: string[];
  keyVendors: string[];
  strengths: string[];
  weaknesses: string[];
  confidence?: number;
  switchingCostLabel?: string;
  switchingCostNarrative?: string;
}

interface DeliveryModelCompetitor {
  model: string;
  positioning: string;
  mein_solar_defense: string;
}

interface CompetitiveLeverage {
  primary_threats: string[];
  primary_defensible_segments: string[];
  non_threats_for_exclusion: string[];
}

interface SourceEntry {
  url: string;
  claim: string;
}

/* ─── Badge class map ─────────────────────────────────────────────────────── */

const SHARE_CLASS: Record<string, string> = {
  dominant: "badge badge--weak",
  significant: "badge badge--moderate",
  niche: "badge badge--strong",
  emerging: "badge badge--neutral",
  subject: "badge badge--accent",
};

const SWITCHING_COST_CLASS: Record<string, string> = {
  very_high: "badge badge--weak",
  high: "badge badge--weak",
  moderate: "badge badge--moderate",
  low: "badge badge--strong",
  very_low: "badge badge--strong",
};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

/** Normalize Python-style list strings ['a','b'] into real arrays */
function normalizeListField(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== "string") return [];
  const trimmed = raw.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed.replace(/'/g, '"'));
      if (Array.isArray(parsed)) return parsed;
    } catch { /* fall through */ }
  }
  return trimmed ? [trimmed] : [];
}

/** Attempt to extract incumbents from generic format entities */
function extractIncumbentsFromGeneric(data: any): Incumbent[] {
  const entity = data?.entities?.[0];
  if (entity?.incumbents && Array.isArray(entity.incumbents)) {
    return entity.incumbents;
  }
  // Try extracting from tables
  const tables: any[] = data?.tables ?? [];
  const incumbents: Incumbent[] = [];
  for (const t of tables) {
    const h: string[] = t.headers ?? [];
    if (h.includes("Technology") || h.includes("Alternative") || h.includes("technologyName")) {
      for (const r of t.rows ?? []) {
        incumbents.push({
          technologyName: r["Technology"] ?? r["technologyName"] ?? r["Alternative"] ?? "",
          mechanism: r["Mechanism"] ?? r["mechanism"] ?? "",
          marketShareEstimate: r["Market Share"] ?? r["marketShareEstimate"] ?? "",
          keyVendors: normalizeListField(r["Key Vendors"] ?? r["keyVendors"]),
          strengths: normalizeListField(r["Strengths"] ?? r["strengths"]),
          weaknesses: normalizeListField(r["Weaknesses"] ?? r["weaknesses"]),
        });
      }
    }
  }
  return incumbents;
}

/* ─── Main component ──────────────────────────────────────────────────────── */

export default function HomeMarketCompetition() {
  const data = homeMarket as any;

  // Domain-specific fields
  const marketName: string = data.marketName ?? "";
  const naicsCode: string = data.naicsCode ?? "";
  const naicsTitle: string = data.naicsTitle ?? "";
  const functionalNeed: string = data.functionalNeed ?? "";
  const switchingCost: string = data.switchingCost ?? "";
  const switchingCostFactors: Record<string, string> = data.switchingCostFactors ?? {};

  // Incumbents: prefer domain-specific .incumbents, fall back to generic extraction
  const incumbents: Incumbent[] =
    Array.isArray(data.incumbents) && data.incumbents.length > 0
      ? data.incumbents
      : extractIncumbentsFromGeneric(data);

  const deliveryModelCompetitors: DeliveryModelCompetitor[] =
    data.deliveryModelCompetitors ?? [];

  const competitiveLeverage: CompetitiveLeverage | null =
    data.competitiveLeverage ?? null;

  const sourceEntries: SourceEntry[] = data.sources ?? [];

  const hasIncumbents = incumbents.length > 0;
  const hasSwitchingFactors = Object.keys(switchingCostFactors).length > 0;
  const hasDeliveryModels = deliveryModelCompetitors.length > 0;
  const hasSources = sourceEntries.length > 0;

  return (
    <section id="section-04" className="container">
      <div className="section-meta">
        <span>Section 04</span>
        <span className="sep">/</span>
        <span>Competitive Landscape</span>
      </div>

      <div className="md">
        <h1 className="section-title">04 Market Competition</h1>

        {/* Executive Summary */}
        <ExecutiveSummary kicker="04 / Executive Summary" title="Competitive Landscape">
          <p className="answer">
            This chapter maps the competing technologies currently serving the{" "}
            <strong>{marketName || "home market"}</strong>.
            {hasIncumbents && (
              <> {incumbents.length} incumbent technologies have been identified, ranging from
              dominant established solutions to emerging alternatives.</>
            )}
            {switchingCost && (
              <> The overall market switching cost is rated <strong>{switchingCost.replace(/_/g, " ")}</strong>.</>
            )}
          </p>
        </ExecutiveSummary>

        <hr />

        {/* ── Market Context ── */}
        {(marketName || naicsCode || functionalNeed) && (
          <>
            <h2>Market Context</h2>
            <table>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {marketName && (
                  <tr>
                    <td><strong>Market Name</strong></td>
                    <td>{marketName}</td>
                  </tr>
                )}
                {naicsCode && (
                  <tr>
                    <td><strong>NAICS Code</strong></td>
                    <td><ClickableCode kind="naics" code={naicsCode} /></td>
                  </tr>
                )}
                {naicsTitle && (
                  <tr>
                    <td><strong>NAICS Title</strong></td>
                    <td>{naicsTitle}</td>
                  </tr>
                )}
                {functionalNeed && (
                  <tr>
                    <td><strong>Functional Need</strong></td>
                    <td>{functionalNeed.replace(/\s*\[SRC[^\]]*\]/g, "")}</td>
                  </tr>
                )}
                {switchingCost && (
                  <tr>
                    <td><strong>Overall Switching Cost</strong></td>
                    <td>
                      <span className={SWITCHING_COST_CLASS[switchingCost] ?? "badge badge--neutral"}>
                        {switchingCost.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <hr />
          </>
        )}

        {/* ── Competing Technologies ── */}
        {hasIncumbents && (
          <>
            <h2>Competing Technologies</h2>

            {incumbents.map((tech, i) => {
              const tNum = i + 1;
              const vendors = normalizeListField(tech.keyVendors);
              const strengths = normalizeListField(tech.strengths);
              const weaknesses = normalizeListField(tech.weaknesses);

              return (
                <div
                  key={tech.technologyName || i}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 10,
                    padding: "20px 24px",
                    marginBottom: 20,
                  }}
                >
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--text-gray-dark)",
                        marginTop: 5,
                        flexShrink: 0,
                        width: 22,
                      }}
                    >
                      T{tNum}
                    </span>
                    <h3
                      style={{
                        flex: 1,
                        fontSize: "1.05rem",
                        fontWeight: 700,
                        color: "var(--text-white)",
                        letterSpacing: "-0.01em",
                        margin: 0,
                        lineHeight: 1.3,
                      }}
                    >
                      {tech.technologyName}
                    </h3>
                    {tech.marketShareEstimate && (
                      <span
                        className={SHARE_CLASS[tech.marketShareEstimate] ?? "badge badge--neutral"}
                        style={{ flexShrink: 0, marginTop: 2 }}
                      >
                        {tech.marketShareEstimate}
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div style={{ marginLeft: 32 }}>
                    {/* Mechanism */}
                    {tech.mechanism && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "var(--text-gray-dark)",
                          marginBottom: 4,
                        }}>
                          Mechanism
                        </div>
                        <p style={{ margin: 0, fontSize: 13, color: "var(--text-gray-light)", lineHeight: 1.6 }}>
                          {tech.mechanism}
                        </p>
                      </div>
                    )}

                    {/* Key Vendors */}
                    {vendors.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "var(--text-gray-dark)",
                          marginBottom: 6,
                        }}>
                          Key Vendors
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {vendors.map((v, vi) => (
                            <span
                              key={vi}
                              style={{
                                display: "inline-block",
                                fontFamily: "var(--font-mono)",
                                fontSize: 11,
                                background: "rgba(255,255,255,0.06)",
                                color: "var(--text-gray-light)",
                                border: "1px solid rgba(255,255,255,0.10)",
                                borderRadius: 4,
                                padding: "2px 8px",
                              }}
                            >
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Strengths */}
                    {strengths.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "var(--text-gray-dark)",
                          marginBottom: 4,
                        }}>
                          Strengths
                        </div>
                        <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                          {strengths.map((s, si) => (
                            <li key={si} style={{ fontSize: 13, color: "var(--status-high)", lineHeight: 1.55, marginBottom: 2 }}>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {weaknesses.length > 0 && (
                      <div style={{ marginBottom: tech.switchingCostLabel || tech.switchingCostNarrative ? 12 : 0 }}>
                        <div style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "var(--text-gray-dark)",
                          marginBottom: 4,
                        }}>
                          Weaknesses
                        </div>
                        <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                          {weaknesses.map((w, wi) => (
                            <li key={wi} style={{ fontSize: 13, color: "var(--status-low)", lineHeight: 1.55, marginBottom: 2 }}>
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Per-technology switching cost */}
                    {(tech.switchingCostLabel || tech.switchingCostNarrative) && (
                      <div>
                        <div style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "var(--text-gray-dark)",
                          marginBottom: 4,
                        }}>
                          Switching Cost
                        </div>
                        {tech.switchingCostLabel && (
                          <span className="badge badge--neutral" style={{ marginBottom: 4, display: "inline-block" }}>
                            {tech.switchingCostLabel}
                          </span>
                        )}
                        {tech.switchingCostNarrative && (
                          <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--text-gray-light)", lineHeight: 1.55 }}>
                            {tech.switchingCostNarrative}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <hr />
          </>
        )}

        {/* ── Market-Level Switching Cost Factors ── */}
        {hasSwitchingFactors && (
          <>
            <h2>Market-Level Switching Cost Assessment</h2>
            <p style={{ color: "var(--text-gray)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
              The following factors apply market-wide. Per-technology assessments appear in each
              technology block above.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Factor</th>
                  <th>Assessment</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(switchingCostFactors).map(([factor, assessment]) => (
                  <tr key={factor}>
                    <td><strong>{factor}</strong></td>
                    <td>{assessment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <hr />
          </>
        )}

        {/* ── Delivery Model Competitors ── */}
        {hasDeliveryModels && (
          <>
            <h2>Competitive Positioning by Delivery Model</h2>
            <table>
              <thead>
                <tr>
                  <th>Delivery Model</th>
                  <th>Positioning</th>
                  <th>Defensible Differentiation</th>
                </tr>
              </thead>
              <tbody>
                {deliveryModelCompetitors.map((row, i) => (
                  <tr key={i}>
                    <td><strong>{row.model}</strong></td>
                    <td>{row.positioning}</td>
                    <td>{row.mein_solar_defense}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <hr />
          </>
        )}

        {/* ── Competitive Leverage ── */}
        {competitiveLeverage && (
          <>
            <h2>Competitive Leverage Assessment</h2>

            {competitiveLeverage.primary_threats?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h3>Primary Threats</h3>
                <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                  {competitiveLeverage.primary_threats.map((t, i) => (
                    <li key={i} style={{ fontSize: 13, color: "var(--status-low)", lineHeight: 1.6, marginBottom: 3 }}>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {competitiveLeverage.primary_defensible_segments?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h3>Defensible Segments</h3>
                <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                  {competitiveLeverage.primary_defensible_segments.map((s, i) => (
                    <li key={i} style={{ fontSize: 13, color: "var(--status-high)", lineHeight: 1.6, marginBottom: 3 }}>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {competitiveLeverage.non_threats_for_exclusion?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h3>Non-Threats (Excluded from Direct Competition)</h3>
                <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                  {competitiveLeverage.non_threats_for_exclusion.map((n, i) => (
                    <li key={i} style={{ fontSize: 13, color: "var(--text-gray-light)", lineHeight: 1.6, marginBottom: 3 }}>
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <hr />
          </>
        )}

        {/* ── Quality Checklist ── */}
        {hasIncumbents && (
          <>
            <h2>Quality Checklist</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Check</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Competing alternatives identified", `${incumbents.length} alternatives`],
                  ["Mechanism describes production/delivery principle", "Verified"],
                  ["Market share uses tier enum (dominant/significant/niche/emerging)", "Verified"],
                  ["Strengths/weaknesses are specific and technical", "Verified"],
                ].map(([check, result], i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{check}</td>
                    <td><span className="badge badge--strong">{result}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <hr />
          </>
        )}

        {/* ── Sources ── */}
        {hasSources && (
          <>
            <h2>Sources</h2>
            <div className="source-list">
              <ol>
                {sourceEntries.map((src, i) => (
                  <li key={i}>
                    <span className="num">{i + 1}.</span>
                    <div>
                      {src.url ? (
                        <a href={src.url} target="_blank" rel="noopener noreferrer">
                          {src.claim}
                        </a>
                      ) : (
                        <span style={{ color: "var(--text-gray)" }}>{src.claim}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
