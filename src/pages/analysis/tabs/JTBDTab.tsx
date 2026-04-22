/**
 * JTBDTab — Job-to-be-Done Analysis tab (Marquardt-style design).
 *
 * Uses the original visualization components: ODIMatrix, NeedsList, JobMap, StakeholderMap.
 * Data is synthesized from the generic JSON format by loadMarketData().
 */

import { useState } from "react";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import SourceList from "@/components/SourceList";
import NeedsList from "./jtbd/NeedsList";
import JobMap from "./jtbd/JobMap";
import StakeholderMap from "./jtbd/StakeholderMap";
import ODIMatrix from "./jtbd/ODIMatrix";
import { loadMarketData } from "./jtbd/loadMarketData";
import type { ODINeed } from "@/types";

export default function JTBDTab({ marketSlug }: { marketSlug: string }) {
  const { jtbd, odi } = loadMarketData(marketSlug);
  const [matrixSelected, setMatrixSelected] = useState<ODINeed | null>(null);

  // Graceful fallback
  if (!jtbd && !odi) {
    return (
      <div className="section">
        <div className="section__eyebrow">JTBD · {marketSlug}</div>
        <h2 className="section__title">Job-to-be-Done Analysis</h2>
        <p className="section__sub" style={{ fontStyle: "italic" }}>
          Data pending — this market has not yet been extracted.
        </p>
      </div>
    );
  }

  const marketName = jtbd?.marketName ?? odi?.marketName ?? marketSlug;
  const coreJob = jtbd?.coreJobStatement;
  const jobSteps = jtbd?.jobSteps ?? [];
  const stakeholders = jtbd?.stakeholders ?? [];

  // ODI entries for the scatter plot (recalibrated satisfaction)
  const odiNeeds: ODINeed[] = Array.isArray(odi?.needs) ? odi.needs : [];
  // JTBD needs for the full needs table (richer rationales)
  const jtbdNeeds: ODINeed[] = Array.isArray(jtbd?.needs) ? jtbd.needs : odiNeeds;

  const jtbdSourceIds: string[] = [];
  const odiSourceIds: string[] = [];
  try {
    for (const s of (jtbd as any)?.sources ?? []) jtbdSourceIds.push(s.prefixedId ?? s.id);
    for (const s of (odi as any)?.sources ?? []) odiSourceIds.push(s.prefixedId ?? s.id);
  } catch { /* ignore */ }

  const underservedCount = odiNeeds.filter((n) => n?.isUnderserved).length;
  const overservedCount = odiNeeds.filter((n) => n?.isOverserved).length;
  const avgOpp = odiNeeds.length > 0
    ? odiNeeds.reduce((acc, n) => acc + n.opportunity, 0) / odiNeeds.length
    : 0;

  return (
    <div>
      {/* ── Section eyebrow & title ── */}
      <div className="section">
        <div className="section__eyebrow">JTBD · {marketName}</div>
        <h2 className="section__title">Job-to-be-Done Analysis</h2>
        <p className="section__sub">
          Below we break down the main job your customer is trying to get done in this market,
          score how well current solutions deliver it, and pinpoint where the biggest
          opportunities lie.
        </p>

        <ExecutiveSummary kicker="JTBD · What you're reading">
          <p className="answer">
            We identified <strong>{jtbdNeeds.length} customer needs</strong> and <strong>{odiNeeds.length} ODI outcomes</strong> for the{" "}
            <strong>{marketName}</strong> market.
            {odiNeeds.length > 0 && (
              <>
                {" "}Average opportunity score: <strong>{avgOpp.toFixed(1)}</strong>.
                {" "}<strong>{underservedCount}</strong> underserved
                {overservedCount > 0 && <>, <strong>{overservedCount}</strong> overserved</>}.
              </>
            )}
            {coreJob && (
              <>
                {" "}Core job: <em>"{coreJob}"</em>
              </>
            )}
          </p>
        </ExecutiveSummary>
      </div>

      {/* ── Section 1: ODI Matrix ── */}
      <div className="section">
        <div className="section__eyebrow">
          Outcome-Driven Innovation · {marketName}
        </div>
        <h2 className="section__title">Customer Outcome Opportunities (ODI Matrix)</h2>
        <p className="section__sub">
          <strong>{odiNeeds.length} outcomes</strong> — Each outcome is scored using the
          opportunity formula: Opportunity&nbsp;= Importance + (Importance&nbsp;−&nbsp;Satisfaction).
          Scores above 12 indicate high market whitespace.
          Click any row to expand the full rationale.
          {overservedCount > 0 &&
            " Overserved outcomes (where satisfaction exceeds importance) are marked separately."}
        </p>
        <ODIMatrix
          needs={odiNeeds}
          onSelect={(n) => setMatrixSelected(n)}
        />
        {odiSourceIds.length > 0 && (
          <SourceList sourceIds={odiSourceIds} title="Sources — ODI" />
        )}
      </div>

      {/* ── Section 2: Needs Table ── */}
      {odiNeeds.length > 0 && (
        <div className="section">
          <div className="section__eyebrow">
            Customer Needs · {marketName}
          </div>
          <h2 className="section__title">Customer Needs Table</h2>
          <p className="section__sub">
            Full detail for every outcome scored in the ODI matrix above.
            Click any row to expand the rationale.
          </p>
          <NeedsList needs={jtbdNeeds} highlightNeed={matrixSelected} />
        </div>
      )}

      {/* ── Section 3: Job Map ── */}
      {jobSteps.length > 0 && (
        <div className="section">
          <div className="section__eyebrow">Job Map · {marketName}</div>
          <h2 className="section__title">Job Map</h2>
          <p className="section__sub">
            The job map breaks the customer's core job into discrete sequential steps.
            Steps highlighted in yellow are directly relevant to the product;
            dimmed steps represent phases where the product has limited or no touchpoint.
          </p>
          <JobMap steps={jobSteps} />
        </div>
      )}

      {/* ── Section 3: Stakeholders ── */}
      {stakeholders.length > 0 && (
        <div className="section">
          <div className="section__eyebrow">Stakeholders · {marketName}</div>
          <h2 className="section__title">Stakeholders</h2>
          <p className="section__sub">
            Key roles involved in purchasing, operating, and maintaining
            solutions in this market — and the JTBD pyramid levels they primarily act on.
          </p>
          <StakeholderMap stakeholders={stakeholders} />
          {jtbdSourceIds.length > 0 && (
            <SourceList sourceIds={jtbdSourceIds} title="Sources — JTBD" />
          )}
        </div>
      )}
    </div>
  );
}
