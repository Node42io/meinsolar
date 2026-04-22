/**
 * 00 Overview — Fully data-driven from overview.json + ranking.json + product.json.
 * No hardcoded company/product names. Reads all content from JSON.
 */

import overviewMeta from "@/data/overview.json";
import { ranking, product, marketDiscovery, listMarkets } from "@/data";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import ClickableCode from "@/components/ClickableCode";
import { renderMarkdown } from "@/lib/renderMarkdown";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface OverviewMeta {
  companyName: string;
  productName: string;
  productSubtitle: string;
  vendorName: string;
  vendorDescription: string;
  naicsHome: string;
  naicsHomeTitle: string;
  marketsAnalyzed: number;
  unspscCode: string;
  unspscTitle: string;
  heroSubhead: string;
  reportTitle: string;
}

const meta = overviewMeta as OverviewMeta;

/** Sections from the product decomposition or other generic data */
function SectionContent({ sections }: { sections: { title: string; content: string }[] }) {
  return (
    <>
      {sections.map((s, i) => (
        <div key={i} style={{ marginBottom: 24 }}>
          {s.title && (
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-white)", marginBottom: 8 }}>
              {s.title}
            </h3>
          )}
          <div
            style={{ fontSize: 13, color: "var(--text-gray-light)", lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(s.content) }}
          />
        </div>
      ))}
    </>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function Overview() {
  const markets = listMarkets();
  const rankingData = ranking as any;
  const productData = product as any;
  const discoveryData = marketDiscovery as any;

  // Extract sections from product decomposition (generic format)
  const productSections: { title: string; content: string }[] = productData?.sections ?? [];
  const discoverySections: { title: string; content: string }[] = discoveryData?.sections ?? [];

  // Extract ranking entities if available
  const rankedMarkets: any[] = rankingData?.rankedMarkets ?? rankingData?.entities ?? [];
  const rankingSections: { title: string; content: string }[] = rankingData?.sections ?? [];

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

        {/* ── Executive Summary ── */}
        <ExecutiveSummary kicker="00 / What you are reading" title="Report scope">
          <p className="answer">
            This report answers a strategic question for <strong>{meta.companyName}</strong>: which
            new markets can the <strong>{meta.productName}</strong> enter, how attractive
            are they, and what business model fits? The analysis evaluated {meta.marketsAnalyzed} candidate
            markets through a six-factor composite scoring model covering architecture
            distance, job-to-be-done coverage, feature fit, constraint compatibility,
            value-network position, and incumbent vulnerability. This page is the entry point — it
            introduces the company and product, and gives a summary of findings.
          </p>
        </ExecutiveSummary>

        {/* ── Company Profile ── */}
        <hr />
        <h2 id="ovw-company">About {meta.companyName}</h2>

        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Company</strong></td>
              <td>{meta.companyName}</td>
            </tr>
            <tr>
              <td><strong>Description</strong></td>
              <td>{meta.vendorDescription}</td>
            </tr>
            <tr>
              <td><strong>Primary NAICS</strong></td>
              <td>
                <ClickableCode kind="naics" code={meta.naicsHome} />{" "}
                — {meta.naicsHomeTitle}
              </td>
            </tr>
            <tr>
              <td><strong>UNSPSC</strong></td>
              <td>
                <ClickableCode kind="unspsc" code={meta.unspscCode} />{" "}
                — {meta.unspscTitle}
              </td>
            </tr>
            <tr>
              <td><strong>Product under analysis</strong></td>
              <td>
                <strong>{meta.productName}</strong>
                <span style={{ display: "block", fontSize: 12, color: "var(--text-gray)", marginTop: 2 }}>
                  {meta.productSubtitle}
                </span>
              </td>
            </tr>
            <tr>
              <td><strong>Markets analyzed</strong></td>
              <td>{meta.marketsAnalyzed} NAICS markets</td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* ── Product Summary from sections ── */}
        {productSections.length > 0 && (
          <>
            <h2 id="ovw-hierarchy">Product Summary</h2>
            <SectionContent sections={productSections.slice(0, 3)} />
            <hr />
          </>
        )}

        {/* ── Market Discovery Summary ── */}
        {discoverySections.length > 0 && (
          <>
            <h2 id="ovw-portfolio">Market Discovery Summary</h2>
            <SectionContent sections={discoverySections.slice(0, 2)} />
            <hr />
          </>
        )}

        {/* ── Markets at a Glance ── */}
        <h2>Markets Analyzed</h2>

        <p style={{ fontSize: 13, color: "var(--text-gray)", lineHeight: 1.7, marginBottom: 16 }}>
          {meta.marketsAnalyzed} candidate markets were screened through a six-factor composite
          scoring model. Each market was analyzed for value network structure, jobs-to-be-done,
          feature-market fit, ODI opportunity scores, and constraint compatibility.
        </p>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Market</th>
              <th>NAICS</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {markets.map((m, i) => (
              <tr key={m.slug}>
                <td style={{ textAlign: "center", fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: 12 }}>{i + 1}</td>
                <td><strong>{m.name}</strong></td>
                <td><ClickableCode kind="naics" code={m.naics} /></td>
                <td>
                  <span className={m.isReference ? "badge badge--accent" : "badge badge--neutral"}>
                    {m.isReference ? "Reference" : "New Market"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        {/* ── Ranking Summary ── */}
        {rankingSections.length > 0 && (
          <>
            <h2 id="ovw-financials">Ranking Summary</h2>
            <SectionContent sections={rankingSections.slice(0, 3)} />
            <hr />
          </>
        )}

        {/* ── How to Read This Report ── */}
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
              ["01 Product Profile", "What the product/service does at mechanism, function, and outcome level. Features, specs, UNSPSC classification.", "Foundation for every compatibility check that follows"],
              ["02 Functional Promise", "The two-level functional promise used as the market search query. What the product does independent of technology.", "Commodity-level promise drives the NAICS market discovery"],
              ["03 Constraints", "Physical, regulatory, and operational limits. Absolute barriers and conditional constraints.", "Every new market candidate is screened against these"],
              ["04 Home Market", "Home market competitive analysis — incumbents and alternatives in the current market.", "Baseline competitive landscape"],
              ["05 New Market Discovery", "NAICS market discovery via commodity functional promise. Architecture distance scoring.", "The ranked shortlist of markets to investigate"],
              ["06 New Market Analysis", "Per-market deep-dive: Job-to-be-Done, ODI matrix, value network, BOM, alternatives, compatibility.", "Decision data per market — what to build, who to sell to, what it costs to enter"],
            ].map(([ch, what, output]) => (
              <tr key={ch}>
                <td><strong>{ch}</strong></td>
                <td>{what}</td>
                <td style={{ fontSize: 12, color: "var(--text-gray)" }}>{output}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
