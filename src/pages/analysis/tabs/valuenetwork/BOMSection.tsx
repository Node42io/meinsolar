/**
 * BOMSection — Bill of Materials for the base product.
 *
 * If product.billOfMaterials[] exists, renders it directly.
 * Otherwise shows a note that BOM data is available on the dedicated BOM tab.
 * No hardcoded product-specific data — all from product.json.
 */

import type { ProductDecomposition } from "@/types";
import SectionAnchor from "@/components/SectionAnchor";
import ExecutiveSummary from "@/components/ExecutiveSummary";

/* -- Category colour map ------------------------------------------------ */
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Measurement: { bg: "rgba(42,157,143,0.18)", text: "#b7fff6" },
  Sensing: { bg: "rgba(42,157,143,0.18)", text: "#b7fff6" },
  Mechanical: { bg: "rgba(255,255,255,0.07)", text: "#a1a2a1" },
  Electronics: { bg: "rgba(253,255,152,0.14)", text: "#fdff98" },
  Interface: { bg: "rgba(233,196,106,0.18)", text: "#e9c46a" },
  Materials: { bg: "rgba(255,255,255,0.07)", text: "#a1a2a1" },
  Process: { bg: "rgba(42,157,143,0.18)", text: "#b7fff6" },
  Quality: { bg: "rgba(233,196,106,0.18)", text: "#e9c46a" },
  Tooling: { bg: "rgba(253,255,152,0.14)", text: "#fdff98" },
  Service: { bg: "rgba(42,157,143,0.18)", text: "#b7fff6" },
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
  const items = product.billOfMaterials ?? [];

  if (items.length === 0) {
    return (
      <div>
        <SectionAnchor
          id="bom"
          kicker="Product Reference"
          title="Product Bill of Materials"
        />
        <ExecutiveSummary kicker="Bill of Materials Note">
          <p className="answer">
            A dedicated BOM breakdown for {product.productName} is available on the{" "}
            <strong>Bill of Materials</strong> tab for each evaluated market.
          </p>
        </ExecutiveSummary>
      </div>
    );
  }

  return (
    <div>
      <SectionAnchor
        id="bom"
        kicker="Product Reference"
        title="Product Bill of Materials"
      />

      <ExecutiveSummary kicker="Bill of Materials Note">
        <p className="answer">
          Below is the product&rsquo;s bill of materials — useful for understanding the
          physical cost structure as we evaluate each market. It reflects the logical
          component architecture of {product.vendorName}&rsquo;s {product.productName} offering.
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

      {/* Key Specifications */}
      {product.specifications && product.specifications.length > 0 && (
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
      )}
    </div>
  );
}
