/**
 * 01 Product Decomposition
 * Replicates 01-product.html exactly in React, with TODO items applied:
 *   - Item 4/15/39: SourceFootnote per claim + SourceList at end
 *   - Item 40: ExecutiveSummary at top
 *   - Item 41: Plain-language labels
 *   - Item 9: NAICS/UNSPSC written out fully
 *   - ClickableCode for UNSPSC codes
 */

import { product } from "@/data";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import SourceFootnote from "@/components/SourceFootnote";
import SourceList from "@/components/SourceList";
import ClickableCode from "@/components/ClickableCode";

// All source IDs used in this sub-chapter
const SECTION_SOURCES = [
  "PROD-S01",
  "PROD-S02",
  "PROD-S03",
  "PROD-S04",
  "PROD-S05",
  "PROD-S06",
  "PROD-S07",
  "PROD-S08",
];

const CATEGORY_CLASS: Record<string, string> = {
  performance: "badge badge--accent",
  integration: "badge badge--moderate",
  reliability: "badge badge--strong",
  usability: "badge badge--neutral",
  maintenance: "badge badge--neutral",
  safety: "badge badge--neutral",
};

const SEVERITY_CLASS: Record<string, string> = {
  hard: "badge badge--weak",
  soft: "badge badge--moderate",
};

function badgeClass(category: string): string {
  return CATEGORY_CLASS[category] ?? "badge badge--neutral";
}

export default function ProductDecomposition() {
  const technologyFeatures = product.features.filter((f) => f.scope === "technology");
  const vendorFeatures = product.features.filter((f) => f.scope === "vendor");

  return (
    <section id="section-01" className="container">
      {/* Section meta breadcrumb */}
      <div className="section-meta">
        <span>Step 01</span>
        <span className="sep">/</span>
        <span>Product Breakdown</span>
        <span className="sep">/</span>
        <span>New Markets for an Existing Product</span>
      </div>

      <div className="md">
        <h1 className="section-title">01 Product Profile</h1>

        {/* Item 40: Executive Summary */}
        <ExecutiveSummary kicker="01 / Executive Summary" title="What you are reading">
          <p className="answer">
            This chapter decomposes ZOLLERN Special Steel Profiles into its underlying
            mechanism, functional promise, feature set, and physical specifications. Understanding what the product
            actually <em>does</em> at each level (mechanism → function → outcome)
            is the foundation for every market-entry decision that follows: it tells us which
            markets are structurally compatible, which features differentiate, and which
            constraints limit entry. The next chapter (02 Functional Promise) uses this
            decomposition to derive the two-level functional promise that drives market discovery.
          </p>
        </ExecutiveSummary>

        {/* Metadata block */}
        <blockquote>
          <p><strong>Component:</strong> Product Decomposition (Step 01)</p>
          <p><strong>Approach:</strong> Three-level product breakdown (mechanism → function → outcome)</p>
          <p><strong>Product:</strong> {product.productName}</p>
          <p><strong>Vendor:</strong> {product.vendorName}</p>
          <p><strong>Archetype:</strong> New Markets for an Existing Product</p>
        </blockquote>


        <hr />

        {/* ── Product Breakdown ── */}
        <h2 id="prod-three-levels">What the Product Does — Three Levels</h2>

        <table>
          <thead>
            <tr>
              <th>Level</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Mechanism</strong></td>
              <td>
                {product.christensen.mechanism}
                <SourceFootnote sourceIds={["PROD-S02", "PROD-S03"]} />
              </td>
            </tr>
            <tr>
              <td><strong>Function</strong></td>
              <td>
                {product.christensen.function}
                <SourceFootnote sourceIds={["PROD-S01", "PROD-S07"]} />
              </td>
            </tr>
            <tr>
              <td><strong>Outcome</strong></td>
              <td>
                {product.christensen.outcome}
                <SourceFootnote sourceIds={["PROD-S07", "PROD-S08"]} />
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── Technology Classification ── */}
        <h2 id="prod-tech-class">Technology Classification</h2>

        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Technology Class</strong></td>
              <td>{product.technology.class}</td>
            </tr>
            <tr>
              <td><strong>Underlying Mechanism</strong></td>
              <td>
                {product.technology.underlyingMechanism}
                <SourceFootnote sourceIds={["PROD-S02"]} />
              </td>
            </tr>
            <tr>
              <td><strong>UNSPSC Code</strong></td>
              <td>
                <ClickableCode kind="unspsc" code={product.technology.unspscCode} />
              </td>
            </tr>
            <tr>
              <td><strong>UNSPSC Title</strong></td>
              <td>{product.technology.unspscTitle}</td>
            </tr>
            <tr>
              <td><strong>UNSPSC Path</strong></td>
              <td>{product.technology.unspscPath}</td>
            </tr>
          </tbody>
        </table>

        {/* ── Functional Promise ── */}
        <h2 id="prod-fp">Functional Promise</h2>

        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Statement</strong></td>
              <td>
                {product.functionalPromise.statement}
                <SourceFootnote sourceIds={["PROD-S07"]} />
              </td>
            </tr>
            <tr>
              <td><strong>Verb</strong></td>
              <td>{product.functionalPromise.verb}</td>
            </tr>
            <tr>
              <td><strong>Object</strong></td>
              <td>{product.functionalPromise.object}</td>
            </tr>
            <tr>
              <td><strong>Context</strong></td>
              <td>{product.functionalPromise.context}</td>
            </tr>
          </tbody>
        </table>

        <h3>Differentiators vs Alternative Steel Profile Manufacturing Mechanisms</h3>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Differentiator</th>
            </tr>
          </thead>
          <tbody>
            {product.differentiators.map((d, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  {d}
                  <SourceFootnote
                    sourceIds={i < 2 ? ["PROD-S01", "PROD-S05"] : ["PROD-S03", "PROD-S07"]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── Commodity-Level Functional Promise ── */}
        <h2 id="prod-commodity-fp">Commodity-Level Functional Promise</h2>

        <blockquote>
          <p>
            <strong>{product.commodityFunctionalPromise}</strong>
            <SourceFootnote sourceIds={["PROD-S01", "PROD-S02"]} />
          </p>
        </blockquote>

        <p>
          <em>
            All steel profile manufacturing technologies (hot rolling, cold drawing, cold rolling,
            extrusion, forging) share the same fundamental function — delivering elongated metal
            shapes with defined cross-sectional geometry. The differences are in dimensional
            precision, surface quality, alloy compatibility, and production volume economics,
            not in function.
          </em>
          <SourceFootnote sourceIds={["PROD-S03", "PROD-S05"]} />
        </p>

        <hr />

        {/* ── Features ── */}
        <h2 id="prod-features">Features</h2>

        <h3>Technology-Level Features (apply to precision steel profile manufacturing)</h3>

        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Description</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {technologyFeatures.map((f) => (
              <tr key={f.name}>
                <td><strong>{f.name}</strong></td>
                <td>
                  {f.long}
                  <SourceFootnote sourceIds={["PROD-S02", "PROD-S03"]} />
                </td>
                <td><span className={badgeClass(f.category)}>{f.category}</span></td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Vendor-Level Features (ZOLLERN-specific)</h3>

        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Description</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {vendorFeatures.map((f) => (
              <tr key={f.name}>
                <td><strong>{f.name}</strong></td>
                <td>
                  {f.long}
                  <SourceFootnote sourceIds={["PROD-S07", "PROD-S08"]} />
                </td>
                <td><span className={badgeClass(f.category)}>{f.category}</span></td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        {/* ── Specifications ── */}
        <h2 id="prod-specs">Specifications</h2>

        <table>
          <thead>
            <tr>
              <th>Specification</th>
              <th>Value</th>
              <th>Unit</th>
              <th>Test Condition</th>
            </tr>
          </thead>
          <tbody>
            {product.specifications.map((s) => (
              <tr key={s.name}>
                <td><strong>{s.name}</strong></td>
                <td>{s.value}</td>
                <td>
                  {s.unit === "C" ? "°C" :
                   s.unit === "uA" ? "μA" :
                   s.unit === "m3" ? "m³" :
                   s.unit === "3/4-pole" ? "—" :
                   s.unit}
                </td>
                <td>{s.testCondition ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        {/* ── Constraints summary ── */}
        <h2 id="prod-constraints">Key Product Constraints</h2>

        <table>
          <thead>
            <tr>
              <th>Constraint</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Description</th>
              <th>Threshold</th>
            </tr>
          </thead>
          <tbody>
            {product.constraints.map((c) => (
              <tr key={c.name}>
                <td><strong>{c.name}</strong></td>
                <td>{c.constraintType}</td>
                <td>
                  <span className={(c.severity && SEVERITY_CLASS[c.severity]) || "badge badge--neutral"}>
                    {c.severity ?? "—"}
                  </span>
                </td>
                <td>
                  {c.description}
                  <SourceFootnote sourceIds={["PROD-S04", "PROD-S06", "PROD-S07"]} />
                </td>
                <td>
                  {c.thresholdValue
                    ? `${c.thresholdValue}${c.thresholdUnit ? ` ${c.thresholdUnit}` : ""}`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        {/* ── UNSPSC Classification ── */}
        <h2 id="prod-unspsc">UNSPSC Classification</h2>

        <table>
          <thead>
            <tr>
              <th>UNSPSC Commodity Code</th>
              <th>Commodity Name</th>
              <th>Confidence</th>
              <th>Reasoning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>
                  <ClickableCode kind="unspsc" code="30102304" />
                </strong>
              </td>
              <td>Steel profiles</td>
              <td><span className="badge badge--strong">92%</span></td>
              <td>
                ZOLLERN's primary output is custom-geometry steel profiles produced via hot
                rolling and cold drawing. UNSPSC code 30102304 covers all rolled and drawn
                steel profile shapes including custom, structural, and precision profiles.
                <SourceFootnote sourceIds={["PROD-S02", "PROD-S03"]} />
              </td>
            </tr>
            <tr>
              <td>
                <ClickableCode kind="unspsc" code="30102303" />
              </td>
              <td>Rolled shapes</td>
              <td><span className="badge badge--moderate">55%</span></td>
              <td>
                Matches the hot-rolling production process but describes the forming method
                rather than the product's primary identity (precision profiles for OEM use).
              </td>
            </tr>
            <tr>
              <td>
                <ClickableCode kind="unspsc" code="30102701" />
              </td>
              <td>Steel bars</td>
              <td><span className="badge badge--weak">30%</span></td>
              <td>
                Cold-drawn profiles can take bar form, but the primary product identity is
                custom cross-sectional profiles, not standard round or flat bar stock.
              </td>
            </tr>
          </tbody>
        </table>

        <p>
          <strong>Selected:</strong>{" "}
          <ClickableCode kind="unspsc" code="30102304" /> — Steel profiles (highest confidence,
          validated)
        </p>

        <hr />

        {/* ── Validation Notes ── */}
        <h2 id="prod-validation">Validation Notes</h2>

        <p>
          The decomposition was cross-referenced against published research on precision steel
          profile manufacturing technology.
          <SourceFootnote sourceIds={["PROD-S01", "PROD-S02", "PROD-S03"]} />
          Key validation findings:
        </p>

        <ul>
          <li>
            <strong>Functional Promise</strong> confirmed solution-agnostic: does not mention
            "ZOLLERN," specific alloy grades, or proprietary process names.
            <SourceFootnote sourceIds={["PROD-S07"]} />
          </li>
          <li>
            <strong>Feature scoping</strong> validated: technology-level features apply to
            any precision steel profile manufacturing capability platform; vendor-level features
            are ZOLLERN-specific.
            <SourceFootnote sourceIds={["PROD-S08"]} />
          </li>
          <li>
            <strong>Minimum order quantity constraint</strong> noted — new die geometry requires
            upfront tooling investment; MOQ applies per geometry to amortize die cost.
            <SourceFootnote sourceIds={["PROD-S04", "PROD-S05"]} />
          </li>
          <li>
            <strong>Carbon content requirement</strong> for induction hardening confirmed —
            minimum 0.35% carbon content required for martensitic transformation.
            <SourceFootnote sourceIds={["PROD-S03"]} />
          </li>
          <li>
            <strong>Cold-forming cross-section limit</strong> quantified: maximum 2,500 mm²
            for drawing; larger sections require hot rolling only.
            <SourceFootnote sourceIds={["PROD-S04", "PROD-S06"]} />
          </li>
          <li>
            <strong>UNSPSC code 30102304 "Steel profiles"</strong> confirmed as the correct
            commodity classification — classifies by primary product identity (custom profiles),
            not by forming process.
            <SourceFootnote sourceIds={["PROD-S02"]} />
          </li>
        </ul>

        <hr />

        {/* Sources list — Item 4/15/39 */}
        <div id="prod-sources">
          <SourceList sourceIds={SECTION_SOURCES} title="Sources — 01 Product Decomposition" />
        </div>
      </div>
    </section>
  );
}
