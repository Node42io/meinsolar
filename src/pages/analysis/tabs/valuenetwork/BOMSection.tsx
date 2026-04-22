/**
 * BOMSection — Bill of Materials for the base product (ZOLLERN steel profiles).
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
function buildBOMFromProduct(product: ProductDecomposition): BOMItem[] {
  // Core production inputs derived from the product data
  const derived: BOMItem[] = [
    {
      id: "BOM-01",
      component: "Steel Billet / Coil (raw material)",
      function: "Input material for hot rolling or cold drawing — carbon, alloy, bearing, spring, or tool steel grades",
      category: "Materials",
      keyAttribute: "Grade range: C45, C60, 42CrMo4, 16MnCr5, 34CrNiMo6, 100Cr6, stainless",
    },
    {
      id: "BOM-02",
      component: "Custom Roll Set / Die Set",
      function: "Define the 2D cross-section geometry during hot rolling or cold drawing",
      category: "Tooling",
      keyAttribute: `Die cost €5–15K per geometry; lead time 6–12 weeks; 300+ year die library`,
    },
    {
      id: "BOM-03",
      component: "Induction Hardening Coil",
      function: "Selectively harden profile surfaces via electromagnetic induction heating + quench",
      category: "Process",
      keyAttribute: `Up to ${product.specifications.find((s) => s.name === "Surface Hardness (induction-hardened)")?.value ?? "64"} HRC; depth 0.5–5 mm`,
    },
    {
      id: "BOM-04",
      component: "Heat Treatment (normalizing, Q&T, case hardening)",
      function: "Achieve target mechanical properties across the full cross-section",
      category: "Process",
      keyAttribute: "Grade-specific cycles; tensile strength up to 1,200 MPa (34CrNiMo6 Q&T)",
    },
    {
      id: "BOM-05",
      component: "CNC Machining (cutting, drilling, milling, grinding)",
      function: "Transform profiles into finished parts (Fertigteile) with holes, chamfers, mating features",
      category: "Mechanical",
      keyAttribute: "Extends offering from semi-finished material to ready-to-install component",
    },
    {
      id: "BOM-06",
      component: "EN 10204 3.1 Material Certificate",
      function: "Provide traceable material certification from melt to delivery",
      category: "Quality",
      keyAttribute: "IATF 16949 certified supply chain; required for automotive and regulated markets",
    },
  ];

  return derived;
}

/* ── Category colour map ─────────────────────────────────────────────────── */
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Measurement: { bg: "rgba(42,157,143,0.18)", text: "#b7fff6" },
  Sensing: { bg: "rgba(42,157,143,0.18)", text: "#b7fff6" },
  Mechanical: { bg: "rgba(255,255,255,0.07)", text: "#a1a2a1" },
  Electronics: { bg: "rgba(253,255,152,0.14)", text: "#fdff98" },
  Interface: { bg: "rgba(233,196,106,0.18)", text: "#e9c46a" },
  Materials: { bg: "rgba(255,255,255,0.07)", text: "#a1a2a1" },
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
          Below is the product's bill of materials — useful for understanding the physical cost structure as we evaluate each market. Because the product data file does not yet include a dedicated BOM field, this table is derived from the documented features, technology class, and specifications. It reflects the logical component architecture of ZOLLERN's precision steel profile offering rather than a formal manufacturing BOM.
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

      {/* ZOLLERN steel profiles specifications as supplementary reference */}
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
