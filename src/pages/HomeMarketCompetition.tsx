/**
 * Page: /home-market
 * 04 Home Market Competition — shows the incumbent technology landscape
 * across ZOLLERN's 12 existing application markets.
 *
 * Per-market deep-dive (JTBD, VN, BOM, etc.) is in Page 08 Market Analysis.
 */

import PageHeader from "@/components/PageHeader";
import ExecutiveSummary from "@/components/ExecutiveSummary";

// The competition analysis content
import HomeMarketCompetitionSection from "@/pages/home/HomeMarketCompetition";

export default function HomeMarketCompetition() {
  return (
    <div>
      {/* ─── Page header ─────────────────────────────────────────────── */}
      <PageHeader
        kicker="04 · Market Competition · NAICS 331110"
        title="Home Market Competition"
      />

      {/* ─── Executive summary ────────────────────────────────────────── */}
      <div style={{ padding: "0 56px" }}>
        <ExecutiveSummary kicker="Market Competition / Overview" title="Our current ground">
          <p className="answer">
            ZOLLERN's Steel Profiles division competes across 12 established application markets —
            from linear guides and elevator rails to automotive components and medical instruments.
            This page maps the incumbent technology landscape, covering the competing
            manufacturing technologies (machined bar stock, forgings, castings, roll-formed sections),
            their market-share tiers, and switching-cost dynamics. For per-market deep-dives
            (JTBD, Value Network, BOM, ODI), see <strong>Page 08 — Market Analysis</strong>.
          </p>
        </ExecutiveSummary>
      </div>

      {/* ─── Competition content ──────────────────────────────────────── */}
      <div style={{ padding: "0 56px" }}>
        <HomeMarketCompetitionSection />
      </div>
    </div>
  );
}
