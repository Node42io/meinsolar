/**
 * 02 Functional Promise
 * Fully dynamic — renders from functionalPromise.json with zero hardcoded names.
 * Supports both domain-specific format (productFP, commodityFP, bomPosition, complements)
 * and generic format ({sections, tables, entities}).
 */

import { functionalPromise as fp } from "@/data";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import SourceFootnote from "@/components/SourceFootnote";
import SourceList from "@/components/SourceList";
import ClickableCode from "@/components/ClickableCode";
import { renderMarkdown } from "@/lib/renderMarkdown";

// Cast to any for runtime field access — the JSON shape may differ from the TS interface
const data = fp as any;

const CRITICALITY_CLASS: Record<string, string> = {
  essential: "badge badge--strong",
  enhancing: "badge badge--moderate",
  optional: "badge badge--neutral",
};

/** Strip [SRC:...] and [ASM:...] annotation tags from JSON string values */
function strip(s: string | undefined | null): string {
  if (!s) return "";
  return s.replace(/\s*\[(?:SRC|ASM)[^\]]*\]/g, "").trim();
}

/** Capitalise first letter */
function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Collect all source IDs referenced in the data */
function collectSourceIds(): string[] {
  const ids: string[] = [];
  if (Array.isArray(data.sources)) {
    data.sources.forEach((s: any) => {
      if (typeof s === "string") ids.push(s);
      else if (s?.id) ids.push(s.id);
    });
  }
  return ids;
}

// ─── Generic section renderer (for {sections} format) ────────────────────────

function GenericFallback() {
  if (!data.sections) return null;
  return (
    <section id="section-02" className="container">
      <div className="section-meta">
        <span>Step 02</span>
        <span className="sep">/</span>
        <span>Functional Promise</span>
      </div>
      <div className="md">
        <h1 className="section-title">02 Functional Promise</h1>
        {(data.sections as any[]).map((sec: any, i: number) => (
          <div key={i}>
            {sec.title && <h2>{sec.title}</h2>}
            {sec.content && (
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(sec.content) }} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Domain-specific (Zollern-style) renderer ────────────────────────────────

export default function FunctionalPromise() {
  // If only generic sections format, delegate
  if (!data.productFP && data.sections) return <GenericFallback />;

  const productFP = data.productFP;
  const commodityFP = data.commodityFP;
  const fpExtension = data.fpExtension;
  const bomPosition = data.bomPosition;
  const complements = data.complements as any[] | undefined;
  const sourceIds = collectSourceIds();

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

        {/* Executive Summary */}
        <ExecutiveSummary kicker="02 / Executive Summary" title="What you are reading">
          <p className="answer">
            This chapter defines the two-level Functional Promise that drives market discovery:
            a product-level promise (what <em>this capability platform</em> does) and a commodity-level
            promise (what <em>the broader commodity category</em> does). The product-level Functional
            Promise is used to assess architectural distance in new markets; the commodity-level
            Functional Promise is the search query that surfaces candidate NAICS markets in
            Chapter 05. Understanding both levels — and the Functional Promise Extension that
            captures capabilities beyond the core commodity — explains why the capability
            platform is relevant in markets beyond existing application markets.
          </p>
        </ExecutiveSummary>

        {/* Metadata block */}
        <blockquote>
          {data.productName && <p><strong>Product:</strong> {data.productName}</p>}
          {data.vendorName && <p><strong>Vendor:</strong> {data.vendorName}</p>}
          {data.customProductGroup && <p><strong>Product Group:</strong> {data.customProductGroup}</p>}
          <p><strong>Component:</strong> Functional Promise (Step 02)</p>
          <p><strong>Approach:</strong> Two-Level Functional Promise (product-level and commodity-level)</p>
          <p><strong>Archetype:</strong> New Markets for an Existing Product</p>
        </blockquote>

        <hr />

        {/* ── Underlying Mechanism ── */}
        {data.underlyingMechanism && (
          <>
            <h2 id="fp-mechanism">Underlying Mechanism</h2>
            <p>{data.underlyingMechanism}</p>
            <hr />
          </>
        )}

        {/* ── Product Functional Promise ── */}
        {productFP && (
          <>
            <h2 id="fp-product-fp">Product Functional Promise</h2>

            <table>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {productFP.statement && (
                  <tr>
                    <td><strong>Statement</strong></td>
                    <td>{strip(productFP.statement)}</td>
                  </tr>
                )}
                {productFP.verb && (
                  <tr>
                    <td><strong>Verb</strong></td>
                    <td>{productFP.verb}</td>
                  </tr>
                )}
                {productFP.object && (
                  <tr>
                    <td><strong>Object</strong></td>
                    <td>{productFP.object}</td>
                  </tr>
                )}
                {productFP.context && (
                  <tr>
                    <td><strong>Context</strong></td>
                    <td>{productFP.context}</td>
                  </tr>
                )}
                {productFP.scope && (
                  <tr>
                    <td><strong>Scope</strong></td>
                    <td>{cap(productFP.scope)}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Differentiators */}
            {Array.isArray(productFP.differentiators) && productFP.differentiators.length > 0 && (
              <>
                <h3>Differentiators vs Alternatives</h3>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Differentiator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productFP.differentiators.map((d: string, i: number) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{strip(d)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {/* Mechanism-Free Test */}
            {productFP.mechanismFreeTest && (
              <blockquote>
                <h3>Mechanism-Free Test</h3>
                <p>
                  The statement contains no technology-specific terms. The same statement would
                  hold if the underlying mechanism changed — only the differentiators would change.{" "}
                  <strong>Test {productFP.mechanismFreeTest === "PASS" ? "passed" : productFP.mechanismFreeTest}.</strong>
                </p>
              </blockquote>
            )}

            <hr />
          </>
        )}

        {/* ── UNSPSC Classification ── */}
        {data.unspscCode && (
          <>
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
                  <td><ClickableCode kind="unspsc" code={data.unspscCode} /></td>
                </tr>
                {data.unspscTitle && (
                  <tr>
                    <td><strong>UNSPSC Title</strong></td>
                    <td>{data.unspscTitle}</td>
                  </tr>
                )}
                {data.customProductGroup && (
                  <tr>
                    <td><strong>Custom Product Group</strong></td>
                    <td>{data.customProductGroup}</td>
                  </tr>
                )}
              </tbody>
            </table>
            <hr />
          </>
        )}

        {/* ── Commodity Functional Promise ── */}
        {commodityFP && (
          <>
            <h2 id="fp-commodity">
              {data.unspscCode
                ? "UNSPSC Commodity Functional Promise"
                : "Commodity Functional Promise"}
            </h2>

            {data.unspscCode && (
              <p style={{ color: "var(--text-gray)", marginBottom: "0.75rem" }}>
                Tied to UNSPSC Classification above —{" "}
                <ClickableCode kind="unspsc" code={data.unspscCode} />
                {data.unspscTitle ? ` (${data.unspscTitle})` : ""}
              </p>
            )}

            <table>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {(commodityFP.commodityOrGroup || commodityFP.commodity) && (
                  <tr>
                    <td><strong>Commodity or Group</strong></td>
                    <td>
                      {commodityFP.commodityOrGroup || commodityFP.commodity}
                      {data.unspscCode && (
                        <> (<ClickableCode kind="unspsc" code={data.unspscCode} />)</>
                      )}
                    </td>
                  </tr>
                )}
                {commodityFP.statement && (
                  <tr>
                    <td><strong>Functional Promise</strong></td>
                    <td>{strip(commodityFP.statement)}</td>
                  </tr>
                )}
                {commodityFP.verb && (
                  <tr>
                    <td><strong>Verb</strong></td>
                    <td>{commodityFP.verb}</td>
                  </tr>
                )}
                {commodityFP.object && (
                  <tr>
                    <td><strong>Object</strong></td>
                    <td>{commodityFP.object}</td>
                  </tr>
                )}
                {commodityFP.context && (
                  <tr>
                    <td><strong>Context</strong></td>
                    <td>{commodityFP.context}</td>
                  </tr>
                )}
                {commodityFP.scope && (
                  <tr>
                    <td><strong>Scope</strong></td>
                    <td>{cap(commodityFP.scope)}</td>
                  </tr>
                )}
                {commodityFP.reasoning && (
                  <tr>
                    <td><strong>Reasoning</strong></td>
                    <td>{strip(commodityFP.reasoning)}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Vendor-Agnostic Test */}
            {commodityFP.vendorAgnosticTest && (
              <blockquote>
                <h3>Vendor-Agnostic Test</h3>
                <p>
                  The commodity-level Functional Promise contains no vendor-specific terms.
                  Any provider in this commodity class could make the same promise — only the
                  execution quality and differentiators vary.{" "}
                  <strong>Test {commodityFP.vendorAgnosticTest === "PASS" ? "passed" : commodityFP.vendorAgnosticTest}.</strong>
                </p>
              </blockquote>
            )}

            <hr />
          </>
        )}

        {/* ── Functional Promise Extension ── */}
        {fpExtension && fpExtension.present && (
          <>
            <h2 id="fp-extension">Functional Promise Extension (Broader-than-Commodity Capabilities)</h2>

            {fpExtension.statement && (
              <p>{strip(fpExtension.statement)}</p>
            )}

            {/* Extension Axes */}
            {Array.isArray(fpExtension.axes) && fpExtension.axes.length > 0 && (
              <>
                {fpExtension.axes.map((axis: any, ai: number) => (
                  <div key={ai} style={{ marginBottom: "1.25rem" }}>
                    <h3>{axis.description || axis.axis}</h3>
                    {Array.isArray(axis.extension_domains) && axis.extension_domains.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                        {axis.extension_domains.map((domain: string, di: number) => (
                          <span key={di} className="badge badge--neutral">
                            {domain}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* Legacy flat fpExtensionDomains (Zollern-style) */}
            {!fpExtension.axes && commodityFP?.fpExtensionDomains && Array.isArray(commodityFP.fpExtensionDomains) && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                {commodityFP.fpExtensionDomains.map((domain: string, di: number) => (
                  <span key={di} className="badge badge--neutral">
                    {domain}
                  </span>
                ))}
              </div>
            )}

            <hr />
          </>
        )}

        {/* ── BOM / Value Network Position ── */}
        {bomPosition && (
          <>
            <h2 id="fp-bom">Value Network / BOM Position</h2>

            <table>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {/* Domain-specific BOM fields (Mein Solar format) */}
                {bomPosition.vnTier && (
                  <tr>
                    <td><strong>Value Network Tier</strong></td>
                    <td>{bomPosition.vnTier}</td>
                  </tr>
                )}
                {bomPosition.vnRole && (
                  <tr>
                    <td><strong>Role</strong></td>
                    <td>{bomPosition.vnRole}</td>
                  </tr>
                )}
                {bomPosition.deliversAssetAtLevel && (
                  <tr>
                    <td><strong>Delivers Asset at Level</strong></td>
                    <td>{bomPosition.deliversAssetAtLevel}</td>
                  </tr>
                )}
                {Array.isArray(bomPosition.upstreamL2Suppliers) && bomPosition.upstreamL2Suppliers.length > 0 && (
                  <tr>
                    <td><strong>Upstream Suppliers</strong></td>
                    <td>
                      <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                        {bomPosition.upstreamL2Suppliers.map((s: string, i: number) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
                {bomPosition.downstreamCustomer && (
                  <tr>
                    <td><strong>Downstream Customer</strong></td>
                    <td>{bomPosition.downstreamCustomer}</td>
                  </tr>
                )}

                {/* Zollern-style BOM fields (fallback) */}
                {bomPosition.level && (
                  <tr>
                    <td><strong>Bill of Materials Level</strong></td>
                    <td>{bomPosition.level}</td>
                  </tr>
                )}
                {bomPosition.position && (
                  <tr>
                    <td><strong>Position</strong></td>
                    <td>{bomPosition.position}</td>
                  </tr>
                )}
                {bomPosition.parentSubsystem && (
                  <tr>
                    <td><strong>Parent Subsystem (typical)</strong></td>
                    <td>{bomPosition.parentSubsystem}</td>
                  </tr>
                )}
                {bomPosition.grandparentSystem && (
                  <tr>
                    <td><strong>Grandparent System (typical)</strong></td>
                    <td>{bomPosition.grandparentSystem}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <hr />
          </>
        )}

        {/* ── Required Complements ── */}
        {Array.isArray(complements) && complements.length > 0 && (
          <>
            <h2 id="fp-complements">Required Complements</h2>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Complement</th>
                  <th>Criticality</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {complements.map((c: any, i: number) => (
                  <tr key={c.name || i}>
                    <td>{i + 1}</td>
                    <td><strong>{c.name}</strong></td>
                    <td>
                      <span className={CRITICALITY_CLASS[c.criticality] ?? "badge badge--neutral"}>
                        {cap(c.criticality || "unknown")}
                      </span>
                    </td>
                    <td>{c.type ? cap(c.type.replace(/_/g, " ")) : ""}</td>
                    <td>{c.description || c.note || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <hr />
          </>
        )}

        {/* ── How This Feeds Downstream Analysis ── */}
        <h2 id="fp-downstream">How This Feeds Downstream Analysis</h2>

        <table>
          <thead>
            <tr>
              <th>Phase</th>
              <th>Uses</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>A: NAICS Code Discovery (primary)</strong></td>
              <td>Commodity Functional Promise</td>
              <td>
                The commodity-level statement is the search query that surfaces candidate
                NAICS markets where this type of offering fulfils a demand.
              </td>
            </tr>
            {fpExtension?.present && (
              <tr>
                <td><strong>A: NAICS Code Discovery (secondary)</strong></td>
                <td>Functional Promise Extension</td>
                <td>
                  Extension domains broaden the search beyond the core commodity into
                  adjacent NAICS markets where the broader capability platform is relevant.
                </td>
              </tr>
            )}
            <tr>
              <td><strong>B: Architecture Distance</strong></td>
              <td>Product Functional Promise + specs</td>
              <td>
                The product-level statement and differentiators are compared against each
                candidate market to assess how close the existing capability is to what
                the market demands.
              </td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* ── Quality Checklist ── */}
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
              [
                "Product Functional Promise present with statement, verb, object, context, differentiators",
                productFP?.statement && productFP?.verb && productFP?.object && productFP?.context && Array.isArray(productFP?.differentiators),
              ],
              [
                "Product Functional Promise passes mechanism-free test",
                productFP?.mechanismFreeTest === "PASS",
              ],
              [
                "Commodity Functional Promise present and vendor-agnostic",
                commodityFP?.statement && (commodityFP?.vendorAgnosticTest === "PASS" || !commodityFP?.vendorAgnosticTest),
              ],
              [
                "BOM / value network position mapped",
                !!bomPosition,
              ],
              [
                "Required complements listed with criticality",
                Array.isArray(complements) && complements.length > 0,
              ],
              [
                "Functional Promise Extension assessed",
                fpExtension != null,
              ],
            ].map(([check, pass], i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{check as string}</td>
                <td>
                  <span className={pass ? "badge badge--strong" : "badge badge--neutral"}>
                    {pass ? "Complete" : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        {/* Sources */}
        {sourceIds.length > 0 && (
          <div id="fp-sources">
            <SourceList sourceIds={sourceIds} title="Sources — 02 Functional Promise" />
          </div>
        )}
      </div>
    </section>
  );
}
