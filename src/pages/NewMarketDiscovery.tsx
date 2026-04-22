/**
 * NewMarketDiscovery — Page 04 (renumbered; home market removed)
 *
 * Combines discovery + ranking into a single scrollable React page:
 *   1. Executive Summary
 *   2. Market Definition (NAICS explainer)
 *   3. Discovery Process (Phase 02a search config + candidates table)
 *   4. Architecture Distance (Phase 02b)
 *   5. Scoring Criteria (with exec summary)
 *   6. Pipeline Summary
 *   7. Final Ranking Table (all 10 markets)
 *   8. Per-market Rationale Cards
 *   9. Sources
 */

import PageHeader from "@/components/PageHeader";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import ClickableCode from "@/components/ClickableCode";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import SectionAnchor from "@/components/SectionAnchor";
import SourceList from "@/components/SourceList";

import marketDiscovery from "@/data/marketDiscovery.json";
import ranking from "@/data/ranking.json";
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

/* Collect all source IDs used on this page */
const PAGE_SOURCE_IDS = [
  "MD-S01", "MD-S02", "MD-S03", "MD-S04",
  "PROD-S03", "PROD-S05", "PROD-S09", "PROD-S10",
];

/* ---- component ---- */

export default function NewMarketDiscovery() {
  const rankedMarkets = ((ranking as any).rankedMarkets ?? []) as RankedMarket[];
  const candidates = (marketDiscovery as any).candidates ?? [];

  /* guard against missing data */
  if (!rankedMarkets.length) {
    return (
      <>
        <p style={{ color: "var(--text-gray)" }}>Data pending — ranking data not available.</p>
      </>
    );
  }

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <PageHeader
        kicker="Step 02a + 02b / NAICS Discovery & Architecture Distance / New Markets for an Existing Product"
        title="New Market Discovery"
        description="Candidate markets discovered, scored by architecture distance, and ranked by 6-factor composite scoring for the GfS Türwächter IoT."
      />

      {/* ── 1. Executive Summary ─────────────────────────────────────── */}
      <section id="executive-summary" className="container">
        <SectionAnchor id="executive-summary" title="Executive Summary" />
        <div className="md">
        <ExecutiveSummary title="What You're Looking At">
          <p className="answer">
            This page covers the full new-market discovery pipeline for the
            GfS Türwächter IoT (Exit Control 179/1125) — Emergency Exit Security Devices
            with Remote Monitoring. The pipeline discovered <strong>{candidates.length} candidate
            markets</strong> via commodity functional promise search and FP extension
            cross-classification, ranked them by architecture distance, carried{" "}
            {rankedMarkets.length} through full constraint and fit analysis, and produced
            a <strong>6-factor composite score</strong> for each.
          </p>
          <p className="answer">
            What you learn here: which NAICS industry adjacencies scored
            best, why they scored the way they did across ODI opportunity (unmet customer needs),
            feature fit, constraint compatibility, job coverage, value-network
            position, and incumbent vulnerability — and what specific
            go-to-market moves are recommended for each.
          </p>
          <p className="answer">
            What's next: all {rankedMarkets.length} surviving markets fall in the{" "}
            <strong>investigate</strong> band (5.0–7.5 composite). The top
            three — <strong>Hotels &amp; Motels</strong> (6.95),{" "}
            <strong>Continuing Care Retirement</strong> (6.80), and{" "}
            <strong>Elementary &amp; Secondary Schools</strong> (6.61) —
            are recommended for customer-discovery sprints before resource
            allocation. Deep-dive analysis for each market (JTBD, ODI matrix,
            feature-market fit, value network) lives on the{" "}
            <strong>Market Analysis</strong> page.
          </p>
        </ExecutiveSummary>
        </div>
      </section>

      {/* ── 2. Market Definition ─────────────────────────────────────── */}
      <MarketDefinition />

      {/* ── 3. Discovery Process — Phase 02a ─────────────────────────── */}
      <section id="discovery-process" className="container">
        <SectionAnchor
          id="discovery-process"
          title="Discovery Process — Phase 02a"
          kicker="Commodity FP → NAICS Cross-Classification"
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
              <tr>
                <td><strong>Commodity Functional Promise</strong></td>
                <td>{marketDiscovery.commodityFP}</td>
              </tr>
              <tr>
                <td><strong>Custom Product Group</strong></td>
                <td>
                  Emergency Exit Door Alarm Guards (no exact UNSPSC 8-digit match;
                  nearest class: 46171500 Locks and security hardware)
                </td>
              </tr>
              <tr>
                <td><strong>Functional Promise Extension</strong></td>
                <td>{marketDiscovery.fpExtension}</td>
              </tr>
              <tr>
                <td><strong>Extension Domains</strong></td>
                <td>{marketDiscovery.extensionDomains}</td>
              </tr>
              <tr>
                <td><strong>Excluded Markets</strong></td>
                <td>
                  <ClickableCode kind="naics" code="332321" /> — Metal Window and
                  Door Manufacturing (manufacturer's home NAICS — GfS Rettungswegtechnik)
                </td>
              </tr>
            </tbody>
          </table>

          <h3>Primary Functional Promise Search Query</h3>
          <pre>
            <code>{`"What 6-digit NAICS industries need to prevent unauthorized use of
 emergency exit doors while maintaining unimpeded escape capability?
 Broad sector sweep: healthcare, education, hospitality, transportation,
 government, retail, industrial, logistics, food service, cultural
 institutions, senior living, data infrastructure, and defense.
 Return specific industry names and 6-digit NAICS codes."`}</code>
          </pre>

          <h3>Functional Promise Extension Search Query</h3>
          <pre>
            <code>{`"What 6-digit NAICS industries manage distributed passive safety-critical
 devices requiring wireless monitoring without mains power?
 Fire suppression, emergency lighting, industrial safety valves,
 building safety hardware fleets.
 Return specific industry names and 6-digit NAICS codes."`}</code>
          </pre>

          <h3>
            Candidates ({candidates.length} discovered, 1 excluded as home
            market)
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
                  <td>{c.title}</td>
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

      {/* ── 3b. Candidate Details (Phase 02a) ───────────────────────── */}
      <section id="candidate-details" className="container">
        <SectionAnchor id="candidate-details" title="Candidate Details" kicker="Phase 02a" />
        <div className="md">
          <p>
            The cards below summarise why each NAICS code was selected:
            the primary job to be done, why emergency exit security is required, what
            alternatives exist, and our best-available market size estimate.
          </p>

          {((marketDiscovery as unknown as { candidateDetails?: CandidateDetail[] }).candidateDetails ?? []).map((d, i) => (
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

      {/* ── 4. Phase 02b — Architecture Distance ────────────────────── */}
      <section id="architecture-distance" className="container">
        <SectionAnchor
          id="architecture-distance"
          title="Architecture Distance Ranking"
          kicker="Phase 02b — Prioritization Filter"
        />
        <div className="md">
          <h3>Scoring Configuration</h3>
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Product</strong></td>
                <td>GfS Türwächter IoT (Exit Control 179/1125)</td>
              </tr>
              <tr>
                <td><strong>Technology Class</strong></td>
                <td>Emergency Exit Security Devices with Remote Monitoring</td>
              </tr>
              <tr>
                <td><strong>Mechanism</strong></td>
                <td>Spring-loaded mechanical door-handle guard with piezoelectric alarm horn (95 dB) + 868 MHz EasyWave wireless</td>
              </tr>
              <tr>
                <td><strong>Key Specs</strong></td>
                <td>95 dB alarm, 868 MHz EasyWave, 9V battery, surface-mount, ~30m range, EN 179/1125, ~730 EUR (IoT variant)</td>
              </tr>
              <tr>
                <td><strong>Scoring Type</strong></td>
                <td>Hardware components (L1–L4) — criteria U1–U5 + H1–H4</td>
              </tr>
              <tr>
                <td><strong>Tiered Discovery</strong></td>
                <td>Not used ({candidates.length} candidates &lt; 20 threshold)</td>
              </tr>
            </tbody>
          </table>

          <h3>Scoring Criteria</h3>
          <h4>Universal (U1–U5)</h4>
          <ul>
            <li><strong>U1:</strong> Operating environment similarity</li>
            <li><strong>U2:</strong> Regulatory regime distance</li>
            <li><strong>U3:</strong> Customer type similarity</li>
            <li><strong>U4:</strong> Integration architecture</li>
            <li><strong>U5:</strong> Price point alignment</li>
          </ul>
          <h4>Hardware-Specific (H1–H4)</h4>
          <ul>
            <li><strong>H1:</strong> Physical envelope match (size, mounting, interfaces)</li>
            <li><strong>H2:</strong> Media / material compatibility</li>
            <li><strong>H3:</strong> Performance specification match (alarm volume, range, battery life)</li>
            <li><strong>H4:</strong> Certification transferability (EN 179/1125, CE)</li>
          </ul>
          <p>
            <em>Scale: 1 = nearly identical to current use case, 10 = completely different.</em>
          </p>

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
              {((marketDiscovery as unknown as { archDistanceData?: ArchDistanceRow[] }).archDistanceData ?? []).map((row, i) => (
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

      {/* ── 5. Scoring Criteria ─────────────────────────────────────── */}
      <ScoringCriteria />

      {/* ── 6. Pipeline Summary ─────────────────────────────────────── */}
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
                <td><strong>Markets Discovered (Phase 02a)</strong></td>
                <td>{candidates.length}</td>
              </tr>
              <tr>
                <td><strong>Home Market Excluded</strong></td>
                <td>
                  1 (<ClickableCode kind="naics" code="332321" /> — Metal Window and Door Manufacturing)
                </td>
              </tr>
              <tr>
                <td><strong>Carried Through Full Analysis</strong></td>
                <td>{rankedMarkets.length} candidate markets</td>
              </tr>
              <tr>
                <td><strong>Eliminated by Constraint Knockout</strong></td>
                <td>0 (no absolute constraint violations across any market)</td>
              </tr>
              <tr>
                <td><strong>Markets Ranked</strong></td>
                <td>{rankedMarkets.length}</td>
              </tr>
              <tr>
                <td><strong>Not Analyzed Downstream</strong></td>
                <td>
                  5 (Airports, Refrigerated Warehousing, Pharma Manufacturing,
                  Food Manufacturing, Fire Protection — below priority threshold
                  or insufficient data for full deep-dive)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 7. Final Ranking Table ───────────────────────────────────── */}
      <RankingTable markets={rankedMarkets} />

      {/* ── 8. Per-market Rationale Cards ───────────────────────────── */}
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
            market-level deep-dive (JTBD, ODI matrix, Kano, Value Network,
            BOM, Compatibility, Alternatives) on the Analysis page.
          </p>
        </div>
        {rankedMarkets.map((m) => (
          <MarketRationaleCard key={m.slug} market={m} />
        ))}
      </section>

      {/* ── 9. Sources ───────────────────────────────────────────────── */}
      <section id="sources" className="container">
        <SourceList
          sourceIds={PAGE_SOURCE_IDS}
          title="Sources — Market Discovery & Ranking"
        />
      </section>
    </>
  );
}
