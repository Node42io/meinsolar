/**
 * Page: /capabilities
 * 02b Capability Register — 9 capabilities derived from ZOLLERN's functional promise.
 * Shows capability cards (C1–C9), interaction combinations, and Track A/B/C adjacency targets.
 * Data: src/data/capabilityRegister.json
 */

import dataRaw from "@/data/capabilityRegister.json";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface Capability {
  id: string;
  name: string;
  type: "core" | "supporting";
  description: string;
  fpLinkage: string;
  constraints: string[];
}

interface Combination {
  ids: string[];
  name: string;
  targetApplications: string;
  distinctContributions: Record<string, string>;
  compoundDescription: string;
}

interface TrackATarget {
  capabilityIds: string[];
  description: string;
  examples: string;
}

interface TrackBTarget {
  existingCapabilityIds: string[];
  additionalCapabilityNeeded: string;
  adjacentUnits: string;
}

interface TrackCTarget {
  currentLevel: string;
  oneLevelUp: string;
  coverageQuestion: string;
}

interface CapabilityRegisterData {
  capabilities: Capability[];
  combinations: Combination[];
  trackATargets: TrackATarget[];
  trackBTargets: TrackBTarget[];
  trackCTargets: TrackCTarget[];
}

const data = dataRaw as unknown as CapabilityRegisterData;

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function IdBadge({ id }: { id: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 36,
        height: 24,
        padding: "0 8px",
        background: "var(--surface-dark)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 4,
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        fontWeight: 700,
        color: "var(--accent-yellow)",
        letterSpacing: "0.04em",
        flexShrink: 0,
      }}
    >
      {id}
    </span>
  );
}

function TypeBadge({ type }: { type: "core" | "supporting" }) {
  const isCore = type === "core";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 20,
        padding: "0 7px",
        borderRadius: 3,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        background: isCore ? "rgba(240, 232, 120, 0.12)" : "rgba(160, 165, 175, 0.12)",
        color: isCore ? "var(--accent-yellow-dark)" : "var(--surface-secondary)",
        border: `1px solid ${isCore ? "rgba(240, 232, 120, 0.25)" : "rgba(160, 165, 175, 0.2)"}`,
      }}
    >
      {isCore ? "Core" : "Supporting"}
    </span>
  );
}

function IdPillGroup({ ids }: { ids: string[] }) {
  return (
    <span style={{ display: "inline-flex", gap: 4, flexWrap: "wrap" }}>
      {ids.map((id) => (
        <span
          key={id}
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: 20,
            padding: "0 6px",
            background: "rgba(240, 232, 120, 0.1)",
            border: "1px solid rgba(240, 232, 120, 0.2)",
            borderRadius: 3,
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fontWeight: 700,
            color: "var(--accent-yellow)",
          }}
        >
          {id}
        </span>
      ))}
    </span>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */

export default function CapabilityRegister() {
  const capabilities = data.capabilities;
  const combinations = data.combinations;
  const trackA = data.trackATargets;
  const trackB = data.trackBTargets;
  const trackC = data.trackCTargets;

  const coreCount = capabilities.filter((c) => c.type === "core").length;
  const supportingCount = capabilities.filter((c) => c.type === "supporting").length;

  return (
    <section id="section-02b" className="container">
      {/* Section meta breadcrumb */}
      <div className="section-meta">
        <span>Step 02b</span>
        <span className="sep">/</span>
        <span>Capability Register</span>
        <span className="sep">/</span>
        <span>Capability Market Expansion</span>
      </div>

      <div className="md">
        <h1 className="section-title">02b Capability Register</h1>

        {/* ── Executive Summary ── */}
        <div className="answer-box" id="cap-summary">
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-gray)",
              marginBottom: 8,
            }}
          >
            02b / Executive Summary
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-white)",
              marginBottom: 10,
            }}
          >
            What you are reading
          </div>
          <p className="answer">
            This chapter maps the {capabilities.length} capabilities derived from ZOLLERN's
            functional promise — {coreCount} core (differentiating) + {supportingCount} supporting
            (table stakes). Capabilities are decomposed from what ZOLLERN must be able to{" "}
            <em>do</em> in order to deliver the promise: "Provide custom cross-sectional metal
            shapes with tight dimensional tolerances and selectable surface hardness in near-net-shape
            geometry that eliminates 40–80% of downstream machining waste." These capabilities —
            individually and in combination — define which adjacency targets are reachable under
            Track A (direct transfer), Track B (strategic expansion), and Track C (vertical
            integration).
          </p>
        </div>

        <blockquote>
          <p><strong>Component:</strong> Capability Register (Step GQ2)</p>
          <p><strong>Upstream:</strong> 01 Product Decomposition, 02 Functional Promise, 00 Product Portfolio</p>
          <p><strong>Guiding Question:</strong> What specific capabilities can be derived from ZOLLERN's functional promise?</p>
        </blockquote>

        <hr />

        {/* ── Derivation Logic ── */}
        <h2 id="cap-derivation">Derivation Logic</h2>
        <p>
          The functional promise is:{" "}
          <strong>
            "Provide custom cross-sectional metal shapes with tight dimensional tolerances and
            selectable surface hardness — in near-net-shape geometry that eliminates 40–80% of
            downstream machining waste."
          </strong>
        </p>
        <p>
          Capabilities are derived by decomposing what ZOLLERN must be able to <em>do</em> in order
          to deliver this promise. Each capability is classified as{" "}
          <strong style={{ color: "var(--accent-yellow-dark)" }}>core</strong> (differentiating —
          creates competitive advantage) or{" "}
          <strong style={{ color: "var(--surface-secondary)" }}>supporting</strong> (table stakes —
          necessary but not differentiating).
        </p>

        <hr />

        {/* ── Capability Cards ── */}
        <h2 id="cap-cards">Capability Register</h2>
        <p>
          {coreCount} core capabilities + {supportingCount} supporting capabilities — {capabilities.length} total.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))",
            gap: 16,
            marginTop: 24,
          }}
        >
          {capabilities.map((cap) => (
            <div
              key={cap.id}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <IdBadge id={cap.id} />
                <TypeBadge type={cap.type} />
              </div>

              {/* Capability name */}
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-white)",
                  lineHeight: 1.4,
                }}
              >
                {cap.name}
              </div>

              {/* Description */}
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-gray-light)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {cap.description}
              </p>

              {/* FP Linkage */}
              <div
                style={{
                  padding: "10px 12px",
                  background: "var(--bg-card-inner)",
                  borderRadius: 5,
                  borderLeft: "2px solid var(--accent-yellow-dark)",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--text-gray)",
                    marginBottom: 4,
                  }}
                >
                  FP Linkage
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-gray-light)",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {cap.fpLinkage}
                </p>
              </div>

              {/* Constraints */}
              <div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--text-gray)",
                    marginBottom: 6,
                  }}
                >
                  Constraints
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 0,
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  {cap.constraints.map((c, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 6,
                        fontSize: 12,
                        color: "var(--text-gray-light)",
                        lineHeight: 1.45,
                      }}
                    >
                      <span
                        style={{
                          color: "var(--status-low)",
                          fontSize: 10,
                          marginTop: 2,
                          flexShrink: 0,
                        }}
                      >
                        ▸
                      </span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <hr />

        {/* ── Capability Combinations ── */}
        <h2 id="cap-combinations">Capability Interaction Map</h2>
        <p>
          Capabilities combine to create compound value propositions. The table below shows which
          capabilities combine, what compound capability they create, where it matters, and what
          each individual capability specifically contributes.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 16 }}>
          {combinations.map((combo, i) => (
            <div
              key={i}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              {/* Combination header */}
              <div
                style={{
                  padding: "14px 20px",
                  background: "var(--bg-card-inner)",
                  borderBottom: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <IdPillGroup ids={combo.ids} />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-white)",
                  }}
                >
                  {combo.name}
                </span>
              </div>

              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Compound description */}
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--text-gray)",
                      marginBottom: 6,
                    }}
                  >
                    Compound Capability
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-gray-light)",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {combo.compoundDescription}
                  </p>
                </div>

                {/* Distinct contributions */}
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--text-gray)",
                      marginBottom: 8,
                    }}
                  >
                    Distinct Contribution per Capability
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {combo.ids.map((id) => (
                      <div
                        key={id}
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "flex-start",
                        }}
                      >
                        <IdBadge id={id} />
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--text-gray-light)",
                            lineHeight: 1.5,
                            paddingTop: 3,
                          }}
                        >
                          {combo.distinctContributions[id]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Target applications */}
                <div
                  style={{
                    padding: "10px 12px",
                    background: "var(--bg-card-inner)",
                    borderRadius: 5,
                    borderLeft: "2px solid rgba(111, 213, 155, 0.4)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--text-gray)",
                      marginBottom: 4,
                    }}
                  >
                    Target Applications
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-gray-light)",
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {combo.targetApplications}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <hr />

        {/* ── Track A/B/C Target Summary ── */}
        <h2 id="cap-tracks">Capability Relevance for Adjacency Search</h2>
        <p>
          Each capability enables specific VN/BOM unit types. This mapping drives the three
          adjacency search tracks.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 20,
            marginTop: 24,
          }}
        >
          {/* Track A */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 18px",
                background: "rgba(111, 213, 155, 0.08)",
                borderBottom: "1px solid rgba(111, 213, 155, 0.15)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--status-high)",
                  marginBottom: 3,
                }}
              >
                Track A
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-white)" }}>
                Direct Transfer
              </div>
              <div style={{ fontSize: 11, color: "var(--text-gray)", marginTop: 2 }}>
                Use capability as-is
              </div>
            </div>
            <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
              {trackA.map((t, i) => (
                <div key={i}>
                  <div style={{ marginBottom: 5 }}>
                    <IdPillGroup ids={t.capabilityIds} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-white)", marginBottom: 3 }}>
                    {t.description}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-gray-light)", lineHeight: 1.5 }}>
                    {t.examples}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Track B */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 18px",
                background: "rgba(213, 169, 111, 0.08)",
                borderBottom: "1px solid rgba(213, 169, 111, 0.15)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--status-medium)",
                  marginBottom: 3,
                }}
              >
                Track B
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-white)" }}>
                Strategic Expansion
              </div>
              <div style={{ fontSize: 11, color: "var(--text-gray)", marginTop: 2 }}>
                Existing capability + additional capability required
              </div>
            </div>
            <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
              {trackB.map((t, i) => (
                <div key={i}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 5 }}>
                    <IdPillGroup ids={t.existingCapabilityIds} />
                    <span style={{ fontSize: 10, color: "var(--text-gray)" }}>+</span>
                    <span
                      style={{
                        fontSize: 10,
                        color: "var(--status-medium)",
                        fontStyle: "italic",
                        lineHeight: 1.4,
                      }}
                    >
                      {t.additionalCapabilityNeeded}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-gray-light)", lineHeight: 1.5 }}>
                    {t.adjacentUnits}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Track C */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 18px",
                background: "rgba(213, 111, 111, 0.08)",
                borderBottom: "1px solid rgba(213, 111, 111, 0.15)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--status-low)",
                  marginBottom: 3,
                }}
              >
                Track C
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-white)" }}>
                Vertical Integration
              </div>
              <div style={{ fontSize: 11, color: "var(--text-gray)", marginTop: 2 }}>
                Move up one BOM level
              </div>
            </div>
            <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
              {trackC.map((t, i) => (
                <div
                  key={i}
                  style={{
                    paddingBottom: i < trackC.length - 1 ? 16 : 0,
                    borderBottom: i < trackC.length - 1 ? "1px solid var(--divider)" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-gray-light)",
                        background: "var(--surface-dark)",
                        padding: "2px 6px",
                        borderRadius: 3,
                      }}
                    >
                      {t.currentLevel}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--text-gray)" }}>→</span>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "var(--font-mono)",
                        color: "var(--status-low)",
                        background: "rgba(213, 111, 111, 0.1)",
                        padding: "2px 6px",
                        borderRadius: 3,
                      }}
                    >
                      {t.oneLevelUp}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-gray-light)", lineHeight: 1.5, margin: 0 }}>
                    {t.coverageQuestion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <hr />

        {/* ── Quick Reference Table ── */}
        <h2 id="cap-reference">Quick Reference</h2>
        <p>All {capabilities.length} capabilities at a glance.</p>

        <div style={{ overflowX: "auto", marginTop: 16 }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: "6%" }}>ID</th>
                <th style={{ width: "10%" }}>Type</th>
                <th style={{ width: "30%" }}>Capability</th>
                <th>FP Linkage</th>
                <th style={{ width: "22%" }}>Key Constraint</th>
              </tr>
            </thead>
            <tbody>
              {capabilities.map((cap) => (
                <tr key={cap.id}>
                  <td>
                    <IdBadge id={cap.id} />
                  </td>
                  <td>
                    <TypeBadge type={cap.type} />
                  </td>
                  <td style={{ fontWeight: 600, color: "var(--text-white)" }}>
                    {cap.name}
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text-gray-light)" }}>
                    {cap.fpLinkage}
                  </td>
                  <td style={{ fontSize: 11, color: "var(--text-gray)" }}>
                    {cap.constraints[0]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
