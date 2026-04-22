/**
 * AdjacencyAnalysis — Page 07 — 3-Track Adjacency Analysis
 *
 * Routes:
 *   /adjacency               → first market by default
 *   /adjacency/:marketSlug   → specific market
 *
 * Layout:
 *   PageHeader
 *   Market selector tabs (all 12 markets)
 *   Current Position card
 *   Three track panels side by side:
 *     Track A: Direct Transfer
 *     Track B: Strategic Expansion
 *     Track C: Vertical Integration
 *   Consolidated Opportunity Map table
 */

import { useParams, useNavigate } from "react-router-dom";
import adjacencyData from "@/data/adjacencyAnalysis.json";

/* =========================================================================
   Types
   ========================================================================= */

interface TrackACandidate {
  unit: string;
  relevance: number;
  verdict: string;
  priority: number;
  coreJob: string;
}

interface TrackBCandidate {
  unit: string;
  relevanceXEase: number;
  verdict: string;
  priority: number;
  coreJob: string;
}

interface TrackC {
  currentLevel: string;
  targetLevel: string;
  currentCoverage: number;
  potentialCoverage: number;
  missing: string;
  investment: string;
  verdict: string;
}

interface ConsolidatedEntry {
  priority: number;
  opportunity: string;
  track: string;
  verdict: string;
  effort: string;
}

interface MarketData {
  slug: string;
  name: string;
  naics: string;
  currentPosition: {
    vnLevel: string;
    vnUnit: string;
    parentL6: string;
    capabilities: string[];
  };
  trackA: { candidates: TrackACandidate[] };
  trackB: { candidates: TrackBCandidate[] };
  trackC: TrackC;
  consolidatedMap: ConsolidatedEntry[];
}

/* =========================================================================
   Badge helpers
   ========================================================================= */

const VERDICT_BADGE: Record<string, string> = {
  STRONG: "badge badge--strong",
  MODERATE: "badge badge--moderate",
  WEAK: "badge badge--weak",
  "NO-GO": "badge badge--weak",
  PURSUE: "badge badge--strong",
  INVESTIGATE: "badge badge--accent",
  DEFER: "badge badge--neutral",
  FEASIBLE: "badge badge--moderate",
  "HIGHLY FEASIBLE": "badge badge--strong",
  VIABLE: "badge badge--moderate",
  "NOT RECOMMENDED": "badge badge--weak",
  "FEASIBLE but capital-intensive": "badge badge--moderate",
  "MODERATE-STRONG": "badge badge--moderate",
};

function VerdictBadge({ verdict }: { verdict: string }) {
  // Normalize to find the best match
  const upper = verdict.toUpperCase();
  let cls = "badge badge--neutral";

  if (upper.includes("STRONG")) cls = "badge badge--strong";
  else if (upper.includes("HIGHLY FEASIBLE")) cls = "badge badge--strong";
  else if (upper.includes("PURSUE")) cls = "badge badge--strong";
  else if (upper.includes("VIABLE")) cls = "badge badge--moderate";
  else if (upper.includes("FEASIBLE") && !upper.includes("NOT")) cls = "badge badge--moderate";
  else if (upper.includes("MODERATE")) cls = "badge badge--moderate";
  else if (upper.includes("INVESTIGATE")) cls = "badge badge--accent";
  else if (upper.includes("DEFER")) cls = "badge badge--neutral";
  else if (upper.includes("WEAK") || upper.includes("NO-GO") || upper.includes("NOT")) cls = "badge badge--weak";

  if (VERDICT_BADGE[verdict]) cls = VERDICT_BADGE[verdict];

  return <span className={cls}>{verdict}</span>;
}

const EFFORT_BADGE: Record<string, string> = {
  LOW: "badge badge--strong",
  "LOW-MEDIUM": "badge badge--moderate",
  MEDIUM: "badge badge--accent",
  "MEDIUM-HIGH": "badge badge--moderate",
  HIGH: "badge badge--weak",
  "VERY HIGH": "badge badge--weak",
};

function EffortBadge({ effort }: { effort: string }) {
  const cls = EFFORT_BADGE[effort.toUpperCase()] ?? "badge badge--neutral";
  return <span className={cls}>{effort}</span>;
}

/* =========================================================================
   Relevance bar
   ========================================================================= */

function RelevanceBar({ value, max = 10 }: { value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  const color = value >= 8 ? "#98ffb8" : value >= 6 ? "#fdff98" : "#ff9898";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          flex: 1,
          height: 6,
          background: "var(--surface-dark)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: 3,
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color,
          minWidth: 28,
          textAlign: "right",
        }}
      >
        {value}/{max}
      </span>
    </div>
  );
}

/* =========================================================================
   Coverage progress bar (Track C)
   ========================================================================= */

function CoverageBar({
  current,
  potential,
}: {
  current: number;
  potential: number;
}) {
  const curPct = Math.round(current * 100);
  const potPct = Math.round(potential * 100);

  return (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          position: "relative",
          height: 20,
          background: "var(--surface-dark)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        {/* Potential (background) */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: `${potPct}%`,
            height: "100%",
            background: "rgba(253,255,152,0.18)",
            transition: "width 0.4s ease",
          }}
        />
        {/* Current (foreground) */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: `${curPct}%`,
            height: "100%",
            background: "#6fd59b",
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 5,
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--text-gray-light)",
        }}
      >
        <span style={{ color: "#6fd59b" }}>Current {curPct}%</span>
        <span style={{ color: "var(--accent-yellow)" }}>Potential {potPct}%</span>
      </div>
    </div>
  );
}

/* =========================================================================
   Track A Panel
   ========================================================================= */

function TrackAPanel({ candidates }: { candidates: TrackACandidate[] }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 0 }}>
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "rgba(110,213,155,0.15)",
              border: "1px solid rgba(110,213,155,0.35)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 700,
              color: "#6fd59b",
            }}
          >
            A
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#6fd59b",
            }}
          >
            Direct Transfer
          </span>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-gray)", lineHeight: 1.5, marginTop: 4 }}>
          Use existing capabilities C1–C9 directly in adjacent VN units — zero new capability investment.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {candidates.map((c) => (
          <div
            key={c.unit}
            style={{
              background: "var(--bg-card-inner)",
              borderRadius: 8,
              padding: "12px 14px",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-gray-dark)",
                    marginBottom: 3,
                  }}
                >
                  #{c.priority}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text-white)",
                    lineHeight: 1.4,
                  }}
                >
                  {c.unit}
                </div>
              </div>
              <VerdictBadge verdict={c.verdict} />
            </div>
            <RelevanceBar value={c.relevance} />
            <p
              style={{
                marginTop: 8,
                fontSize: 11,
                color: "var(--text-gray)",
                lineHeight: 1.5,
                fontStyle: "italic",
              }}
            >
              "{c.coreJob}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   Track B Panel
   ========================================================================= */

function TrackBPanel({ candidates }: { candidates: TrackBCandidate[] }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 0 }}>
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "rgba(253,255,152,0.12)",
              border: "1px solid rgba(253,255,152,0.3)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--accent-yellow)",
            }}
          >
            B
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--accent-yellow)",
            }}
          >
            Strategic Expansion
          </span>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-gray)", lineHeight: 1.5, marginTop: 4 }}>
          Expand capabilities to adjacent units in the same segment — ranked by relevance × ease of entry.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {candidates.map((c) => (
          <div
            key={c.unit}
            style={{
              background: "var(--bg-card-inner)",
              borderRadius: 8,
              padding: "12px 14px",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-gray-dark)",
                    marginBottom: 3,
                  }}
                >
                  #{c.priority}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text-white)",
                    lineHeight: 1.4,
                  }}
                >
                  {c.unit}
                </div>
              </div>
              <VerdictBadge verdict={c.verdict} />
            </div>
            <RelevanceBar value={c.relevanceXEase} />
            <p
              style={{
                marginTop: 8,
                fontSize: 11,
                color: "var(--text-gray)",
                lineHeight: 1.5,
                fontStyle: "italic",
              }}
            >
              "{c.coreJob}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   Track C Panel
   ========================================================================= */

function TrackCPanel({ trackC }: { trackC: TrackC }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 0 }}>
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "rgba(213,169,111,0.15)",
              border: "1px solid rgba(213,169,111,0.35)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 700,
              color: "#d5a96f",
            }}
          >
            C
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#d5a96f",
            }}
          >
            Vertical Integration
          </span>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-gray)", lineHeight: 1.5, marginTop: 4 }}>
          Move up one level in the value network — own the entire segment.
        </p>
      </div>

      {/* Coverage visualization */}
      <div
        style={{
          background: "var(--bg-card-inner)",
          borderRadius: 8,
          padding: "14px 16px",
          border: "1px solid var(--border-subtle)",
          marginBottom: 12,
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-gray)",
            }}
          >
            Coverage Ratio
          </span>
        </div>
        <CoverageBar
          current={trackC.currentCoverage}
          potential={trackC.potentialCoverage}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* From / To */}
        <div
          style={{
            background: "var(--bg-card-inner)",
            borderRadius: 8,
            padding: "12px 14px",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-gray-dark)",
                  marginBottom: 4,
                }}
              >
                Current Level
              </div>
              <div style={{ fontSize: 12, color: "#6fd59b", lineHeight: 1.4 }}>
                {trackC.currentLevel}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-gray-dark)",
                  marginBottom: 4,
                }}
              >
                Target Level
              </div>
              <div style={{ fontSize: 12, color: "var(--accent-yellow)", lineHeight: 1.4 }}>
                {trackC.targetLevel}
              </div>
            </div>
          </div>
        </div>

        {/* Missing capabilities */}
        <div
          style={{
            background: "var(--bg-card-inner)",
            borderRadius: 8,
            padding: "12px 14px",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-gray-dark)",
              marginBottom: 5,
            }}
          >
            Gap
          </div>
          <p style={{ fontSize: 12, color: "var(--text-gray-light)", lineHeight: 1.5 }}>
            {trackC.missing}
          </p>
        </div>

        {/* Investment */}
        <div
          style={{
            background: "var(--bg-card-inner)",
            borderRadius: 8,
            padding: "12px 14px",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-gray-dark)",
              marginBottom: 5,
            }}
          >
            Investment Required
          </div>
          <p style={{ fontSize: 12, color: "var(--text-gray-light)", lineHeight: 1.5 }}>
            {trackC.investment}
          </p>
        </div>

        {/* Verdict */}
        <div
          style={{
            background: "var(--bg-card-inner)",
            borderRadius: 8,
            padding: "12px 14px",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-gray-dark)",
              marginBottom: 8,
            }}
          >
            Verdict
          </div>
          <VerdictBadge verdict={trackC.verdict} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Consolidated Opportunity Map
   ========================================================================= */

function ConsolidatedMap({ entries }: { entries: ConsolidatedEntry[] }) {
  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ marginBottom: 14 }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--text-gray)",
          }}
        >
          Consolidated Opportunity Map
        </span>
        <p style={{ fontSize: 12, color: "var(--text-gray)", marginTop: 4 }}>
          All opportunities ranked across Track A, B, and C by strategic priority.
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                background: "var(--surface-dark)",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              {["#", "Opportunity", "Track", "Verdict", "Effort"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--text-gray)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((row, i) => (
              <tr
                key={row.priority}
                style={{
                  borderBottom:
                    i < entries.length - 1
                      ? "1px solid var(--border-subtle)"
                      : "none",
                  background:
                    i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                }}
              >
                <td
                  style={{
                    padding: "10px 14px",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--accent-yellow)",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  {row.priority}
                </td>
                <td
                  style={{
                    padding: "10px 14px",
                    fontSize: 13,
                    color: "var(--text-white)",
                    lineHeight: 1.4,
                  }}
                >
                  {row.opportunity}
                </td>
                <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--text-gray-light)",
                      background: "var(--surface-dark)",
                      padding: "2px 7px",
                      borderRadius: 4,
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {row.track}
                  </span>
                </td>
                <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                  <VerdictBadge verdict={row.verdict} />
                </td>
                <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                  <EffortBadge effort={row.effort} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================================
   Current Position Card
   ========================================================================= */

function CurrentPositionCard({ market }: { market: MarketData }) {
  const pos = market.currentPosition;
  return (
    <div
      className="card"
      style={{
        marginBottom: 28,
        background:
          "linear-gradient(135deg, rgba(31,35,41,1) 0%, rgba(27,30,35,1) 100%)",
        borderColor: "rgba(253,255,152,0.12)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--accent-yellow)",
          }}
        >
          ZOLLERN's Current Position
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-gray-dark)",
            background: "var(--surface-dark)",
            padding: "2px 8px",
            borderRadius: 4,
            border: "1px solid var(--border-subtle)",
          }}
        >
          NAICS {market.naics}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-gray-dark)",
              marginBottom: 5,
            }}
          >
            VN Level
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "#6fd59b",
              fontWeight: 600,
            }}
          >
            {pos.vnLevel}
          </div>
        </div>

        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-gray-dark)",
              marginBottom: 5,
            }}
          >
            VN Unit
          </div>
          <div style={{ fontSize: 13, color: "var(--text-white)", fontWeight: 500, lineHeight: 1.4 }}>
            {pos.vnUnit}
          </div>
        </div>

        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-gray-dark)",
              marginBottom: 5,
            }}
          >
            Parent Unit
          </div>
          <div style={{ fontSize: 12, color: "var(--text-gray-light)", lineHeight: 1.4 }}>
            {pos.parentL6}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border-subtle)" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--text-gray-dark)",
            marginBottom: 7,
          }}
        >
          Capabilities Deployed
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {pos.capabilities.map((cap) => (
            <span
              key={cap}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--accent-yellow)",
                background: "rgba(253,255,152,0.08)",
                padding: "3px 9px",
                borderRadius: 5,
                border: "1px solid rgba(253,255,152,0.2)",
                fontWeight: 600,
              }}
            >
              {cap}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Market selector tabs
   ========================================================================= */

function MarketTabs({
  markets,
  activeSlug,
  onSelect,
}: {
  markets: MarketData[];
  activeSlug: string;
  onSelect: (slug: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        marginBottom: 28,
        padding: "14px 16px",
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 10,
      }}
    >
      {markets.map((m) => {
        const isActive = m.slug === activeSlug;
        return (
          <button
            key={m.slug}
            onClick={() => onSelect(m.slug)}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: isActive ? 600 : 400,
              padding: "6px 12px",
              borderRadius: 6,
              border: isActive
                ? "1px solid rgba(253,255,152,0.4)"
                : "1px solid var(--border-subtle)",
              background: isActive
                ? "rgba(253,255,152,0.1)"
                : "var(--surface-dark)",
              color: isActive ? "var(--accent-yellow)" : "var(--text-gray-light)",
              cursor: "pointer",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = "var(--text-white)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = "var(--text-gray-light)";
                e.currentTarget.style.borderColor = "var(--border-subtle)";
              }
            }}
          >
            {m.name}
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================================
   Main page
   ========================================================================= */

const markets = adjacencyData.markets as MarketData[];

export default function AdjacencyAnalysis() {
  const { marketSlug } = useParams<{ marketSlug: string }>();
  const navigate = useNavigate();

  // Default to first market if no slug
  const activeSlug = marketSlug || markets[0]?.slug || "";
  const market = markets.find((m) => m.slug === activeSlug) ?? markets[0];

  function handleSelect(slug: string) {
    navigate(`/adjacency/${slug}`);
  }

  if (!market) {
    return (
      <div style={{ padding: 48, color: "var(--text-gray)" }}>
        Adjacency data not available.
      </div>
    );
  }

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div
        style={{
          padding: "40px 48px 24px",
          borderBottom: "1px solid var(--border-subtle)",
          marginBottom: 32,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--text-gray)",
            marginBottom: 10,
          }}
        >
          Step 03 / 3-Track Adjacency Framework / Capability-Market Expansion
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 500,
            color: "var(--text-white)",
            letterSpacing: "-0.02em",
            marginBottom: 10,
            lineHeight: 1.2,
          }}
        >
          3-Track Adjacency Analysis
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-gray-light)",
            maxWidth: 720,
            lineHeight: 1.6,
          }}
        >
          For each target market, ZOLLERN's capabilities are evaluated across three
          expansion tracks: Track A (direct capability transfer at zero adaptation cost),
          Track B (strategic expansion into adjacent units), and Track C (vertical
          integration up the value network). Each track surfaces ranked opportunities with
          verdicts grounded in the VN, BOM, and JTBD analyses.
        </p>
      </div>

      <div style={{ padding: "0 48px 60px" }}>
        {/* ── Market selector ─────────────────────────────────────── */}
        <MarketTabs
          markets={markets}
          activeSlug={activeSlug}
          onSelect={handleSelect}
        />

        {/* ── Market title ────────────────────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 500,
              color: "var(--text-white)",
              letterSpacing: "-0.01em",
            }}
          >
            {market.name}
          </h2>
        </div>

        {/* ── Current Position ────────────────────────────────────── */}
        <CurrentPositionCard market={market} />

        {/* ── Three Track Panels ──────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            marginBottom: 0,
            alignItems: "start",
          }}
        >
          <TrackAPanel candidates={market.trackA.candidates} />
          <TrackBPanel candidates={market.trackB.candidates} />
          <TrackCPanel trackC={market.trackC} />
        </div>

        {/* ── Consolidated Opportunity Map ────────────────────────── */}
        <ConsolidatedMap entries={market.consolidatedMap} />
      </div>
    </>
  );
}
