/**
 * ValueNetworkTab — Value Network & BOM analysis for a given market.
 *
 * Handles BOTH data formats:
 *   A) Domain-specific: vnUnits[] + l6Systems[] -> renders interactive SVG diagram
 *   B) Generic: {sections, tables, entities} -> renders markdown sections with tables
 *
 * All text is data-driven — no hardcoded company names.
 */

import { getMarket } from "@/data";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import SectionAnchor from "@/components/SectionAnchor";
import { renderMarkdown } from "@/lib/renderMarkdown";
import type { Source } from "@/types";

import VNDiagram from "./valuenetwork/VNDiagram";

/* -- Helpers ------------------------------------------------------------ */

/**
 * Local source list for VN sources that live inside the market JSON.
 */
function LocalSourceList({ sources }: { sources: Source[] }) {
  if (!sources || sources.length === 0) return null;
  const validSources = sources.filter(
    (s) => s.label && s.label !== "--" && s.prefixedId
  );
  if (validSources.length === 0) return null;

  return (
    <div className="source-list">
      <div className="source-list__title">Sources — Value Network</div>
      <ol>
        {validSources.map((src, i) => (
          <li key={src.prefixedId ?? src.id}>
            <span className="num">{i + 1}.</span>
            <div>
              {src.url ? (
                <a href={src.url} target="_blank" rel="noopener noreferrer">
                  {src.label}
                </a>
              ) : (
                <span style={{ color: "var(--text-gray)" }}>{src.label}</span>
              )}
              {!src.url && (
                <span className="pending" style={{ display: "block" }}>
                  source pending
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* -- Architecture distance label ---------------------------------------- */
function archDistanceLabel(dist: number): string {
  if (dist <= 1) return "very close — direct application";
  if (dist <= 2) return "close — minor adaptation";
  if (dist <= 3) return "moderate — process similarity";
  if (dist <= 5) return "moderate-to-distant — cross-sector";
  return "distant — significant adaptation required";
}

/* -- Tab component ------------------------------------------------------ */
export default function ValueNetworkTab({ marketSlug }: { marketSlug: string }) {
  // Graceful data load
  let vnData: any = null;
  try {
    const bundle = getMarket(marketSlug);
    vnData = bundle.valueNetwork;
  } catch {
    return (
      <div className="section">
        <div className="section__eyebrow">Value Network · {marketSlug}</div>
        <h2 className="section__title">Value Network</h2>
        <p className="section__sub" style={{ color: "var(--status-low)" }}>
          No value network data found for market &ldquo;{marketSlug}&rdquo;.
        </p>
      </div>
    );
  }

  // Detect data format
  const hasL6 = vnData.l6Systems && vnData.l6Systems.length > 0;
  const hasUnits = vnData.vnUnits && vnData.vnUnits.length > 0;
  const hasDiagramData = hasL6 && hasUnits;
  const hasSections = vnData.sections && vnData.sections.length > 0;
  const hasTables = vnData.tables && vnData.tables.length > 0;
  const hasGenericData = hasSections || hasTables;

  // Extract market name from whichever format is available
  const entity = vnData.entities?.[0] ?? {};
  const marketName = vnData.marketName ?? (entity as any).market_name ?? marketSlug;
  const naicsCode = vnData.naicsCode ?? "";
  const archDist = vnData.architectureDistance ?? null;
  const companyName = vnData.focalCompany?.name ?? "";
  const productName = vnData.focalCompany?.product ?? "";

  // Strategic position text (generic field or legacy)
  const strategicNote =
    vnData.strategicPositionNote ??
    vnData.marquardtPosition ??
    (vnData as any).zollernPosition ??
    "";

  // If there is no data at all, show pending message
  if (!hasDiagramData && !hasGenericData) {
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

  // -- FORMAT B: Generic sections + tables (no L6/vnUnit data) ----
  if (!hasDiagramData && hasGenericData) {
    return (
      <div>
        <div className="section">
          <div className="section__eyebrow">Value Network · {marketName}</div>
          <h2 className="section__title">Position in the Value Network</h2>
          <p className="section__sub">
            How the output in this market gets made — from raw inputs through transformation
            to the final deliverable.
            {companyName && productName && (
              <> Shows where {companyName}&rsquo;s {productName} sits in the chain.</>
            )}
          </p>
          <ExecutiveSummary kicker="Value Network · What you are reading">
            <p className="answer">
              The value network maps the complete production and delivery chain for{" "}
              <strong>{marketName}</strong>. Each level (L1&ndash;L6) represents a stage of
              value creation. The product&rsquo;s entry point is highlighted to show where the
              service integrates.
              {hasTables && vnData.tables.length > 0 && (
                <> Contains <strong>{vnData.tables.length}</strong> data tables.</>
              )}
            </p>
          </ExecutiveSummary>
        </div>

        {(vnData.sections ?? [])
          .filter(
            (s: any) =>
              !s.title?.includes("Structured Data") &&
              !s.title?.includes("Neo4j") &&
              !s.title?.includes("QA Checklist")
          )
          .map((s: any, i: number) => (
            <div key={i} className="section">
              {s.title && (
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--accent-yellow)",
                    marginBottom: 8,
                  }}
                >
                  {s.title}
                </h3>
              )}
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-gray-light)",
                  lineHeight: 1.75,
                }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(s.content) }}
              />
            </div>
          ))}

        {(vnData.tables ?? [])
          .filter((t: any) => t.headers && t.rows?.length > 0)
          .map((t: any, i: number) => (
            <div key={`t-${i}`} className="section" style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    {t.headers.map((h: string, hi: number) => (
                      <th key={hi}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.rows.map((r: any, ri: number) => (
                    <tr key={ri}>
                      {t.headers.map((h: string, ci: number) => (
                        <td key={ci} style={{ fontSize: 12 }}>
                          {r[h] ?? ""}
                        </td>
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

  // -- FORMAT A: Full diagram with L6 systems + vnUnits ----
  return (
    <div className="section">
      {/* Section eyebrow */}
      <div className="section__eyebrow">
        Value Network{naicsCode ? ` · NAICS ${naicsCode}` : ""}
      </div>

      <h2 className="section__title">Position in the Value Network</h2>

      <p className="section__sub">
        {marketName}
        {vnData.hierarchy ? ` — ${vnData.hierarchy}` : ""}
      </p>

      {/* Opening executive summary */}
      <ExecutiveSummary
        kicker="What you are reading"
        title="Value Network Analysis"
      >
        <p className="answer">
          This section maps where
          {companyName ? ` ${companyName}'s` : " the"}
          {productName ? ` ${productName}` : " offering"} fits within the{" "}
          <strong>{marketName}</strong> value network. Value-network positioning
          directly informs sales-channel strategy: it tells the sales team which buyers
          to approach first, which systems integrators control purchasing decisions,
          and where margin can be captured rather than ceded to a channel partner.
          {naicsCode && (
            <>
              {" "}The analysis is based on NAICS code{" "}
              <strong>{naicsCode}</strong>
            </>
          )}
          {archDist != null && (
            <>
              {" "}and an architecture distance score of{" "}
              <strong>{archDist}</strong> ({archDistanceLabel(archDist)})
            </>
          )}
          .
        </p>
        <p className="answer" style={{ marginTop: 12 }}>
          The tab is structured in two parts: (1) position in the general value
          network, and (2) the detailed process-level map with the anchor
          position. The product Bill of Materials is available on the separate{" "}
          <strong>Bill of Materials</strong> tab.
        </p>
      </ExecutiveSummary>

      {/* "Position in General Value Network" heading */}
      <SectionAnchor
        id="vn-position"
        kicker="Step 02c"
        title="Position in General Value Network"
      />

      {/* Description of what a value network is */}
      <ExecutiveSummary kicker="What is a value network?">
        <p className="answer">
          <strong>What is a value network?</strong> A value network is the chain of
          organizations, process steps, and enabling systems that together deliver a
          finished product or service to an end user. In a manufacturing context it
          spans raw-material suppliers, equipment vendors, integrators, operators, and
          distributors.
        </p>
        <p className="answer" style={{ marginTop: 12 }}>
          In this section you are seeing the <strong>{marketName}</strong>{" "}
          production chain decomposed to the L6 (functional sub-system) and L5 (specific process step)
          levels. The highlighted rows show where the product fits as a primary,
          secondary, or tertiary supply point. Click any row to read the functional
          job statement and a plain-language description of that process step.
        </p>
      </ExecutiveSummary>

      {/* Market context stat row */}
      {(vnData.marketSize || vnData.coreJobStatement || vnData.cfjStatement) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 12,
            marginBottom: 28,
          }}
        >
          {vnData.marketSize && (
            <div className="stat-tile">
              <div className="stat-tile__label">Market Size</div>
              <div
                className="stat-tile__value"
                style={{ fontSize: 16, lineHeight: 1.35 }}
              >
                {vnData.marketSize.split(";")[0].trim()}
              </div>
            </div>
          )}
          {archDist != null && (
            <div className="stat-tile">
              <div className="stat-tile__label">Architecture Distance</div>
              <div className="stat-tile__value">
                <span className="accent">{archDist}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-gray)",
                    display: "block",
                    marginTop: 4,
                    fontWeight: 400,
                  }}
                >
                  {archDistanceLabel(archDist)}
                </span>
              </div>
            </div>
          )}
          <div className="stat-tile">
            <div className="stat-tile__label">L6 Functional Sub-Systems</div>
            <div className="stat-tile__value">
              <span className="accent">{vnData.l6Systems?.length ?? 0}</span>
            </div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile__label">L5 Process Units (specific steps)</div>
            <div className="stat-tile__value">
              <span className="accent">
                {(vnData.vnUnits ?? []).filter((u: any) => u.level === "L5").length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Core job statement */}
      {(vnData.coreJobStatement || vnData.cfjStatement) && (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderLeft: "3px solid var(--accent-yellow)",
            borderRadius: 8,
            padding: "14px 18px",
            marginBottom: 24,
            fontSize: 14,
            color: "var(--text-white)",
            lineHeight: 1.6,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-gray-dark)",
              display: "block",
              marginBottom: 6,
            }}
          >
            Core Job Statement
          </span>
          {vnData.coreJobStatement || vnData.cfjStatement}
        </div>
      )}

      {/* Output types */}
      {vnData.outputTypes && vnData.outputTypes.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-gray-dark)",
              marginBottom: 10,
            }}
          >
            Output Types / Segments
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(Array.isArray(vnData.outputTypes) ? vnData.outputTypes : []).map(
              (ot: any) => {
                const label = typeof ot === "string" ? ot : ot?.name ?? ot?.id ?? "";
                return (
                  <span
                    key={label}
                    style={{
                      padding: "5px 12px",
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 20,
                      fontSize: 12,
                      color: "var(--text-gray-light)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {label}
                  </span>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Method explanation */}
      <SectionAnchor
        id="vn-method"
        kicker="Method"
        title="How This Analysis Was Conducted"
      />

      <ExecutiveSummary kicker="Analysis method">
        <p className="answer">
          <strong>Why these steps are listed.</strong> The value network is decomposed
          hierarchically: L7 is the full ecosystem, L6 are functional sub-systems
          (the major functional blocks), and L5 are the specific process steps
          within each sub-system. This decomposition maps all co-innovation dependencies
          before committing to a market entry strategy.
        </p>
        <p className="answer" style={{ marginTop: 12 }}>
          <strong>What the steps mean.</strong> Each L5 unit represents a discrete
          buying occasion or integration point. The &ldquo;PRIMARY&rdquo; badge marks
          the L5 unit where the product&rsquo;s functional promise maps most directly.
          Secondary and tertiary positions are adjacent supply opportunities once the
          primary position is established.
        </p>
        <p className="answer" style={{ marginTop: 12 }}>
          <strong>How the following analysis will be conducted.</strong> The diagram
          below is interactive — click any L6 row to expand its L5 children, and click
          any row to read the functional job statement and a plain-language description.
          The goal is to identify the shortest path from the current positioning
          to a volume-production relationship with a systems integrator or OEM in this
          market.
        </p>
      </ExecutiveSummary>

      {/* VN Diagram */}
      <SectionAnchor
        id="vn-diagram"
        kicker="Process Map"
        title={`${marketName} — Process Value Network`}
      />

      {hasDiagramData ? (
        <div style={{ marginTop: 16 }}>
          <VNDiagram data={vnData} />
        </div>
      ) : (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 12,
            padding: "40px 32px",
            textAlign: "center",
            color: "var(--text-gray)",
            marginTop: 16,
          }}
        >
          <p>Value network diagram data not yet available for this market.</p>
        </div>
      )}

      {/* Strategic position note */}
      {strategicNote && (
        <div
          style={{
            marginTop: 24,
            padding: "14px 18px",
            background: "rgba(253,255,152,0.04)",
            border: "1px solid rgba(253,255,152,0.2)",
            borderRadius: 8,
            fontSize: 13,
            color: "var(--text-white)",
            lineHeight: 1.6,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--accent-yellow)",
              display: "block",
              marginBottom: 6,
            }}
          >
            Strategic Position
          </span>
          {strategicNote}
        </div>
      )}

      {/* Sources */}
      <LocalSourceList sources={vnData.sources ?? []} />
    </div>
  );
}
