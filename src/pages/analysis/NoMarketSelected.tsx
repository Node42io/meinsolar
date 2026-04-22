/**
 * NoMarketSelected — shown at /analysis when no :marketSlug is in the URL.
 *
 * Renders a grid of market cards from markets index + ranking, linking to
 * /analysis/<slug>/jtbd. Fully data-driven — works with both domain-specific
 * (rankedMarkets array) and generic (sections/entities) JSON formats.
 * No hardcoded market names.
 */

import { Link } from "react-router-dom";
import { ranking, marketsIndex, markets } from "@/data";

export default function NoMarketSelected() {
  const rankingData = ranking as any;
  const rankedMarkets: any[] = rankingData?.rankedMarkets ?? [];

  // Build a slug -> ranking map for composite scores and metadata
  const rankBySlug: Record<string, any> = {};
  for (const rm of rankedMarkets) {
    if (rm.slug) rankBySlug[rm.slug] = rm;
  }

  // Summary text from ranking
  const summary = rankingData?.executiveSummary
    ?? (rankingData?.sections?.[0]?.content ?? "").slice(0, 300);

  // Only show markets that have data bundles
  const availableMarkets = marketsIndex.filter((m) => !!markets[m.slug]);

  return (
    <div style={{ padding: "48px 56px" }}>
      {/* Page header */}
      <div className="section-meta" style={{ marginBottom: 8 }}>
        <span>Deep-dive per market</span>
      </div>
      <div className="md" style={{ marginBottom: 6 }}>
        <h1 className="section-title">New Market Analysis</h1>
      </div>
      {summary && (
        <p className="section__sub" style={{ marginBottom: 40, maxWidth: 740 }}>
          {summary}
        </p>
      )}

      {/* Market picker grid */}
      <div className="market-grid">
        {availableMarkets.map((m, i) => {
          const rm = rankBySlug[m.slug];
          const isRef = m.isReference ?? false;

          return (
            <Link
              key={m.slug}
              to={`/analysis/${m.slug}/jtbd`}
              className="market-card"
              style={isRef ? { opacity: 0.55 } : undefined}
            >
              {/* Top row */}
              <div className="market-card__top">
                <span className="market-card__priority">
                  {isRef
                    ? "Reference"
                    : rm
                    ? `Rank ${rm.rank}`
                    : `Market ${i + 1}`}
                </span>
                {rm?.recommendation && (
                  <span
                    className={`badge badge--${
                      rm.recommendation === "pursue"
                        ? "strong"
                        : rm.recommendation === "investigate"
                        ? "moderate"
                        : "neutral"
                    }`}
                  >
                    {rm.recommendation}
                  </span>
                )}
              </div>

              {/* Title */}
              <div className="market-card__title">{m.name}</div>

              {/* NAICS */}
              <div className="market-card__tam">
                <span
                  className="clickable-code"
                  style={{ pointerEvents: "none", cursor: "default" }}
                >
                  NAICS {m.naics}
                </span>
              </div>

              {/* Composite score (if available from ranking) */}
              {rm?.scores?.composite != null && (
                <div style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 22,
                      fontWeight: 700,
                      color: "var(--accent-yellow)",
                    }}
                  >
                    {rm.scores.composite.toFixed(2)}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "var(--text-gray-dark)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Composite
                  </span>
                </div>
              )}

              {/* Rationale */}
              {rm?.rationale && (
                <p className="market-card__headline">{rm.rationale}</p>
              )}

              {/* CTA */}
              <div className="market-card__cta">Explore analysis</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
