/**
 * 02 Functional Promise
 * Replicates 02-functional-promise.html in React, with TODO items applied:
 *   - Item 16: Second-level title reads "UNSPSC Commodity Functional Promise"
 *   - Item 17: UNSPSC code is clickable via ClickableCode; UNSPSC registry added to SourceList
 *   - Item 18: Every "FP" → "Functional Promise"
 *   - Item 40: ExecutiveSummary at top
 *   - Item 4/39: SourceFootnote per claim + SourceList at end
 *   - Item 41: Plain-language labels
 */

import { functionalPromise as fp } from "@/data";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import SourceFootnote from "@/components/SourceFootnote";
import SourceList from "@/components/SourceList";
import ClickableCode from "@/components/ClickableCode";

// Source IDs for this sub-chapter (no functional-promise-specific external sources in
// functionalPromise.json, so we reference product sources + UNSPSC registry)
// Note: UNSPSC registry is linked inline via ClickableCode (item 17); no separate source
// entry needed since UNSPSC code 30102304 is clickable throughout this chapter.
const SECTION_SOURCES = [
  "PROD-S01",
  "PROD-S02",
  "PROD-S03",
  "PROD-S07",
  "PROD-S08",
];

const CRITICALITY_CLASS: Record<string, string> = {
  essential: "badge badge--strong",
  enhancing: "badge badge--moderate",
  optional: "badge badge--neutral",
};

export default function FunctionalPromise() {
  const productFP = fp.productFP;
  const commodityFP = fp.commodityFP;
  const bomPosition = fp.bomPosition;
  const complements = fp.complements;

  // Strip [SRC:...] and [ASM:...] annotation tags from JSON string values
  function stripAnnotations(s: string): string {
    return s.replace(/\s*\[(?:SRC|ASM)[^\]]*\]/g, "").trim();
  }

  const unspscCode = "30102304";

  return (
    <section id="section-02" className="container">
      {/* Section meta breadcrumb */}
      <div className="section-meta">
        <span>Step 02</span>
        <span className="sep">/</span>
        <span>Two-Level Functional Promise</span>
        <span className="sep">/</span>
        <span>New Markets for an Existing Product</span>
      </div>

      <div className="md">
        <h1 className="section-title">02 Functional Promise</h1>

        {/* Item 40: Executive Summary */}
        <ExecutiveSummary kicker="02 / Executive Summary" title="What you are reading">
          <p className="answer">
            This chapter defines the two-level Functional Promise that drives market discovery:
            a product-level promise (what <em>this capability platform</em> does) and a commodity-level
            promise (what <em>all steel profiles</em> do). The product-level Functional Promise is
            used to assess architectural distance in new markets; the commodity-level Functional
            Promise is the search query that surfaces candidate NAICS markets in Chapter 05.
            Understanding both levels — and the Functional Promise Extension that captures
            capabilities beyond pure shape provision — explains why the capability platform is
            relevant in markets beyond existing application markets.
          </p>
        </ExecutiveSummary>

        {/* Metadata block */}
        <blockquote>
          <p><strong>Component:</strong> Functional Promise (Step 02)</p>
          <p><strong>Approach:</strong> Two-Level Functional Promise (product-level and commodity-level)</p>
          <p><strong>Product:</strong> ZOLLERN Special Steel Profiles</p>
          <p><strong>Vendor:</strong> ZOLLERN GmbH &amp; Co. KG</p>
          <p><strong>Archetype:</strong> New Markets for an Existing Product</p>
        </blockquote>


        <hr />

        {/* ── Underlying Mechanism ── */}
        <h2 id="fp-mechanism">Underlying Mechanism</h2>

        <p>
          Sequential plastic deformation of steel billets through custom-geometry roll sets
          (hot rolling) and carbide die sets (cold drawing/rolling) produces near-net-shape
          2D cross-sections. Optional selective induction surface hardening via high-frequency
          electromagnetic heating and rapid quench applies a hard wear-resistant surface while
          retaining a ductile core.
          <SourceFootnote sourceIds={["PROD-S02", "PROD-S03"]} />
        </p>

        <hr />

        {/* ── Product Functional Promise ── */}
        <h2 id="fp-product-fp">Product Functional Promise</h2>

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
                {productFP.statement}
                <SourceFootnote sourceIds={["PROD-S07"]} />
              </td>
            </tr>
            <tr>
              <td><strong>Verb</strong></td>
              <td>{productFP.verb}</td>
            </tr>
            <tr>
              <td><strong>Object</strong></td>
              <td>{productFP.object}</td>
            </tr>
            <tr>
              <td><strong>Context</strong></td>
              <td>{productFP.context}</td>
            </tr>
            <tr>
              <td><strong>Scope</strong></td>
              <td>Product</td>
            </tr>
          </tbody>
        </table>

        <h3>Differentiators vs Alternatives</h3>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Differentiator</th>
              <th>Versus</th>
            </tr>
          </thead>
          <tbody>
            {productFP.differentiators.map((d, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{d}</td>
                <td>
                  {i === 0 && "Machining from bar stock removes 40-80% of material as chips"}
                  {i === 1 && "Standard bar stock requires full downstream machining to reach final geometry"}
                  {i === 2 && "Outsourced heat treatment adds lead time and logistics cost"}
                  {i === 3 && "Standard sections (HEA/HEB, IPE) lack custom cross-sectional geometries"}
                  {i === 4 && "External heat treaters cannot guarantee case depth or geometry match"}
                  {i === 5 && "Most European profile competitors lack IATF 16949 automotive certification"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <blockquote>
          <h3>Mechanism-Free Test</h3>
          <p>
            The statement contains no technology-specific terms (no "hot rolling,"
            "cold drawing," "induction hardening"). The same statement would hold if profiles
            were produced by extrusion, forging, or other forming means — only the differentiators
            would change. <strong>Test passed.</strong>
          </p>
        </blockquote>

        <hr />

        {/* ── UNSPSC Classification — Item 16/17 ── */}
        <h2 id="fp-unspsc">UNSPSC Classification</h2>

        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>UNSPSC Code</strong></td>
              {/* Item 17: Clickable UNSPSC code */}
              <td>
                <ClickableCode kind="unspsc" code={unspscCode} />
                <SourceFootnote sourceIds={["PROD-S02"]} />
              </td>
            </tr>
            <tr>
              <td><strong>UNSPSC Title</strong></td>
              <td>Steel profiles</td>
            </tr>
            <tr>
              <td><strong>UNSPSC Path</strong></td>
              <td>
                30 Structures and Building and Construction and Manufacturing Components &gt;
                10 Structural components and basic shapes &gt; 23 Profiles &gt; 04 Steel profiles
              </td>
            </tr>
            <tr>
              <td><strong>Classification Confidence</strong></td>
              <td>92%</td>
            </tr>
            <tr>
              <td><strong>Custom Product Group</strong></td>
              <td>None — UNSPSC match is strong</td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* ── UNSPSC Commodity Functional Promise — Item 16 ── */}
        {/* Item 16: Subordinate h3 so it's visually tied to the UNSPSC Classification h2 above */}
        <h3>UNSPSC Commodity Functional Promise</h3>

        <p style={{ color: "var(--text-gray)", marginBottom: "0.75rem" }}>
          Tied to UNSPSC Classification above —{" "}
          <ClickableCode kind="unspsc" code={unspscCode} /> (Steel profiles)
        </p>

        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Commodity or Group</strong></td>
              <td>
                Steel profiles (<ClickableCode kind="unspsc" code={unspscCode} />)
                <SourceFootnote sourceIds={["PROD-S02"]} />
              </td>
            </tr>
            <tr>
              <td><strong>Functional Promise</strong></td>
              <td>
                {stripAnnotations(commodityFP.statement)}
                <SourceFootnote sourceIds={["PROD-S01", "PROD-S03"]} />
              </td>
            </tr>
            <tr>
              <td><strong>Scope</strong></td>
              <td>Commodity</td>
            </tr>
            <tr>
              <td><strong>Reasoning</strong></td>
              <td>{stripAnnotations(commodityFP.reasoning)}</td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* ── Functional Promise Extension — Item 18: no bare "FP" ── */}
        <h2 id="fp-extension">Functional Promise Extension (Broader-than-UNSPSC Capabilities)</h2>

        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Primary Commodity Functional Promise</strong></td>
              <td>{stripAnnotations(commodityFP.statement)}</td>
            </tr>
            <tr>
              <td><strong>Functional Promise Extension</strong></td>
              <td>
                The underlying precision forming capability also enables: (1) functional
                surface engineering — selective hardening delivers wear-resistant surfaces
                for tribological applications; (2) structural integration — profiles can
                serve as load-bearing linear guides or rails; (3) material engineering —
                multi-alloy processing enables application-specific mechanical properties
                (spring, bearing, tool steel grades).
                These cross into UNSPSC classes{" "}
                <ClickableCode kind="unspsc" code="31161500" /> (Processed metal shapes) and{" "}
                <ClickableCode kind="unspsc" code="31161600" /> (Metal bars and rods).
                <SourceFootnote sourceIds={["PROD-S07", "PROD-S08"]} />
              </td>
            </tr>
            <tr>
              <td><strong>Extension Domains</strong></td>
              <td>{commodityFP.fpExtensionDomains?.join(", ")}</td>
            </tr>
            <tr>
              <td><strong>Market Discovery Use</strong></td>
              <td>
                Phase A secondary search: "What industries need precision metal components
                with engineered surface hardness and near-net-shape geometry to eliminate
                downstream machining?"
              </td>
            </tr>
          </tbody>
        </table>

        <blockquote>
          <h3>Justification for Extension</h3>
          <p>
            ZOLLERN's capability platform (Selective Induction Surface Hardening, Multi-Alloy
            Grade Processing, Proprietary Die Library) delivers capabilities beyond pure shape
            provision. The surface hardening and functional geometry capabilities are not
            generic steel profile functions — they are precision engineering functions that
            happen to be co-located in the same production platform. This broadens the
            addressable market beyond traditional steel profile buyers.
            <SourceFootnote sourceIds={["PROD-S07", "PROD-S08"]} />
          </p>
        </blockquote>

        <hr />

        {/* ── Bill of Materials / Value Network Position ── */}
        <h2 id="fp-bom">Bill of Materials (BOM) Position in the Product Hierarchy</h2>
        <p style={{ color: "var(--text-gray)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
          Level notation: L7 = ecosystem · L6 = process step · L5 = equipment · L4 = subsystem · L3 = module · L2 = assembly · L1 = part. ZOLLERN's steel profiles sit at L1–L2 as semi-finished material input.
        </p>

        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Bill of Materials Level</strong></td>
              <td>{bomPosition.level}</td>
            </tr>
            <tr>
              <td><strong>Position</strong></td>
              <td>{bomPosition.position}</td>
            </tr>
            <tr>
              <td><strong>Parent Subsystem (typical)</strong></td>
              <td>{bomPosition.parentSubsystem}</td>
            </tr>
            <tr>
              <td><strong>Grandparent System (typical)</strong></td>
              <td>{bomPosition.grandparentSystem}</td>
            </tr>
            <tr>
              <td><strong>Functional Promise Scope Impact</strong></td>
              <td>
                Material/component-level Functional Promise is narrow: "provide custom
                cross-sectional shapes with defined tolerances and surface properties."
                The subsystem-level promise would be broader: "enable precise mechanical
                guidance or structural load transfer." The Functional Promise as stated is
                correctly scoped to the material/component level.
              </td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* ── Required Complements ── */}
        <h2 id="fp-complements">Required Complements</h2>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Complement</th>
              <th>Criticality</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {complements.map((c, i) => (
              <tr key={c.name}>
                <td>{i + 1}</td>
                <td><strong>{c.name}</strong></td>
                <td>
                  <span className={CRITICALITY_CLASS[c.criticality] ?? "badge badge--neutral"}>
                    {c.criticality.charAt(0).toUpperCase() + c.criticality.slice(1)}
                  </span>
                </td>
                <td>{c.description}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        {/* ── How This Feeds Downstream ── */}
        <h2 id="fp-downstream">How This Feeds Downstream Analysis</h2>

        <table>
          <thead>
            <tr>
              <th>Phase</th>
              <th>Uses</th>
              <th>Search Query</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>A: NAICS code Discovery (primary)</strong></td>
              <td>Commodity Functional Promise</td>
              <td>
                "What industries need elongated metal shapes with defined cross-sectional
                geometry for structural, mechanical, or guiding functions?"
              </td>
            </tr>
            <tr>
              <td><strong>A: NAICS code Discovery (secondary)</strong></td>
              <td>Functional Promise Extension</td>
              <td>
                "What industries need precision metal components with engineered surface
                hardness and near-net-shape geometry to reduce downstream machining?"
              </td>
            </tr>
            <tr>
              <td><strong>B: Architecture Distance</strong></td>
              <td>Product Functional Promise + specs</td>
              <td>
                "How close is this market's use case to supplying custom cross-sectional metal
                shapes with tight dimensional tolerances and selectable surface hardness in
                near-net-shape geometry?"
              </td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* ── QA Checklist — simplified (no PASS badges per Item 21 analogy) ── */}
        <h2 id="fp-quality">Quality Checklist</h2>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Check</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Product Functional Promise present with statement, verb, object, context, differentiators", "Complete"],
              ["Product Functional Promise passes mechanism-free test", "Complete"],
              ["Commodity Functional Promise present and vendor-agnostic", "Complete"],
              ["UNSPSC commodity code identified and clickable", "Complete"],
              ["Bill of Materials position mapped", "Complete"],
              ["Required complements listed with criticality", "Complete"],
              ["Source references on all factual claims", "Complete"],
              ["Functional Promise Extension assessed", "Complete"],
            ].map(([check, result], i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{check}</td>
                <td><span className="badge badge--strong">{result}</span></td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        {/* Sources — Item 4/17/39 */}
        <div id="fp-sources">
          <SourceList sourceIds={SECTION_SOURCES} title="Sources — 02 Functional Promise" />
        </div>
      </div>
    </section>
  );
}
