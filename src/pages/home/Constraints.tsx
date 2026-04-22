/**
 * 03 Constraints Analysis
 * Data-driven constraint cards grouped by type, with executive summary,
 * severity badges, absolute vs conditional tags, and source list.
 * Zero hardcoded text — all content from constraints.json.
 */

import { constraints as constraintsData } from "@/data";
import type { Constraint, ConstraintType } from "@/types";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import SourceFootnote from "@/components/SourceFootnote";
import SourceList from "@/components/SourceList";

// ─── Badge class per constraint type ────────────────────────────────────────

const TYPE_CLASS: Record<string, string> = {
  physical: "badge badge--accent",
  chemical: "badge badge--moderate",
  operational: "badge badge--neutral",
  economic: "badge badge--strong",
  regulatory: "badge badge--weak",
  environmental: "badge badge--moderate",
};

// ─── Ordered list of constraint type groups ─────────────────────────────────

const GROUP_ORDER: ConstraintType[] = [
  "physical",
  "chemical",
  "operational",
  "economic",
  "regulatory",
  "environmental",
];

// ─── Severity badge styling ─────────────────────────────────────────────────

const SEVERITY_CLASS: Record<string, string> = {
  critical: "badge badge--weak",
  high: "badge badge--moderate",
  medium: "badge badge--neutral",
  low: "badge badge--strong",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatUnit(u: string): string {
  if (u === "degC") return "\u00B0C";
  if (u === "degC ambient" || u === "degC_ambient") return "\u00B0C ambient";
  if (u === "degC_cell_surface") return "\u00B0C cell surface";
  if (u === "degC_flash_point") return "\u00B0C flash point";
  if (u === "m3") return "m\u00B3";
  if (u === "m2_per_MWh") return "m\u00B2/MWh";
  if (u === "%_loss") return "% loss";
  if (u === "%_CN_share") return "% CN share";
  return u.replace(/_/g, " ");
}

function formatThreshold(c: Constraint): string {
  if (!c.thresholdValue) return "\u2014";
  const unit = c.thresholdUnit ? ` ${formatUnit(c.thresholdUnit)}` : "";
  return `${c.thresholdValue}${unit}`;
}

// ─── Constraint Card ────────────────────────────────────────────────────────

function ConstraintCard({ c, index }: { c: Constraint; index: number }) {
  const srcIds = c.sourceIds ?? [];

  return (
    <div className="card" style={{ marginBottom: "1.5rem" }}>
      <h3
        style={{
          fontSize: "1.1rem",
          fontWeight: 700,
          marginBottom: "0.75rem",
          color: "var(--text-white)",
          letterSpacing: "-0.01em",
        }}
      >
        C{index}: {c.name}
        {srcIds.length > 0 && <SourceFootnote sourceIds={srcIds} />}
      </h3>

      <table>
        <tbody>
          <tr>
            <td><strong>Type</strong></td>
            <td>
              <span className={TYPE_CLASS[c.constraintType] ?? "badge badge--neutral"}>
                {c.constraintType}
              </span>
            </td>
          </tr>
          {c.severity && (
            <tr>
              <td><strong>Severity</strong></td>
              <td>
                <span className={SEVERITY_CLASS[c.severity] ?? "badge badge--neutral"}>
                  {c.severity}
                </span>
              </td>
            </tr>
          )}
          <tr>
            <td><strong>Absolute barrier</strong></td>
            <td>
              {c.isAbsolute
                ? <strong>Yes &mdash; fundamental limit</strong>
                : "No &mdash; engineering or commercial solutions exist"}
            </td>
          </tr>
          <tr>
            <td><strong>Threshold</strong></td>
            <td>{formatThreshold(c)}</td>
          </tr>
          <tr>
            <td><strong>Description</strong></td>
            <td>{c.description}</td>
          </tr>
          {c.rationale && (
            <tr>
              <td><strong>Rationale</strong></td>
              <td>{c.rationale}</td>
            </tr>
          )}
          {c.mitigation && (
            <tr>
              <td><strong>Mitigation</strong></td>
              <td>{c.mitigation}</td>
            </tr>
          )}
          {c.affectedMarketsHint && c.affectedMarketsHint.length > 0 && (
            <tr>
              <td><strong>Markets affected</strong></td>
              <td>{c.affectedMarketsHint.join(", ")}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function Constraints() {
  const raw = constraintsData as any;
  const all: Constraint[] = raw.constraints ?? [];
  const dataSources: Array<{ id: string; prefixedId?: string }> = raw.sources ?? [];

  const absoluteCount = all.filter((c) => c.isAbsolute).length;
  const conditionalCount = all.length - absoluteCount;

  // Group by type
  const grouped: Record<string, Constraint[]> = {};
  for (const c of all) {
    if (!grouped[c.constraintType]) grouped[c.constraintType] = [];
    grouped[c.constraintType].push(c);
  }

  // Derive active types from data (preserving GROUP_ORDER where applicable)
  const activeTypes = GROUP_ORDER.filter((t) => grouped[t]);
  // Append any types from data not in GROUP_ORDER
  for (const t of Object.keys(grouped)) {
    if (!activeTypes.includes(t)) activeTypes.push(t);
  }

  // Build type counts summary
  const typeSummaryParts = activeTypes.map(
    (t) => `${grouped[t].length} ${t}`
  );

  // Section source IDs
  const sectionSourceIds = dataSources
    .map((s) => s.prefixedId ?? s.id)
    .filter(Boolean);

  // Build the taxonomy counts from data if present
  const taxonomyCounts = raw.taxonomyCounts;

  let runningIndex = 1;

  return (
    <section id="section-03" className="container">
      <div className="section-meta">
        <span>Step 07</span>
        <span className="sep">/</span>
        <span>Constraints Analysis</span>
        <span className="sep">/</span>
        <span>Constraints Analysis</span>
      </div>

      <div className="md">
        <h1 className="section-title">03 Constraints</h1>

        {/* Executive Summary */}
        <ExecutiveSummary kicker="03 / Executive Summary" title="What you are reading">
          <p className="answer">
            This chapter maps the constraints that bound the capability platform's addressable
            market scope &mdash; covering {activeTypes.join(", ")} limits. Absolute constraints
            cannot be overcome by any engineering change or investment; conditional constraints can
            be mitigated at varying cost and lead time. Every new market candidate is screened
            against these constraints: absolute violations eliminate a market entirely, while
            conditional barriers reduce its fit score and add a cost-to-enter estimate.
          </p>
        </ExecutiveSummary>

        {/* Metadata block */}
        {(raw.productName || raw.technologyClass) && (
          <blockquote>
            <p><strong>Component:</strong> Constraints Analysis (Step 07)</p>
            <p>
              <strong>Coverage:</strong>{" "}
              {activeTypes.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(", ")} limits
            </p>
            {raw.productName && <p><strong>Product:</strong> {raw.productName}</p>}
            {raw.technologyClass && <p><strong>Technology Class:</strong> {raw.technologyClass}</p>}
            <p><strong>Archetype:</strong> New Markets for an Existing Product</p>
          </blockquote>
        )}

        <hr />

        {/* ── Constraint Summary Table ── */}
        {all.length > 0 && (
          <>
            <h2 id="con-summary">Constraint Summary</h2>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Constraint</th>
                  <th>Type</th>
                  <th>Absolute</th>
                  <th>Threshold</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                {all.map((c, i) => (
                  <tr key={c.name}>
                    <td>{i + 1}</td>
                    <td>
                      {c.name}
                      {c.sourceIds && c.sourceIds.length > 0 && (
                        <SourceFootnote sourceIds={c.sourceIds} />
                      )}
                    </td>
                    <td>
                      <span className={TYPE_CLASS[c.constraintType] ?? "badge badge--neutral"}>
                        {c.constraintType}
                      </span>
                    </td>
                    <td>{c.isAbsolute ? <strong>true</strong> : "false"}</td>
                    <td>{c.thresholdValue ?? "\u2014"}</td>
                    <td>{c.thresholdUnit ? formatUnit(c.thresholdUnit) : "\u2014"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p>
              <strong>Totals:</strong> {all.length} constraints &mdash; {absoluteCount} absolute,{" "}
              {conditionalCount} conditional. Types: {typeSummaryParts.join(", ")}.
            </p>

            <hr />
          </>
        )}

        {/* ── Detailed Constraints by Type ── */}
        {all.length > 0 && (
          <>
            <h2 id="con-detailed">Detailed Constraints</h2>

            {activeTypes.map((type) => {
              const group = grouped[type];
              if (!group) return null;
              return (
                <div key={type}>
                  <h3
                    id={`con-${type}`}
                    style={{
                      textTransform: "capitalize",
                      fontSize: "0.95rem",
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-gray)",
                      letterSpacing: "0.08em",
                      marginBottom: "1rem",
                      marginTop: "2rem",
                    }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)} ({group.length})
                  </h3>
                  {group.map((c) => {
                    const idx = runningIndex++;
                    return <ConstraintCard key={c.name} c={c} index={idx} />;
                  })}
                </div>
              );
            })}

            <hr />
          </>
        )}

        {/* ── Coverage Table ── */}
        {all.length > 0 && (
          <>
            <h2 id="con-coverage">Constraint Type Coverage</h2>

            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Count</th>
                  <th>Absolute</th>
                  <th>Conditional</th>
                </tr>
              </thead>
              <tbody>
                {activeTypes.map((t) => {
                  const g = grouped[t];
                  if (!g) return null;
                  const abs = g.filter((c) => c.isAbsolute);
                  const cond = g.filter((c) => !c.isAbsolute);
                  return (
                    <tr key={t}>
                      <td>{t}</td>
                      <td>{g.length}</td>
                      <td>
                        {abs.length > 0
                          ? `${abs.length} (${abs.map((a) => `C${all.indexOf(a) + 1}`).join(", ")})`
                          : "0"}
                      </td>
                      <td>{cond.length > 0 ? cond.length : "0"}</td>
                    </tr>
                  );
                })}
                <tr>
                  <td><strong>Total</strong></td>
                  <td><strong>{all.length}</strong></td>
                  <td><strong>{absoluteCount}</strong></td>
                  <td><strong>{conditionalCount}</strong></td>
                </tr>
              </tbody>
            </table>

            <hr />
          </>
        )}

        {/* ── Absolute vs Conditional Interpretation ── */}
        {all.length > 0 && (
          <>
            <h2 id="con-absolute">Absolute vs Conditional</h2>

            <table>
              <thead>
                <tr>
                  <th>Classification</th>
                  <th>Meaning</th>
                  <th>Constraints</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Absolute = true</strong></td>
                  <td>
                    Fundamental limit. No redesign, money, or time overcomes it.
                  </td>
                  <td>
                    {all
                      .filter((c) => c.isAbsolute)
                      .map((c) => `C${all.indexOf(c) + 1} (${c.name})`)
                      .join(", ") || "\u2014"}
                  </td>
                </tr>
                <tr>
                  <td><strong>Absolute = false</strong></td>
                  <td>
                    Barrier exists but known engineering solutions, design modifications, or
                    certifications can overcome it.
                  </td>
                  <td>
                    {all
                      .filter((c) => !c.isAbsolute)
                      .map((c) => `C${all.indexOf(c) + 1}`)
                      .join(", ") || "\u2014"}
                  </td>
                </tr>
              </tbody>
            </table>

            <hr />
          </>
        )}

        {/* ── Downstream Use ── */}
        <h2 id="con-downstream">How Constraints Feed Downstream Analysis</h2>

        <ul>
          <li>
            <strong>Step 08 (Constraint-Market Compatibility):</strong> Each constraint is
            assessed against each candidate market from Market Discovery. Markets where any
            absolute constraint is exceeded in all normal operating conditions are eliminated.
            {sectionSourceIds.length > 0 && (
              <SourceFootnote sourceIds={sectionSourceIds.slice(0, 2)} />
            )}
          </li>
          <li>
            <strong>Market Fit Assessment:</strong> Conditional constraints carry cost/time
            penalties into the Constraint Readiness (CR) dimension of market fit scores.
          </li>
          <li>
            <strong>Market Prioritization:</strong> Eliminated markets are excluded entirely;
            conditional costs factor into the final ranking.
          </li>
        </ul>

        <hr />

        {/* Source List */}
        {sectionSourceIds.length > 0 && (
          <div id="con-sources">
            <SourceList sourceIds={sectionSourceIds} title="Sources \u2014 03 Constraints" />
          </div>
        )}
      </div>
    </section>
  );
}
