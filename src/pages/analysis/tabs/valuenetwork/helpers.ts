/**
 * Value Network helpers — pure utility functions, no React imports.
 *
 * Generic implementation: product position detection uses the `isProductPosition`
 * field from the JSON data rather than hardcoded company name matching.
 */

import type { VNUnit, L6System } from "@/types";

/**
 * Derive a 2-sentence plain-language description for a VN unit.
 * Uses the unit's description or functionalJob; strips source tags.
 */
export function deriveDescription(unit: VNUnit, systemName: string): string {
  if (unit.description && unit.description.trim()) return unit.description.trim();

  const fj = unit.functionalJob || "";

  // Strip source annotations like [SRC: web_search] and bold position indicators
  const clean = fj
    .replace(/\[SRC:[^\]]*\]/gi, "")
    .replace(/\*\*[^*]*POSITION[^*]*\*\*/gi, "")
    .trim()
    .replace(/\s+/g, " ");

  if (!clean) return `Part of the ${systemName} system in the value chain.`;

  // Build a 2-sentence description from the functional job
  const sentences = clean.split(/(?<=[.!?])\s+/);
  const first = sentences[0] ?? clean;

  // Second sentence: add context about the system it belongs to
  const second = `It is part of the ${systemName} system in the value chain.`;

  return `${first.endsWith(".") ? first : first + "."} ${second}`;
}

/**
 * Return true if a VN unit is flagged as a product position (anchor).
 * Uses the `isProductPosition` boolean from the JSON data.
 */
export function isProductAnchor(unit: VNUnit): boolean {
  return (unit as any).isProductPosition === true;
}

/**
 * Return the product position label for a unit, if any.
 * Uses the `isProductPosition` boolean and optional `positionType` from JSON data.
 * Falls back to text analysis for legacy data formats.
 */
export function productPositionLabel(unit: VNUnit): string | null {
  // Primary: use the explicit boolean from data
  if ((unit as any).isProductPosition === true) {
    // Check for explicit position type if provided
    const posType = (unit as any).positionType;
    if (posType) return String(posType).toUpperCase();
    return "PRODUCT";
  }

  // Fallback: check text for position markers (legacy format)
  const text = (unit.functionalJob || "") + " " + (unit.description || "");
  if (/PRIMARY POSITION/i.test(text)) return "PRIMARY";
  if (/SECONDARY POSITION/i.test(text)) return "SECONDARY";
  if (/TERTIARY POSITION/i.test(text)) return "TERTIARY";

  return null;
}

// Legacy aliases for backward compatibility
export const isPrimaryAnchor = isProductAnchor;
export const marquardtPositionLabel = productPositionLabel;

/**
 * Extract the L6 prefix from an L5 unit ID (e.g. "L5.10.1" -> "L5.10").
 */
export function getL6Prefix(l5Id: string): string {
  const parts = l5Id.split(".");
  // L5.6.3 -> "6" -> match to L6.6
  if (parts.length >= 2) {
    return parts[1] ?? "";
  }
  return "";
}

/**
 * Group L5 units by their parent L6 system.
 * Matching priority:
 *   1. parentId field (new format from orchestrator_v2)
 *   2. parentL6 field (legacy)
 *   3. Numeric section from unit ID: L5.6.x -> L6.6
 */
export function groupUnitsByL6(
  units: VNUnit[],
  systems: L6System[]
): Map<string, VNUnit[]> {
  const map = new Map<string, VNUnit[]>();

  for (const sys of systems) {
    map.set(sys.id, []);
  }

  for (const unit of units) {
    // Skip non-L5 units (L6/L7 entries in the flat vnUnits array)
    if (unit.level && unit.level !== "L5") continue;

    // Primary: use parentId or parentL6 field (works for all ID formats)
    const parentId = (unit as any).parentId ?? (unit as any).parentL6;
    if (parentId && map.has(parentId)) {
      map.get(parentId)!.push(unit);
    } else {
      // Fallback: parse section from unit ID: "L5.6.3" -> "6", "L5.H1.1" -> "H1"
      const parts = unit.id.split(".");
      const section = parts[1] ?? "";

      // Try exact L6.{section} match first
      const l6Id = `L6.${section}`;
      const bucket = map.get(l6Id);
      if (bucket) {
        bucket.push(unit);
      } else {
        // Try L6{section} (no dot) for formats like L6a, L6b, L6H-SEC
        const l6NoDot = `L6${section}`;
        const noDotBucket = map.get(l6NoDot);
        if (noDotBucket) {
          noDotBucket.push(unit);
        } else {
          // Fallback: try numeric ordinal index
          const sectionNum = parseInt(section, 10);
          if (!isNaN(sectionNum)) {
            const fallbackKey = systems[sectionNum - 1]?.id;
            if (fallbackKey && map.has(fallbackKey)) {
              map.get(fallbackKey)!.push(unit);
            }
          }
        }
      }
    }
  }

  return map;
}

/**
 * Clean a functional job string for display (remove source tags, tidy whitespace).
 */
export function cleanFunctionalJob(raw: string): string {
  return (raw || "")
    .replace(/\[SRC:[^\]]*\]/gi, "")
    .replace(/\*\*/g, "")
    .trim()
    .replace(/\s{2,}/g, " ");
}
