/**
 * Page: /home-market  and  /home-market/:tab
 * 04 Home Market — Skipped per project scope.
 *
 * The Türwächter IoT is a new product with no established home market.
 * Home market analysis was skipped per INSTRUCTIONS.md.
 */

import PageHeader from "@/components/PageHeader";
import ExecutiveSummary from "@/components/ExecutiveSummary";

/* =========================================================================
   Main page component
   ========================================================================= */

export default function HomeMarketCompetition() {
  return (
    <div>
      {/* ─── Page header ─────────────────────────────────────────────── */}
      <PageHeader
        kicker="04 · Home Market Analysis"
        title="Home Market — Skipped"
      />

      {/* ─── Executive summary ────────────────────────────────────────── */}
      <div style={{ padding: "0 56px" }}>
        <ExecutiveSummary kicker="Home Market Analysis" title="Skipped per project scope">
          <p className="answer">
            The GfS Türwächter IoT (Exit Control 179/1125) is analyzed as a new product
            entering new markets. GfS Rettungswegtechnik manufactures within NAICS 332321
            (Metal Window and Door Manufacturing), but the product's end markets are downstream
            building operations — not the manufacturing NAICS itself. Per the project
            instructions, Step 04 (Home Market / Incumbents) was skipped. The competitive
            landscape is analyzed per target market in the individual market analysis sections
            (COMPAT tab for each ranked market) instead of a single home-market view.
          </p>
        </ExecutiveSummary>
      </div>

      {/* ─── Info card ────────────────────────────────────────────────── */}
      <div style={{ padding: "32px 56px" }}>
        <div style={{
          background: "var(--bg-surface, #f8f9fa)",
          border: "1px solid var(--border-subtle, #e2e8f0)",
          borderRadius: "8px",
          padding: "24px 32px",
          maxWidth: "720px"
        }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "16px", fontWeight: 600 }}>
            Why was this section skipped?
          </h3>
          <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: 1.7 }}>
            <li>The Türwächter IoT is a <strong>new product</strong> — there is no established home market to analyze</li>
            <li>GfS's manufacturing NAICS (332321) describes <em>how</em> the product is made, not <em>where</em> it is sold</li>
            <li>Competitive analysis is conducted <strong>per target market</strong> in the Market Analysis section</li>
            <li>Business model canvas and go-to-market strategy will be designed separately in a later phase</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
