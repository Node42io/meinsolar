/**
 * BOMCategoryRow — one L4 subsystem row with label, confidence badge, and variant chips.
 *
 * Matches Figma design:
 *   - Left: collapse/expand caret, L4.N identifier in mono font, row label, confidence badge
 *   - Right: inline row of variant chips (VariantCard x N)
 *   - Expandable detail panel showing L3 modules and their variant chips
 *   - Product anchor highlighting (yellow border + badge)
 *
 * All anchor detection uses `isProductAnchor` from JSON data or `productAnchorIds[]`.
 * Uses .bom-category-row CSS classes from bom.css.
 */

import { useState } from "react";
import type { BOML4Subsystem, BOMModule, BOMConfidence } from "@/types";
import ConfidenceTierBadge from "./ConfidenceTierBadge";
import VariantCard from "./VariantCard";

/* -- Chevron icon ------------------------------------------------------- */
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ transition: "transform 0.18s ease", transform: open ? "rotate(180deg)" : "none" }}
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* -- Product anchor badge ----------------------------------------------- */
function AnchorBadge({ note }: { note?: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "var(--accent-yellow)",
        background: "rgba(253,255,152,0.08)",
        border: "1px solid rgba(253,255,152,0.2)",
        borderRadius: 3,
        padding: "2px 6px",
        whiteSpace: "nowrap",
      }}
      title={note}
    >
      Product anchor
    </span>
  );
}

/**
 * Determine if a subsystem or module is a product anchor.
 * Checks explicit isProductAnchor field first, falls back to isMarquardtAnchor,
 * then checks if the item ID is in the productAnchorIds array.
 */
function isAnchor(
  item: { isProductAnchor?: boolean; isMarquardtAnchor?: boolean; id?: string },
  productAnchorIds: string[]
): boolean {
  if (item.isProductAnchor === true) return true;
  if (item.isMarquardtAnchor === true) return true;
  if (item.id && productAnchorIds.includes(item.id)) return true;
  return false;
}

/* -- Module row (L3 level, inside expanded panel) ----------------------- */
function ModuleRow({
  module,
  parentConfidence,
  productAnchorIds,
}: {
  module: BOMModule;
  parentConfidence: BOMConfidence;
  productAnchorIds: string[];
}) {
  const moduleIsAnchor = isAnchor(module, productAnchorIds);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "10px 0",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-gray-dark)",
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 3,
            padding: "2px 6px",
            whiteSpace: "nowrap",
          }}
        >
          {module.id}
        </span>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-white)" }}>
          {module.name}
        </span>
        {moduleIsAnchor && <AnchorBadge note={module.sensorNote} />}
      </div>
      {module.alternatives && module.alternatives.length > 0 && (
        <div className="bom-inline-variants">
          {module.alternatives.map((alt) => (
            <VariantCard
              key={alt.name}
              alternative={alt}
              confidence={parentConfidence}
              functionalRole={module.name}
              detail={module.sensorNote}
              productAnchorIds={productAnchorIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* -- Main component ----------------------------------------------------- */
export interface BOMCategoryRowProps {
  subsystem: BOML4Subsystem;
  /** Display index for the L4.N label (1-based) */
  rowIndex: number;
  /** Product anchor IDs from bom.json for cross-checking. */
  productAnchorIds?: string[];
}

export default function BOMCategoryRow({
  subsystem,
  rowIndex,
  productAnchorIds = [],
}: BOMCategoryRowProps) {
  const [open, setOpen] = useState(false);

  const modules = subsystem.modules ?? (subsystem as any).l3Modules ?? [];
  const hasModules = modules.length > 0;
  const hasAlternatives = subsystem.alternatives && subsystem.alternatives.length > 0;
  const subsystemIsAnchor = isAnchor(subsystem, productAnchorIds);
  const confidence = subsystem.confidence ?? "medium";
  // Use the real L4 ID from the data (e.g. "L4-A"); fall back to index only if missing.
  const idLabel = subsystem.id?.startsWith("L4") ? subsystem.id : `L4.${rowIndex}`;

  return (
    <div
      className="bom-category-row"
      style={
        subsystemIsAnchor
          ? { borderLeft: "2px solid rgba(253,255,152,0.4)" }
          : undefined
      }
    >
      {/* Header row */}
      <div
        className="bom-category-row__header"
        onClick={() => setOpen((v) => !v)}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
      >
        {/* Caret cell */}
        <div
          className={`bom-category-row__caret${open ? " is-open" : ""}`}
          aria-hidden="true"
        >
          <ChevronIcon open={open} />
        </div>

        {/* L4.N identifier cell */}
        <div className="bom-category-row__id-cell">
          <span className="bom-category-row__id">{idLabel}</span>
        </div>

        {/* Label + badge + variant chips */}
        <div className="bom-category-row__text-cell">
          <div className="bom-category-row__label-row">
            <span className="bom-category-row__label">{subsystem.name}</span>
            {confidence && <ConfidenceTierBadge confidence={confidence} />}
            {subsystemIsAnchor && <AnchorBadge />}
            {subsystem.costSharePct != null && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-gray-dark)",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 3,
                  padding: "2px 6px",
                  whiteSpace: "nowrap",
                }}
              >
                ~{subsystem.costSharePct}% BOM cost
              </span>
            )}
          </div>

          {/* Description (new format includes description field) */}
          {subsystem.description && (
            <p
              style={{
                fontSize: 12,
                color: "var(--text-gray)",
                margin: "4px 0 0 0",
                lineHeight: 1.4,
              }}
            >
              {subsystem.description}
            </p>
          )}

          {/* Top-level alternatives */}
          {hasAlternatives && (
            <div className="bom-inline-variants">
              {subsystem.alternatives!.map((alt) => (
                <VariantCard
                  key={alt.name}
                  alternative={alt}
                  confidence={confidence}
                  functionalRole={subsystem.keyDesignChoice}
                  productAnchorIds={productAnchorIds}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expanded module detail */}
      {open && hasModules && (
        <div className="bom-category-row__detail">
          <div className="bom-category-row__detail-label">
            L3 Modules — {subsystem.name}
          </div>
          {modules.map((mod: any) => (
            <ModuleRow
              key={mod.id}
              module={mod}
              parentConfidence={confidence}
              productAnchorIds={productAnchorIds}
            />
          ))}
          {subsystem.keyDesignChoice && (
            <div style={{ marginTop: 10 }}>
              <div className="bom-attr-chip">
                <span className="bom-attr-chip__key">Key design choice:</span>
                {subsystem.keyDesignChoice}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expanded no-module fallback */}
      {open && !hasModules && (
        <div className="bom-category-row__detail">
          <p className="bom-category-row__detail-text" style={{ color: "var(--text-gray)" }}>
            No sub-module breakdown available for this subsystem.
          </p>
        </div>
      )}
    </div>
  );
}
