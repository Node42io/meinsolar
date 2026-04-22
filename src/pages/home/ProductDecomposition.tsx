/**
 * 01 Product Decomposition
 * Fully data-driven from product.json, following the Zollern visual design:
 *   - Christensen 3-level table (mechanism / function / outcome)
 *   - Technology classification table
 *   - Functional promise table with verb/object/context
 *   - Differentiators list
 *   - Commodity-level functional promise
 *   - Features tables split by scope (technology / vendor)
 *   - Specifications table
 *   - Constraints table with severity badges
 *   - UNSPSC classification (shown only when data present)
 *   - Source list (shown only when sources present)
 *
 * All sections guarded — missing/empty fields hide gracefully.
 * Zero hardcoded text — everything reads from product.json.
 */

import { product } from "@/data";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import SourceList from "@/components/SourceList";
import ClickableCode from "@/components/ClickableCode";

// ── Resolve raw JSON fields that may differ from TypeScript interface ──
const raw = product as any;

// Sources — collect all source IDs referenced in the data
const SECTION_SOURCES: string[] = Array.isArray(raw.sources)
  ? raw.sources.map((s: any) => s.prefixedId ?? s.id).filter(Boolean)
  : [];

// ── Badge helpers ──

const CATEGORY_CLASS: Record<string, string> = {
  performance: "badge badge--accent",
  integration: "badge badge--moderate",
  reliability: "badge badge--strong",
  usability: "badge badge--neutral",
  maintenance: "badge badge--neutral",
  safety: "badge badge--neutral",
};

const SEVERITY_CLASS: Record<string, string> = {
  hard: "badge badge--weak",
  soft: "badge badge--moderate",
  critical: "badge badge--weak",
  high: "badge badge--weak",
  medium: "badge badge--moderate",
  low: "badge badge--strong",
};

function badgeClass(category: string): string {
  return CATEGORY_CLASS[category] ?? "badge badge--neutral";
}

function severityBadgeClass(severity: string | undefined): string {
  if (!severity) return "badge badge--neutral";
  return SEVERITY_CLASS[severity] ?? "badge badge--neutral";
}

// ── Feature description field (JSON may use "long" or "longDescription") ──
function featureDescription(f: any): string {
  return f.long ?? f.longDescription ?? f.short ?? "";
}

// ── Spec note/condition field (JSON may use "testCondition" or "note") ──
function specCondition(s: any): string {
  return s.testCondition ?? s.note ?? "";
}

// ── Format unit for display ──
function formatUnit(unit: string | undefined): string {
  if (!unit) return "";
  if (unit === "C") return "\u00B0C";
  if (unit === "uA") return "\u03BCA";
  if (unit === "m2") return "m\u00B2";
  if (unit === "m3") return "m\u00B3";
  if (unit === "m2_per_MWh") return "m\u00B2/MWh";
  if (unit === "EUR_per_kWh") return "\u20AC/kWh";
  return unit;
}

// ── Format threshold for display ──
function formatThreshold(c: any): string {
  const val = c.thresholdValue;
  const unit = c.thresholdUnit;
  if (!val && val !== 0) return "\u2014";
  const formattedUnit = unit ? ` ${formatUnit(unit)}` : "";
  return `${val}${formattedUnit}`;
}

export default function ProductDecomposition() {
  const christensen = raw.christensen;
  const technology = raw.technology;
  const fp = raw.functionalPromise;
  const commodityFP = raw.commodityFunctionalPromise;
  const differentiators: string[] = raw.differentiators ?? [];
  const features: any[] = raw.features ?? [];
  const specifications: any[] = raw.specifications ?? [];
  const constraints: any[] = raw.constraints ?? [];
  const offeringType: string = raw.offeringType ?? "";
  const validationNotes: any[] = raw.validationNotes ?? [];
  const unspscClassifications: any[] = raw.unspscClassifications ?? [];

  const technologyFeatures = features.filter((f) => f.scope === "technology");
  const vendorFeatures = features.filter((f) => f.scope === "vendor");

  const hasChristensen = christensen?.mechanism || christensen?.function || christensen?.outcome;
  const hasTechnology = technology?.class || technology?.underlyingMechanism;
  const hasFP = fp?.statement || fp?.verb;
  const hasUNSPSC = technology?.unspscCode && technology.unspscCode.trim() !== "";

  return (
    <section id="section-01" className="container">
      {/* Section meta breadcrumb */}
      <div className="section-meta">
        <span>Step 01</span>
        <span className="sep">/</span>
        <span>Product Breakdown</span>
        <span className="sep">/</span>
        <span>New Markets for an Existing Product</span>
      </div>

      <div className="md">
        <h1 className="section-title">01 Product Profile</h1>

        {/* Executive Summary */}
        <ExecutiveSummary kicker="01 / Executive Summary" title="What you are reading">
          <p className="answer">
            This chapter decomposes {raw.productName} into its underlying
            mechanism, functional promise, feature set, and specifications. Understanding what the product
            actually <em>does</em> at each level (mechanism &rarr; function &rarr; outcome)
            is the foundation for every market-entry decision that follows: it tells us which
            markets are structurally compatible, which features differentiate, and which
            constraints limit entry.
          </p>
        </ExecutiveSummary>

        {/* Metadata block */}
        <blockquote>
          <p><strong>Component:</strong> Product Decomposition (Step 01)</p>
          <p><strong>Approach:</strong> Three-level product breakdown (mechanism &rarr; function &rarr; outcome)</p>
          <p><strong>Product:</strong> {raw.productName}</p>
          <p><strong>Vendor:</strong> {raw.vendorName}</p>
          {offeringType && <p><strong>Offering Type:</strong> {offeringType.replace(/_/g, " ")}</p>}
          <p><strong>Archetype:</strong> New Markets for an Existing Product</p>
        </blockquote>

        <hr />

        {/* ── Christensen Three-Level Breakdown ── */}
        {hasChristensen && (
          <>
            <h2 id="prod-three-levels">What the Product Does — Three Levels</h2>
            <table>
              <thead>
                <tr>
                  <th>Level</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {christensen.mechanism && (
                  <tr>
                    <td><strong>Mechanism</strong></td>
                    <td>{christensen.mechanism}</td>
                  </tr>
                )}
                {christensen.function && (
                  <tr>
                    <td><strong>Function</strong></td>
                    <td>{christensen.function}</td>
                  </tr>
                )}
                {christensen.outcome && (
                  <tr>
                    <td><strong>Outcome</strong></td>
                    <td>{christensen.outcome}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}

        {/* ── Technology Classification ── */}
        {hasTechnology && (
          <>
            <h2 id="prod-tech-class">Technology Classification</h2>
            <table>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {technology.class && (
                  <tr>
                    <td><strong>Technology Class</strong></td>
                    <td>{technology.class}</td>
                  </tr>
                )}
                {technology.underlyingMechanism && (
                  <tr>
                    <td><strong>Underlying Mechanism</strong></td>
                    <td>{technology.underlyingMechanism}</td>
                  </tr>
                )}
                {hasUNSPSC && (
                  <>
                    <tr>
                      <td><strong>UNSPSC Code</strong></td>
                      <td>
                        <ClickableCode kind="unspsc" code={technology.unspscCode} />
                      </td>
                    </tr>
                    {technology.unspscTitle && (
                      <tr>
                        <td><strong>UNSPSC Title</strong></td>
                        <td>{technology.unspscTitle}</td>
                      </tr>
                    )}
                    {technology.unspscPath && (
                      <tr>
                        <td><strong>UNSPSC Path</strong></td>
                        <td>{technology.unspscPath}</td>
                      </tr>
                    )}
                  </>
                )}
                {technology.customProductGroup && (
                  <tr>
                    <td><strong>Product Group</strong></td>
                    <td>{technology.customProductGroup}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}

        {/* ── Functional Promise ── */}
        {hasFP && (
          <>
            <h2 id="prod-fp">Functional Promise</h2>
            <table>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {fp.statement && (
                  <tr>
                    <td><strong>Statement</strong></td>
                    <td>{fp.statement}</td>
                  </tr>
                )}
                {fp.verb && (
                  <tr>
                    <td><strong>Verb</strong></td>
                    <td>{fp.verb}</td>
                  </tr>
                )}
                {fp.object && (
                  <tr>
                    <td><strong>Object</strong></td>
                    <td>{fp.object}</td>
                  </tr>
                )}
                {fp.context && (
                  <tr>
                    <td><strong>Context</strong></td>
                    <td>{fp.context}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}

        {/* ── Differentiators ── */}
        {differentiators.length > 0 && (
          <>
            <h3>Differentiators</h3>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Differentiator</th>
                </tr>
              </thead>
              <tbody>
                {differentiators.map((d, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* ── Commodity-Level Functional Promise ── */}
        {commodityFP && (
          <>
            <h2 id="prod-commodity-fp">Commodity-Level Functional Promise</h2>
            <blockquote>
              <p><strong>{commodityFP}</strong></p>
            </blockquote>
          </>
        )}

        {/* ── Features ── */}
        {features.length > 0 && (
          <>
            <hr />
            <h2 id="prod-features">Features</h2>

            {technologyFeatures.length > 0 && (
              <>
                <h3>Technology-Level Features</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>Description</th>
                      <th>Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {technologyFeatures.map((f) => (
                      <tr key={f.name}>
                        <td><strong>{f.name}</strong></td>
                        <td>{featureDescription(f)}</td>
                        <td><span className={badgeClass(f.category)}>{f.category}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {vendorFeatures.length > 0 && (
              <>
                <h3>{raw.vendorName}-Specific Features</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>Description</th>
                      <th>Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorFeatures.map((f) => (
                      <tr key={f.name}>
                        <td><strong>{f.name}</strong></td>
                        <td>{featureDescription(f)}</td>
                        <td><span className={badgeClass(f.category)}>{f.category}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </>
        )}

        {/* ── Specifications ── */}
        {specifications.length > 0 && (
          <>
            <hr />
            <h2 id="prod-specs">Specifications</h2>
            <table>
              <thead>
                <tr>
                  <th>Specification</th>
                  <th>Value</th>
                  <th>Unit</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {specifications.map((s) => (
                  <tr key={s.name}>
                    <td><strong>{s.name}</strong></td>
                    <td>{s.value}</td>
                    <td>{formatUnit(s.unit) || "\u2014"}</td>
                    <td>{specCondition(s) || "\u2014"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* ── Constraints ── */}
        {constraints.length > 0 && (
          <>
            <hr />
            <h2 id="prod-constraints">Key Product Constraints</h2>
            <table>
              <thead>
                <tr>
                  <th>Constraint</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Description</th>
                  <th>Threshold</th>
                </tr>
              </thead>
              <tbody>
                {constraints.map((c) => (
                  <tr key={c.name}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.constraintType}</td>
                    <td>
                      <span className={severityBadgeClass(c.severity)}>
                        {c.severity ?? "\u2014"}
                      </span>
                    </td>
                    <td>{c.description}</td>
                    <td>{formatThreshold(c)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* ── UNSPSC Classification (only if classification data exists) ── */}
        {unspscClassifications.length > 0 && (
          <>
            <hr />
            <h2 id="prod-unspsc">UNSPSC Classification</h2>
            <table>
              <thead>
                <tr>
                  <th>UNSPSC Commodity Code</th>
                  <th>Commodity Name</th>
                  <th>Confidence</th>
                  <th>Reasoning</th>
                </tr>
              </thead>
              <tbody>
                {unspscClassifications.map((u: any, i: number) => (
                  <tr key={i}>
                    <td>
                      {i === 0 ? (
                        <strong><ClickableCode kind="unspsc" code={u.code} /></strong>
                      ) : (
                        <ClickableCode kind="unspsc" code={u.code} />
                      )}
                    </td>
                    <td>{u.name ?? u.title}</td>
                    <td>
                      <span className={
                        (u.confidence ?? 0) >= 80 ? "badge badge--strong" :
                        (u.confidence ?? 0) >= 50 ? "badge badge--moderate" :
                        "badge badge--weak"
                      }>
                        {u.confidence != null ? `${u.confidence}%` : "\u2014"}
                      </span>
                    </td>
                    <td>{u.reasoning ?? u.rationale ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* ── Validation Notes (only if present in data) ── */}
        {validationNotes.length > 0 && (
          <>
            <hr />
            <h2 id="prod-validation">Validation Notes</h2>
            <ul>
              {validationNotes.map((note: any, i: number) => (
                <li key={i}>
                  {note.title && <strong>{note.title}</strong>}
                  {note.title && " \u2014 "}
                  {note.text ?? note.description ?? (typeof note === "string" ? note : "")}
                </li>
              ))}
            </ul>
          </>
        )}

        {/* ── Sources (only if present) ── */}
        {SECTION_SOURCES.length > 0 && (
          <>
            <hr />
            <div id="prod-sources">
              <SourceList sourceIds={SECTION_SOURCES} title="Sources — 01 Product Decomposition" />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
