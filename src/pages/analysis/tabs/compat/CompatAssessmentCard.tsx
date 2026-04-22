/**
 * CompatAssessmentCard — one constraint x market compatibility row card.
 *
 * Fully data-driven: constraint title, verdict badge (color-coded),
 * rationale text, mitigation details (when mitigable), cost/time metadata.
 * Handles both uppercase (JSON) and lowercase verdict strings.
 */

import type { CompatAssessment } from "@/types";
import SourceFootnote from "@/components/SourceFootnote";
import { getVerdictConfig, normalizeVerdictValue } from "./verdictConfig";

interface CompatAssessmentCardProps {
  assessment: CompatAssessment;
  index: number;
  /** Source IDs to attach to this card */
  sourceIds: string[];
}

const TYPE_CLASS: Record<string, string> = {
  physical: "badge badge--accent",
  chemical: "badge badge--moderate",
  operational: "badge badge--neutral",
  economic: "badge badge--strong",
  regulatory: "badge badge--weak",
  environmental: "badge badge--moderate",
};

export default function CompatAssessmentCard({
  assessment,
  index,
  sourceIds,
}: CompatAssessmentCardProps) {
  const normalizedVerdict = normalizeVerdictValue(assessment.verdict);
  const vc = getVerdictConfig(assessment.verdict);
  const hasType = !!assessment.constraintType;
  const hasMitigation =
    normalizedVerdict === "mitigable" && !!assessment.mitigation;

  return (
    <div
      className="card"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 10,
        padding: "20px 24px",
        marginBottom: 16,
      }}
    >
      {/* Header row: index, title, verdict badge */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-gray-dark)",
            marginTop: 4,
            flexShrink: 0,
            width: 22,
          }}
        >
          C{index}
        </span>

        <h3
          style={{
            flex: 1,
            fontSize: "1.05rem",
            fontWeight: 700,
            color: "var(--text-white)",
            letterSpacing: "-0.01em",
            lineHeight: 1.3,
            margin: 0,
          }}
        >
          {assessment.constraintName}
          {sourceIds.length > 0 && <SourceFootnote sourceIds={sourceIds} />}
        </h3>

        {/* Verdict badge */}
        <span className={vc.badgeClass} style={{ flexShrink: 0 }}>
          {vc.label}
        </span>
      </div>

      {/* Meta row: type badge */}
      {hasType && (
        <div style={{ marginBottom: 10, marginLeft: 34 }}>
          <span
            className={TYPE_CLASS[assessment.constraintType] ?? "badge badge--neutral"}
          >
            {assessment.constraintType}
          </span>
        </div>
      )}

      {/* Threshold — show if present */}
      {assessment.threshold && (
        <div style={{ marginLeft: 34, marginBottom: 8 }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--text-gray)",
            }}
          >
            Threshold: {assessment.threshold}
          </span>
        </div>
      )}

      {/* Rationale */}
      {assessment.rationale && (
        <div style={{ marginLeft: 34 }}>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-gray-light)",
              lineHeight: 1.6,
              marginBottom: hasMitigation ? 12 : 0,
            }}
          >
            {assessment.rationale}
          </p>
        </div>
      )}

      {/* Mitigation block — only for mitigable */}
      {hasMitigation && (
        <div
          style={{
            marginLeft: 34,
            background: "rgba(253,255,152,0.04)",
            border: "1px solid rgba(253,255,152,0.18)",
            borderRadius: 8,
            padding: "12px 16px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--accent-yellow)",
              display: "block",
              marginBottom: 6,
            }}
          >
            Mitigation
          </span>
          <ul
            style={{
              margin: 0,
              paddingLeft: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {assessment.mitigation.split(/[;,](?=\s)/).map((step, i) => {
              const trimmed = step.trim();
              if (!trimmed) return null;
              return (
                <li
                  key={i}
                  style={{ fontSize: 12.5, color: "var(--text-white)", lineHeight: 1.55 }}
                >
                  {trimmed}
                </li>
              );
            })}
          </ul>
          {(assessment.mitigationCost || assessment.mitigationTime) && (
            <div
              style={{
                display: "flex",
                gap: 20,
                marginTop: 10,
                paddingTop: 10,
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {assessment.mitigationCost && (
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-gray)" }}>
                  Cost: {assessment.mitigationCost}
                </span>
              )}
              {assessment.mitigationTime && (
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-gray)" }}>
                  Time: {assessment.mitigationTime}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
