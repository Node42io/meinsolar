/**
 * Page: /home-market
 * 04 Home Market Competition — shows the incumbent technology landscape
 * in the company's home market.
 *
 * Per-market deep-dive (JTBD, VN, BOM, etc.) is in Page 08 Market Analysis.
 */

import { homeMarket } from "@/data";
import PageHeader from "@/components/PageHeader";
import ExecutiveSummary from "@/components/ExecutiveSummary";

// The competition analysis content
import HomeMarketCompetitionSection from "@/pages/home/HomeMarketCompetition";

export default function HomeMarketCompetition() {
  const data = homeMarket as any;
  const marketName: string = data.marketName ?? "Home Market";
  const naicsCode: string = data.naicsCode ?? "";

  return (
    <div>
      {/* Page header */}
      <PageHeader
        kicker={`04 · Market Competition${naicsCode ? ` · NAICS ${naicsCode}` : ""}`}
        title="Home Market Competition"
      />

      {/* Executive summary */}
      <div style={{ padding: "0 56px" }}>
        <ExecutiveSummary kicker="Market Competition / Overview" title="Competitive Landscape">
          <p className="answer">
            This page maps the incumbent technology landscape for the{" "}
            <strong>{marketName}</strong> market, covering competing technologies,
            their market-share tiers, delivery model positioning, and switching-cost dynamics.
            For per-market deep-dives (JTBD, Value Network, BOM, ODI), see{" "}
            <strong>Page 08 — Market Analysis</strong>.
          </p>
        </ExecutiveSummary>
      </div>

      {/* Competition content */}
      <div style={{ padding: "0 56px" }}>
        <HomeMarketCompetitionSection />
      </div>
    </div>
  );
}
