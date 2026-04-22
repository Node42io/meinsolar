/**
 * VariantChips — top product-variant chip group (Output Types).
 *
 * Matches Figma design: pill chips for product variants (OT-1, OT-2, ...).
 * Shows only output types that have product relevance (primary or secondary).
 * Selected chip is highlighted in accent-yellow.
 *
 * Handles both old format (sensorFit field) and new format (focalCompanyPresent field).
 * Uses .bom-variant-chips / .bom-variant-chip CSS from bom.css.
 */

import type { BOMOutputType } from "@/types";

export interface VariantChipsProps {
  outputTypes: BOMOutputType[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function fitLabel(ot: BOMOutputType): string {
  if (ot.sensorFit === "primary") return "primary";
  if (ot.sensorFit === "secondary") return "secondary";
  // New format may use focalCompanyPresent
  if ((ot as any).focalCompanyPresent === true) return "primary";
  return "";
}

function isRelevant(ot: BOMOutputType): boolean {
  // Old format: filter out sensorFit === "none"
  if (ot.sensorFit && ot.sensorFit !== "none") return true;
  // New format: focalCompanyPresent
  if ((ot as any).focalCompanyPresent === true) return true;
  // If no sensorFit field at all, show it (new format where all types are relevant)
  if (!ot.sensorFit && !(ot as any).focalCompanyPresent) return true;
  return false;
}

export default function VariantChips({
  outputTypes,
  selectedId,
  onSelect,
}: VariantChipsProps) {
  const relevant = outputTypes.filter(isRelevant);

  if (relevant.length === 0) return null;

  return (
    <div className="bom-variant-chips" role="group" aria-label="Product output types">
      {relevant.map((ot) => {
        const isActive = ot.id === selectedId;
        const label = fitLabel(ot);
        return (
          <button
            key={ot.id}
            type="button"
            className={`bom-variant-chip${isActive ? " is-active" : ""}`}
            aria-pressed={isActive}
            onClick={() => onSelect(ot.id)}
            title={ot.notes}
          >
            {ot.name}
            {label && (
              <span className="bom-variant-chip__status">{label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
