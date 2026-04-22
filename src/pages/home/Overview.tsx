/**
 * 00 Overview
 * Covers: the question being answered, company profile,
 * product hierarchy, and portfolio priorities.
 * Data lives in src/data/overview.json -- never hardcoded here.
 */

import overviewRaw from "@/data/overview.json";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import SourceFootnote from "@/components/SourceFootnote";
import ClickableCode from "@/components/ClickableCode";

/* -- cast to loose type so optional/missing fields never crash ------------- */
const data = overviewRaw as any;

/* -- Helpers --------------------------------------------------------------- */
const FIT_CLASS: Record<string, string> = {
  pursue: "badge badge--strong",
  STRONG: "badge badge--strong",
  "MODERATE-top": "badge badge--moderate",
  MODERATE: "badge badge--moderate",
  investigate: "badge badge--moderate",
  WEAK: "badge badge--weak",
  monitor: "badge badge--weak",
};

function fitBadge(label: string) {
  return (
    <span className={FIT_CLASS[label] ?? "badge badge--neutral"}>{label}</span>
  );
}

/* -- Inline source list ---------------------------------------------------- */
function SourceList({
  sources,
}: {
  sources: { id: string; label: string; url: string | null }[];
}) {
  return (
    <div className="source-list" style={{ marginTop: 32 }}>
      <div className="source-list__title">Sources -- 00 Overview</div>
      <ol>
        {sources.map((src, i) => (
          <li key={src.id}>
            <span className="num">{i + 1}.</span>
            <div>
              {src.url ? (
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {src.label}
                </a>
              ) : (
                <span style={{ color: "var(--text-gray)" }}>{src.label}</span>
              )}
              {!src.url && (
                <span
                  className="pending"
                  style={{ display: "block" }}
                >
                  source pending
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* -- Page ------------------------------------------------------------------ */
export default function Overview() {
  const company = data.company;
  const globalFootprint = data.globalFootprint;
  const divisions: any[] = data.divisions ?? [];
  const productGroup = data.productGroup;
  const product = data.product;
  const studyQuestion = data.studyQuestion;
  const portfolioPriorities: any[] = data.portfolioPriorities ?? [];
  const financials = data.financials;
  const sources: any[] = data.sources ?? [];

  const subjectDivision = divisions.find((d: any) => d.isSubjectDivision);

  /* Does the financials object have any real content? */
  const hasFinancials =
    financials &&
    typeof financials === "object" &&
    Object.keys(financials).length > 0 &&
    (financials.y5RevenueBase || financials.npvBase || financials.irrBase);

  return (
    <section id="section-00" className="container">
      {/* Breadcrumb */}
      <div className="section-meta">
        <span>Step 00</span>
        <span className="sep">/</span>
        <span>Overview &amp; Context</span>
        <span className="sep">/</span>
        <span>New Markets for an Existing Product</span>
      </div>

      <div className="md">
        <h1 className="section-title">00 Overview</h1>

        {/* -- Executive Summary -- */}
        <ExecutiveSummary kicker="00 / What you are reading" title="Report scope">
          <p className="answer">
            This report answers the strategic questions posed by{" "}
            {company?.name ?? "the company"}: which new markets exist for{" "}
            {product?.name ?? "the product under analysis"}, how attractive are
            these segments, and what business model fits? The analysis evaluates{" "}
            {portfolioPriorities.length} application markets through a six-factor
            composite scoring model covering architecture distance,
            job-to-be-done coverage, feature fit, constraint compatibility,
            value-network position, and incumbent vulnerability. This page is the
            entry point -- it explains the question, introduces the company and
            product, and gives a one-page summary of findings.
          </p>
        </ExecutiveSummary>

        {/* -- The Question -- */}
        {studyQuestion && (
          <>
            <hr />
            <h2 id="ovw-question">
              The Question {company?.name ?? "the Company"} Asked
            </h2>

            {/* Q1 */}
            {studyQuestion.q1 && (
              <div
                style={{
                  border: "1px solid var(--border-subtle)",
                  borderLeft: "3px solid var(--accent-yellow)",
                  borderRadius: 8,
                  padding: "20px 24px",
                  marginBottom: 20,
                  background: "var(--bg-card)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--text-gray-dark)",
                    marginBottom: 8,
                  }}
                >
                  Q1 -- Primary Question
                  {studyQuestion.q1.german ? " (original German)" : ""}
                </div>
                {studyQuestion.q1.german && (
                  <p
                    style={{
                      fontStyle: "italic",
                      color: "var(--text-gray-light)",
                      marginBottom: 8,
                      fontSize: 14,
                    }}
                  >
                    &ldquo;{studyQuestion.q1.german}&rdquo;
                  </p>
                )}
                {studyQuestion.q1.english && (
                  <p
                    style={{
                      color: "var(--text-gray)",
                      fontSize: 13,
                      marginBottom: 16,
                    }}
                  >
                    <strong style={{ color: "var(--text-white)" }}>
                      In English:
                    </strong>{" "}
                    {studyQuestion.q1.english}
                  </p>
                )}
                {studyQuestion.q1.answer && (
                  <>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "var(--text-gray-dark)",
                        marginBottom: 6,
                      }}
                    >
                      Answer (summary)
                    </div>
                    <p
                      style={{
                        color: "var(--text-white)",
                        fontSize: 13,
                        lineHeight: 1.6,
                        marginBottom: 0,
                      }}
                    >
                      {studyQuestion.q1.answer}
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Q2 */}
            {studyQuestion.q2 &&
              (studyQuestion.q2.german ||
                studyQuestion.q2.english ||
                studyQuestion.q2.answer) && (
                <div
                  style={{
                    border: "1px solid var(--border-subtle)",
                    borderLeft: "3px solid var(--status-medium)",
                    borderRadius: 8,
                    padding: "20px 24px",
                    marginBottom: 24,
                    background: "var(--bg-card)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--text-gray-dark)",
                      marginBottom: 8,
                    }}
                  >
                    Q2 -- Secondary Question
                    {studyQuestion.q2.german ? " (original German)" : ""}
                  </div>
                  {studyQuestion.q2.german && (
                    <p
                      style={{
                        fontStyle: "italic",
                        color: "var(--text-gray-light)",
                        marginBottom: 8,
                        fontSize: 14,
                      }}
                    >
                      &ldquo;{studyQuestion.q2.german}&rdquo;
                    </p>
                  )}
                  {studyQuestion.q2.english && (
                    <p
                      style={{
                        color: "var(--text-gray)",
                        fontSize: 13,
                        marginBottom: 16,
                      }}
                    >
                      <strong style={{ color: "var(--text-white)" }}>
                        In English:
                      </strong>{" "}
                      {studyQuestion.q2.english}
                    </p>
                  )}
                  {studyQuestion.q2.answer && (
                    <>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: "var(--text-gray-dark)",
                          marginBottom: 6,
                        }}
                      >
                        Answer (summary)
                      </div>
                      <p
                        style={{
                          color: "var(--text-white)",
                          fontSize: 13,
                          lineHeight: 1.6,
                          marginBottom: 0,
                        }}
                      >
                        {studyQuestion.q2.answer}
                      </p>
                    </>
                  )}
                </div>
              )}
          </>
        )}

        {/* -- About the Company -- */}
        {company && (
          <>
            <hr />
            <h2 id="ovw-company">
              About {company.name}
              {company.legalForm ? ` (${company.legalForm})` : ""}
            </h2>
            {sources.length > 0 && (
              <SourceFootnote sourceIds={sources.slice(0, 3).map((s: any) => s.id)} />
            )}

            <table>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Legal name</strong></td>
                  <td>
                    {company.name}
                    {company.legalForm ? ` (${company.legalForm})` : ""}
                  </td>
                </tr>
                {company.founded && (
                  <tr>
                    <td><strong>Founded</strong></td>
                    <td>{company.founded}</td>
                  </tr>
                )}
                {company.hq && (
                  <tr>
                    <td><strong>Headquarters</strong></td>
                    <td>{company.hq}</td>
                  </tr>
                )}
                {company.ownership && (
                  <tr>
                    <td><strong>Ownership</strong></td>
                    <td>{company.ownership}</td>
                  </tr>
                )}
                {company.revenue?.value && (
                  <tr>
                    <td><strong>Revenue</strong></td>
                    <td>
                      {company.revenue.value}
                      {company.revenue.year ? ` (${company.revenue.year})` : ""}
                      {company.revenue.note && (
                        <span
                          style={{
                            display: "block",
                            fontSize: 11,
                            color: "var(--text-gray-dark)",
                            marginTop: 2,
                          }}
                        >
                          {company.revenue.note}
                        </span>
                      )}
                    </td>
                  </tr>
                )}
                {!company.revenue?.value && company.revenue?.note && (
                  <tr>
                    <td><strong>Revenue</strong></td>
                    <td>
                      <span style={{ color: "var(--text-gray)" }}>
                        {company.revenue.note}
                      </span>
                    </td>
                  </tr>
                )}
                {company.employees?.value && (
                  <tr>
                    <td><strong>Employees</strong></td>
                    <td>
                      {typeof company.employees.value === "number"
                        ? `~${company.employees.value.toLocaleString()}`
                        : company.employees.value}
                      {company.employees.year
                        ? ` (${company.employees.year})`
                        : ""}
                      {company.employees.note && (
                        <span
                          style={{
                            display: "block",
                            fontSize: 11,
                            color: "var(--text-gray-dark)",
                            marginTop: 2,
                          }}
                        >
                          {company.employees.note}
                        </span>
                      )}
                    </td>
                  </tr>
                )}
                {company.sites && (
                  <tr>
                    <td><strong>Sites</strong></td>
                    <td>
                      {typeof company.sites === "number"
                        ? `${company.sites} locations across ${company.countries} countries, ${company.continents} continents`
                        : company.sites}
                      {typeof company.sites !== "number" &&
                        company.countries && (
                          <span
                            style={{
                              display: "block",
                              fontSize: 11,
                              color: "var(--text-gray-dark)",
                              marginTop: 2,
                            }}
                          >
                            {company.countries}
                            {company.continents
                              ? ` / ${company.continents}`
                              : ""}
                          </span>
                        )}
                    </td>
                  </tr>
                )}
                {company.ceo?.name && (
                  <tr>
                    <td><strong>CEO</strong></td>
                    <td>
                      {company.ceo.name}
                      {company.ceo.since ? ` (since ${company.ceo.since})` : ""}
                      {company.ceo.note && (
                        <span
                          style={{
                            display: "block",
                            fontSize: 11,
                            color: "var(--text-gray-dark)",
                            marginTop: 2,
                          }}
                        >
                          {company.ceo.note}
                        </span>
                      )}
                    </td>
                  </tr>
                )}
                {company.rdIntensity && (
                  <tr>
                    <td><strong>R&amp;D intensity</strong></td>
                    <td>{company.rdIntensity}</td>
                  </tr>
                )}
                {(company.patentsTotal != null && company.patentsTotal !== "") && (
                  <tr>
                    <td><strong>Patent portfolio</strong></td>
                    <td>
                      {typeof company.patentsTotal === "number"
                        ? `${company.patentsTotal.toLocaleString()} total${
                            company.patentsGranted != null
                              ? ` \u00B7 ${company.patentsGranted.toLocaleString()} granted`
                              : ""
                          }`
                        : "Not publicly disclosed"}
                    </td>
                  </tr>
                )}
                {company.primaryNaics && (
                  <tr>
                    <td><strong>Primary NAICS</strong></td>
                    <td>
                      <ClickableCode
                        kind="naics"
                        code={company.primaryNaics}
                      />{" "}
                      {company.primaryNaicsTitle
                        ? `-- ${company.primaryNaicsTitle}`
                        : ""}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}

        {/* -- Global Footprint -- */}
        {globalFootprint?.regions && globalFootprint.regions.length > 0 && (
          <>
            <h3>Global Footprint</h3>
            <table>
              <thead>
                <tr>
                  <th>Region</th>
                  <th>Sites</th>
                </tr>
              </thead>
              <tbody>
                {globalFootprint.regions.map((r: any) => (
                  <tr key={r.region}>
                    <td><strong>{r.region}</strong></td>
                    <td>
                      {Array.isArray(r.sites)
                        ? r.sites.join(" \u00B7 ")
                        : r.sites}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* -- Division & Product Hierarchy -- */}
        {(divisions.length > 0 || productGroup || product) && (
          <>
            <hr />
            <h2 id="ovw-hierarchy">
              Company → Division → Product Hierarchy
            </h2>
            {sources.length > 0 && (
              <SourceFootnote sourceIds={sources.slice(0, 2).map((s: any) => s.id)} />
            )}

            <table>
              <thead>
                <tr>
                  <th>Level</th>
                  <th>Entity</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {company && (
                  <tr>
                    <td>
                      <span className="badge badge--accent">Company</span>
                    </td>
                    <td><strong>{company.name}</strong></td>
                    <td>
                      {company.ownership ? `${company.ownership}. ` : ""}
                      {company.primaryNaicsTitle
                        ? `Primary sector: ${company.primaryNaicsTitle}.`
                        : ""}
                    </td>
                  </tr>
                )}
                {subjectDivision && (
                  <tr>
                    <td>
                      <span className="badge badge--moderate">Division</span>
                    </td>
                    <td><strong>{subjectDivision.name}</strong></td>
                    <td>{subjectDivision.description}</td>
                  </tr>
                )}
                {productGroup && (
                  <tr>
                    <td>
                      <span className="badge badge--neutral">
                        Product Group
                      </span>
                    </td>
                    <td><strong>{productGroup.name}</strong></td>
                    <td>{productGroup.scope}</td>
                  </tr>
                )}
                {product && (
                  <tr>
                    <td>
                      <span className="badge badge--strong">
                        Product{product.bomLevel ? ` (${product.bomLevel})` : ""}
                      </span>
                    </td>
                    <td><strong>{product.name}</strong></td>
                    <td>
                      {product.homeMarketNaics && (
                        <>
                          Home market:{" "}
                          <ClickableCode
                            kind="naics"
                            code={product.homeMarketNaics}
                          />{" "}
                          {product.homeMarketTitle ?? ""}.{" "}
                        </>
                      )}
                      The subject of this entire analysis.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}

        {/* -- All Divisions -- */}
        {divisions.length > 0 && (
          <>
            <h3>All Divisions</h3>
            <table>
              <thead>
                <tr>
                  <th>Division</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {divisions.map((d: any) => (
                  <tr
                    key={d.name}
                    style={
                      d.isSubjectDivision
                        ? { background: "rgba(253,255,152,0.04)" }
                        : undefined
                    }
                  >
                    <td>
                      <strong>{d.name}</strong>
                      {d.isSubjectDivision && (
                        <span
                          className="badge badge--strong"
                          style={{ marginLeft: 8 }}
                        >
                          Subject
                        </span>
                      )}
                    </td>
                    <td
                      style={{ fontSize: 12, color: "var(--text-gray)" }}
                    >
                      {d.type}
                    </td>
                    <td style={{ fontSize: 12 }}>{d.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* -- Product Families -- */}
        {productGroup?.families && productGroup.families.length > 0 && (
          <>
            <h3>Product Families</h3>
            <table>
              <thead>
                <tr>
                  <th>Product Family</th>
                  <th>Technology</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {productGroup.families.map((f: any) => (
                  <tr key={f.name}>
                    <td><strong>{f.name}</strong></td>
                    <td>{f.technology}</td>
                    <td>
                      <span
                        className={
                          (f.status || "").startsWith("Current") ||
                          (f.status || "").toLowerCase() === "active"
                            ? "badge badge--strong"
                            : (f.status || "").startsWith("Legacy")
                              ? "badge badge--weak"
                              : "badge badge--moderate"
                        }
                      >
                        {(f.status || "--").split(" -- ")[0]}
                      </span>
                      {(f.status || "").includes(" -- ") && (
                        <span
                          style={{
                            display: "block",
                            fontSize: 11,
                            color: "var(--text-gray)",
                            marginTop: 2,
                          }}
                        >
                          {(f.status || "").split(" -- ")[1]}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* -- Product Variants -- */}
        {product?.variants && product.variants.length > 0 && (
          <>
            <hr />
            <h2 id="ovw-product">
              The Product: {company?.name ?? ""}{" "}
              {product.name ?? "Variants"}
            </h2>
            {sources.length > 0 && (
              <SourceFootnote sourceIds={sources.slice(0, 2).map((s: any) => s.id)} />
            )}

            {product.family && (
              <p>
                The {product.family.toLowerCase()} spans multiple service
                configurations.{" "}
                {product.variants.find((v: any) => v.isSerial) && (
                  <>
                    The{" "}
                    <strong>
                      {product.variants.find((v: any) => v.isSerial)?.id}
                    </strong>{" "}
                    variant is the primary serial offering.{" "}
                  </>
                )}
                All variants are subject of this analysis.
              </p>
            )}

            <table>
              <thead>
                <tr>
                  <th>Variant</th>
                  <th>Status</th>
                  {/* Adaptive column headers based on data shape */}
                  {product.variants[0]?.crossSection != null ? (
                    <>
                      <th>Cross-Section</th>
                      <th>Tolerance</th>
                      <th>Max Length</th>
                    </>
                  ) : product.variants[0]?.innerDiameter != null ? (
                    <>
                      <th>Inner diameter</th>
                      <th>Flow Range</th>
                      <th>Dimensions (L x W x H)</th>
                    </>
                  ) : (
                    <th>Note</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {product.variants.map((v: any) => (
                  <tr
                    key={v.id}
                    style={
                      v.isSerial
                        ? { background: "rgba(253,255,152,0.04)" }
                        : undefined
                    }
                  >
                    <td>
                      <strong>{v.id}</strong>
                      {v.isSerial && (
                        <span
                          className="badge badge--strong"
                          style={{ marginLeft: 8 }}
                        >
                          Serial
                        </span>
                      )}
                    </td>
                    <td>{v.status}</td>
                    {v.crossSection != null ? (
                      <>
                        <td>{v.crossSection}</td>
                        <td>{v.tolerance}</td>
                        <td
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 12,
                          }}
                        >
                          {v.maxLength}
                        </td>
                      </>
                    ) : v.innerDiameter != null ? (
                      <>
                        <td>{v.innerDiameter}</td>
                        <td>{v.flowRange}</td>
                        <td
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 12,
                          }}
                        >
                          {v.dimensions}
                        </td>
                      </>
                    ) : (
                      <td
                        style={{
                          fontSize: 12,
                          color: "var(--text-gray)",
                        }}
                      >
                        {v.note ?? "--"}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* -- Portfolio Priorities -- */}
        {portfolioPriorities.length > 0 && (
          <>
            <hr />
            <h2 id="ovw-portfolio">Market Priorities at a Glance</h2>

            <p>
              {portfolioPriorities.length} application markets were evaluated.
              The table below shows the priority ranking with fit score,
              time-to-first-revenue, estimated investment, and strategic role.
            </p>

            <table>
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>Market</th>
                  <th>NAICS</th>
                  <th>Fit Score</th>
                  <th>Time to Revenue</th>
                  {/* Show investment column if any row has it */}
                  {portfolioPriorities.some(
                    (p: any) => p.estimatedInvestment || p.hardwareDelta
                  ) && <th>Investment / Delta</th>}
                  {/* Show Y5 revenue if any row has it */}
                  {portfolioPriorities.some(
                    (p: any) => p.y5RevenueBaseM != null
                  ) && <th>Y5 Base Revenue</th>}
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {portfolioPriorities.map((p: any) => (
                  <tr key={p.priority}>
                    <td
                      style={{
                        textAlign: "center",
                        fontWeight: 700,
                      }}
                    >
                      {p.priority}
                    </td>
                    <td><strong>{p.market}</strong></td>
                    <td>
                      {p.naicsCode ? (
                        <ClickableCode kind="naics" code={p.naicsCode} />
                      ) : (
                        "--"
                      )}
                    </td>
                    <td>
                      {typeof p.fitScore === "number"
                        ? p.fitScore.toFixed(2)
                        : p.fitScore}{" "}
                      {p.fitLabel && fitBadge(p.fitLabel)}
                    </td>
                    <td
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                      }}
                    >
                      {p.timeToFirstRevenue ?? "--"}
                    </td>
                    {portfolioPriorities.some(
                      (pp: any) => pp.estimatedInvestment || pp.hardwareDelta
                    ) && (
                      <td style={{ fontSize: 12 }}>
                        {p.estimatedInvestment ?? p.hardwareDelta ?? "--"}
                      </td>
                    )}
                    {portfolioPriorities.some(
                      (pp: any) => pp.y5RevenueBaseM != null
                    ) && (
                      <td
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontWeight: 700,
                        }}
                      >
                        {p.y5RevenueBaseM != null
                          ? `\u20AC${p.y5RevenueBaseM}M`
                          : "--"}
                      </td>
                    )}
                    <td
                      style={{
                        fontSize: 12,
                        color: "var(--text-gray)",
                      }}
                    >
                      {p.role}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <hr />
          </>
        )}

        {/* -- Financial Summary -- */}
        {hasFinancials && (
          <>
            <h2 id="ovw-financials">Financial Summary</h2>

            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Base</th>
                  <th>Upside</th>
                  <th>Downside</th>
                </tr>
              </thead>
              <tbody>
                {financials.y5RevenueBase && (
                  <tr>
                    <td><strong>5-Year Revenue</strong></td>
                    <td>{financials.y5RevenueBase}</td>
                    <td>{financials.y5RevenueUpside ?? "--"}</td>
                    <td>{financials.y5RevenueDownside ?? "--"}</td>
                  </tr>
                )}
                {financials.npvBase && (
                  <tr>
                    <td><strong>NPV</strong></td>
                    <td>{financials.npvBase}</td>
                    <td>{financials.npvUpside ?? "--"}</td>
                    <td>{financials.npvDownside ?? "--"}</td>
                  </tr>
                )}
                {financials.irrBase && (
                  <tr>
                    <td><strong>IRR</strong></td>
                    <td>{financials.irrBase}</td>
                    <td>{financials.irrUpside ?? "--"}</td>
                    <td>{financials.irrDownside ?? "--"}</td>
                  </tr>
                )}
                {financials.breakevenBase && (
                  <tr>
                    <td><strong>Breakeven</strong></td>
                    <td>{financials.breakevenBase}</td>
                    <td>{financials.breakevenUpside ?? "--"}</td>
                    <td>{financials.breakevenDownside ?? "--"}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {(financials.cumulativeInvestment || financials.discountRate) && (
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-gray)",
                  marginTop: 8,
                }}
              >
                {financials.cumulativeInvestment &&
                  `Cumulative investment: ${financials.cumulativeInvestment}. `}
                {financials.discountRate &&
                  `Discount rate: ${financials.discountRate}. `}
                {financials.note ?? ""}
              </p>
            )}

            <hr />
          </>
        )}

        {/* -- How to Read This Report -- */}
        <h2 id="ovw-howto">How to Read This Report</h2>

        <table>
          <thead>
            <tr>
              <th>Chapter</th>
              <th>What it covers</th>
              <th>Key output</th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "01 Product Profile",
                `What ${product?.name ?? "the product"} does at mechanism, function, and outcome level. Features, specs, UNSPSC classification.`,
                "Foundation for every compatibility check that follows",
              ],
              [
                "02 Functional Promise",
                "The two-level functional promise used as the market search query. What the product does independent of technology.",
                "Commodity-level promise drives the NAICS market discovery in Chapter 05",
              ],
              [
                "03 Constraints",
                "Physical, regulatory, and operational limits. Absolute barriers and conditional constraints.",
                "Every new market candidate is screened against these -- absolute violations eliminate a market",
              ],
              [
                "04 Home Market",
                `Competition, alternatives, and value network position in the existing ${company?.primaryNaicsTitle ?? "home"} market.`,
                "Baseline for comparison -- current home market",
              ],
              [
                "05 New Market Discovery",
                "NAICS market discovery via commodity functional promise. Architecture distance scoring. 6-factor composite ranking.",
                `The ranked shortlist of ${portfolioPriorities.length} markets to investigate`,
              ],
              [
                "06 New Market Analysis",
                "Per-market deep-dive: Job-to-be-Done, ODI matrix, Kano fit, value network, BOM, alternatives, compatibility.",
                "Decision data per market -- what to build, who to sell to, what it costs to enter",
              ],
            ].map(([ch, what, output]) => (
              <tr key={ch}>
                <td><strong>{ch}</strong></td>
                <td>{what}</td>
                <td style={{ fontSize: 12, color: "var(--text-gray)" }}>
                  {output}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        {/* Sources */}
        {sources.length > 0 && <SourceList sources={sources} />}
      </div>
    </section>
  );
}
