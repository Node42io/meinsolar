/**
 * New Market Analysis — deep-dive per market.
 *
 * Routes:
 *   /analysis                     -> NoMarketSelected picker
 *   /analysis/:marketSlug         -> redirect to default tab
 *   /analysis/:marketSlug/:tab    -> full analysis view
 *
 * Layout (when a market is selected):
 *   PageHeader (title + exec summary)
 *   MarketTabs — all markets from index.json, ordered by ranking
 *   MarketHeader — name, NAICS, composite score, rec badge, rationale
 *   AnalysisTabs — jtbd / value-network / kano / compatibility / alternatives / ...
 *   Tab content area
 *
 * Market tab row, market header, and analysis tab row are fully dynamic
 * from markets/index.json + ranking.json. No hardcoded market names.
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
      }
    }
  } catch {
    // Fallback: show all base tabs
  }
  return tabs;
}

const DEFAULT_TAB = "jtbd";

/* =========================================================================
   Build the market tab list dynamically from index.json + ranking.json.
   Markets are shown in rank order (from ranking.json), with composite
   scores displayed as tab metadata.
   ========================================================================= */
function buildMarketTabs(): MarketTab[] {
  const rankingData = ranking as any;
  const rankedMarkets: any[] = rankingData?.rankedMarkets ?? [];

  // Build a lookup: slug -> { rank, composite }
  const rankBySlug: Record<string, { rank: number; composite: number }> = {};
  for (const rm of rankedMarkets) {
    if (rm.slug) {
      rankBySlug[rm.slug] = {
        rank: rm.rank,
        composite: rm.scores?.composite ?? 0,
      };
    }
  }

  // Only show markets that have data bundles
  return marketsIndex
    .filter((m) => !!markets[m.slug])
    .map((m) => {
      const ranked = rankBySlug[m.slug];
      return {
        slug: m.slug,
        label: m.name,
        meta: ranked && ranked.composite != null
          ? ranked.composite.toFixed(2)
          : undefined,
      };
    });
}

/* =========================================================================
   Tab switcher — renders the correct tab component for the active slug
   ========================================================================= */
/** Map base tab slugs to their json_exporter type for GenericAnalysisTab fallback */
const BASE_TAB_TO_TYPE: Record<string, string> = {
  "jtbd": "jtbd_analysis",
  "value-network": "value_network",
  "bom": "product_bom",
  "kano": "feature_market_fit",
  "compatibility": "constraint_compatibility",
  "alternatives": "feature_market_fit",
};

function TabContent({
  tabSlug,
  marketSlug,
}: {
  tabSlug: string;
  marketSlug: string;
}) {
  // If market is NOT in the static bundle, use GenericAnalysisTab for ALL tabs
  const isStaticMarket = !!markets[marketSlug];

  if (!isStaticMarket) {
    const analysisType = TAB_TO_TYPE[tabSlug] || BASE_TAB_TO_TYPE[tabSlug] || tabSlug;
    return <GenericAnalysisTab marketSlug={marketSlug} analysisType={analysisType} />;
  }

  // Static market — use custom visualizations for proven types
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
      const analysisType = TAB_TO_TYPE[tabSlug];
      if (analysisType) {
        return <GenericAnalysisTab marketSlug={marketSlug} analysisType={analysisType} />;
      }
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

  // -- Case 1: no slug at all -> show market picker
  if (!marketSlug) {
    return <NoMarketSelected />;
  }

  // -- Case 2: slug given but no tab -> redirect to default tab
  const isStaticMarket = !!markets[marketSlug];
  if (!tab) {
    const defaultTab = isStaticMarket ? DEFAULT_TAB : "application-engineering";
    return <Navigate to={`/analysis/${marketSlug}/${defaultTab}`} replace />;
  }

  // -- Case 3: validate the slug -- check static bundle first, then dynamic
  const bundle = markets[marketSlug];

  // If market not in static bundle, render dynamic-only view (GenericAnalysisTab)
  if (!bundle) {
    const dynamicTabs = buildAnalysisTabs(marketSlug);
    const displayName = marketSlug.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    return (
      <div>
        <PageHeader
          kicker="Deep-dive per market"
          title={displayName}
          description={`Dynamic analysis for ${displayName}. Data loaded from JSON exports.`}
        />

        {/* --- Analysis tab row --- */}
        <div
          style={{
            borderBottom: "1px solid var(--border-subtle)",
            padding: "0 32px",
            background: "var(--bg-page)",
          }}
        >
          <AnalysisTabs tabs={dynamicTabs} marketSlug={marketSlug} />
        </div>

        {/* --- Tab content --- */}
        <div style={{ padding: "0 56px" }}>
          <TabContent tabSlug={tab} marketSlug={marketSlug} />
        </div>
      </div>
    );
  }

  // -- Static bundle exists -- full rendering with market header
  const meta = bundle.meta;
  const rankingData = ranking as any;
  const ranked = rankingData.rankedMarkets?.find((rm: any) => rm.slug === marketSlug) ?? null;
  const marketTabs = buildMarketTabs();
  const executiveSummary = rankingData.executiveSummary ?? "";

  return (
    <div>
      {/* --- Page header --- */}
      <PageHeader
        kicker="Deep-dive per market"
        title="New Market Analysis"
        description={executiveSummary}
      />

      {/* --- Market tab row (dynamic from index.json + ranking.json) --- */}
      <MarketTabs markets={marketTabs} />

      {/* --- Market overview strip --- */}
      <MarketHeader meta={meta} ranked={ranked} />

      {/* --- Analysis tab row --- */}
      <div
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          padding: "0 32px",
          background: "var(--bg-page)",
        }}
      >
        <AnalysisTabs tabs={buildAnalysisTabs(marketSlug)} marketSlug={marketSlug} />
      </div>

      {/* --- Tab content --- */}
      <div style={{ padding: "0 56px" }}>
        <TabContent tabSlug={tab} marketSlug={marketSlug} />
      </div>
    </div>
  );
}
