/**
 * BOMTab — Bill of Materials tab component.
 *
 * Handles BOTH data formats:
 *   A) Domain-specific: l4Subsystems[] + outputTypes[] -> tree visualization
 *   B) Generic: {sections, tables, entities} -> markdown sections with tables
 *
 * All text is data-driven — no hardcoded company names.
 * Product anchor detection uses `isProductAnchor` and `productAnchorIds` from bom.json.
 */

import { useState } from "react";
import { getMarket } from "@/data";
import type { BOMData } from "@/types";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import SectionAnchor from "@/components/SectionAnchor";
import SourceList from "@/components/SourceList";
import { renderMarkdown } from "@/lib/renderMarkdown";

import VariantChips from "./bom/VariantChips";
import BOMCategoryRow from "./bom/BOMCategoryRow";
import "./bom/bom.css";

/* BOM source IDs — registered in src/data/sources.json */
const BOM_SOURCE_IDS = [
  "BOM-S01", "BOM-S02", "BOM-S03", "BOM-S04",
  "BOM-S05", "BOM-S06", "BOM-S07",
];

/* -- Pending placeholder ------------------------------------------------ */
function BOMPendingPlaceholder({ bomData }: { bomData: BOMData }) {
  const companyName = bomData.focalCompany?.name ?? "";
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 12,
        padding: "40px 32px",
        textAlign: "center",
        marginTop: 24,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "var(--text-gray-dark)",
          marginBottom: 12,
        }}
      >
        BOM Data Pending
      </div>
      <p style={{ fontSize: 14, color: "var(--text-gray)", lineHeight: 1.6, maxWidth: 520, margin: "0 auto" }}>
        A Bill of Materials breakdown has not yet been generated for{" "}
        <strong style={{ color: "var(--text-white)" }}>{bomData.marketName}</strong>.
      </p>
      {bomData.sensorNote && (
        <p
          style={{
            marginTop: 16,
            color: "var(--text-gray-light)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 6,
            padding: "10px 16px",
            maxWidth: 560,
            margin: "16px auto 0",
            lineHeight: 1.55,
          }}
        >
          <span style={{ color: "var(--text-gray-dark)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {companyName ? `${companyName} position note: ` : "Position note: "}
          </span>
          {bomData.sensorNote}
        </p>
      )}
    </div>
  );
}

/* -- Product position note callout -------------------------------------- */
function PositionNoteCallout({ note, companyName }: { note: string; companyName: string }) {
  if (!note) return null;
  return (
    <div
      style={{
        background: "rgba(253,255,152,0.04)",
        border: "1px solid rgba(253,255,152,0.15)",
        borderLeft: "3px solid rgba(253,255,152,0.5)",
        borderRadius: 8,
        padding: "12px 16px",
        marginBottom: 20,
        fontSize: 13,
        color: "var(--text-white)",
        lineHeight: 1.55,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "rgba(253,255,152,0.65)",
          display: "block",
          marginBottom: 5,
        }}
      >
        {companyName ? `${companyName} position note` : "Product position note"}
      </span>
      {note}
    </div>
  );
}

/* -- Output type detail callout ----------------------------------------- */
function OutputTypeDetail({
  outputTypes,
  selectedId,
}: {
  outputTypes: NonNullable<BOMData["outputTypes"]>;
  selectedId: string | null;
}) {
  const selected = outputTypes.find((ot) => ot.id === selectedId);
  if (!selected) return null;

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 8,
        padding: "10px 16px",
        marginBottom: 16,
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--text-gray-dark)",
            display: "block",
            marginBottom: 3,
          }}
        >
          {selected.id}{selected.sensorFit ? ` · ${selected.sensorFit} fit` : ""}
        </span>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-white)" }}>
          {selected.name}
        </span>
      </div>
      {selected.notes && (
        <span style={{ fontSize: 12, color: "var(--text-gray-light)", lineHeight: 1.45, paddingTop: 14 }}>
          {selected.notes}
        </span>
      )}
    </div>
  );
}

/* -- Sources ------------------------------------------------------------ */
function BOMSourceList() {
  return <SourceList sourceIds={BOM_SOURCE_IDS} title="Sources — Bill of Materials" />;
}

/* -- Main tab component ------------------------------------------------- */
export default function BOMTab({ marketSlug }: { marketSlug: string }) {
  let bomData: BOMData | null = null;
  let marketName = marketSlug;
  let naicsCode = "";

  try {
    const bundle = getMarket(marketSlug);
    bomData = bundle.bom;
    marketName = bomData.marketName ?? marketSlug;
    naicsCode = bomData.naicsCode ?? "";
  } catch {
    return (
      <div className="section">
        <div className="section__eyebrow">Bill of Materials · {marketSlug}</div>
        <h2 className="section__title">Bill of Materials</h2>
        <p className="section__sub" style={{ color: "var(--status-low)" }}>
          No BOM data found for market &ldquo;{marketSlug}&rdquo;.
        </p>
      </div>
    );
  }

  // Extract company info from data
  const companyName = bomData.focalCompany?.name ?? "";
  const productName = bomData.focalCompany?.product ?? "";
  const productAnchorIds = bomData.productAnchorIds ?? bomData.marquardtAnchorIds ?? [];

  // Detect data format
  const hasSubsystems = bomData.l4Subsystems && bomData.l4Subsystems.length > 0;
  const hasSections = (bomData as any).sections && (bomData as any).sections.length > 0;
  const hasTables = (bomData as any).tables && (bomData as any).tables.length > 0;
  const hasGenericData = hasSections || hasTables;

  // Normalize subsystems: merge l3Modules into modules if needed
  const subsystems = (bomData.l4Subsystems ?? []).map((sub) => ({
    ...sub,
    modules: sub.modules ?? sub.l3Modules ?? [],
    isProductAnchor: sub.isProductAnchor ?? sub.isMarquardtAnchor ?? false,
    confidence: sub.confidence ?? "medium" as const,
    alternatives: sub.alternatives ?? [],
  }));

  // Output types
  const outputTypes = bomData.outputTypes ?? [];

  // Determine default selected output type
  const primaryOTs = outputTypes.filter((ot) => ot.sensorFit === "primary");
  const defaultOTId = primaryOTs.length > 0 ? primaryOTs[0].id : (outputTypes[0]?.id ?? null);

  const [selectedOTId, setSelectedOTId] = useState<string | null>(defaultOTId);

  // -- FORMAT B: Generic sections + tables ----
  if (!hasSubsystems && hasGenericData) {
    const entity = (bomData as any).entities?.[0] ?? {};
    const genMarketName = entity.market_name ?? marketName;

    return (
      <div>
        <div className="section">
          <div className="section__eyebrow">BOM · {genMarketName}</div>
          <h2 className="section__title">Bill of Materials</h2>
          <p className="section__sub">
            The BOM decomposition shows what physical or service components make up the output
            in this market — from the top-level finished good down to raw materials and sub-assemblies.
          </p>
          <ExecutiveSummary kicker="BOM · What you are reading">
            <p className="answer">
              This bill of materials maps the <strong>{genMarketName}</strong> output structure,
              identifying where
              {companyName ? ` ${companyName}'s` : " the"} service inserts into the component hierarchy
              and which sub-systems are critical to project delivery.
              {hasTables && (bomData as any).tables.length > 0 && (
                <> Contains <strong>{(bomData as any).tables.length}</strong> data tables.</>
              )}
            </p>
          </ExecutiveSummary>
        </div>

        {((bomData as any).sections ?? [])
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

        {((bomData as any).tables ?? [])
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

  // -- FORMAT A: Full tree visualization with L4 subsystems ----
  return (
    <div className="section">
      {/* Section eyebrow */}
      <div className="section__eyebrow">
        Bill of Materials{naicsCode ? ` · NAICS ${naicsCode}` : ""}
      </div>

      <h2 className="section__title">Bill of Materials</h2>

      <p className="section__sub">
        {marketName}
      </p>

      {/* Executive summary */}
      <ExecutiveSummary kicker="What you are reading" title="Bill of Materials Analysis">
        <p className="answer">
          A Bill of Materials (BOM) is the complete hierarchical breakdown of every component,
          module, and sub-system that makes up the final product or equipment in this market.
          Reading the BOM for market entry reveals <strong>where
          {companyName ? ` ${companyName}'s` : " the"} {productName || "product"} fits
          in the physical product architecture</strong>.
        </p>
        <p className="answer" style={{ marginTop: 12 }}>
          Each row below is a <strong>L4 subsystem</strong> (the top-level functional block — L4 = major subsystem, L3 = module, L2 = assembly, L1 = part). Clicking a row expands the
          L3 modules. The variant chips in each row show which technologies compete for that
          slot and their current market-share percentages. Rows with a{" "}
          <span
            style={{
              display: "inline-block",
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              fontWeight: 700,
              textTransform: "uppercase",
              color: "var(--accent-yellow)",
              background: "rgba(253,255,152,0.1)",
              border: "1px solid rgba(253,255,152,0.25)",
              borderRadius: 3,
              padding: "1px 5px",
              letterSpacing: "0.06em",
            }}
          >
            Product anchor
          </span>{" "}
          badge are the subsystems or modules where the product competes directly.
        </p>
      </ExecutiveSummary>

      {/* Data pending placeholder */}
      {bomData.dataPending ? (
        <BOMPendingPlaceholder bomData={bomData} />
      ) : (
        <>
          {/* Product position note */}
          {bomData.sensorNote && (
            <PositionNoteCallout note={bomData.sensorNote} companyName={companyName} />
          )}

          {/* Focal company position rationale */}
          {bomData.focalCompany?.positionRationale && (
            <PositionNoteCallout
              note={bomData.focalCompany.positionRationale}
              companyName={companyName}
            />
          )}

          {/* Output type filter row */}
          {outputTypes.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div className="bom-filter-label">Select a Product Output Type to filter context:</div>
              <VariantChips
                outputTypes={outputTypes}
                selectedId={selectedOTId}
                onSelect={setSelectedOTId}
              />
              <OutputTypeDetail outputTypes={outputTypes} selectedId={selectedOTId} />
            </div>
          )}

          {/* L4 subsystem rows */}
          {subsystems.length > 0 && (
            <>
              <SectionAnchor
                id="bom-subsystems"
                kicker="Product Decomposition L4"
                title="Subsystem Breakdown with Competitive Alternatives"
              />

              <ExecutiveSummary kicker="How to read this table">
                <p className="answer">
                  Each row is a top-level subsystem (L4 = major subsystem) of the product. The percentage shown
                  next to the identifier is the approximate BOM cost share. The colored chips
                  show competing technologies for that subsystem — <strong>green = high
                  confidence data</strong>, amber = medium confidence, red = low confidence /
                  analyst estimate. Click any row to see L3 module-level detail and the specific
                  BOM position where the product competes.
                </p>
              </ExecutiveSummary>

              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                {subsystems.map((subsystem, idx) => (
                  <BOMCategoryRow
                    key={subsystem.id}
                    subsystem={subsystem as any}
                    rowIndex={idx + 1}
                    productAnchorIds={productAnchorIds}
                  />
                ))}
              </div>
            </>
          )}

          {/* No subsystems but not pending either */}
          {subsystems.length === 0 && (
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
              <p>No subsystem breakdown available for this market.</p>
            </div>
          )}

          {/* Sources */}
          <BOMSourceList />
        </>
      )}
    </div>
  );
}
