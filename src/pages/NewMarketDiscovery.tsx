/**
 * NewMarketDiscovery — Market Discovery & Ranking page.
 *
 * Combines discovery + ranking into a single scrollable React page:
 *   1. Executive Summary
 *   2. Market Definition (NAICS explainer)
 *   3. Discovery Process (Phase 02a search config + candidates table)
 *   4. Architecture Distance (Phase 02b — if data exists)
 *   5. Scoring Criteria (with exec summary)
 *   6. Pipeline Summary
 *   7. Final Ranking Table
 *   8. Per-market Rationale Cards
 *   9. Sources
 *
 * Handles both domain-specific (candidates[], rankedMarkets[]) and
 * generic ({sections, tables, entities}) data formats.
 */

import PageHeader from "@/components/PageHeader";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import ClickableCode from "@/components/ClickableCode";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import SectionAnchor from "@/components/SectionAnchor";
import SourceList from "@/components/SourceList";
import GenericSectionPage from "@/components/GenericSectionPage";

import { marketDiscovery, ranking } from "@/data";
import type { ArchDistanceRow, CandidateDetail } from "@/types";

import MarketDefinition from "./discovery/MarketDefinition";
import ScoringCriteria from "./discovery/ScoringCriteria";
import RankingTable from "./discovery/RankingTable";
import MarketRationaleCard from "./discovery/MarketRationaleCard";
import type { RankedMarket } from "./discovery/types";

/* ---- helpers ---- */

function confidenceLevel(val: number): "high" | "medium" | "low" {
  if (val >= 0.85) return "high";
  if (val >= 0.75) return "medium";
  return "low";
}

const FIT_BADGE: Record<string, string> = {
  direct: "badge badge--strong",
  adjacent: "badge badge--moderate",
  stretch: "badge badge--weak",
};

const ADOPTION_BADGE: Record<string, string> = {
  established: "badge badge--strong",
  growing: "badge badge--accent",
  emerging: "badge badge--moderate",
};

const DISTANCE_BADGE: Record<string, string> = {
  HIGH: "badge badge--strong",
  MEDIUM: "badge badge--accent",
  LOW: "badge badge--weak",
};

/* ---- component ---- */

export default function NewMarketDiscovery() {
  const disc = marketDiscovery as any;
  const rank = ranking as any;

  // Domain-specific format: candidates[] + rankedMarkets[]
  const candidates: any[] = disc.candidates ?? [];
  const rankedMarkets: RankedMarket[] = (rank.rankedMarkets ?? []) as RankedMarket[];
  const hasDomainData = candidates.length > 0 || rankedMarkets.length > 0;

  // Generic format: sections / tables / entities
  const hasGenericData = !!(disc.sections || disc.tables || disc.entities);

  // If neither format has data, show placeholder
  if (!hasDomainData && !hasGenericData) {
    return (
      <>
        <PageHeader
          kicker="Market Discovery & Ranking"
          title="New Market Discovery"
          description="Data pending — discovery data not available."
        />
        <p style={{ color: "var(--text-gray)", padding: "48px 56px" }}>
          Data pending — market discovery data not available.
        </p>
      </>
    );
  }

  // If only generic format, render through GenericSectionPage
  if (!hasDomainData && hasGenericData) {
    return (
      <>
        <PageHeader
          kicker="Market Discovery & Ranking"
          title="New Market Discovery"
          description={rank.executiveSummary ?? ""}
        />
        <GenericSectionPage data={disc} />
      </>
    );
  }

  // --- Domain-specific rendering below ---

  // Build source IDs from available sources in discovery data
  const discoverySources: string[] = (disc.sources ?? []).map((s: any) => s.id ?? s.prefixedId ?? "").filter(Boolean);

  // Derive product/vendor info from ranking data
  const productName = rank.productName ?? "";
  const vendorName = rank.vendorName ?? "";
  const commodityFP = disc.commodityFP ?? rank.commodityFunctionalPromise ?? "";
  const executiveSummary = rank.executiveSummary ?? "";
  const totalEvaluated = rank.totalMarketsEvaluated ?? rankedMarkets.length;
  const eliminated = rank.marketsEliminatedByConstraints ?? 0;
  const totalDiscovered = disc.totalNaicsDiscovered ?? candidates.length;

  // Derive UNSPSC context from discovery data
  const unspscContext = disc.unspscContext ?? "";

  // FP extensions — handle both fpExtension (string) and fpExtensions (array)
  const fpExtensions: string[] = Array.isArray(disc.fpExtensions)
    ? disc.fpExtensions
    : disc.fpExtension
    ? [disc.fpExtension]
    : [];

  const extensionDomains = disc.extensionDomains ?? "";

  // Architecture distance data (may not exist for all projects)
  const archDistanceData: ArchDistanceRow[] =
    (disc as any).archDistanceData ?? [];

  // Candidate details (may not exist for all projects)
  const candidateDetails: CandidateDetail[] =
    (disc as any).candidateDetails ?? [];

  // Excluded markets info
  const excludedMarkets: any[] = disc.excludedMarkets ?? [];

  // Recommendation distribution
  const recDist = rank.recommendationDistribution ?? {};
  const pursueCount = recDist.pursue ?? 0;
  const investigateCount = recDist.investigate ?? 0;

  // Top 3 markets for executive summary
  const top3 = rankedMarkets.slice(0, 3);

  return (
    <>
      {/* == Page Header ====================================================== */}
      <PageHeader
        kicker="NAICS Discovery & Architecture Distance / New Markets for an Existing Product"
        title="New Market Discovery"
        description={`Candidate markets discovered, scored by architecture distance, and ranked by 6-factor composite scoring${productName ? ` for ${productName}` : ""}${vendorName ? ` (${vendorName})` : ""}.`}
      />

      {/* == 1. Executive Summary ============================================= */}
      <section id="executive-summary" className="container">
        <SectionAnchor id="executive-summary" title="Executive Summary" />
        <div className="md">
          <ExecutiveSummary title="What You're Looking At">
            <p className="answer">
              This page covers the full new-market discovery pipeline
              {productName ? ` for ${productName}` : ""}
              {vendorName ? ` (${vendorName})` : ""}. The pipeline
              discovered <strong>{totalDiscovered} candidate markets</strong> via
              commodity functional promise search and cross-classification,
              ranked them by architecture distance, carried{" "}
              {totalEvaluated} through full constraint and fit analysis, and produced
              a <strong>6-factor composite score</strong> for each.
            </p>
            <p className="answer">
              What you learn here: which NAICS industry adjacencies scored
              best, why they scored the way they did across ODI opportunity (unmet customer needs),
              feature fit, constraint compatibility, job coverage, value-network
              position, and incumbent vulnerability — and what specific
              go-to-market moves are recommended for each.
            </p>
            {top3.length > 0 && (
              <p className="answer">
                What's next: the top markets are{" "}
                {top3.map((m, i) => (
                  <span key={m.slug}>
                    {i > 0 && (i === top3.length - 1 ? ", and " : ", ")}
                    <strong>{m.marketName}</strong> ({m.scores.composite.toFixed(2)})
                  </span>
                ))}
                {" — "}
                {pursueCount > 0
                  ? `${pursueCount} recommended to pursue, ${investigateCount} to investigate.`
                  : `all ${rankedMarkets.length} fall in the investigate band (5.0\u20137.5 composite).`}
                {" "}Deep-dive analysis for each market lives on the{" "}
                <strong>Market Analysis</strong> page.
              </p>
            )}
            {executiveSummary && (
              <p className="answer">{executiveSummary}</p>
            )}
          </ExecutiveSummary>
        </div>
      </section>

      {/* == 2. Market Definition ============================================= */}
      <MarketDefinition />

      {/* == 3. Discovery Process — Phase 02a ================================= */}
      <section id="discovery-process" className="container">
        <SectionAnchor
          id="discovery-process"
          title="Discovery Process — Phase 02a"
          kicker="Commodity FP Search & Cross-Classification"
        />
        <div className="md">
          <h3>Search Configuration</h3>
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {commodityFP && (
                <tr>
                  <td><strong>Commodity Functional Promise</strong></td>
                  <td>{commodityFP}</td>
                </tr>
              )}
              {unspscContext && (
                <tr>
                  <td><strong>Product Classification</strong></td>
                  <td>{unspscContext}</td>
                </tr>
              )}
              {fpExtensions.length > 0 && (
                <tr>
                  <td><strong>FP Extension{fpExtensions.length > 1 ? "s" : ""}</strong></td>
                  <td>
                    {fpExtensions.length === 1
                      ? fpExtensions[0]
                      : (
                        <ul style={{ margin: 0, paddingLeft: 16 }}>
                          {fpExtensions.map((ext, i) => (
                            <li key={i}>{ext}</li>
                          ))}
                        </ul>
                      )}
                  </td>
                </tr>
              )}
              {extensionDomains && (
                <tr>
                  <td><strong>Extension Domains</strong></td>
                  <td>{extensionDomains}</td>
                </tr>
              )}
              {excludedMarkets.length > 0 && (
                <tr>
                  <td><strong>Excluded Markets</strong></td>
                  <td>
                    {excludedMarkets.map((em: any, i: number) => (
                      <div key={i} style={{ marginBottom: i < excludedMarkets.length - 1 ? 4 : 0 }}>
                        <ClickableCode kind="naics" code={em.naics ?? em.code ?? ""} />
                        {" "}{em.title ?? em.name ?? em.reason ?? ""}
                      </div>
                    ))}
                  </td>
                </tr>
              )}
              {disc.scoringType && (
                <tr>
                  <td><strong>Scoring Type</strong></td>
                  <td>{disc.scoringType}</td>
                </tr>
              )}
              {disc.tieredDiscoveryUsed != null && (
                <tr>
                  <td><strong>Tiered Discovery</strong></td>
                  <td>
                    {disc.tieredDiscoveryUsed
                      ? `Used (${totalDiscovered} candidates, max ${disc.maxMarketsSelected ?? "N/A"} selected)`
                      : `Not used (${totalDiscovered} candidates)`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <h3>
            Candidates ({candidates.length} discovered
            {excludedMarkets.length > 0 ? `, ${excludedMarkets.length} excluded` : ""})
          </h3>

          {/* Confidence legend */}
          <div
            style={{
              background: "var(--surface-dark)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 16,
              fontSize: 12,
              color: "var(--text-gray-light)",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--text-gray-dark)",
                flexShrink: 0,
                paddingTop: 2,
              }}
            >
              Confidence key
            </span>
            <span>
              <ConfidenceBadge level="high" /> — claim supported by authoritative,
              verifiable source.{" "}
              <ConfidenceBadge level="medium" /> — directionally correct but
              proxied or inferred.{" "}
              <ConfidenceBadge level="low" /> — not independently verified;
              treat as directional only.
            </span>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>NAICS</th>
                <th>Title</th>
                <th>Functional Promise Fit</th>
                <th>Adoption</th>
                <th>Discovery Source</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c: any, i: number) => (
                <tr key={c.naics}>
                  <td style={{ fontFamily: "var(--font-mono)", textAlign: "center" }}>
                    {i + 1}
                  </td>
                  <td>
                    <ClickableCode kind="naics" code={c.naics} />
                  </td>
                  <td>{c.title ?? c.marketName ?? ""}</td>
                  <td>
                    <span className={FIT_BADGE[c.fpFit] ?? "badge badge--neutral"}>
                      {c.fpFit}
                    </span>
                  </td>
                  <td>
                    <span
                      className={ADOPTION_BADGE[c.adoption] ?? "badge badge--neutral"}
                    >
                      {c.adoption}
                    </span>
                  </td>
                  <td
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--text-gray)",
                    }}
                  >
                    {c.discoverySource}
                  </td>
                  <td>
                    <ConfidenceBadge level={confidenceLevel(c.confidence)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* == 3b. Candidate Details (if available) ============================= */}
      {candidateDetails.length > 0 && (
        <section id="candidate-details" className="container">
          <SectionAnchor id="candidate-details" title="Candidate Details" kicker="Phase 02a" />
          <div className="md">
            <p>
              The cards below summarise why each NAICS code was selected:
              the primary job to be done, why the product is relevant, what
              alternatives exist, and our best-available market size estimate.
            </p>

            {candidateDetails.map((d, i) => (
              <div
                key={d.naics}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 10,
                  padding: "20px 24px",
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--accent-yellow)",
                      fontWeight: 600,
                    }}
                  >
                    #{i + 1}
                  </span>
                  <ClickableCode kind="naics" code={d.naics} />
                  <span style={{ fontSize: 15, fontWeight: 500, color: "var(--text-white)" }}>
                    {d.title}
                  </span>
                </div>
                <table style={{ marginTop: 0, marginBottom: 0 }}>
                  <tbody>
                    <tr>
                      <td style={{ width: 160 }}><strong>Job</strong></td>
                      <td>{d.job}</td>
                    </tr>
                    <tr>
                      <td><strong>Why needed</strong></td>
                      <td>{d.whyNeeded}</td>
                    </tr>
                    <tr>
                      <td><strong>Alternatives</strong></td>
                      <td>{d.alternatives}</td>
                    </tr>
                    <tr>
                      <td><strong>Market size est.</strong></td>
                      <td>
                        {d.marketSize}{" "}
                        <ConfidenceBadge level={confidenceLevel(d.confidence)} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* == 4. Phase 02b — Architecture Distance (if data exists) ============ */}
      {archDistanceData.length > 0 && (
        <section id="architecture-distance" className="container">
          <SectionAnchor
            id="architecture-distance"
            title="Architecture Distance Ranking"
            kicker="Phase 02b — Prioritization Filter"
          />
          <div className="md">
            <h3>Ranked Results</h3>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>NAICS</th>
                  <th>Title</th>
                  <th style={{ textAlign: "center" }}>Distance</th>
                  <th style={{ textAlign: "center" }}>Uses Tech</th>
                  <th>Functional Promise Fit</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {archDistanceData.map((row, i) => (
                  <tr key={row.naics}>
                    <td
                      style={{
                        fontFamily: "var(--font-mono)",
                        textAlign: "center",
                        color: "var(--text-gray)",
                      }}
                    >
                      {i + 1}
                    </td>
                    <td>
                      <ClickableCode kind="naics" code={row.naics} />
                    </td>
                    <td>{row.title}</td>
                    <td
                      style={{
                        textAlign: "center",
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        color: "var(--text-white)",
                      }}
                    >
                      {row.distance}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: row.usesTech ? "var(--status-high)" : "var(--text-gray)",
                        }}
                      >
                        {row.usesTech ? "yes" : "no"}
                      </span>
                    </td>
                    <td>
                      <span className={FIT_BADGE[row.fpFit] ?? "badge badge--neutral"}>
                        {row.fpFit}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          DISTANCE_BADGE[row.priority] ?? "badge badge--neutral"
                        }
                      >
                        {row.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* == 4b. Inline architecture distance from candidates (if no separate data) == */}
      {archDistanceData.length === 0 && candidates.some((c: any) => c.architectureDistance != null) && (
        <section id="architecture-distance" className="container">
          <SectionAnchor
            id="architecture-distance"
            title="Architecture Distance Ranking"
            kicker="Phase 02b — Prioritization Filter"
          />
          <div className="md">
            <h3>Ranked Results</h3>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>NAICS</th>
                  <th>Title</th>
                  <th style={{ textAlign: "center" }}>Distance</th>
                  <th style={{ textAlign: "center" }}>Uses Tech</th>
                  <th>Functional Promise Fit</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {[...candidates]
                  .sort((a: any, b: any) => (a.architectureDistance ?? 99) - (b.architectureDistance ?? 99))
                  .map((c: any, i: number) => (
                    <tr key={c.naics}>
                      <td
                        style={{
                          fontFamily: "var(--font-mono)",
                          textAlign: "center",
                          color: "var(--text-gray)",
                        }}
                      >
                        {i + 1}
                      </td>
                      <td>
                        <ClickableCode kind="naics" code={c.naics} />
                      </td>
                      <td>{c.title ?? c.marketName ?? ""}</td>
                      <td
                        style={{
                          textAlign: "center",
                          fontFamily: "var(--font-mono)",
                          fontWeight: 700,
                          color: "var(--text-white)",
                        }}
                      >
                        {c.architectureDistance}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            color: c.alreadyUsesTechnology ? "var(--status-high)" : "var(--text-gray)",
                          }}
                        >
                          {c.alreadyUsesTechnology ? "yes" : "no"}
                        </span>
                      </td>
                      <td>
                        <span className={FIT_BADGE[c.fpFit] ?? "badge badge--neutral"}>
                          {c.fpFit}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            DISTANCE_BADGE[c.marketPriority] ?? "badge badge--neutral"
                          }
                        >
                          {c.marketPriority}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* == 5. Scoring Criteria ============================================== */}
      <ScoringCriteria />

      {/* == 6. Pipeline Summary ============================================== */}
      <section id="pipeline-summary" className="container">
        <SectionAnchor id="pipeline-summary" title="Pipeline Summary" />
        <div className="md">
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Markets Discovered</strong></td>
                <td>{totalDiscovered}</td>
              </tr>
              {excludedMarkets.length > 0 && (
                <tr>
                  <td><strong>Excluded Markets</strong></td>
                  <td>
                    {excludedMarkets.length} (
                    {excludedMarkets.map((em: any) => em.title ?? em.name ?? em.naics).join(", ")}
                    )
                  </td>
                </tr>
              )}
              <tr>
                <td><strong>Carried Through Full Analysis</strong></td>
                <td>{totalEvaluated} candidate markets</td>
              </tr>
              <tr>
                <td><strong>Eliminated by Constraint Knockout</strong></td>
                <td>{eliminated}</td>
              </tr>
              <tr>
                <td><strong>Markets Ranked</strong></td>
                <td>{rankedMarkets.length}</td>
              </tr>
              {totalDiscovered > rankedMarkets.length && (
                <tr>
                  <td><strong>Not Analyzed Downstream</strong></td>
                  <td>
                    {totalDiscovered - rankedMarkets.length} markets outside pipeline scope
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* == 7. Final Ranking Table =========================================== */}
      {rankedMarkets.length > 0 && (
        <RankingTable markets={rankedMarkets} />
      )}

      {/* == 8. Per-market Rationale Cards ===================================== */}
      {rankedMarkets.length > 0 && (
        <section id="market-rationale" className="container">
          <SectionAnchor
            id="market-rationale"
            title="Per-Market Rationale"
            kicker="Strategic Synthesis"
          />
          <div className="md" style={{ marginBottom: 24 }}>
            <p>
              Each card below details the recommendation rationale, entry
              strategy, time and investment estimates for one candidate market.
              Click the link at the bottom of any card to open the full
              market-level deep-dive on the Analysis page.
            </p>
          </div>
          {rankedMarkets.map((m) => (
            <MarketRationaleCard key={m.slug} market={m} />
          ))}
        </section>
      )}

      {/* == 9. Sources ======================================================= */}
      {discoverySources.length > 0 && (
        <section id="sources" className="container">
          <SourceList
            sourceIds={discoverySources}
            title="Sources — Market Discovery & Ranking"
          />
        </section>
      )}
    </>
  );
}
