/**
 * Page 06 — New Market Analysis
 *
 * Routes:
 *   /analysis                     → NoMarketSelected picker
 *   /analysis/:marketSlug         → redirect to jtbd tab
 *   /analysis/:marketSlug/:tab    → full analysis view
 *
 * Layout (when a market is selected):
 *   PageHeader (title + exec summary)
 *   MarketTabs — all 8 markets
 *   MarketHeader — name, NAICS, composite score, rec badge, rationale
 *   AnalysisTabs — jtbd / value-network / kano / compatibility / alternatives
 *   Tab content area
 */

import { Navigate, useParams } from "react-router-dom";

import { marketsIndex, ranking, markets } from "@/data";
import PageHeader from "@/components/PageHeader";
import { MarketTabs, AnalysisTabs } from "@/components/Tabs";
import type { MarketTab, AnalysisTab } from "@/components/Tabs";

import MarketHeader from "@/pages/analysis/MarketHeader";
import NoMarketSelected from "@/pages/analysis/NoMarketSelected";

// Tab components — custom visualizations for proven types
import JTBDTab from "@/pages/analysis/tabs/JTBDTab";
import ValueNetworkTab from "@/pages/analysis/tabs/ValueNetworkTab";
import BOMTab from "@/pages/analysis/tabs/BOMTab";
import KanoTab from "@/pages/analysis/tabs/KanoTab";
import CompatibilityTab from "@/pages/analysis/tabs/CompatibilityTab";
import AlternativesTab from "@/pages/analysis/tabs/AlternativesTab";
// Generic tab for new analysis types (tables + text)
import GenericAnalysisTab from "@/pages/analysis/tabs/GenericAnalysisTab";

/* =========================================================================
   Constants — base tabs (always shown) + extended tabs (shown if data exists)
   ========================================================================= */

const BASE_TABS: AnalysisTab[] = [
  { slug: "jtbd", label: "Job-to-be-Done Analysis" },
  { slug: "value-network", label: "Value Network" },
  { slug: "bom", label: "Bill of Materials" },
  { slug: "kano", label: "Kano Analysis" },
  { slug: "compatibility", label: "Compatibility & Constraint Analysis" },
  { slug: "alternatives", label: "Alternative Solutions Analysis" },
];

/** Extended tabs for new workflow archetypes. Rendered via GenericAnalysisTab. */
const EXTENDED_TABS: AnalysisTab[] = [
  { slug: "application-engineering", label: "Application Engineering" },
  { slug: "competitive-intel", label: "Competitive Intelligence" },
  { slug: "market-sizing", label: "Market Sizing" },
  { slug: "business-model", label: "Business Model Canvas" },
  { slug: "go-to-market", label: "Go-to-Market" },
  { slug: "financial-scenarios", label: "Financial Scenarios" },
  { slug: "feasibility", label: "Design Feasibility" },
  { slug: "value-chain", label: "Value Chain" },
  { slug: "working-capital", label: "Working Capital" },
];

/** Map tab slugs to json_exporter analysis type names for GenericAnalysisTab */
const TAB_TO_TYPE: Record<string, string> = {
  "application-engineering": "application_engineering",
  "competitive-intel": "competitive_intel",
  "market-sizing": "market_sizing",
  "business-model": "business_model_canvas",
  "go-to-market": "go_to_market",
  "financial-scenarios": "financial_scenarios",
  "feasibility": "product_design_feasibility",
  "value-chain": "value_chain_construction",
  "working-capital": "working_capital_simulation",
};

/** Build the full tab list: base tabs + any extended tabs that have data */
function buildAnalysisTabs(marketSlug: string): AnalysisTab[] {
  let tabs = [...BASE_TABS];
  try {
    const manifest = (window as any).__CLAYTON_MANIFEST__;
    if (manifest) {
      // Hide BOM tab if this market has no BOM (service industries)
      const marketEntry = manifest.markets?.find((m: any) => m.slug === marketSlug);
      if (marketEntry && !marketEntry.has_bom) {
        tabs = tabs.filter(t => t.slug !== "bom");
      }
      // Add extended tabs if data exists
      if (manifest.market_types?.[marketSlug]) {
        const available = manifest.market_types[marketSlug] as string[];
        for (const ext of EXTENDED_TABS) {
          const typeName = TAB_TO_TYPE[ext.slug];
          if (typeName && available.includes(typeName)) {
            tabs.push(ext);
          }
        }
      } else {
        // No manifest loaded — show all extended tabs (they'll show "no data" gracefully)
        tabs.push(...EXTENDED_TABS);
      }
    } else {
      // No manifest — show all extended tabs
      tabs.push(...EXTENDED_TABS);
    }
  } catch {
    // Fallback: show all tabs
    tabs.push(...EXTENDED_TABS);
  }
  return tabs;
}

const DEFAULT_TAB = "jtbd";

/* =========================================================================
   Build the market tab list from ranking.json (rank order) merged with
   the index.json for slug→name, falling back on index order.
   ========================================================================= */
function buildMarketTabs(): MarketTab[] {
  // Create a rank lookup by slug
  const rankBySLug = Object.fromEntries(
    ranking.rankedMarkets.map((rm) => [
      rm.slug,
      { rank: rm.rank, composite: rm.scores.composite },
    ])
  );

  // Only show markets that have static data bundles (the 12 reference markets)
  return marketsIndex
    .filter((m) => !!markets[m.slug])
    .map((m) => {
      const ranked = rankBySLug[m.slug];
      return {
        slug: m.slug,
        label: m.name,
        meta: ranked && ranked.composite != null ? ranked.composite.toFixed(2) : undefined,
      };
    });
}

/* =========================================================================
   Tab switcher — renders the correct tab component for the active slug
   ========================================================================= */
function TabContent({
  tabSlug,
  marketSlug,
}: {
  tabSlug: string;
  marketSlug: string;
}) {
  // Custom visualizations for proven types
  switch (tabSlug) {
    case "jtbd":
      return <JTBDTab marketSlug={marketSlug} />;
    case "value-network":
      return <ValueNetworkTab marketSlug={marketSlug} />;
    case "bom":
      return <BOMTab marketSlug={marketSlug} />;
    case "kano":
      return <KanoTab marketSlug={marketSlug} />;
    case "compatibility":
      return <CompatibilityTab marketSlug={marketSlug} />;
    case "alternatives":
      return <AlternativesTab marketSlug={marketSlug} />;
    default: {
      // Generic tables + text renderer for new analysis types
      const analysisType = TAB_TO_TYPE[tabSlug];
      if (analysisType) {
        return <GenericAnalysisTab marketSlug={marketSlug} analysisType={analysisType} />;
      }
      // Truly unknown — fallback to jtbd
      return <JTBDTab marketSlug={marketSlug} />;
    }
  }
}

/* =========================================================================
   Main page component
   ========================================================================= */
export default function NewMarketAnalysis() {
  const { marketSlug, tab } = useParams<{
    marketSlug?: string;
    tab?: string;
  }>();

  // ── Case 1: no slug at all → show market picker
  if (!marketSlug) {
    return <NoMarketSelected />;
  }

  // ── Case 2: slug given but no tab → redirect to default tab
  // If market is not in static bundle, default to first extended tab instead of jtbd
  if (!tab) {
    const isStaticMarket = !!markets[marketSlug];
    const defaultTab = isStaticMarket ? DEFAULT_TAB : "application-engineering";
    return <Navigate to={`/analysis/${marketSlug}/${defaultTab}`} replace />;
  }

  // ── Case 3: validate the slug — check static bundle first, then dynamic
  const bundle = markets[marketSlug];

  // If market not in static bundle, render dynamic-only view (GenericAnalysisTab)
  if (!bundle) {
    const dynamicTabs = buildAnalysisTabs(marketSlug);
    const displayName = marketSlug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return (
      <div>
        <PageHeader
          kicker="Page 06 / Deep-dive per market"
          title={displayName}
          description={`Dynamic analysis for ${displayName}. Data loaded from JSON exports.`}
        />

        {/* ─── Analysis tab row ─────────────────────────────────────── */}
        <div
          style={{
            borderBottom: "1px solid var(--border-subtle)",
            padding: "0 32px",
            background: "var(--bg-page)",
          }}
        >
          <AnalysisTabs tabs={dynamicTabs} marketSlug={marketSlug} />
        </div>

        {/* ─── Tab content ──────────────────────────────────────────── */}
        <div style={{ padding: "0 56px" }}>
          <TabContent tabSlug={tab} marketSlug={marketSlug} />
        </div>
      </div>
    );
  }

  // ── Static bundle exists — full rendering with market header
  const meta = bundle.meta;
  const ranked = ranking.rankedMarkets.find((rm) => rm.slug === marketSlug);
  const marketTabs = buildMarketTabs();

  return (
    <div>
      {/* ─── Page header ─────────────────────────────────────────────── */}
      <PageHeader
        kicker="Page 06 / Deep-dive per market"
        title="New Market Analysis"
        description={ranking.executiveSummary}
      />

      {/* ─── Market tab row ───────────────────────────────────────────── */}
      <MarketTabs markets={marketTabs} />

      {/* ─── Market overview strip ────────────────────────────────────── */}
      <MarketHeader meta={meta} ranked={ranked} />

      {/* ─── Analysis tab row ─────────────────────────────────────────── */}
      <div
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          padding: "0 32px",
          background: "var(--bg-page)",
        }}
      >
        <AnalysisTabs tabs={buildAnalysisTabs(marketSlug)} marketSlug={marketSlug} />
      </div>

      {/* ─── Tab content ──────────────────────────────────────────────── */}
      <div style={{ padding: "0 56px" }}>
        <TabContent tabSlug={tab} marketSlug={marketSlug} />
      </div>
    </div>
  );
}
