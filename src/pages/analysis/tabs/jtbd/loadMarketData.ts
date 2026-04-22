/**
 * loadMarketData — extracts structured JTBD + ODI data from generic {sections, tables} JSON.
 * Handles variable column headers across different markets.
 */

import { getMarket } from "@/data";
import type { JTBDData, ODIData, ODINeed, JobStep, Stakeholder } from "@/types";

export interface MarketJTBDBundle { jtbd: JTBDData | null; odi: ODIData | null; }

function parseNum(s: string | number | undefined): number {
  if (typeof s === "number") return s;
  const n = parseFloat(String(s ?? "0").replace(/\*\*/g, "").trim());
  return isNaN(n) ? 0 : n;
}

/** Find value in row by trying multiple possible header names */
function pick(row: any, ...keys: string[]): string {
  for (const k of keys) {
    if (row[k] != null && row[k] !== "") return String(row[k]);
  }
  return "";
}

/** Check if any header partially matches any of the given patterns */
function headersMatch(hdrs: string[], patterns: string[]): boolean {
  return patterns.some(p => hdrs.some(h => h.toLowerCase().includes(p.toLowerCase())));
}

function synthesize(jtbdRaw: any, odiRaw: any, meta: any): { jtbd: JTBDData; odi: ODIData } {
  const jtbdTables: any[] = jtbdRaw?.tables ?? [];
  const odiTables: any[] = odiRaw?.tables ?? [];
  const entity = jtbdRaw?.entities?.[0] ?? {};
  const odiEntity = odiRaw?.entities?.[0] ?? {};
  const marketName = entity.market_name ?? meta?.name ?? "";

  // ══════════════════════════════════════════════════════════════════════
  // PRIORITY 1: Extract from entities (richer — has rationales)
  // ══════════════════════════════════════════════════════════════════════

  // ── Build ODI recalibration lookup (maps job_step_name → recalibration_note) ──
  const recalByStatement: Record<string, string> = {};
  const recalByStep: Record<string, string> = {};
  for (const oe of odiEntity.entries ?? []) {
    if (oe.recalibration_note) {
      // Index by error statement (first 60 chars for fuzzy matching)
      const key = (oe.error_statement ?? "").slice(0, 60).toLowerCase();
      if (key) recalByStatement[key] = oe.recalibration_note;
      // Also index by step + id combo
      const stepKey = `${oe.job_step_name ?? ""}_${oe.id ?? ""}`.toLowerCase();
      if (stepKey) recalByStep[stepKey] = oe.recalibration_note;
    }
  }

  // ── NEEDS from entities.error_statements ──
  const entityNeeds: ODINeed[] = [];
  for (const es of entity.error_statements ?? []) {
    const imp = parseNum(es.importance);
    const sat = parseNum(es.satisfaction_current);
    const opp = parseNum(es.opportunity_score);

    // Satisfaction rationale: prefer entity field, then ODI cross-ref, then fallback
    const stmtKey = (es.full_statement ?? "").slice(0, 60).toLowerCase();
    const stepKey = `${es.job_step_name ?? ""}_${es.id ?? ""}`.toLowerCase();
    const satRationale = es.satisfaction_rationale
      ?? recalByStatement[stmtKey]
      ?? recalByStep[stepKey]
      ?? "";

    entityNeeds.push({
      id: String(es.id ?? ""),
      statement: es.full_statement ?? "",
      jobStep: es.job_step_name ?? "",
      importance: imp,
      satisfaction: sat,
      opportunity: opp || (imp + Math.max(0, imp - sat)),
      isUnderserved: imp > 7 && sat < 5,
      isOverserved: imp < 3 && sat > 7,
      productRelated: !!es.product_related,
      importanceRationale: es.rationale ?? "",
      satisfactionRationale: satRationale || `Current satisfaction: ${sat}/10. Impact: ${es.impact_category ?? "—"}.`,
    });
  }

  // ── ODI from odiEntity.entries ──
  const entityODI: ODINeed[] = [];
  for (const oe of odiEntity.entries ?? []) {
    const imp = parseNum(oe.importance);
    const sat = parseNum(oe.satisfaction_current);
    const opp = parseNum(oe.opportunity_score);
    entityODI.push({
      id: String(oe.id ?? ""),
      statement: oe.error_statement ?? "",
      jobStep: oe.job_step_name ?? "",
      importance: imp,
      satisfaction: sat,
      opportunity: opp || (imp + Math.max(0, imp - sat)),
      isUnderserved: !!oe.is_underserved,
      isOverserved: !!oe.is_overserved,
      productRelated: !!oe.product_related,
      importanceRationale: oe.recalibration_note ?? "",
      satisfactionRationale: `Initial satisfaction: ${oe.satisfaction_initial ?? "—"}. Impact: ${oe.impact_category ?? "—"}.`,
    });
  }

  // ── Job steps from entities.job_steps ──
  const entityJobSteps: JobStep[] = [];
  for (const js of entity.job_steps ?? []) {
    entityJobSteps.push({
      stepNumber: js.step_number ?? 0,
      verb: js.step_name ?? "",
      description: js.relevance_rationale ?? "",
      isSensorRelevant: !!js.relevant_to_product,
      sensorDependencyRationale: js.relevance_rationale ?? "",
      rawStatement: `${js.step_name ?? ""}: ${js.relevance_rationale ?? ""}`,
      jobStep: js.step_name ?? "",
      relevant: !!js.relevant_to_product,
    });
  }

  // ── Stakeholders from entities.stakeholders ──
  const entityStakeholders: Stakeholder[] = [];
  for (const st of entity.stakeholders ?? []) {
    entityStakeholders.push({
      role: st.role ?? "",
      who: st.instance ?? "",
      pyramidLevels: Array.isArray(st.pyramid_levels) ? st.pyramid_levels.join(", ") : (st.pyramid_levels ?? ""),
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // PRIORITY 2: Fall back to tables (if entities are empty)
  // ══════════════════════════════════════════════════════════════════════

  const needs: ODINeed[] = [];
  for (const t of jtbdTables) {
    const h: string[] = t.headers ?? [];
    const rows: any[] = t.rows ?? [];
    const hasImp = h.some(x => /^(Imp|I|Importance)$/i.test(x));
    const hasSat = h.some(x => /^(Sat|S|Satisfaction)$/i.test(x));
    const hasStmt = h.some(x => /Statement|Need|Error/i.test(x));
    if (hasImp && hasSat && hasStmt && rows.length >= 3) {
      for (const r of rows) {
        const imp = parseNum(pick(r, "Imp", "I", "Importance"));
        const sat = parseNum(pick(r, "Sat", "S", "Satisfaction"));
        const opp = parseNum(pick(r, "Opp", "O", "Opportunity"));
        const stmt = pick(r, "Statement", "Need (Minimize / Increase)", "Need", "Error statement", "Statement (short)");
        if (!stmt || imp === 0) continue;
        needs.push({
          id: pick(r, "#", "ID"),
          statement: stmt,
          jobStep: pick(r, "Step", "Stage", "Job step"),
          importance: imp,
          satisfaction: sat,
          opportunity: opp || (imp + Math.max(0, imp - sat)),
          isUnderserved: imp > 7 && sat < 5,
          isOverserved: imp < 3 && sat > 7,
          productRelated: /true|yes|✅/i.test(pick(r, "Prod-rel", "PR", "pr", "product_related", "p_rel")),
          importanceRationale: `Impact: ${pick(r, "Impact", "Cat", "impact") || "—"}`,
          satisfactionRationale: `Error type: ${pick(r, "Error type", "Err type", "error_type") || "—"}`,
        });
      }
      break; // take first matching table
    }
  }

  // ── ODI OUTCOMES from ODI tables ──
  // Match: table with Opp + Statement/Error statement + >5 rows
  const odiNeeds: ODINeed[] = [];
  for (const t of odiTables) {
    const h: string[] = t.headers ?? [];
    const rows: any[] = t.rows ?? [];
    const hasOpp = h.some(x => /^Opp$/i.test(x));
    const hasStmt = h.some(x => /Statement|Error/i.test(x));
    const hasImp = h.some(x => /^(I|Imp|Importance)$/i.test(x));
    if (hasOpp && hasStmt && hasImp && rows.length >= 3) {
      for (const r of rows) {
        const imp = parseNum(pick(r, "Imp", "I", "Importance"));
        const sat = parseNum(pick(r, "Sat", "S", "Sat_recal", "Sat₀", "Satisfaction"));
        const opp = parseNum(pick(r, "Opp", "O", "Opportunity"));
        const stmt = pick(r, "Error statement", "Statement (short)", "Statement (truncated)", "Statement", "Error statement (truncated)");
        if (!stmt) continue;
        odiNeeds.push({
          id: pick(r, "ID", "#"),
          statement: stmt,
          jobStep: pick(r, "Src", "Step", "Source") === "prod" ? "PRODUCT" : "MARKET",
          importance: imp,
          satisfaction: sat,
          opportunity: opp || (imp + Math.max(0, imp - sat)),
          isUnderserved: /✅|yes|true/i.test(pick(r, "Under", "UnderS", "US", "U")),
          isOverserved: /✅|yes|true/i.test(pick(r, "Over", "OverS", "OS", "O_over")),
          productRelated: /prod|true|yes/i.test(pick(r, "Src", "p_rel", "product_related")),
          importanceRationale: `Source: ${pick(r, "Src", "Source") || "—"}`,
          satisfactionRationale: "",
        });
      }
      break;
    }
  }

  // ── JOB STEPS ──
  // Match: table with Step + Relevant (partial match) columns
  const jobSteps: JobStep[] = [];
  for (const t of jtbdTables) {
    const h: string[] = t.headers ?? [];
    const rows: any[] = t.rows ?? [];
    const hasStep = h.some(x => /^(Step|Stage)$/i.test(x));
    const hasRelevant = h.some(x => /Relevant/i.test(x));
    if (hasStep && hasRelevant && rows.length >= 3) {
      for (const r of rows) {
        const relVal = pick(r, ...h.filter(x => /Relevant/i.test(x)));
        const isRel = /yes|✅|high|direct|true/i.test(relVal);
        const rationale = pick(r, "Rationale", "Why", ...h.filter(x => /Rationale|Why/i.test(x)));
        const step = pick(r, "Step", "Stage");
        jobSteps.push({
          stepNumber: parseInt(pick(r, "#")) || 0,
          verb: step,
          description: rationale,
          isSensorRelevant: isRel,
          sensorDependencyRationale: rationale,
          rawStatement: `${step}: ${rationale}`,
          jobStep: step,
          relevant: isRel,
        });
      }
      break;
    }
  }

  // ── STAKEHOLDERS ──
  // Match: table with Role + (Instance|Who|persona) columns
  const stakeholders: Stakeholder[] = [];
  for (const t of jtbdTables) {
    const h: string[] = t.headers ?? [];
    const rows: any[] = t.rows ?? [];
    const hasRole = h.some(x => /^Role$/i.test(x));
    const hasWho = h.some(x => /Instance|Who|persona|Person/i.test(x));
    if (hasRole && hasWho && rows.length >= 3) {
      const whoCol = h.find(x => /Instance|Who|persona|Person/i.test(x)) ?? "";
      const levelsCol = h.find(x => /Active|levels|Pyramid|coverage|Included/i.test(x)) ?? "";
      for (const r of rows) {
        stakeholders.push({
          role: r["Role"] ?? "",
          who: r[whoCol] ?? "",
          pyramidLevels: levelsCol ? (r[levelsCol] ?? "") : "",
        });
      }
      break;
    }
  }

  // Prefer entity-based data (has rationales) over table-based
  const allNeeds = entityNeeds.length > 0 ? entityNeeds : (needs.length > 0 ? needs : odiNeeds);
  const allOdi = entityODI.length > 0 ? entityODI : (odiNeeds.length > 0 ? odiNeeds : needs);

  const jtbd: JTBDData = {
    marketName,
    coreJobStatement: entity.core_job ?? "",
    needs: allNeeds,
    jobSteps: entityJobSteps.length > 0 ? entityJobSteps : jobSteps,
    stakeholders: entityStakeholders.length > 0 ? entityStakeholders : stakeholders,
    sources: [],
  } as JTBDData;

  const odi: ODIData = {
    marketName,
    needs: allOdi,
    summary: {
      totalNeeds: allOdi.length,
      underservedCount: allOdi.filter(n => n.isUnderserved).length,
      overservedCount: allOdi.filter(n => n.isOverserved).length,
      avgOpportunity: allOdi.length > 0 ? allOdi.reduce((s, n) => s + n.opportunity, 0) / allOdi.length : 0,
    },
    sources: [],
  } as ODIData;

  return { jtbd, odi };
}

export function loadMarketData(marketSlug: string): { jtbd: JTBDData | null; odi: ODIData | null } {
  try {
    const bundle = getMarket(marketSlug);
    const jtbdRaw = bundle.jtbd as any;
    const odiRaw = bundle.odi as any;

    // If domain-specific, use directly
    if (jtbdRaw?.needs?.length > 0 || jtbdRaw?.jobSteps?.length > 0) {
      return { jtbd: bundle.jtbd, odi: bundle.odi };
    }

    // Synthesize from generic format
    const { jtbd, odi } = synthesize(jtbdRaw, odiRaw, bundle.meta);
    return { jtbd, odi };
  } catch {
    return { jtbd: null, odi: null };
  }
}
