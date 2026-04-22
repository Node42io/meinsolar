/**
 * AlternativesTab — competing technologies and alternative solutions analysis.
 *
 * Handles BOTH domain-specific format (has .alternatives[] array with
 * { name, unspsc, tradeoffs, category?, existential? }) AND generic format
 * ({sections, tables, entities} from json_exporter).
 *
 * Renders AlternativeCard for each alternative entry.
 */

import { getMarket } from "@/data";

import ExecutiveSummary from "@/components/ExecutiveSummary";
import ClickableCode from "@/components/ClickableCode";
import SectionAnchor from "@/components/SectionAnchor";

import AlternativeCard from "./alternatives/AlternativeCard";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

interface AlternativeEntry {
  name: string;
  unspsc: string;
  tradeoffs: string;
  category?: string;
  existential?: boolean;
}

/** Extract alternatives from generic-format tables */
function extractAlternativesFromGeneric(rawData: any): AlternativeEntry[] {
  const tables: any[] = rawData?.tables ?? [];
  const results: AlternativeEntry[] = [];
  for (const t of tables) {
    const h: string[] = t.headers ?? [];
    if (h.includes("Alternative") || h.includes("Technology") || h.includes("Name")) {
      for (const r of t.rows ?? []) {
        results.push({
          name: r["Alternative"] ?? r["Technology"] ?? r["Name"] ?? "",
          unspsc: r["UNSPSC (neutral)"] ?? r["UNSPSC"] ?? "",
          tradeoffs: r["Inherent trade-offs"] ?? r["Tradeoffs"] ?? r["Weaknesses"] ?? "",
          category: r["Category"] ?? "",
        });
      }
    }
  }
  // Also check entities[0].incumbents or entities[0].alternatives
  const entity = rawData?.entities?.[0];
  if (entity?.alternatives && Array.isArray(entity.alternatives)) {
    for (const a of entity.alternatives) {
      results.push({
        name: a.name ?? "",
        unspsc: a.unspsc ?? "",
        tradeoffs: a.tradeoffs ?? "",
        category: a.category ?? "",
        existential: a.existential,
      });
    }
  }
  return results;
}

/* ─── Main component ──────────────────────────────────────────────────────── */

export default function AlternativesTab({ marketSlug }: { marketSlug: string }) {
  let rawData: any = {};
  try { rawData = getMarket(marketSlug).alternatives; } catch { /* */ }

  const marketName: string =
    rawData?.marketName ?? rawData?.entities?.[0]?.market_name ?? marketSlug;
  const naicsCode: string = rawData?.naicsCode ?? "";

  // Domain-specific: .alternatives[] array
  const domainAlternatives: AlternativeEntry[] =
    Array.isArray(rawData?.alternatives) && rawData.alternatives.length > 0
      ? rawData.alternatives
      : [];

  // Fallback: extract from generic tables/entities
  const alternatives: AlternativeEntry[] =
    domainAlternatives.length > 0
      ? domainAlternatives
      : extractAlternativesFromGeneric(rawData);

  const hasData = alternatives.length > 0;

  return (
    <div className="section">
      {/* Eyebrow */}
      <div className="section__eyebrow">
        Competitive Landscape · Alternatives &amp; Competing Technologies · {marketName}
      </div>

      {/* Title */}
      <h2 className="section__title">Competing Technologies</h2>

      {/* Executive summary */}
      <ExecutiveSummary kicker="Alternatives / Executive Summary">
        <p className="answer">
          This tab maps the <strong>competing supply options</strong> that customers in{" "}
          <strong>{marketName}</strong>
          {naicsCode && (
            <>
              {" "}(<ClickableCode kind="naics" code={naicsCode} />)
            </>
          )}{" "}
          could use <em>instead of</em> the subject product to fulfil their
          functional need. An &ldquo;alternative&rdquo; here means any technology, process, or
          existing supply arrangement that satisfies the same functional requirement.
        </p>
        {hasData && (
          <p className="answer">
            <strong>{alternatives.length} alternative{alternatives.length !== 1 ? "s" : ""}</strong>{" "}
            identified in this market.
            {alternatives.some(a => a.existential) && (
              <> Some are flagged as <strong>existential</strong> threats that could structurally
              displace the subject approach.</>
            )}
          </p>
        )}
      </ExecutiveSummary>

      {/* Alternative cards */}
      {!hasData ? (
        <p style={{ color: "var(--text-gray)", fontStyle: "italic", fontSize: 13 }}>
          Data pending — alternative technology data for {marketName} has not yet been generated.
        </p>
      ) : (
        <div>
          <SectionAnchor id={`alternatives-techs-${marketSlug}`}>
            <h3
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--text-gray)",
                marginBottom: 16,
                marginTop: 8,
              }}
            >
              Competing Technologies in {marketName} ({alternatives.length})
            </h3>
          </SectionAnchor>

          <div className="alternatives-grid">
            {alternatives.map((alt, i) => (
              <AlternativeCard
                key={alt.name || i}
                alternative={alt}
                rank={i + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
