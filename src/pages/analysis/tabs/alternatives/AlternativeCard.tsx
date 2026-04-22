/**
 * AlternativeCard — renders one entry from alternatives.json.
 *
 * Data shape (Mein Solar alternatives):
 *   { name: string, unspsc: string, tradeoffs: string, category?: string, existential?: boolean }
 *
 * Tradeoffs may be:
 *   - Semicolon-separated: "trade-off A; trade-off B"
 *   - Comma-separated: "trade-off A, trade-off B"
 *   - Python array string: "['trade-off A', 'trade-off B']"
 *   - Plain string
 */

import ClickableCode from "@/components/ClickableCode";

interface Alternative {
  name: string;
  unspsc: string;
  tradeoffs: string;
  category?: string;
  existential?: boolean;
}

interface AlternativeCardProps {
  alternative: Alternative;
  rank: number;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

/**
 * Extract a trailing [SRC: ...] suffix from the tradeoffs string.
 * Returns { clean: string without suffix, sources: string[] }.
 */
function extractSources(tradeoffs: string): {
  clean: string;
  sources: string[];
} {
  const srcMatch = tradeoffs.match(/\s*\[SRC:\s*([^\]]+)\]\s*$/);
  if (!srcMatch) return { clean: tradeoffs.trim(), sources: [] };
  const clean = tradeoffs.slice(0, srcMatch.index).trim();
  const sources = srcMatch[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return { clean, sources };
}

/**
 * Parse tradeoffs text into bullet points.
 * Handles Python array strings, semicolons, and comma-separated values.
 */
function parseTradeoffs(text: string): string[] {
  if (!text) return [];
  const trimmed = text.trim();

  // Python-style array: ['a', 'b', 'c']
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed.replace(/'/g, '"'));
      if (Array.isArray(parsed)) return parsed.map((s: string) => s.trim()).filter(Boolean);
    } catch { /* fall through to string splitting */ }
    // Manual parse for Python arrays that JSON.parse can't handle
    const inner = trimmed.slice(1, -1);
    const items = inner.split(/'\s*,\s*'/).map(s => s.replace(/^'|'$/g, "").trim()).filter(Boolean);
    if (items.length > 1) return items;
  }

  // Semicolon-separated
  if (trimmed.includes(";")) {
    return trimmed.split(";").map(s => s.trim()).filter(Boolean);
  }

  // Comma-separated (only if there are multiple distinct clauses)
  if (trimmed.includes(",") && trimmed.split(",").length >= 2) {
    return trimmed.split(",").map(s => s.trim()).filter(Boolean);
  }

  return trimmed ? [trimmed] : [];
}

/**
 * Highlight $X-$Y price ranges and X% percentages inside a string.
 */
function HighlightedText({ text }: { text: string }) {
  const parts = text.split(/([\$\u20AC\u00A3][\d,]+(?:[\u2013\-][\$\u20AC\u00A3]?[\d,]+)?(?:\s*[A-Za-z/]+)?|\d+(?:\.\d+)?%)/g);
  return (
    <>
      {parts.map((part, i) => {
        const isHighlight =
          /^[\$\u20AC\u00A3]/.test(part) || /^\d+(?:\.\d+)?%$/.test(part);
        return isHighlight ? (
          <span
            key={i}
            style={{
              color: "var(--accent-yellow)",
              fontWeight: 600,
            }}
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
}

/**
 * Parse **Bold** markdown name pattern.
 */
function parseName(name: string): string {
  const m = name.match(/^\*\*(.+?)\*\*/);
  return m ? m[1] : name;
}

/* ─── Badge helpers ──────────────────────────────────────────────────────── */

function CategoryBadge({ category }: { category?: string }) {
  if (!category) return null;
  const label = category.replace(/_/g, " ");
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        background: "rgba(255,255,255,0.06)",
        color: "var(--text-gray-light)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 4,
        padding: "1px 7px",
        marginLeft: 8,
        verticalAlign: "middle",
      }}
    >
      {label}
    </span>
  );
}

function ExistentialBadge({ existential }: { existential?: boolean }) {
  if (!existential) return null;
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        background: "rgba(239,68,68,0.10)",
        color: "var(--status-low)",
        border: "1px solid rgba(239,68,68,0.25)",
        borderRadius: 4,
        padding: "1px 7px",
        marginLeft: 8,
        verticalAlign: "middle",
      }}
    >
      existential
    </span>
  );
}

function StatusBadge({ name }: { name: string }) {
  if (name.toLowerCase().includes("status quo") || name.toLowerCase().includes("do nothing") || name.toLowerCase().includes("defer")) {
    return (
      <span
        style={{
          display: "inline-block",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          background: "rgba(255,255,255,0.06)",
          color: "var(--text-gray-light)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 4,
          padding: "1px 7px",
          marginLeft: 8,
          verticalAlign: "middle",
        }}
      >
        Status Quo
      </span>
    );
  }
  return null;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function AlternativeCard({
  alternative,
  rank,
}: AlternativeCardProps) {
  const displayName = parseName(alternative.name);

  // Strip [Status Quo] / trailing qualifiers from display name
  const cleanDisplayName = displayName
    .replace(/\s*\[Status Quo\]\s*/gi, "")
    .trim();

  const hasUnspsc =
    alternative.unspsc &&
    alternative.unspsc !== "\u2014" &&
    alternative.unspsc.trim() !== "" &&
    !alternative.unspsc.startsWith("custom:");

  const customUnspsc =
    alternative.unspsc && alternative.unspsc.startsWith("custom:")
      ? alternative.unspsc.replace("custom:", "")
      : null;

  const { clean: tradeoffsClean, sources } = extractSources(
    alternative.tradeoffs ?? ""
  );
  const bullets = parseTradeoffs(tradeoffsClean);
  const hasTradeoffs = bullets.length > 0;

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 10,
        padding: "20px 24px",
        marginBottom: 20,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          marginBottom: hasTradeoffs ? 16 : 0,
        }}
      >
        {/* Rank number */}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-gray-dark)",
            marginTop: 5,
            flexShrink: 0,
            width: 22,
          }}
        >
          A{rank}
        </span>

        <div style={{ flex: 1 }}>
          {/* Technology name + badges */}
          <h3
            style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "var(--text-white)",
              letterSpacing: "-0.01em",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {cleanDisplayName}
            <StatusBadge name={alternative.name} />
            <ExistentialBadge existential={alternative.existential} />
          </h3>

          {/* UNSPSC code */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            {hasUnspsc && (
              <ClickableCode kind="unspsc" code={alternative.unspsc} />
            )}
            {customUnspsc && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-gray-dark)",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 3,
                  padding: "1px 6px",
                }}
              >
                {customUnspsc}
              </span>
            )}
            {alternative.category && (
              <CategoryBadge category={alternative.category} />
            )}
          </div>
        </div>
      </div>

      {/* Tradeoffs body */}
      {hasTradeoffs && (
        <div style={{ marginLeft: 32 }}>
          <ul
            style={{
              margin: 0,
              paddingLeft: "1.25rem",
              marginBottom: sources.length > 0 ? 10 : 0,
            }}
          >
            {bullets.map((bullet, i) => (
              <li
                key={i}
                style={{
                  fontSize: 13,
                  color: "var(--text-gray-light)",
                  lineHeight: 1.6,
                  marginBottom: 3,
                }}
              >
                <HighlightedText text={bullet} />
              </li>
            ))}
          </ul>

          {/* Sources line */}
          {sources.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 8,
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                style={{ color: "var(--text-gray-dark)", flexShrink: 0 }}
              >
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
                <path
                  d="M8 7v4M8 5.5v.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-gray-dark)",
                  letterSpacing: "0.04em",
                }}
              >
                Source:{" "}
                {sources.map((src, i) => (
                  <span key={i}>
                    {i > 0 && ", "}
                    <code
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: 3,
                        padding: "0 4px",
                        fontSize: 10,
                        color: "var(--text-gray-light)",
                      }}
                    >
                      {src}
                    </code>
                  </span>
                ))}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Data pending state */}
      {!hasTradeoffs && (
        <p
          style={{
            marginLeft: 32,
            marginTop: 6,
            margin: "6px 0 0 32px",
            fontSize: 12.5,
            color: "var(--text-gray-dark)",
            fontStyle: "italic",
          }}
        >
          Tradeoffs data pending.
        </p>
      )}
    </div>
  );
}
