/**
 * CompatibilityTab — constraint x market compatibility analysis.
 *
 * Layout:
 *  1. Executive summary (dynamic from data)
 *  2. Compatibility summary bar (knockout / mitigable / no-impact counts)
 *  3. Per-constraint detail cards (sorted: knockouts first, then mitigable, then no-impact)
 *  4. Chapter source list (when sources exist)
 *
 * Zero hardcoded text — all content from compatibility.json per market.
 * Handles uppercase verdict strings from data (NONE, MITIGABLE, KNOCKOUT).
 */

import { getMarket } from "@/data";
import type { CompatAssessment } from "@/types";

import ExecutiveSummary from "@/components/ExecutiveSummary";
import SourceFootnote from "@/components/SourceFootnote";
import SourceList from "@/components/SourceList";
import SectionAnchor from "@/components/SectionAnchor";
import ClickableCode from "@/components/ClickableCode";

import CompatSummaryBar from "./compat/CompatSummaryBar";
import CompatAssessmentCard from "./compat/CompatAssessmentCard";
import { sortByVerdict, normalizeVerdictValue } from "./compat/verdictConfig";

/* ─── Source ID builder ────────────────────────────────────────────────────── */

function buildSourceIds(
  sources: Array<{ id: string; prefixedId?: string }>
): string[] {
  if (!sources || sources.length === 0) return [];
  return sources.map((s) => s.prefixedId ?? s.id).filter(Boolean);
}

/* ─── Main component ───────────────────────────────────────────────────────── */

export default function CompatibilityTab({ marketSlug }: { marketSlug: string }) {
  let data: any = {};
  try {
    data = getMarket(marketSlug).compatibility;
  } catch {
    /* market not found — render empty state */
  }

  const {
    assessments = [],
    result,
    sources = [],
    marketName,
    naicsCode,
  } = data;

  // Section source IDs
  const sectionSourceIds = buildSourceIds(sources);
  const assessmentSourceIds =
    sectionSourceIds.length > 0 ? sectionSourceIds : [];

  // Sort assessments: knockouts first, then mitigable, then no-impact
  const sorted = sortByVerdict(assessments as CompatAssessment[]);

  const knockouts = sorted.filter(
    (a) => normalizeVerdictValue(a.verdict) === "knockout"
  );
  const mitigable = sorted.filter(
    (a) => normalizeVerdictValue(a.verdict) === "mitigable"
  );
  const noImpact = sorted.filter(
    (a) => normalizeVerdictValue(a.verdict) === "none"
  );

  const hasAssessments = assessments.length > 0;
  const hasResult = !!result;

  // Running index across all cards (1-based)
  let cardIndex = 0;

  // Derive display name
  const displayName = marketName || marketSlug;

  return (
    <div className="section">
      {/* Eyebrow */}
      <div className="section__eyebrow">
        Step 08 {"\u00B7"} Constraint Compatibility {"\u00B7"} {displayName}
      </div>

      {/* Title */}
      <h2 className="section__title">Compatibility Analysis</h2>

      {/* Executive summary */}
      <ExecutiveSummary kicker="Compatibility / Executive Summary">
        <p className="answer">
          This tab tests every constraint against the operating conditions of{" "}
          <strong>{displayName}</strong>
          {naicsCode && (
            <>
              {" "}(<ClickableCode kind="naics" code={naicsCode} />)
            </>
          )}
          . For each constraint the question is: does this market's typical operating
          environment exceed the product capability limit, and if so, can it be mitigated?
          {sectionSourceIds.length > 0 && (
            <SourceFootnote sourceIds={sectionSourceIds.slice(0, 2)} />
          )}
        </p>
        <p className="answer">
          <strong>Knockout</strong> constraints are absolute blockers that eliminate the market.{" "}
          <strong>Mitigable</strong> constraints require installation discipline, design adaptation,
          or commercial solutions. <strong>No-impact</strong> constraints are fully satisfied.
          Any knockout eliminates the market before investment; mitigable constraints add
          cost-to-enter that flows into the composite ranking score.
        </p>
        {hasResult && (
          <p className="answer">
            <strong>Verdict for {displayName}:</strong>{" "}
            {result.marketStatus
              ? result.marketStatus
              : (result.knockouts ?? 0) === 0
              ? "Surviving"
              : "Eliminated"}
            .
            {(result.knockouts ?? 0) === 0 && (result.mitigable ?? 0) === 0
              ? " All constraints are satisfied with no mitigation required."
              : (result.knockouts ?? 0) === 0
              ? ` ${result.mitigable ?? 0} constraint${(result.mitigable ?? 0) !== 1 ? "s" : ""} require targeted mitigation.`
              : ` ${result.knockouts ?? 0} knockout${(result.knockouts ?? 0) !== 1 ? "s" : ""} detected \u2014 market is eliminated.`}
          </p>
        )}
      </ExecutiveSummary>

      {/* ── Summary bar ───────────────────────────────────────────────────── */}
      {hasResult && <CompatSummaryBar result={result} />}

      {/* ── No-data state ────────────────────────────────────────────────── */}
      {!hasAssessments && (
        <p style={{ color: "var(--text-gray)", fontStyle: "italic", fontSize: 13 }}>
          Data pending &mdash; compatibility assessments for {displayName} have not yet been generated.
        </p>
      )}

      {/* ── Detail cards by verdict group ────────────────────────────────── */}
      {hasAssessments && (
        <div>
          {/* Knockouts */}
          {knockouts.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <SectionAnchor id={`compat-knockouts-${marketSlug}`}>
                <h3
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--status-low)",
                    marginBottom: 12,
                    marginTop: 28,
                  }}
                >
                  Knockout Constraints ({knockouts.length})
                </h3>
              </SectionAnchor>
              {knockouts.map((a) => {
                cardIndex++;
                return (
                  <CompatAssessmentCard
                    key={a.constraintName}
                    assessment={a}
                    index={cardIndex}
                    sourceIds={assessmentSourceIds}
                  />
                );
              })}
            </div>
          )}

          {/* Mitigable */}
          {mitigable.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <SectionAnchor id={`compat-mitigable-${marketSlug}`}>
                <h3
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--status-medium)",
                    marginBottom: 12,
                    marginTop: 28,
                  }}
                >
                  Mitigable Constraints ({mitigable.length})
                </h3>
              </SectionAnchor>
              {mitigable.map((a) => {
                cardIndex++;
                return (
                  <CompatAssessmentCard
                    key={a.constraintName}
                    assessment={a}
                    index={cardIndex}
                    sourceIds={assessmentSourceIds}
                  />
                );
              })}
            </div>
          )}

          {/* No-impact */}
          {noImpact.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <SectionAnchor id={`compat-none-${marketSlug}`}>
                <h3
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--status-high)",
                    marginBottom: 12,
                    marginTop: 28,
                  }}
                >
                  No-Impact Constraints ({noImpact.length})
                </h3>
              </SectionAnchor>
              {noImpact.map((a) => {
                cardIndex++;
                return (
                  <CompatAssessmentCard
                    key={a.constraintName}
                    assessment={a}
                    index={cardIndex}
                    sourceIds={assessmentSourceIds}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Source list */}
      {sectionSourceIds.length > 0 && (
        <SourceList
          sourceIds={sectionSourceIds}
          title={`Sources \u2014 Compatibility \u00B7 ${displayName}`}
        />
      )}
    </div>
  );
}
