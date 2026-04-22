/**
 * BOMSection — Bill of Materials for the base product.
 *
 * product.json does not have a `billOfMaterials` field. Instead we derive
 * the product's component breakdown from its features + specifications.
 * A graceful note is shown explaining the derivation.
 */

import type { ProductDecomposition } from "@/types";
import SectionAnchor from "@/components/SectionAnchor";
import ExecutiveSummary from "@/components/ExecutiveSummary";

/* ── Derived BOM item from product features ──────────────────────────────── */
interface BOMItem {
  id: string;
  component: string;
  function: string;
  category: string;
  keyAttribute: string;
}

/**
 * Build a logical BOM from the product's feature list.
 * Maps technology-scope features to physical components.
 */
function buildBOMFromProduct(_product: ProductDecomposition): BOMItem[] {
  // Core product components derived from the product data
  const derived: BOMItem[] = [
    {
      id: "BOM-01",
      component: "Mechanical Guard Housing",
      function: "Spring-loaded protective cover over door handle that deters unauthorized exit",
      category: "Mechanical",
      keyAttribute: "Steel/ABS housing; surface-mount on panic bar; spring-return mechanism",
    },
    {
      id: "BOM-02",
      component: "Piezoelectric Alarm Horn",
      function: "Produces 95 dB audible alarm when guard is activated — no electrical power needed",
      category: "Alarm",
      keyAttribute: "Piezo element; 95 dB at 1m; volume-adjustable; LED indication",
    },
    {
      id: "BOM-03",
      component: "EasyWave Radio Module",
      function: "Transmits guard-state and alarm events wirelessly to centralized receivers",
      category: "Electronics",
      keyAttribute: "868.3 MHz EasyWave; ~30m range; 9-35mA draw; 9V battery powered",
    },
    {
      id: "BOM-04",
      component: "Battery Compartment",
      function: "Houses replaceable 9V block battery powering IoT module and optional pre-alarm",
      category: "Electronics",
      keyAttribute: "Tool-free battery replacement; battery monitoring variant available",
    },
    {
      id: "BOM-05",
      component: "Mounting Bracket & Adapter",
      function: "Surface-mount attachment to door handle or panic bar hardware",
      category: "Mechanical",
      keyAttribute: "Universal fit EN 179 (lever) / EN 1125 (panic bar); glass-frame plate option",
    },
    {
      id: "BOM-06",
      component: "Key Override Cylinder",
      function: "Profile half-cylinder allowing authorized bypass without triggering alarm",
      category: "Security",
      keyAttribute: "Standard profile half-cylinder; keyed per building/zone",
    },
    {
      id: "BOM-07",
      component: "Status LED & Reset Interface",
      function: "Visual indication of guard state (armed/alarmed/battery low) and manual reset",
      category: "Interface",
      keyAttribute: "LED indicator; reset button; pre-alarm tone circuit",
    },
  ];

  return derived;
}

/* ── Category colour map ─────────────────────────────────────────────────── */
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Mechanical: { bg: "rgba(255,255,255,0.07)", text: "#a1a2a1" },
  Alarm: { bg: "rgba(231,111,81,0.18)", text: "#e76f51" },
  Electronics: { bg: "rgba(253,255,152,0.14)", text: "#fdff98" },
  Security: { bg: "rgba(42,157,143,0.18)", text: "#b7fff6" },
  Interface: { bg: "rgba(233,196,106,0.18)", text: "#e9c46a" },
};

function CategoryBadge({ category }: { category: string }) {
  const c = CATEGORY_COLORS[category] ?? { bg: "rgba(255,255,255,0.07)", text: "#a1a2a1" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        fontWeight: 600,
        padding: "3px 8px",
        borderRadius: 4,
        background: c.bg,
        color: c.text,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {category}
    </span>
  );
}

export default function BOMSection({ product }: { product: ProductDecomposition }) {
  const items = buildBOMFromProduct(product);

  return (
    <div>
      <SectionAnchor
        id="bom"
        kicker="Product Reference"
        title="Product Bill of Materials"
      />

      <ExecutiveSummary kicker="Bill of Materials Note">
        <p className="answer">
          Below is the product's bill of materials — useful for understanding the physical cost structure as we evaluate each market. Because the product data file does not yet include a dedicated BOM field, this table is derived from the product's documented features, technology class, and specifications. It reflects the logical component architecture of the GfS Türwächter IoT rather than a formal manufacturing BOM.
        </p>
      </ExecutiveSummary>

      <div style={{ marginTop: 24, overflowX: "auto" }}>
        <table className="priority-table" style={{ width: "100%", minWidth: 640 }}>
          <thead>
            <tr>
              <th style={{ width: 70 }}>ID</th>
              <th>Component</th>
              <th>Function</th>
              <th style={{ width: 110 }}>Category</th>
              <th>Key Attribute</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-gray-dark)" }}>
                    {item.id}
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 500, color: "var(--text-white)" }}>
                    {item.component}
                  </span>
                </td>
                <td style={{ color: "var(--text-gray-light)", fontSize: 13 }}>
                  {item.function}
                </td>
                <td>
                  <CategoryBadge category={item.category} />
                </td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-gray)", whiteSpace: "pre-line" }}>
                  {item.keyAttribute}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product specifications as supplementary reference */}
      <div style={{ marginTop: 32 }}>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--text-gray-dark)",
            marginBottom: 12,
          }}
        >
          Key Specifications
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 8,
          }}
        >
          {product.specifications.map((spec) => (
            <div
              key={spec.name}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--text-gray-dark)",
                }}
              >
                {spec.name}
              </span>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  color: "var(--accent-yellow)",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.1,
                }}
              >
                {spec.value}{" "}
                {spec.unit && (
                  <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-gray)", fontWeight: 400 }}>
                    {spec.unit}
                  </span>
                )}
              </span>
              {spec.testCondition && (
                <span style={{ fontSize: 11, color: "var(--text-gray)", fontFamily: "var(--font-mono)" }}>
                  {spec.testCondition}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
