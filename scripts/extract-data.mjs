#!/usr/bin/env node
/**
 * extract-data.mjs — Assa Abloy (GfS Türwächter) data extraction pipeline.
 *
 * Run: node scripts/extract-data.mjs
 *
 * Reads markdown files from ../sections/ (relative to app root),
 * extracts structured data, and writes typed JSON to src/data/.
 *
 * Market list is discovered from ../app/data/manifest.json (not parsed from markdown).
 * File naming convention: underscores (e.g. JTBD_hotels_motels.md).
 *
 * Idempotent — safe to re-run; always overwrites outputs.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, "..");
const SECTIONS_DIR = path.resolve(APP_ROOT, "../sections");
const ARCHIVE_DIR = path.resolve(APP_ROOT, "../archive");
const REPORT_DIR = path.resolve(APP_ROOT, "../report");
const DATA_DIR = path.join(APP_ROOT, "src/data");
const MARKETS_DIR = path.join(DATA_DIR, "markets");

// ─────────────────────────────────────────────
// helpers
// ─────────────────────────────────────────────

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function write(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
  console.log(`  wrote ${path.relative(APP_ROOT, file)}`);
}

/** Parse a markdown table into array of objects (using header row as keys). */
function parseTable(text) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|") && !l.match(/^\|[-| ]+\|$/));
  if (lines.length < 2) return [];
  const headers = lines[0]
    .split("|")
    .slice(1, -1)
    .map((h) => h.trim().replace(/\*\*/g, ""));
  return lines.slice(1).map((row) => {
    const cells = row
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim().replace(/\*\*/g, ""));
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = cells[i] ?? "";
    });
    return obj;
  });
}

/** Extract first JSON fenced block from markdown text. */
function extractJSON(text) {
  const m = text.match(/```json\s*([\s\S]*?)```/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch (e) {
    console.warn("    JSON parse error:", e.message);
    return null;
  }
}

/** Extract section content between two ## headings. */
function extractSection(text, heading) {
  const re = new RegExp(
    `## ${escRe(heading)}[^\n]*\n([\\s\\S]*?)(?=\n## |$)`,
    "i"
  );
  const m = text.match(re);
  return m ? m[1].trim() : "";
}

/**
 * Extract section at ANY heading level (##, ###, ####) whose title contains
 * the given keyword. Stops at the next heading of the same or higher level.
 * Returns the content between the matched heading line and the next boundary.
 */
function extractAnySection(text, keyword) {
  // Match ## or ### or #### headings containing the keyword (case-insensitive)
  const re = new RegExp(
    `(#{2,4})\\s[^\n]*${escRe(keyword)}[^\n]*\n([\\s\\S]*?)(?=\\n#{1,4}\\s|$)`,
    "i"
  );
  const m = text.match(re);
  return m ? m[2].trim() : "";
}

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Clean markdown bold/italic/link syntax from a string. */
function clean(s) {
  if (!s) return "";
  return s
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

// ─────────────────────────────────────────────
// slug / market registry — loaded from manifest.json
// ─────────────────────────────────────────────

// NAICS codes for each Assa Abloy market (derived from 10_final_ranking.md and 05_market_discovery.md)
const MARKET_NAICS = {
  colleges_universities: "611310",
  continuing_care_retirement: "623311",
  data_centers: "518210",
  elementary_secondary_schools: "611110",
  facilities_support_services: "561210",
  general_medical_surgical_hospitals: "622110",
  general_warehousing_storage: "493110",
  hotels_motels: "721110",
  lessors_nonresidential_buildings: "531120",
  museums_historical_sites: "712110",
};

// Human-readable market names for each slug
const MARKET_NAMES = {
  colleges_universities: "Colleges, Universities, and Professional Schools",
  continuing_care_retirement: "Continuing Care Retirement Communities",
  data_centers: "Data Processing, Hosting, and Related Services",
  elementary_secondary_schools: "Elementary and Secondary Schools",
  facilities_support_services: "Facilities Support Services",
  general_medical_surgical_hospitals: "General Medical and Surgical Hospitals",
  general_warehousing_storage: "General Warehousing and Storage",
  hotels_motels: "Hotels (except Casino Hotels) and Motels",
  lessors_nonresidential_buildings: "Lessors of Nonresidential Buildings (except Miniwarehouses)",
  museums_historical_sites: "Museums, Historical Sites, and Similar Institutions",
};

// Load market slugs from manifest.json (single source of truth)
const MANIFEST_PATH = path.resolve(APP_ROOT, "../app/data/manifest.json");
// Fallback: if manifest.json is at APP_ROOT/data/manifest.json
const MANIFEST_PATH_ALT = path.resolve(APP_ROOT, "data/manifest.json");

function loadMarketMap() {
  let manifestPath = null;
  if (fs.existsSync(MANIFEST_PATH)) {
    manifestPath = MANIFEST_PATH;
  } else if (fs.existsSync(MANIFEST_PATH_ALT)) {
    manifestPath = MANIFEST_PATH_ALT;
  } else {
    console.warn("  manifest.json not found; falling back to hardcoded market list");
    return Object.keys(MARKET_NAICS).map((slug) => ({
      slug,
      fileKey: slug,
      name: MARKET_NAMES[slug] || slug,
      naics: MARKET_NAICS[slug] || "",
      isReference: false,
    }));
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const markets = manifest.markets || [];
  return markets.map((m) => ({
    slug: m.slug,
    // For Assa Abloy, the file key IS the slug (underscores, no truncation)
    fileKey: m.slug,
    name: MARKET_NAMES[m.slug] || m.title || m.slug,
    naics: MARKET_NAICS[m.slug] || "",
    isReference: false,
  }));
}

const MARKET_MAP = loadMarketMap();

// ─────────────────────────────────────────────
// global sources registry
// ─────────────────────────────────────────────

const globalSources = {}; // id → Source object

function registerSources(entries, prefix) {
  for (const s of entries) {
    if (s.id) globalSources[`${prefix}-${s.id}`] = { ...s, prefixedId: `${prefix}-${s.id}` };
  }
}

function parseSources(text, prefix) {
  const section = extractSection(text, "Sources");
  if (!section) return [];

  const sources = [];
  // Handle table format: | S01 | label | url | quote |
  const tableRows = parseTable(section);
  if (tableRows.length > 0 && tableRows[0]["#"]) {
    for (const row of tableRows) {
      sources.push({
        id: row["#"] || row["id"] || "",
        label: clean(row["label"] || row["Label"] || ""),
        url: row["url"] || row["URL"] || undefined,
        quote: row["quote"] || row["Quote"] || undefined,
      });
    }
  } else {
    // Parse bullet-list format: - [Label](url) or - Label
    const lines = section.split("\n").filter((l) => l.trim().startsWith("-"));
    let idx = 1;
    for (const line of lines) {
      const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      const label = linkMatch ? linkMatch[1] : clean(line.replace(/^-\s*/, ""));
      const url = linkMatch ? linkMatch[2] : undefined;
      sources.push({
        id: `S${String(idx).padStart(2, "0")}`,
        label,
        url,
      });
      idx++;
    }
  }

  registerSources(sources, prefix);
  return sources.map((s) => ({ ...s, prefixedId: `${prefix}-${s.id}` }));
}

// ─────────────────────────────────────────────
// 01 — Product Decomposition
// ─────────────────────────────────────────────

function extractProduct() {
  console.log("Extracting product decomposition...");
  const text = read(path.join(SECTIONS_DIR, "01_product_decomposition.md"));
  const json = extractJSON(text);

  const sources = parseSources(text, "PROD");

  // Christensen
  const christensenRows = parseTable(extractSection(text, "Christensen Abstraction"));
  const christensen = {
    mechanism: clean(christensenRows.find((r) => r["Level"]?.includes("Mechanism"))?.["Description"] || ""),
    function: clean(christensenRows.find((r) => r["Level"]?.includes("Function"))?.["Description"] || ""),
    outcome: clean(christensenRows.find((r) => r["Level"]?.includes("Outcome"))?.["Description"] || ""),
  };

  // Technology
  const techRows = parseTable(extractSection(text, "Technology Classification"));
  const techMap = {};
  techRows.forEach((r) => { techMap[r["Field"]?.replace(/\*\*/g, "").trim()] = r["Value"]; });

  const technology = {
    class: techMap["technology_class"] || "",
    underlyingMechanism: techMap["underlying_mechanism"] || "",
    unspscCode: techMap["UNSPSC Code"] || "",
    unspscTitle: techMap["UNSPSC Title"] || "",
    unspscPath: techMap["UNSPSC Path"] || "",
  };

  // Functional promise
  const fpRows = parseTable(extractSection(text, "Functional Promise"));
  const fpMap = {};
  fpRows.forEach((r) => { fpMap[r["Field"]?.replace(/\*\*/g, "").trim()] = r["Value"]; });

  // Differentiators — parse the table after "Differentiators vs"
  const diffSection = text.match(/\*\*Differentiators vs[^*]*:\*\*\s*([\s\S]*?)(?=\n##|\n---)/);
  let differentiators = [];
  if (diffSection) {
    const rows = parseTable(diffSection[1]);
    differentiators = rows.map((r) => clean(r["Differentiator"] || Object.values(r)[1] || "")).filter(Boolean);
  }
  if (differentiators.length === 0 && json?.functional_promise?.differentiators) {
    differentiators = json.functional_promise.differentiators;
  }

  // Commodity FP
  const commodityFP = clean(text.match(/> \*\*Quantify([^*]+)\*\*/)?.[0] || "")
    || (json?.commodity_functional_promise ?? "");

  // Features
  let features = [];
  if (json?.features) {
    features = json.features.map((f) => ({
      scope: f.scope,
      name: f.name,
      short: f.description,
      long: f.long_description,
      category: f.category,
    }));
  } else {
    // Parse from markdown tables
    const techFeatSection = extractSection(text, "Technology-Scoped Features");
    const vendorFeatSection = extractSection(text, "Vendor-Scoped Features");
    const parseFeatTable = (section, scope) => {
      const rows = parseTable(section);
      return rows.map((r) => ({
        scope,
        name: clean(r["Feature"] || ""),
        short: clean(r["Description"] || ""),
        long: clean(r["Long Description"] || ""),
        category: clean(r["Category"] || ""),
      }));
    };
    features = [
      ...parseFeatTable(techFeatSection, "technology"),
      ...parseFeatTable(vendorFeatSection, "vendor"),
    ];
  }

  // Specifications
  let specifications = [];
  if (json?.specifications) {
    specifications = json.specifications.map((s) => ({
      name: s.name,
      value: String(s.value),
      unit: s.unit ?? undefined,
      testCondition: s.test_condition ?? undefined,
    }));
  } else {
    const rows = parseTable(extractSection(text, "Specifications"));
    specifications = rows.map((r) => ({
      name: clean(r["Specification"] || ""),
      value: clean(r["Value"] || ""),
      unit: clean(r["Unit"] || "") || undefined,
      testCondition: clean(r["Test Condition"] || "") || undefined,
    }));
  }

  // Constraints (basic — full constraint set is in 03_constraints.md)
  let constraints = [];
  if (json?.constraints) {
    constraints = json.constraints.map((c) => ({
      name: c.name,
      constraintType: c.constraint_type,
      description: c.description,
      severity: c.severity || (c.is_absolute ? "hard" : "soft"),
      thresholdValue: c.threshold_value ?? null,
      thresholdUnit: c.threshold_unit ?? null,
      isAbsolute: c.is_absolute ?? (c.severity === "hard"),
    }));
  }

  // ── Bill of Materials ─────────────────────────────────────────────────────
  // For Assa Abloy, BOM data is in per-market BOM_<slug>.md files and is
  // extracted by extractBOM(). The product-level BOM is derived from the
  // JSON block if present, or left empty (per-market BOMs are the primary source).
  let billOfMaterials = [];
  if (json?.bill_of_materials) {
    billOfMaterials = json.bill_of_materials.map((b) => ({
      id: b.id || "",
      component: b.component || b.name || "",
      function: b.function || b.role || "",
      category: b.category || "",
      keyAttribute: b.key_attribute || b.keyAttribute || "",
    }));
  }

  const product = {
    productName: json?.product_name || "GfS Türwächter IoT (Exit Control 179/1125)",
    vendorName: json?.vendor_name || "GfS Rettungswegtechnik GmbH (Assa Abloy Group)",
    christensen,
    technology,
    functionalPromise: {
      statement: clean(fpMap["Statement"] || json?.functional_promise?.statement || ""),
      verb: clean(fpMap["Verb"] || json?.functional_promise?.verb || ""),
      object: clean(fpMap["Object"] || json?.functional_promise?.object || ""),
      context: clean(fpMap["Context"] || json?.functional_promise?.context || ""),
    },
    commodityFunctionalPromise: clean(json?.commodity_functional_promise || commodityFP),
    differentiators,
    features,
    specifications,
    constraints,
    billOfMaterials,
    sources,
  };

  write(path.join(DATA_DIR, "product.json"), product);
  return product;
}

// ─────────────────────────────────────────────
// 02 — Functional Promise
// ─────────────────────────────────────────────

function extractFunctionalPromise() {
  console.log("Extracting functional promise...");
  const text = read(path.join(SECTIONS_DIR, "02_functional_promise.md"));
  const json = extractJSON(text);
  const sources = parseSources(text, "FP");

  // Product FP
  const fpRows = parseTable(extractSection(text, "Product Functional Promise"));
  const fpMap = {};
  fpRows.forEach((r) => { fpMap[r["Field"]?.replace(/\*\*/g, "").trim()] = r["Value"]; });

  // Differentiators
  const diffSection = extractSection(text, "Product Functional Promise");
  const diffTable = parseTable(text.match(/\*\*Differentiators vs alternatives:\*\*\s*([\s\S]*?)(?=\n##|\n---|\n\*\*Mechanism)/)?.[1] || "");
  const differentiators = diffTable
    .map((r) => clean(r["Differentiator"] || Object.values(r)[1] || ""))
    .filter(Boolean);

  // Commodity FP
  const cfpRows = parseTable(extractSection(text, "Commodity Functional Promise"));
  const cfpMap = {};
  cfpRows.forEach((r) => { cfpMap[r["Field"]?.replace(/\*\*/g, "").trim()] = r["Value"]; });

  // UNSPSC
  const unspscRows = parseTable(extractSection(text, "UNSPSC Classification"));
  const unspscMap = {};
  unspscRows.forEach((r) => { unspscMap[r["Field"]?.replace(/\*\*/g, "").trim()] = r["Value"]; });

  // FP Extension
  const extRows = parseTable(extractSection(text, "FP Extension"));
  const extMap = {};
  extRows.forEach((r) => { extMap[r["Field"]?.replace(/\*\*/g, "").trim()] = r["Value"]; });

  // VN / BOM position
  const bomRows = parseTable(extractSection(text, "VN / BOM Position"));
  const bomMap = {};
  bomRows.forEach((r) => { bomMap[r["Field"]?.replace(/\*\*/g, "").trim()] = r["Value"]; });

  // Complements
  let complements = [];
  if (json?.complements) {
    complements = json.complements.map((c) => ({
      name: c.name,
      criticality: c.criticality,
      description: c.description,
    }));
  } else {
    const rows = parseTable(extractSection(text, "Required Complements"));
    complements = rows.map((r) => ({
      name: clean(r["Complement"] || ""),
      criticality: clean(r["Criticality"] || "").toLowerCase(),
      description: clean(r["Description"] || ""),
    }));
  }

  const fp = {
    productFP: {
      statement: clean(fpMap["Statement"] || json?.product_functional_promise?.statement || ""),
      verb: clean(fpMap["Verb"] || json?.product_functional_promise?.verb || ""),
      object: clean(fpMap["Object"] || json?.product_functional_promise?.object || ""),
      context: clean(fpMap["Context"] || json?.product_functional_promise?.context || ""),
      differentiators:
        differentiators.length > 0
          ? differentiators
          : (json?.product_functional_promise?.differentiators || []),
    },
    commodityFP: {
      statement: clean(cfpMap["Functional Promise"] || json?.commodity_functional_promise?.functional_promise || ""),
      commodity: clean(cfpMap["Commodity or Group"] || "Flowmeters"),
      unspscCode: clean(unspscMap["UNSPSC Code"] || "41112501"),
      reasoning: clean(cfpMap["Reasoning"] || json?.commodity_functional_promise?.reasoning || ""),
      fpExtension: clean(extMap["FP Extension"] || json?.commodity_functional_promise?.fp_extension || ""),
      fpExtensionDomains: json?.commodity_functional_promise?.fp_extension_domains || [],
    },
    bomPosition: {
      level: clean(bomMap["BOM Level"] || "L5"),
      position: clean(bomMap["Position"] || "Component"),
      parentSubsystem: clean(bomMap["Parent Subsystem (typical)"] || ""),
      grandparentSystem: clean(bomMap["Grandparent System (typical)"] || ""),
    },
    complements,
    sources,
  };

  write(path.join(DATA_DIR, "functionalPromise.json"), fp);
  return fp;
}

// ─────────────────────────────────────────────
// 03 — Constraints
// ─────────────────────────────────────────────

function extractConstraints() {
  console.log("Extracting constraints...");
  const text = read(path.join(SECTIONS_DIR, "03_constraints.md"));
  const json = extractJSON(text);
  const sources = parseSources(text, "CONSTR");

  let constraints = [];
  if (json?.constraints) {
    constraints = json.constraints.map((c) => ({
      name: c.name,
      constraintType: c.constraint_type,
      description: c.description,
      thresholdValue: c.threshold_value ?? null,
      thresholdUnit: c.threshold_unit ?? null,
      isAbsolute: c.is_absolute,
      affectedMarketsHint: c.affected_markets_hint || [],
    }));
  } else {
    // Parse from markdown summary table
    const summarySection = extractSection(text, "Constraint Summary");
    const rows = parseTable(summarySection);
    constraints = rows.map((r) => ({
      name: clean(r["Constraint"] || ""),
      constraintType: clean(r["Type"] || ""),
      thresholdValue: r["Threshold"]?.trim() === "—" ? null : r["Threshold"]?.trim() || null,
      thresholdUnit: r["Unit"]?.trim() === "—" ? null : r["Unit"]?.trim() || null,
      isAbsolute: r["is_absolute"]?.includes("true") || false,
      description: "",
      affectedMarketsHint: [],
    }));
  }

  const data = { constraints, sources };
  write(path.join(DATA_DIR, "constraints.json"), data);
  return data;
}

// ─────────────────────────────────────────────
// 04 — Home Market Competition
// ─────────────────────────────────────────────

function extractHomeMarket() {
  console.log("Extracting home market competition...");
  const text = read(path.join(SECTIONS_DIR, "04_incumbents_home.md"));
  const json = extractJSON(text);
  const sources = parseSources(text, "HOME");

  // Context
  const ctxRows = parseTable(extractSection(text, "Market Context"));
  const ctxMap = {};
  ctxRows.forEach((r) => { ctxMap[r["Field"]?.replace(/\*\*/g, "").trim()] = r["Value"]; });

  let incumbents = [];
  if (json?.incumbents) {
    incumbents = json.incumbents.map((inc) => ({
      technologyName: inc.technology_name,
      mechanism: inc.mechanism,
      marketShareEstimate: inc.market_share_estimate,
      keyVendors: inc.key_vendors || [],
      strengths: inc.strengths || [],
      weaknesses: inc.weaknesses || [],
      confidence: inc.confidence,
    }));
  }

  // Competitive summary table
  const compTableSection = extractSection(text, "Competitive Positioning Summary");
  const compRows = parseTable(compTableSection);
  const positioningTable = compRows
    .filter((r) => {
      const tech = r["Technology"] || Object.values(r)[0] || "";
      return tech.trim() && !tech.includes("---");
    })
    .map((r) => {
      const keys = Object.keys(r);
      return {
        technology: clean(r[keys[0]] || ""),
        share: clean(r["Share"] || r[keys[1]] || ""),
        pressureDrop: clean(r["Pressure Drop"] || r[keys[2]] || ""),
        movingParts: clean(r["Moving Parts"] || r[keys[3]] || ""),
        accuracy: clean(r["Accuracy"] || r[keys[4]] || ""),
        unitCost: clean(r["Unit Cost (OEM)"] || r[keys[5]] || ""),
        continuousOutput: clean(r["Continuous Output"] || r[keys[6]] || ""),
        heatMeterReady: clean(r["Heat Meter Ready"] || r[keys[7]] || ""),
      };
    });

  // Switching cost
  const switchRows = parseTable(extractSection(text, "Switching Cost Assessment"));
  const switchMap = {};
  switchRows.forEach((r) => {
    switchMap[r["Factor"]?.replace(/\*\*/g, "").trim()] = clean(r["Assessment"] || "");
  });

  const data = {
    marketName: clean(ctxMap["Market Name"] || "HVAC OEM Flow Measurement"),
    naicsCode: clean(ctxMap["NAICS Code"] || "333415"),
    naicsTitle: clean(ctxMap["NAICS Title"] || ""),
    functionalNeed: clean(ctxMap["Functional Need"] || ""),
    switchingCost: clean(ctxMap["Switching Cost Assessment"] || json?.switching_cost_assessment || "moderate"),
    switchingCostFactors: switchMap,
    incumbents,
    positioningTable,
    sources,
  };

  write(path.join(DATA_DIR, "homeMarketCompetition.json"), data);
  return data;
}

// ─────────────────────────────────────────────
// 05 — Market Discovery
// ─────────────────────────────────────────────

function extractMarketDiscovery() {
  console.log("Extracting market discovery...");
  const text = read(path.join(SECTIONS_DIR, "05_market_discovery.md"));
  const json = extractJSON(text);
  const sources = parseSources(text, "DISC");

  // Search config
  const cfgRows = parseTable(extractSection(text, "Search Configuration"));
  const cfgMap = {};
  cfgRows.forEach((r) => { cfgMap[r["Field"]?.replace(/\*\*/g, "").trim()] = clean(r["Value"] || ""); });

  // Candidates table — may span multiple sections
  const candidatesSection = extractSection(text, "Candidates");
  let candidates = parseTable(candidatesSection);
  if (candidates.length === 0) {
    // Try the full doc
    const allTables = [...text.matchAll(/\| # \| NAICS \|([\s\S]*?)(?=\n\n|\n##)/g)];
    if (allTables.length > 0) {
      candidates = parseTable(allTables[0][0]);
    }
  }

  const candidatesParsed = candidates.map((r) => ({
    naics: clean(r["NAICS"] || ""),
    title: clean(r["Title"] || ""),
    fpFit: clean(r["FP Fit"] || ""),
    adoption: clean(r["Adoption"] || ""),
    discoverySource: clean(r["Discovery Source"] || ""),
    confidence: parseFloat(r["Confidence"] || "0"),
  })).filter((c) => c.naics);

  const data = {
    commodityFP: cfgMap["Commodity FP"] || "",
    unspscContext: cfgMap["UNSPSC Context"] || "",
    fpExtension: cfgMap["FP Extension"] || "",
    extensionDomains: cfgMap["Extension Domains"] || "",
    candidates: candidatesParsed,
    sources,
  };

  write(path.join(DATA_DIR, "marketDiscovery.json"), data);
  return data;
}

// ─────────────────────────────────────────────
// 10 — Ranking
// ─────────────────────────────────────────────

function extractRanking() {
  console.log("Extracting ranking...");
  const text = read(path.join(SECTIONS_DIR, "10_final_ranking.md"));
  const json = extractJSON(text);

  if (!json) {
    console.warn("  No JSON block found in ranking file");
    return {};
  }

  // Match slugs
  const slugForNaics = (naics) => {
    const m = MARKET_MAP.find((x) => x.naics === naics);
    return m ? m.slug : naics;
  };

  const ranked = (json.ranked_markets || []).map((m) => ({
    rank: m.rank,
    slug: slugForNaics(m.naics_code),
    marketName: m.market_name,
    naicsCode: m.naics_code,
    scores: {
      // Support both Marquardt field names (odi_opportunity_score) and
      // Assa Abloy field names (odi_score, constraint_score, coverage_score, etc.)
      odi: m.odi_opportunity_score ?? m.odi_score ?? 0,
      featureFit: m.feature_fit_score ?? 0,
      constraintCompatibility: m.constraint_compatibility_score ?? m.constraint_score ?? 0,
      jobCoverage: m.job_coverage_score ?? m.coverage_score ?? 0,
      vnHierarchy: m.vn_hierarchy_score ?? m.vn_score ?? 0,
      incumbentVulnerability: m.incumbent_vulnerability_score ?? m.incumbent_vuln_score ?? 0,
      composite: m.composite_score ?? 0,
    },
    recommendation: m.recommendation,
    rationale: m.recommendation_rationale ?? m.rationale ?? "",
    entryStrategy: m.entry_strategy_sketch ?? m.primary_entry_motion ?? "",
    estimatedTimeToEntry: m.estimated_time_to_entry ?? (m.time_to_revenue_months ? `${m.time_to_revenue_months} months` : ""),
    estimatedInvestment: m.estimated_investment ?? (m.pilot_investment_eur ? `€${m.pilot_investment_eur}` : ""),
  }));

  const data = {
    productName: json.product_name || "GfS Türwächter IoT (Exit Control 179/1125)",
    vendorName: json.vendor_name || "GfS Rettungswegtechnik GmbH (Assa Abloy Group)",
    technologyClass: json.technology_class,
    unspscCode: json.unspsc_code,
    unspscTitle: json.unspsc_title,
    customProductGroup: json.custom_product_group,
    commodityFunctionalPromise: json.commodity_functional_promise,
    totalMarketsEvaluated: json.total_markets_evaluated,
    marketsEliminatedByConstraints: json.markets_eliminated_by_constraints,
    weights: json.weights,
    rankedMarkets: ranked,
    executiveSummary: json.executive_summary,
  };

  write(path.join(DATA_DIR, "ranking.json"), data);
  return data;
}

// ─────────────────────────────────────────────
// JTBD — per market
// ─────────────────────────────────────────────

function extractJTBD(market) {
  const file = path.join(SECTIONS_DIR, `JTBD_${market.fileKey}.md`);
  if (!fs.existsSync(file)) {
    console.warn(`  JTBD file not found: ${file}`);
    return null;
  }

  const text = read(file);
  const sources = parseSources(text, `JTBD-${market.slug.toUpperCase()}`);

  // VN anchor / product job — use anySection to handle both ## and ### headings
  const anchorSection = extractAnySection(text, "VN Anchor");
  const anchorRows = parseTable(anchorSection);
  const anchorMap = {};
  anchorRows.forEach((r) => { anchorMap[r["Field"]?.replace(/\*\*/g, "").trim()] = clean(r["Value"] || ""); });

  const jobSection = extractAnySection(text, "Product Job");
  const jobRows = parseTable(jobSection);
  const jobMap2 = {};
  jobRows.forEach((r) => { jobMap2[r["Field"]?.replace(/\*\*/g, "").trim()] = clean(r["Value"] || ""); });

  // ── Job Map (Ulwick steps) ──────────────────────────────────────────────────
  // Section headings vary across files:
  //   "### 3.2 Job Map (8 Ulwick Steps)"
  //   "### 3.1 Job Map (8 Universal Steps — Ulwick 2005)"
  //   "### Job Map (Ulwick 8 Steps)"
  // We use extractAnySection with "Job Map" as keyword.
  const jobMapSection = extractAnySection(text, "Job Map");
  const jobMapRows = parseTable(jobMapSection);
  const steps = jobMapRows
    .filter((r) => {
      // Column header varies: "Relevant?", "Relevant", "Relevant to Product?"
      const relevant = r["Relevant?"] || r["Relevant to Product?"] || r["Relevant"] || "";
      return relevant.toLowerCase().includes("yes");
    })
    .map((r) => {
      const rawStatement = clean(r["Statement"] || "");
      const stepName = clean(r["Step"] || "");
      // Extract verb from step name (e.g. "DEFINE" → "Define")
      const verbMatch = stepName.match(/([A-Z]{2,})/);
      const verb = verbMatch
        ? verbMatch[1].charAt(0).toUpperCase() + verbMatch[1].slice(1).toLowerCase()
        : stepName;
      // Description: strip the leading VERB word from the statement so the UI
      // can prepend "This step is about " and get a natural sentence.
      // e.g. "Define the required water flow..." → "the required water flow..."
      // Fallback: if rawStatement is empty (job-map table had no Statement column),
      // use the rationale text which describes what the step involves.
      const rationaleForDesc = clean(
        r["Rationale"] || r["Relevance Rationale"] || r["Sensor Dependency"] || ""
      );
      const description = rawStatement
        ? (rawStatement
            .replace(new RegExp(`^${verb}\\s+`, "i"), "")
            .replace(/^\*?\*?[A-Z]{2,}\*?\*?\s+/, "")
            .trim() || rawStatement)
        : rationaleForDesc;
      // isSensorRelevant / sensorDependencyRationale
      const relevanceCol = r["Relevant?"] || r["Relevant to Product?"] || r["Relevant"] || "";
      const rationaleCol = clean(
        r["Rationale"] || r["Relevance Rationale"] || r["Sensor Dependency"] || ""
      );
      return {
        stepNumber: parseInt(r["#"] || "0"),
        verb,
        description,
        isSensorRelevant: relevanceCol.toLowerCase().includes("yes"),
        sensorDependencyRationale: rationaleCol,
        rawStatement,
        jobStep: stepName.replace(/\*\*/g, "").replace(/^\d+\s*/, ""),
        relevant: relevanceCol.toLowerCase().includes("yes"),
        rationale: rationaleCol,
      };
    });

  console.log(`    Job steps (sensor-relevant): ${steps.length}`);

  // ── Stakeholders / Segments ────────────────────────────────────────────────
  // The files have TWO distinct stakeholder tables:
  //   1. "### 1.2 Segments (Circumstance-Based)" — circumstance segments
  //   2. "### 3.0 Stakeholder Roles for This Market" / "### 3.1 Stakeholder Roles"
  //      — role-based stakeholders (Executor, Overseer, etc.)

  // 1. Circumstance-based segments (from Phase 1)
  // Headings: "1.2 Segments", "1.2 Segments (Circumstance-Based)", "1.2 Segments (by circumstance)"
  const segSection = extractAnySection(text, "1.2 Segments");
  const segRows = parseTable(segSection);

  // Parse name + optional qualifier from bolded segment text
  // e.g. "**Large-scale commercial RAS** (>500 t/yr, salmon focus)" → name + qualifier
  function parseSegmentName(raw) {
    const boldMatch = raw.match(/\*\*([^*]+)\*\*\s*([\s\S]*)/);
    if (boldMatch) {
      return {
        name: boldMatch[1].trim(),
        qualifier: boldMatch[2].trim(),
      };
    }
    return { name: raw.trim(), qualifier: "" };
  }

  const segments = segRows
    .filter((r) => r["Segment"] || r["#"])
    .map((r, idx) => {
      const rawSeg = r["Segment"] || "";
      const { name, qualifier } = parseSegmentName(rawSeg);
      const altDiffer = r["Alternatives Differ?"] || "";
      // isTargetable: "Yes" somewhere in the field
      const isTargetable = altDiffer.toLowerCase().includes("yes");
      // targetabilityReason: everything after the "Yes — " prefix
      const reasonMatch = altDiffer.match(/yes\s*[—–-]\s*([\s\S]+)/i);
      const targetabilityReason = reasonMatch ? reasonMatch[1].trim() : clean(altDiffer);
      return {
        segmentNumber: parseInt(r["#"] || String(idx + 1)),
        name: clean(name),
        qualifier: clean(qualifier),
        characteristics: clean(r["Circumstance"] || ""),
        isTargetable,
        targetabilityReason: clean(targetabilityReason),
        // Legacy fields kept for backward compat
        circumstance: clean(r["Circumstance"] || ""),
        alternativesDiffer: clean(altDiffer),
      };
    });

  console.log(`    Segments extracted: ${segments.length}`);

  // 2. Role-based stakeholders (Executor, Overseer, etc.)
  // Headings vary: "Stakeholder Roles", "3.0 Stakeholder Roles for This Market", "3.1 Stakeholder Roles"
  const stakeSection =
    extractAnySection(text, "Stakeholder Roles") ||
    extractAnySection(text, "3.0 Stakeholder");
  const stakeRows = parseTable(stakeSection);
  const stakeholders = stakeRows
    .filter((r) => r["Role"] || Object.values(r)[0])
    .map((r) => {
      const keys = Object.keys(r);
      return {
        role: clean(r["Role"] || r[keys[0]] || ""),
        who: clean(r[keys[1]] || ""),
        pyramidLevels: clean(r["Pyramid Levels"] || r[keys[2]] || ""),
      };
    });

  console.log(`    Role-based stakeholders extracted: ${stakeholders.length}`);

  // ── Error statements (P1+P2) ───────────────────────────────────────────────
  const errSection =
    extractAnySection(text, "P1 + P2 Error Statements") ||
    extractAnySection(text, "Error Statements") ||
    extractAnySection(text, "3.2 P1 + P2 Needs") ||
    extractAnySection(text, "3.3 Error Statements") ||
    extractAnySection(text, "3.2 Error Statements");

  // We collect all table rows from the error statements section
  const needsRows = [];
  const errTables = errSection.matchAll(/\| # \| Error Statement \|([\s\S]*?)(?=\n#{3,}|\n---)/g);
  for (const match of errTables) {
    const rows = parseTable("| # | Error Statement |" + match[1]);
    needsRows.push(...rows);
  }
  // Also try to parse from the full section using a wider match
  if (needsRows.length === 0) {
    const allRows = parseTable(errSection);
    needsRows.push(...allRows);
  }

  const needs = needsRows
    .filter((r) => r["#"] && r["Error Statement"])
    .map((r) => ({
      id: clean(r["#"] || ""),
      statement: clean(r["Error Statement"] || ""),
      jobStep: clean(r["Job Step"] || ""),
      errorType: clean(r["Error Type"] || ""),
      importance: parseFloat(r["Imp"] || "0"),
      satisfaction: parseFloat(r["Sat"] || "0"),
      opportunity: parseFloat(r["Opp"] || "0"),
      impactCategory: clean(r["Impact"] || ""),
      productRelated: r["product_related"]?.trim() === "true",
      confidence: parseFloat(r["Confidence"] || "0"),
    }));

  // Alternatives from section 2.4
  const altSection = extractAnySection(text, "Alternatives");
  const altRows = parseTable(altSection);
  const alternatives = altRows.map((r) => ({
    name: clean(r["Alternative"] || ""),
    unspsc: clean(r["UNSPSC"] || ""),
    tradeoffs: clean(r["Inherent Trade-Offs"] || ""),
  }));

  // CFJ from Phase 1 summary table
  const phase1Section = extractAnySection(text, "Phase 1") || extractSection(text, "Phase 1");
  const phase1Rows = parseTable(phase1Section);
  const phase1Map = {};
  phase1Rows.forEach((r) => { phase1Map[r["Field"]?.replace(/\*\*/g, "").trim()] = clean(r["Value"] || ""); });

  const data = {
    naicsCode: market.naics,
    marketName: market.name,
    slug: market.slug,
    coreJobStatement: phase1Map["CFJ"] || jobMap2["Product Job Statement"] || "",
    productJobStatement: jobMap2["Product Job Statement"] || "",
    anchorLevel: anchorMap["Anchor Level"] || "",
    lPath: anchorMap["L-Path"] || "",
    segments,
    alternatives,
    jobSteps: steps,
    stakeholders,
    needs,
    sources,
  };

  write(path.join(MARKETS_DIR, market.slug, "jtbd.json"), data);
  return data;
}

// ─────────────────────────────────────────────
// ODI — per market
// ─────────────────────────────────────────────

function extractODI(market) {
  const file = path.join(SECTIONS_DIR, `ODI_${market.fileKey}.md`);
  if (!fs.existsSync(file)) {
    console.warn(`  ODI file not found: ${file}`);
    return null;
  }

  const text = read(file);
  const sources = parseSources(text, `ODI-${market.slug.toUpperCase()}`);
  const json = extractJSON(text);

  // Build a statement→jobStep lookup from the JTBD markdown JSON block.
  // The JTBD JSON has job_step_name for each error statement; ODI JSON does not.
  const jtbdFile = path.join(SECTIONS_DIR, `JTBD_${market.fileKey}.md`);
  const jobStepLookup = {};
  // Stakeholder list from the already-written jtbd.json for this market.
  // Used to derive primaryStakeholder for each ODI need.
  let jtbdStakeholders = [];
  if (fs.existsSync(jtbdFile)) {
    const jtbdText = read(jtbdFile);
    const jtbdJson = extractJSON(jtbdText);
    const needsList = jtbdJson?.needs || jtbdJson?.error_statements || [];
    for (const n of needsList) {
      const stmt = (n.statement || n.error_statement || "").trim();
      const step = (n.job_step_name || "").trim();
      if (stmt && step) {
        jobStepLookup[stmt] = step;
      }
    }
    // Also try parsing JTBD error-statement tables (fallback)
    const errSection =
      extractAnySection(jtbdText, "P1 + P2 Error Statements") ||
      extractAnySection(jtbdText, "Error Statements") ||
      extractAnySection(jtbdText, "3.2 P1 + P2 Needs") ||
      extractAnySection(jtbdText, "3.3 Error Statements") ||
      extractAnySection(jtbdText, "3.2 Error Statements");
    const allErrRows = parseTable(errSection);
    for (const r of allErrRows) {
      const stmt = clean(r["Error Statement"] || "").trim();
      const step = clean(r["Job Step"] || "").trim();
      if (stmt && step && !jobStepLookup[stmt]) {
        jobStepLookup[stmt] = step;
      }
    }
    // Read stakeholder roles from the written jtbd.json (already extracted)
    const jtbdJsonFile = path.join(MARKETS_DIR, market.slug, "jtbd.json");
    if (fs.existsSync(jtbdJsonFile)) {
      try {
        const jtbdData = JSON.parse(fs.readFileSync(jtbdJsonFile, "utf8"));
        jtbdStakeholders = jtbdData.stakeholders || [];
      } catch (_) { /* ignore */ }
    }
  }

  /**
   * Map a job step name to the primary stakeholder "who" string.
   * Uses the canonical Burleson/Ulwick step→role mapping:
   *   EXECUTE, MONITOR, MODIFY, DEFINE → Job Executor (primary operational actor)
   *   PREPARE, CONFIRM                  → Product Lifecycle Support (install/commission)
   *   CONCLUDE                          → Job Overseer (records, compliance)
   *   product_constraint                → Product Lifecycle Support (OEM/integrator)
   * Falls back to the first stakeholder in the list if role not found.
   */
  function resolveStakeholder(jobStep) {
    const step = (jobStep || "").toUpperCase();

    // Step → preferred role keyword
    let targetRole = "Job Executor";
    if (step === "PREPARE" || step === "CONFIRM") {
      targetRole = "Product Lifecycle Support";
    } else if (step === "CONCLUDE") {
      targetRole = "Job Overseer";
    } else if (step === "PRODUCT_CONSTRAINT" || step === "") {
      targetRole = "Product Lifecycle Support";
    }

    // Find matching stakeholder by role
    const found = jtbdStakeholders.find(
      (s) => s.role && s.role.toLowerCase().includes(targetRole.toLowerCase())
    );
    if (found) return found.who;

    // Fallback: Job Executor
    const executor = jtbdStakeholders.find(
      (s) => s.role && s.role.toLowerCase().includes("executor")
    );
    return executor ? executor.who : (jtbdStakeholders[0]?.who || "");
  }

  /**
   * Build a list of all stakeholder "who" strings relevant to a given step.
   * Returns an array of stakeholder names (no duplicates, non-empty).
   */
  function resolveStakeholderIds(jobStep) {
    const step = (jobStep || "").toUpperCase();
    const result = [];
    for (const s of jtbdStakeholders) {
      // Always include the primary stakeholder
      const primary = resolveStakeholder(jobStep);
      if (s.who === primary && !result.includes(s.who)) {
        result.unshift(s.who); // primary first
        continue;
      }
      // Include Overseer for EXECUTE/MONITOR (they care about outcomes)
      if ((step === "EXECUTE" || step === "MONITOR") &&
          s.role && s.role.toLowerCase().includes("overseer") &&
          !result.includes(s.who)) {
        result.push(s.who);
      }
      // Include Purchase Executor for cost-related DEFINE needs
      if (step === "DEFINE" &&
          s.role && s.role.toLowerCase().includes("purchase executor") &&
          !result.includes(s.who)) {
        result.push(s.who);
      }
    }
    return result.filter(Boolean);
  }

  // Parse structured data if available.
  // Supports both { entries: [...] } format AND a raw array JSON block.
  let entries = [];
  // Prefer explicit .entries property (object wrapper), else fall back to bare array.
  const rawEntries = (json && !Array.isArray(json) && Array.isArray(json.entries))
    ? json.entries
    : (Array.isArray(json) ? json : null);
  if (rawEntries) {
    entries = rawEntries.map((e) => {
      const stmt = (e.error_statement || "").trim();
      const jobStep = e.job_step_name || jobStepLookup[stmt] || (e.product_related ? "product_constraint" : "");
      return {
        id: "",
        statement: stmt,
        jobStep,
        importance: e.importance,
        satisfaction: e.satisfaction_current,
        opportunity: e.opportunity_score,
        isUnderserved: e.is_underserved,
        isOverserved: e.is_overserved,
        productRelated: e.product_related,
        importanceRationale: "",
        satisfactionRationale: "",
        needsRationale: true,
        primaryStakeholder: resolveStakeholder(jobStep),
        stakeholderIds: resolveStakeholderIds(jobStep),
      };
    });
  }

  // Supplement with rationale from recalibration table
  const recalSection = extractSection(text, "Recalibration Table — Step 06 Needs");
  const recalRows = parseTable(recalSection);
  const recalMap = {};
  recalRows.forEach((r) => {
    const idx = r["#"]?.trim();
    if (idx) {
      recalMap[idx] = {
        satRationale: clean(r["Recalibration Rationale"] || ""),
        satRecal: parseFloat(r["Sat_recal"] || r["Sat_recal"] || "0"),
      };
    }
  });

  // Parse scored needs from Step 3 tables
  const step06Matches = [...text.matchAll(/\| # \| Error Statement[^|]*\| Job Step[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|([\s\S]*?)(?=\n---|\n##)/g)];
  const scoredNeeds06 = [];
  for (const match of step06Matches) {
    const rows = parseTable("| # | Error Statement | Job Step | Error Type | Imp | Sat | Opp | Impact | product_related | Confidence |" + match[1]);
    scoredNeeds06.push(...rows.filter((r) => r["#"]));
  }

  // Also parse from step 3 tables with abbreviated form
  const scoredAbbrevSection = extractSection(text, "Step 06 Needs — Scored") || extractSection(text, "Step 06 Needs");
  let scoredAbbrevRows = parseTable(scoredAbbrevSection);

  // PRN rows
  const prnSection = extractSection(text, "Step 10 Product-Related Needs — Scored") || extractSection(text, "Step 10 Product-Related Needs");
  const prnRows = parseTable(prnSection);

  // Build the complete needs list
  if (entries.length === 0) {
    // Fall back to parsing from scored tables
    entries = scoredAbbrevRows
      .filter((r) => r["#"])
      .map((r) => {
        const imp = parseFloat(r["Imp"] || "0");
        const sat = parseFloat(r["Sat"] || "0");
        const opp = parseFloat(r["Opp"]?.replace(/\*\*/g, "") || "0") || (imp + Math.max(0, imp - sat));
        const stmt = clean(r["Statement (abbreviated)"] || r["Statement"] || "");
        const jobStep = clean(r["Job Step"] || "") || jobStepLookup[stmt] || "";
        return {
          id: r["#"],
          statement: stmt,
          jobStep,
          importance: imp,
          satisfaction: sat,
          opportunity: opp,
          isUnderserved: r["Under?"]?.includes("YES") || false,
          isOverserved: r["Over?"]?.includes("YES") || false,
          productRelated: false,
          primaryStakeholder: resolveStakeholder(jobStep),
          stakeholderIds: resolveStakeholderIds(jobStep),
          importanceRationale: "",
          satisfactionRationale: clean(recalMap[r["#"]]?.satRationale || ""),
          needsRationale: true,
        };
      });

    // Add PRN entries
    const prnEntries = prnRows
      .filter((r) => r["#"])
      .map((r) => {
        const imp = parseFloat(r["Imp"] || "0");
        const sat = parseFloat(r["Sat"] || "0");
        const opp = parseFloat(r["Opp"]?.replace(/\*\*/g, "") || "0") || (imp + Math.max(0, imp - sat));
        const jobStep = "product_constraint";
        return {
          id: r["#"],
          statement: clean(r["Statement (abbreviated)"] || r["Statement"] || ""),
          jobStep,
          importance: imp,
          satisfaction: sat,
          opportunity: opp,
          isUnderserved: r["Under?"]?.includes("YES") || false,
          isOverserved: r["Over?"]?.includes("YES") || false,
          productRelated: true,
          importanceRationale: "",
          satisfactionRationale: clean(recalMap[r["#"]]?.satRationale || ""),
          needsRationale: true,
          primaryStakeholder: resolveStakeholder(jobStep),
          stakeholderIds: resolveStakeholderIds(jobStep),
        };
      });
    entries.push(...prnEntries);
  } else {
    // Augment existing entries with rationale data and stakeholder linkage
    entries = entries.map((e, i) => {
      const idx = String(i + 1);
      const recal = recalMap[idx];
      return {
        ...e,
        satisfactionRationale: recal?.satRationale || e.satisfactionRationale || "",
        needsRationale: !recal?.satRationale,
        primaryStakeholder: e.primaryStakeholder || resolveStakeholder(e.jobStep),
        stakeholderIds: (e.stakeholderIds && e.stakeholderIds.length > 0)
          ? e.stakeholderIds
          : resolveStakeholderIds(e.jobStep),
      };
    });
  }

  // Compute opportunity for any entries where it's missing/zero
  entries = entries.map((e) => ({
    ...e,
    opportunity: e.opportunity || e.importance + Math.max(0, e.importance - e.satisfaction),
  }));

  // Summary stats from markdown
  const summarySection = extractSection(text, "Market ODI Summary");
  const summaryRows = parseTable(summarySection);
  const summaryMap = {};
  summaryRows.forEach((r) => { summaryMap[r["Metric"]?.replace(/\*\*/g, "").trim()] = clean(r["Value"] || ""); });

  // Top 5
  const top5Section = extractSection(text, "Top 5 Opportunities");
  const top5Rows = parseTable(top5Section);
  const top5 = top5Rows.map((r) => ({
    rank: parseInt(r["Rank"] || "0"),
    needId: clean(r["#"] || ""),
    statement: clean(r["Error Statement"] || ""),
    importance: parseFloat(r["Imp"] || "0"),
    satisfaction: parseFloat(r["Sat"] || "0"),
    opportunity: parseFloat(r["Opp"]?.replace(/\*\*/g, "") || "0"),
    zone: clean(r["Zone"] || ""),
  }));

  // Preserve hand-authored importanceRationale values from any existing JSON.
  // This prevents re-running the extractor from wiping rationales that were
  // authored manually or by a downstream agent. Match by statement string.
  const existingOdiPath = path.join(MARKETS_DIR, market.slug, "odi.json");
  if (fs.existsSync(existingOdiPath)) {
    try {
      const existingData = JSON.parse(fs.readFileSync(existingOdiPath, "utf8"));
      const existingByStatement = {};
      for (const n of (existingData.needs || [])) {
        if (n.statement) existingByStatement[n.statement.trim()] = n;
      }
      entries = entries.map((e) => {
        const existing = existingByStatement[e.statement?.trim()];
        if (!existing) return e;
        return {
          ...e,
          // Preserve hand-authored rationale if the extractor would produce empty.
          importanceRationale: e.importanceRationale || existing.importanceRationale || "",
          satisfactionRationale: e.satisfactionRationale || existing.satisfactionRationale || "",
          // Preserve corrected jobStep if existing is a valid Ulwick step.
          jobStep: e.jobStep || existing.jobStep || "",
        };
      });
    } catch (_) { /* ignore parse errors — proceed with fresh extraction */ }
  }

  // Flag entries with missing rationale
  const flaggedCount = entries.filter((e) => !e.importanceRationale).length;

  const data = {
    naicsCode: market.naics,
    marketName: market.name,
    slug: market.slug,
    summary: {
      totalNeeds: parseInt(summaryMap["Total Needs"] || String(entries.length)),
      underservedCount: parseInt(summaryMap["Underserved Count"] || "0"),
      overservedCount: parseInt(summaryMap["Overserved Count"] || "0"),
      avgOpportunityScore: parseFloat(summaryMap["Avg Opportunity Score"] || "0"),
    },
    top5Opportunities: top5,
    needs: entries,
    flaggedRationalesCount: flaggedCount,
    sources,
  };

  write(path.join(MARKETS_DIR, market.slug, "odi.json"), data);
  return data;
}

// ─────────────────────────────────────────────
// VN — per market
// ─────────────────────────────────────────────

function extractVN(market) {
  const file = path.join(SECTIONS_DIR, `VN_${market.fileKey}.md`);
  if (!fs.existsSync(file)) {
    console.warn(`  VN file not found: ${file}`);
    return null;
  }

  const text = read(file);
  const json = extractJSON(text);
  const sources = parseSources(text, `VN-${market.slug.toUpperCase()}`);

  // Header — try "## Header" table first (Format A), then fall back to inline fields (Format B)
  const headerRows = parseTable(extractSection(text, "Header"));
  const headerMap = {};
  headerRows.forEach((r) => { headerMap[r["Field"]?.replace(/\*\*/g, "").trim()] = clean(r["Value"] || ""); });

  // Also parse ## Metadata and ## Input Context tables (Assa Abloy format variants)
  // These tables use bolded field names like "**Architecture Distance**" and "**NAICS code**"
  for (const sectionName of ["Metadata", "Input Context"]) {
    const rows = parseTable(extractSection(text, sectionName));
    rows.forEach((r) => {
      const key = (r["Field"] || r[Object.keys(r)[0]] || "").replace(/\*\*/g, "").trim();
      const val = clean(r["Value"] || r[Object.keys(r)[1]] || "");
      if (key && val && !headerMap[key]) headerMap[key] = val;
    });
  }
  // Normalise architecture-distance key (case-insensitive → canonical "Architecture Distance")
  if (!headerMap["Architecture Distance"]) {
    const archKey = Object.keys(headerMap).find((k) => k.toLowerCase() === "architecture distance");
    if (archKey) {
      const raw = headerMap[archKey];
      // Extract leading integer (e.g. "3 — MEDIUM…" → "3", "2 (adjacent…)" → "2")
      headerMap["Architecture Distance"] = (raw.match(/^(\d+)/) || ["", ""])[1] || raw.split(/[\s—(]/)[0];
    }
  }

  // Format B files have no ## Header table — extract fields from other sections
  if (!headerMap["CFJ"]) {
    // Try ## Industry Context table (data-processing-hosting)
    const ctxRows = parseTable(extractSection(text, "Industry Context"));
    ctxRows.forEach((r) => { headerMap[r["Field"]?.replace(/\*\*/g, "").trim()] = clean(r["Value"] || ""); });
    // Try ## Core Functional Job (L7) table
    const cfjRows = parseTable(extractSection(text, "Core Functional Job"));
    cfjRows.forEach((r) => { headerMap[r["Field"]?.replace(/\*\*/g, "").trim()] = clean(r["Value"] || ""); });
    // Remap known alternate keys to canonical names
    if (!headerMap["CFJ"] && headerMap["CFJ statement"]) headerMap["CFJ"] = headerMap["CFJ statement"];
    if (!headerMap["Architecture Distance"] && headerMap["Architecture distance"]) {
      headerMap["Architecture Distance"] = headerMap["Architecture distance"].split(" ")[0];
    }
    // ac-home-heating: CFJ in bold paragraph under ## Core Functional Job (L7)
    if (!headerMap["CFJ"]) {
      const cfjSection = extractSection(text, "Core Functional Job");
      const cfjMatch = cfjSection.match(/\*\*CFJ Statement:\*\*\s*([^\n]+)/i)
        || cfjSection.match(/CFJ Statement:\s*([^\n]+)/i);
      if (cfjMatch) {
        headerMap["CFJ"] = clean(cfjMatch[1]);
      } else {
        // Also handle blockquote format: > Operate and maintain...
        const bqMatch = cfjSection.match(/^>\s*(.+)/m);
        if (bqMatch) headerMap["CFJ"] = clean(bqMatch[1]);
      }
    }
    // Assa Abloy format: ## CFJ Statement section with a blockquote
    // e.g.  > Provide paid temporary accommodation...
    if (!headerMap["CFJ"]) {
      const cfjSection = extractSection(text, "CFJ Statement");
      const bqMatch = cfjSection.match(/^>\s*(.+)/m);
      if (bqMatch) headerMap["CFJ"] = clean(bqMatch[1]);
    }
    // Assa Abloy inline bold CFJ pattern (data_centers, lessors, warehousing):
    //   **CFJ (industry-level):** Deliver continuous, secure...
    //   **Core Functional Job (L7):** Diagnose, treat...
    if (!headerMap["CFJ"]) {
      const inlineMatch = text.match(/\*\*CFJ[^*:]*:\*\*\s*([^\n]+)/i)
        || text.match(/\*\*Core Functional Job[^*:]*:\*\*\s*([^\n]+)/i);
      if (inlineMatch) headerMap["CFJ"] = clean(inlineMatch[1]);
    }
    // ac-home-heating: output types from ## Output Types table
    if (!headerMap["Output Types"]) {
      const otSection = extractSection(text, "Output Types");
      const otRows = parseTable(otSection);
      if (otRows.length > 0) {
        headerMap["Output Types"] = otRows.map((r) => clean(r["Output Type"] || r["Name"] || Object.values(r)[1] || "")).filter(Boolean).join(";");
      }
    }
    // data-processing-hosting: output type focus
    if (!headerMap["Output Types"] && headerMap["Output type focus"]) {
      headerMap["Output Types"] = headerMap["Output type focus"];
    }
    // Assa Abloy format: output types from the Step A.4 activation matrix column headers
    // The matrix has output-type abbreviation columns (FS, SS, BU, ES) with a legend line.
    // Extract the legend: "**FS** = Full-service | **SS** = Select-service | ..."
    if (!headerMap["Output Types"]) {
      const activationSection = extractSection(text, "Step A.4") || extractAnySection(text, "Output Type Activation");
      if (activationSection) {
        // Parse "**ABBREV** = Full name" pairs from the legend line
        const legendPairs = [...activationSection.matchAll(/\*\*([A-Z]{2,})\*\*\s*=\s*([^|]+)/g)];
        if (legendPairs.length > 0) {
          headerMap["Output Types"] = legendPairs.map((m) => clean(m[2])).join(";");
        }
      }
    }
    // Architecture distance: extract numeric part if present (e.g. "4 (adjacent...)")
    if (!headerMap["Architecture Distance"] && headerMap["Architecture distance"]) {
      headerMap["Architecture Distance"] = headerMap["Architecture distance"].replace(/\s.*/, "");
    }
    // Assa Abloy format: architecture distance from inline header metadata
    // e.g. first lines of file: "**Architecture Distance:** 4" or from bold key-value in any section
    if (!headerMap["Architecture Distance"]) {
      const archMatch = text.match(/\*\*Architecture Distance[:\*]*\s*\*?\*?\s*(\d+)/i)
        || text.match(/Architecture Distance[:\s]+(\d+)/i);
      if (archMatch) headerMap["Architecture Distance"] = archMatch[1];
    }
  }

  // ── L6 systems extraction — handles two markdown formats ─────────────────
  //
  // Format A ("System-of-Systems Decomposition"):
  //   ## L6 — System-of-Systems Decomposition
  //   | L6 ID | Name | Type | Job Family |
  //   | L6.1  | ...  | Core | ...        |
  //
  // Format B1 (multiple per-category headings, e.g. ac-home-heating):
  //   ## L6 — Core Process Steps (Sequential)
  //   | L6 | Name | Job Family | Output Types |
  //   | L6a | Sheet Metal Fabrication | ... | ... |
  //   ## L6 — Horizontal Process Steps
  //   | L6 | Name | Job Family | Scope |
  //   | L6(H1) | Quality Assurance | ... | ... |
  //
  // Format B2 (sub-headings under single L6 section, e.g. data-processing-hosting):
  //   ## L6 — Process Steps
  //   ### Core (sequential)
  //   | ID | Name | Job family | Activates for output types |
  //   | L6a | Facility Provisioning | ... | ... |
  //   ### Horizontal (parallel, cross-cutting) — marked (H)
  //   | ID | Name | Role |
  //   | L6f (H) | ... | ... |

  let l6Systems = [];

  // Try Format A first — exact heading "L6 — System-of-Systems Decomposition"
  const l6SectionA = extractSection(text, "L6 — System-of-Systems Decomposition");
  if (l6SectionA) {
    const l6Rows = parseTable(l6SectionA);
    l6Systems = l6Rows.map((r) => ({
      id: clean(r["L6 ID"] || ""),
      name: clean(r["Name"] || ""),
      type: clean(r["Type"] || ""),
      jobFamily: clean(r["Job Family"] || ""),
      l5Units: [],
    })).filter((r) => r.id);
  } else if (extractSection(text, "L6 Core Process Steps") ||
             extractAnySection(text, "L6 Core Process Steps") ||
             extractAnySection(text, "A.1: L6 Core") ||
             extractAnySection(text, "A.1 — L6 Core") ||
             extractAnySection(text, "A.2 — L6 Core") ||
             extractAnySection(text, "A.2: L6 Core")) {
    // Assa Abloy format variants — all use a core-steps section + horizontal-steps section.
    // Supported heading patterns (at ## or ### level):
    //   "Step A.1 — L6 Core Process Steps"      (hotels_motels, at ## level)
    //   "Phase 1 — A.1: L6 Core Process Steps"  (lessors, data_centers, at ## level)
    //   "Step A.2 — L6 Core Process Steps"       at ### level (hospitals, warehousing)
    //   "L6 Core Process Steps"                  (facilities_support_services, at ## level)
    // Horizontal variants: A.2 or A.3 containing "horizontal"

    // Helper: parse L6 rows from a section body into l6Systems
    const parseL6Rows = (section, isHorizontal) => {
      if (!section) return;
      const rows = parseTable(section);
      for (const r of rows) {
        // ID column may be "Node", "#", "ID", "L6", or "L6 ID"
        const id = clean(r["Node"] || r["#"] || r["ID"] || r["L6"] || r["L6 ID"] || "");
        const name = clean(r["Name"] || "");
        // Skip rows that don't represent L6-level entries (e.g. L7 ecosystem rows)
        if (!id || !name) continue;
        // Require that the id starts with L6 (or is a recognisable L6 code like L6a, L6H1, etc.)
        if (!id.match(/^L6/i)) continue;
        const jobFamily = clean(
          r["Job family"] || r["Job Family"] || r["Notes"] || r["Why horizontal"] ||
          r["Distinction from Core"] || r["Runs Across"] || r["Regulatory anchor"] || ""
        );
        const type = isHorizontal ? "Horizontal" : "Core";
        l6Systems.push({ id, name, type, jobFamily, ...(isHorizontal ? { isHorizontal: true } : {}), l5Units: [] });
      }
    };

    // Find the L6 core process steps section — try multiple heading patterns
    const coreSection = extractAnySection(text, "A.1 — L6 Core") ||
                        extractAnySection(text, "A.1: L6 Core") ||
                        extractAnySection(text, "A.2 — L6 Core") ||
                        extractAnySection(text, "A.2: L6 Core") ||
                        extractSection(text, "L6 Core Process Steps");
    parseL6Rows(coreSection, false);

    // Try horizontal process steps section — multiple heading patterns:
    //   "Step A.2 — L6 Horizontal Process Steps"  (hotels_motels)
    //   "Phase 1 — A.2: L6 Horizontal Functions"  (lessors, data_centers)
    //   "Step A.3 — L6 Horizontal Process Steps"  at ### level (warehousing, hospitals)
    //   "L6 Horizontal Functions" / "L6 Horizontal Process Steps" (facilities_support_services)
    //
    // Strategy: scan all headings in the doc for one containing "horizontal" at L6-step level.
    {
      // Split on any ##/### heading prefix; each element is "heading\nbody"
      const headingChunks = ("\n" + text).split(/\n#{2,4} /);
      for (let ci = 1; ci < headingChunks.length; ci++) {
        const firstNewline = headingChunks[ci].indexOf("\n");
        if (firstNewline === -1) continue;
        const headingLine = headingChunks[ci].slice(0, firstNewline).toLowerCase();
        if (!headingLine.includes("horizontal")) continue;
        // Skip BOM-related sections
        if (headingLine.includes("b.2") || headingLine.includes("b.1") ||
            headingLine.includes("l4") || headingLine.includes("l5")) continue;
        const body = headingChunks[ci].slice(firstNewline + 1);
        parseL6Rows(body, true);
        break; // only parse the first matching horizontal section
      }
    }
  } else {
    // Format B: one or more ## L6 — <title> sections that are NOT the canonical Format A heading.
    //
    // Two sub-variants:
    //   B1 (multiple sibling sections, e.g. ac-home-heating):
    //       ## L6 — Core Process Steps (Sequential)   ← section 1, rows have "L6" first column
    //       ## L6 — Horizontal Process Steps           ← section 2, rows have "L6" first column
    //
    //   B2 (single section with ### sub-headings, e.g. data-processing-hosting):
    //       ## L6 — Process Steps
    //       ### Core (sequential)                      ← sub-section, rows have "ID" first column
    //       ### Horizontal (parallel …) — marked (H)  ← sub-section, rows have "ID" first column
    //
    // Strategy: split text on every ## heading boundary, find sections whose title starts "L6 —",
    // then parse their content (handling ### sub-headings for Format B2).

    // Split on "## " heading boundaries (non-greedy, from one ## to the next ## or end of string).
    // Using (?=\n## ) lookahead avoids the m-flag $ ambiguity.
    const l6SectionRe = /## (L6 —[^\n]+)\n([\s\S]*?)(?=\n## |\n# |(?!\s*\S))/g;
    // Simpler approach: split entire text by "\n## " and process chunks.
    const chunks = ("\n" + text).split("\n## ");
    for (const chunk of chunks) {
      const headingEnd = chunk.indexOf("\n");
      if (headingEnd === -1) continue;
      const heading = chunk.slice(0, headingEnd).trim().toLowerCase();
      if (!heading.startsWith("l6 —")) continue;
      const body = chunk.slice(headingEnd + 1);

      // Check for ### sub-headings inside this section (Format B2)
      // Split body by "\n### "
      const subChunks = ("\n" + body).split("\n### ");
      let foundSubHeadings = false;
      for (let i = 1; i < subChunks.length; i++) {
        // Only count chunks after the first (which is pre-### content)
        foundSubHeadings = true;
        const subChunk = subChunks[i];
        const subHeadingEnd = subChunk.indexOf("\n");
        if (subHeadingEnd === -1) continue;
        const subHeading = subChunk.slice(0, subHeadingEnd).trim().toLowerCase();
        const subBody = subChunk.slice(subHeadingEnd + 1);
        const category = subHeading.startsWith("horizontal") ? "horizontal" : "core";
        const rows = parseTable(subBody);
        for (const r of rows) {
          const id = clean(r["ID"] || r["L6"] || r["L6 ID"] || "");
          const name = clean(r["Name"] || "");
          const jobFamily = clean(r["Job family"] || r["Job Family"] || r["Role"] || "");
          const scope = clean(r["Activates for output types"] || r["Scope"] || r["Output Types"] || "");
          if (id) l6Systems.push({ id, name, type: category === "horizontal" ? "Horizontal" : "Core", jobFamily, scope, category, l5Units: [] });
        }
      }

      if (!foundSubHeadings) {
        // Format B1: parse the table directly from the section body
        const category = heading.includes("horizontal") ? "horizontal" : "core";
        const rows = parseTable(body);
        for (const r of rows) {
          const id = clean(r["L6"] || r["L6 ID"] || r["ID"] || "");
          const name = clean(r["Name"] || "");
          const jobFamily = clean(r["Job family"] || r["Job Family"] || r["Role"] || "");
          const scope = clean(r["Activates for output types"] || r["Scope"] || r["Output Types"] || "");
          if (id) l6Systems.push({ id, name, type: category === "horizontal" ? "Horizontal" : "Core", jobFamily, scope, category, l5Units: [] });
        }
      }
    }
  }

  // Extract VN units from JSON if available
  let vnUnits = [];
  if (json?.vn_units) {
    vnUnits = json.vn_units.map((u) => ({
      level: u.level || "",
      id: u.id || "",
      name: u.name || "",
      functionalJob: u.functional_job || u.job_family || "",
      description: u.description || "",
      dependencies: u.dependencies || [],
    }));
  } else {
    // Parse from markdown L5 section headers (Format A/B: #### L5.x.x: Name)
    const l5Matches = [...text.matchAll(/#### (L5\.[^:]+): ([^\n]+)\n\n([^\n]+)/g)];
    for (const m of l5Matches) {
      vnUnits.push({
        level: "L5",
        id: m[1].trim(),
        name: m[2].trim(),
        functionalJob: m[3].trim(),
        description: "",
        dependencies: [],
      });
    }

    // Assa Abloy format: ## Step A.3 — L5 Equipment per L6 Node
    // Contains ### L6x — <name> subsections, each with a table:
    //   | L5 | Alternatives | Share | Confidence | Source |
    //   | Property Management System | Oracle Opera | 35% | MEDIUM | ... |
    //   |  | Cloudbeds | 15% | | |          ← continuation rows (empty L5 col)
    //   | Revenue Management System | IDeaS (SAS) | 30% | LOW | ... |
    if (vnUnits.length === 0) {
      // Try all known L5 equipment section heading patterns using extractSection (stops at ##)
      // so that ### L6x subsections are included in the body.
      //   "Step A.3 — L5 Equipment per L6 Node"   (hotels_motels, at ## level)
      //   "Phase 1 — A.3: L5 Equipment per L6 Node"  (lessors, at ## level)
      //   "L5 Equipment per L6 Node"               (facilities_support_services, at ## level)
      //   "Step A.4 — L5 Equipment per L6 Node"   (warehousing — at ### level, so use full text scan)
      let equipSection = extractSection(text, "Step A.3") ||
                         extractSection(text, "Phase 1 — A.3") ||
                         extractSection(text, "L5 Equipment per L6 Node");
      // For files where the L5 section is at ### level (e.g. warehousing), do a full-text scan.
      // We split the full text on ## boundaries and look for a ## section that contains ### L6 headings
      // with L5 equipment tables.
      if (!equipSection) {
        // Scan ## sections for one that contains ### L6 headings followed by equipment tables
        const hashChunks = ("\n" + text).split("\n## ");
        for (let hci = 1; hci < hashChunks.length; hci++) {
          const hChunk = hashChunks[hci];
          const hEnd = hChunk.indexOf("\n");
          if (hEnd === -1) continue;
          const hHeading = hChunk.slice(0, hEnd).toLowerCase();
          // Must be an L5 equipment / A.3 / A.4 section heading
          if (!hHeading.match(/l5 equip|a\.3|a\.4/i)) continue;
          // Check that it contains ### L6 subsections
          if (!hChunk.match(/\n#{3,4} L6/i)) continue;
          equipSection = hChunk.slice(hEnd + 1);
          break;
        }
      }
      if (equipSection) {
        // Split into per-L6 subsections on "### L6" or "#### L6" headings.
        // We need to find the right heading level: in some files L6 subsections are ###,
        // in others they are ####. Detect the level by scanning for the first L6 heading.
        const firstL6LevelMatch = equipSection.match(/\n(#{3,4}) L6/i);
        const l6HeadingPattern = firstL6LevelMatch
          ? new RegExp(`\n${firstL6LevelMatch[1]} `)
          : /\n#{3,4} /;
        const l6SubChunks = ("\n" + equipSection).split(l6HeadingPattern);
        for (let ci = 1; ci < l6SubChunks.length; ci++) {
          const chunk = l6SubChunks[ci];
          const headingEnd = chunk.indexOf("\n");
          if (headingEnd === -1) continue;
          const l6Heading = chunk.slice(0, headingEnd).trim(); // e.g. "L6a — Demand Management & Reservations"
          // Only process L6-level subsections (skip non-L6 headings like "Property Management System → L4")
          if (!l6Heading.match(/^L6/i)) continue;
          const l6Id = l6Heading.match(/^(L6[a-zA-Z0-9H-]+)/i)?.[1] || `L6.${ci}`;
          const body = chunk.slice(headingEnd + 1);

          let currentL5Name = "";
          let currentAlts = [];
          let l5Counter = 0;

          const flushUnit = () => {
            if (!currentL5Name) return;
            l5Counter++;
            // Check if product (Türwächter / GfS) is one of the alternatives
            const isPrimaryPosition = currentAlts.some(
              (a) => /türwächter|tuerwächter|gfs|assa abloy/i.test(a.name)
            );
            vnUnits.push({
              level: "L5",
              id: `${l6Id}.${l5Counter}`,
              name: currentL5Name,
              functionalJob: "",
              description: "",
              parentL6: l6Id,
              dependencies: [],
              isPrimaryPosition,
              alternatives: currentAlts,
            });
            currentAlts = [];
          };

          // Check if L5 units are identified by "#### L5: <name>" sub-headings
          // (facilities_support_services format) OR by the "L5" column in a table
          // (hotels_motels, warehousing format).
          const l5SubChunks = ("\n" + body).split(/\n#{4,5} L5:\s*/i);
          if (l5SubChunks.length > 1) {
            // "#### L5: <name>" format — each chunk starts with the L5 name
            for (let li = 1; li < l5SubChunks.length; li++) {
              const l5Chunk = l5SubChunks[li];
              const l5End = l5Chunk.indexOf("\n");
              if (l5End === -1) continue;
              currentL5Name = l5Chunk.slice(0, l5End).trim();
              currentAlts = [];
              const l5Body = l5Chunk.slice(l5End + 1);
              // Parse alternative table in this L5 section
              const altRows = parseTable(l5Body);
              for (const r of altRows) {
                // In this format the first column IS the alternative name
                const altName = clean(r["Alternative"] || Object.values(r)[0] || "");
                if (!altName) continue;
                const shareStr = (r["Share"] || "").replace(/[~%]/g, "").trim();
                const sharePct = parseFloat(shareStr) || 0;
                const confidence = clean(r["Confidence"] || "").toUpperCase();
                const source = clean(r["Source"] || "");
                const isPrimary = /türwächter|tuerwächter|gfs|assa abloy/i.test(altName);
                currentAlts.push({ name: altName, sharePct, confidence, source, isPrimary });
              }
              flushUnit();
            }
          } else {
            // "L5 | Alternatives | Share" table format — L5 column holds equipment name
            const rows = parseTable(body);
            for (const r of rows) {
              const l5Col = clean(r["L5"] || "");
              const altCol = clean(r["Alternatives"] || r["Alternative"] || "");
              const shareStr = (r["Share"] || "").replace(/[~%]/g, "").trim();
              const sharePct = parseFloat(shareStr) || 0;
              const confidence = clean(r["Confidence"] || "").toUpperCase();
              const source = clean(r["Source"] || "");

              if (l5Col) {
                // New L5 equipment entry
                flushUnit();
                currentL5Name = l5Col;
                if (altCol) {
                  // First alternative is on the same row as the L5 name
                  const isPrimary = /türwächter|tuerwächter|gfs|assa abloy/i.test(altCol);
                  currentAlts.push({ name: altCol, sharePct, confidence, source, isPrimary });
                }
              } else if (altCol && currentL5Name) {
                // Continuation row — additional alternative for the current L5 equipment
                const isPrimary = /türwächter|tuerwächter|gfs|assa abloy/i.test(altCol);
                currentAlts.push({ name: altCol, sharePct, confidence, source, isPrimary });
              }
            }
            flushUnit(); // flush last unit in section
          }
        }
      }
    }
  }

  // Vendor position (look for "PRIMARY POSITION", "GfS", or "ASSA ABLOY" in text)
  const positionMatch = text.match(/\*\*GfS[^*]+\*\*|GfS PRIMARY POSITION[^\n]*|\*\*ASSA ABLOY[^*]+\*\*|PRIMARY POSITION[^\n]*/i);
  const marquardtPosition = positionMatch ? clean(positionMatch[0]) : "";

  // Strategic position from JSON
  let strategicPosition = null;
  if (json?.strategic_position) {
    strategicPosition = json.strategic_position;
  } else if (json?.vn_hierarchy_score != null) {
    strategicPosition = { score: json.vn_hierarchy_score };
  }

  const data = {
    naicsCode: market.naics,
    marketName: market.name,
    slug: market.slug,
    coreJobStatement: headerMap["CFJ"] || "",
    outputTypes: (headerMap["Output Types"] || "").split(";").map((s) => s.trim()).filter(Boolean),
    hierarchy: headerMap["Hierarchy"] || "",
    architectureDistance: parseInt(headerMap["Architecture Distance"] || "0"),
    marketSize: headerMap["Market Size"] || "",
    l6Systems,
    vnUnits,
    marquardtPosition,
    strategicPosition,
    sources,
  };

  write(path.join(MARKETS_DIR, market.slug, "valueNetwork.json"), data);
  return data;
}

// ─────────────────────────────────────────────
// FIT / Kano — per market
// ─────────────────────────────────────────────

function extractKano(market) {
  const file = path.join(SECTIONS_DIR, `FIT_${market.fileKey}.md`);
  if (!fs.existsSync(file)) {
    console.warn(`  FIT file not found: ${file}`);
    return null;
  }

  const text = read(file);
  const sources = parseSources(text, `FIT-${market.slug.toUpperCase()}`);

  // Step 09a table
  const step09Section = extractSection(text, "09a — Per-Market Kano + ODI Fit Scoring");
  const kanoRows = parseTable(step09Section);

  const features = kanoRows.map((r) => {
    const featureName = clean(r["Feature"] || "");
    const kano = clean(r["Kano"] || "");
    const overall = parseFloat(r["Overall"]?.replace(/\*\*/g, "") || "0");

    return {
      featureName,
      kanoClassification: kano,
      scores: {
        time: parseFloat(r["Time"] || "0"),
        cost: parseFloat(r["Cost"] || "0"),
        safety: parseFloat(r["Safety"] || "0"),
        reliability: parseFloat(r["Reliab."] || r["Reliability"] || "0"),
        skill: parseFloat(r["Skill"] || "0"),
        stress: parseFloat(r["Stress"] || "0"),
        pain: parseFloat(r["Pain"] || "0"),
        confidence: parseFloat(r["Confid."] || r["Confidence"] || "0"),
        delight: parseFloat(r["Delight"] || "0"),
        overall,
      },
    };
  }).filter((f) => f.featureName && f.kanoClassification);

  // Step 09a rationales
  const rationaleSection = extractSection(text, "09a — Rationales");
  const rationales = {};
  // Each feature has a bold header like "**Feature Name** — ..."
  const rationaleParts = rationaleSection.split(/\n(?=\*\*[^*]+\*\*)/);
  for (const part of rationaleParts) {
    const nameMatch = part.match(/^\*\*([^*]+)\*\*/);
    if (nameMatch) {
      const name = nameMatch[1].trim();
      const text2 = part.replace(/^\*\*[^*]+\*\*\s*—?\s*/, "").trim();
      rationales[name] = text2;
    }
  }

  // Step 10 product-related needs
  const prn10Section = extractSection(text, "10a — Generated Needs");
  const prnRows = parseTable(prn10Section);
  const prnNeeds = prnRows.map((r) => ({
    id: clean(r["#"] || ""),
    statement: clean(r["Statement"] || ""),
    sourceConstraint: clean(r["Source Constraint"] || ""),
    importance: parseFloat(r["Imp"] || "0"),
    satisfaction: parseFloat(r["Sat"] || "0"),
  })).filter((r) => r.id);

  // Rationales for step 10
  const prn10RationaleSection = extractSection(text, "10a — Rationales");
  const prnRationales = {};
  const prnParts = prn10RationaleSection.split(/\n(?=\*\*PRN-\d+)/);
  for (const part of prnParts) {
    const nameMatch = part.match(/^\*\*(PRN-\d+)[^*]*\*\*/);
    if (nameMatch) {
      prnRationales[nameMatch[1]] = part.replace(/^\*\*[^*]+\*\*\s*:?\s*/, "").trim();
    }
  }

  const data = {
    naicsCode: market.naics,
    marketName: market.name,
    slug: market.slug,
    features: features.map((f) => ({
      ...f,
      rationale: rationales[f.featureName] || "",
    })),
    avgOverallFit: features.length > 0
      ? parseFloat((features.reduce((s, f) => s + f.scores.overall, 0) / features.length).toFixed(2))
      : 0,
    productRelatedNeeds: prnNeeds.map((n) => ({
      ...n,
      rationale: prnRationales[n.id] || "",
    })),
    sources,
  };

  write(path.join(MARKETS_DIR, market.slug, "kano.json"), data);
  return data;
}

// ─────────────────────────────────────────────
// COMPAT — per market
// ─────────────────────────────────────────────

function extractCompat(market) {
  const file = path.join(SECTIONS_DIR, `COMPAT_${market.fileKey}.md`);
  if (!fs.existsSync(file)) {
    console.warn(`  COMPAT file not found: ${file}`);
    return null;
  }

  const text = read(file);
  const sources = parseSources(text, `COMPAT-${market.slug.toUpperCase()}`);
  const json = extractJSON(text);

  // Context
  const ctxRows = parseTable(extractSection(text, "Market Context"));
  const ctxMap = {};
  ctxRows.forEach((r) => { ctxMap[r["Field"]?.replace(/\*\*/g, "").trim()] = clean(r["Value"] || ""); });

  // Summary table
  const summarySection = extractSection(text, "Summary Table") || extractSection(text, "Constraint Assessments");
  const summaryRows = parseTable(summarySection);

  let assessments = [];
  if (json?.assessments) {
    assessments = json.assessments.map((a) => ({
      constraintName: a.constraint_name || a.name || "",
      constraintType: a.constraint_type || "",
      threshold: a.threshold_value || "",
      verdict: a.verdict || "",
      rationale: a.rationale || "",
      mitigation: a.mitigation_actions ? a.mitigation_actions.join("; ") : (a.mitigation || ""),
      mitigationCost: a.mitigation_cost || "",
      mitigationTime: a.mitigation_time || "",
    }));
  } else {
    assessments = summaryRows.map((r) => ({
      constraintName: clean(r["Constraint"] || ""),
      constraintType: clean(r["Type"] || ""),
      threshold: clean(r["Threshold"] || ""),
      verdict: clean(r["Verdict"] || "").toLowerCase().replace(/\*\*/g, ""),
      rationale: clean(r["Rationale"] || ""),
      mitigation: "",
      mitigationCost: "",
      mitigationTime: "",
    })).filter((a) => a.constraintName);
  }

  // Result
  const resultSection = extractSection(text, "Result");
  const resultRows = parseTable(resultSection);
  const resultMap = {};
  resultRows.forEach((r) => { resultMap[r["Field"]?.replace(/\*\*/g, "").trim()] = clean(r["Value"] || ""); });

  const data = {
    naicsCode: market.naics,
    marketName: market.name,
    slug: market.slug,
    operatingMedium: ctxMap["Operating Medium"] || "",
    architectureDistance: parseInt(ctxMap["Architecture Distance"] || "0"),
    assessments,
    result: {
      knockouts: parseInt(resultMap["Knockouts"] || "0"),
      mitigable: parseInt(resultMap["Mitigable"] || "0"),
      none: parseInt(resultMap["None"] || "0"),
      marketStatus: resultMap["Market Status"] || "SURVIVING",
      totalMitigationCost: resultMap["Total Mitigation Cost"] || "",
      totalMitigationTime: resultMap["Total Mitigation Time"] || "",
    },
    sources,
  };

  write(path.join(MARKETS_DIR, market.slug, "compatibility.json"), data);
  return data;
}

// ─────────────────────────────────────────────
// BOM — per market
// ─────────────────────────────────────────────

function extractBOM(market) {
  const fileInSections = path.join(SECTIONS_DIR, `BOM_${market.fileKey}.md`);
  const fileInArchive  = path.join(ARCHIVE_DIR,  `BOM_${market.fileKey}.md`);
  const file = fs.existsSync(fileInSections) ? fileInSections
             : fs.existsSync(fileInArchive)  ? fileInArchive
             : null;
  if (!file) {
    // No BOM file — write a stub with dataPending: true
    const stub = {
      slug: market.slug,
      marketName: market.name,
      naicsCode: market.naics,
      confidence: "low",
      dataPending: true,
      sensorNote: "",
      outputTypes: [],
      marquardtAnchorIds: [],
      l4Subsystems: [],
    };
    write(path.join(MARKETS_DIR, market.slug, "bom.json"), stub);
    return stub;
  }

  const text = read(file);

  // ── Routing confirmation context ──────────────────────────────────────────
  const routingSection = extractSection(text, "Routing Confirmation");
  const routingRows = parseTable(routingSection);
  const routingMap = {};
  routingRows.forEach((r) => {
    const key = (r["Check"] || r[Object.keys(r)[0]] || "").replace(/\*\*/g, "").trim();
    routingMap[key] = clean(r["Result"] || r[Object.keys(r)[1]] || "");
  });

  // ── L4 Subsystems — parse from "## B.1 — L4 Subsystems" and "## B.2 + B.3" ─
  // Parse B.1 first: extract the ASCII-art tree to get L4 names
  const b1Section = extractSection(text, "B.1 — L4 Subsystems") || extractAnySection(text, "L4 Subsystems");

  // Extract L4 names from the code block (tree diagram)
  const codeBlock = b1Section.match(/```[\s\S]*?```/);
  const l4Names = [];
  if (codeBlock) {
    const treeLines = codeBlock[0].split("\n");
    for (const line of treeLines) {
      const l4Match = line.match(/\+--\s+(L4\s+[^\n]+)/);
      if (l4Match) {
        // First line of L4 entry is the name
        const rawName = l4Match[1].replace(/^L4\s+/, "").trim();
        // Remove trailing notes like "PRIMARY FUNCTIONAL CORE"
        const namePart = rawName.split(/\s+[A-Z]{4,}[\s.]*/)[0].trim();
        l4Names.push(namePart || rawName);
      }
    }
  }

  // Parse B.2+B.3 section for L4 subsystems with alternatives
  // Find all "### L4: <name>" subsections
  const l4Subsystems = [];
  const b2b3Section = extractAnySection(text, "B.2") || "";
  const fullText = b1Section + "\n" + b2b3Section + "\n" + text;

  // Split the full text on "### L4:" headings
  const l4Chunks = ("\n" + fullText).split(/\n### L4:/);
  const seenNames = new Set();

  for (let i = 1; i < l4Chunks.length; i++) {
    const chunk = l4Chunks[i];
    const headingEnd = chunk.indexOf("\n");
    if (headingEnd === -1) continue;
    const name = chunk.slice(0, headingEnd).trim();
    if (seenNames.has(name)) continue;
    seenNames.add(name);

    const body = chunk.slice(headingEnd + 1);

    // Parse "L4 Alternatives" table immediately after the heading
    const altTableMatch = body.match(/\*\*L4 Alternatives[^*]*\*\*\s*\n([\s\S]*?)(?=\n>|\n---|\n#####|\n####|\n###|\n##|\n+\*\*L1)/);
    const alternatives = [];
    if (altTableMatch) {
      const altRows = parseTable(altTableMatch[1]);
      for (const r of altRows) {
        const altName = clean(r["Alternative"] || "");
        if (!altName) continue;
        const shareStr = r["Share"] || "0";
        const sharePct = parseFloat(shareStr.replace(/[~%]/g, "")) || 0;
        const trend = clean(r["Trend"] || "stable").toLowerCase();
        alternatives.push({ name: altName, sharePct, trend });
      }
    }

    // Extract market implication note (blockquote)
    const implicationMatch = body.match(/^>\s*\*\*[^*]+implication[^:]*:\*\*\s*([^\n]+)/im)
      || body.match(/^>\s*\*\*[^*]+:\*\*\s*([^\n]+)/im);
    const implication = implicationMatch ? clean(implicationMatch[1]) : "";

    // Modules: find all "#### L3: <name>" sub-sections in this L4 chunk
    const modules = [];
    const l3Chunks = ("\n" + body).split(/\n#### L3:/);
    for (let j = 1; j < l3Chunks.length; j++) {
      const l3Chunk = l3Chunks[j];
      const l3End = l3Chunk.indexOf("\n");
      if (l3End === -1) continue;
      const l3Name = l3Chunk.slice(0, l3End).trim();
      const l3Body = l3Chunk.slice(l3End + 1);

      // Parse L3 alternatives table (stop before any L1→L0 block, L2 heading, or section break)
      const l3AltMatch = l3Body.match(/\*\*L3 Alternatives[^*]*\*\*\s*\n([\s\S]*?)(?=\n>|\n---|\n#####|\n####|\n###|\n##|\n+\*\*L1)/);
      const l3Alternatives = [];
      if (l3AltMatch) {
        const l3AltRows = parseTable(l3AltMatch[1]);
        for (const r of l3AltRows) {
          const aName = clean(r["Alternative"] || "");
          if (!aName) continue;
          const shareStr = r["Share"] || "0";
          const sPct = parseFloat(shareStr.replace(/[~%]/g, "")) || 0;
          const trend = clean(r["Trend"] || "stable").toLowerCase();
          l3Alternatives.push({ name: aName, sharePct: sPct, trend });
        }
      }

      // Parse L2 children: "##### L2: <name>" heading OR "**L2: <name>**" bold label
      const l2Children = [];
      // Normalise both formats into a single split token: replace "**L2: " with "\n##### L2: "
      const l3BodyNorm = ("\n" + l3Body).replace(/\n\*\*L2:\s*/g, "\n##### L2: ");
      const l2Chunks = l3BodyNorm.split(/\n##### L2:/);
      for (let k = 1; k < l2Chunks.length; k++) {
        const l2Chunk = l2Chunks[k];
        // For bold format, the name ends at "**"; for heading format, at end-of-line.
        let l2Name, l2Body;
        const boldEnd = l2Chunk.indexOf("**");
        const lineEnd  = l2Chunk.indexOf("\n");
        if (boldEnd !== -1 && (lineEnd === -1 || boldEnd < lineEnd)) {
          // Bold format: name is up to the closing "**"
          l2Name = l2Chunk.slice(0, boldEnd).trim();
          l2Body = l2Chunk.slice(boldEnd + 2); // skip closing **
        } else {
          if (lineEnd === -1) continue;
          l2Name = l2Chunk.slice(0, lineEnd).trim();
          l2Body = l2Chunk.slice(lineEnd + 1);
        }

        // Parse L2 alternatives table (bold header "**L2 Alternatives…**")
        const l2AltMatch = l2Body.match(/\*\*L2 Alternatives[^*]*\*\*\s*\n([\s\S]*?)(?=\n>|\n---|\n#####|\n####|\n###|\n##|\n+\*\*L1|\n+\*\*L2)/);
        const l2Alternatives = [];
        if (l2AltMatch) {
          const l2AltRows = parseTable(l2AltMatch[1]);
          for (const r of l2AltRows) {
            const aName = clean(r["Alternative"] || "");
            if (!aName) continue;
            const shareStr = r["Share"] || "0";
            const sPct = parseFloat(shareStr.replace(/[~%]/g, "")) || 0;
            const trend = clean(r["Trend"] || "stable").toLowerCase();
            l2Alternatives.push({ name: aName, sharePct: sPct, trend });
          }
        }

        // Parse L1→L0 raw material tables: "**L1 → L0: <component>**" sections
        const rawMaterials = [];
        const l0Sections = [...l2Body.matchAll(/\*\*L1\s*(?:→|->|–>|>)\s*L0:\s*([^*]+)\*\*/g)];
        for (const l0Match of l0Sections) {
          const componentName = l0Match[1].trim();
          // Grab the table that follows this heading (up to next bold heading or section break)
          const afterHeading = l2Body.slice(l0Match.index + l0Match[0].length);
          const tableEnd = afterHeading.search(/\n\*\*L1\s*(?:→|->|–>|>)|\n#####|\n####|\n---/);
          const tableText = tableEnd !== -1 ? afterHeading.slice(0, tableEnd) : afterHeading;
          const materialRows = parseTable(tableText);
          const materials = materialRows.map((r) => {
            const matName = clean(r["L0 Raw Material"] || r["Raw Material"] || Object.values(r)[0] || "");
            const shareStr = r["Share"] || r["Role"] || "0";
            const sharePct = parseFloat(shareStr.replace(/[~%]/g, "")) || 0;
            const trend = clean(r["Trend"] || "").toLowerCase() || undefined;
            const confidence = clean(r["Confidence"] || "").toUpperCase() || undefined;
            const source = clean(r["Source"] || r["Notes"] || "") || undefined;
            return { name: matName, sharePct, ...(trend ? { trend } : {}), ...(confidence ? { confidence } : {}), ...(source ? { source } : {}) };
          }).filter((m) => m.name);
          if (materials.length > 0) {
            rawMaterials.push({ component: componentName, materials });
          }
        }
        // Fallback: if no explicit "L1 → L0:" headers exist but the body starts with a
        // table whose first column is "L0 Raw Material", treat the whole body as raw materials.
        if (rawMaterials.length === 0) {
          const directRows = parseTable(l2Body);
          if (directRows.length > 0 && (directRows[0]["L0 Raw Material"] !== undefined || directRows[0]["Raw Material"] !== undefined)) {
            const materials = directRows.map((r) => {
              const matName = clean(r["L0 Raw Material"] || r["Raw Material"] || Object.values(r)[0] || "");
              const shareStr = r["Share"] || r["Role"] || "0";
              const sharePct = parseFloat(shareStr.replace(/[~%]/g, "")) || 0;
              const trend = clean(r["Trend"] || "").toLowerCase() || undefined;
              const confidence = clean(r["Confidence"] || "").toUpperCase() || undefined;
              const source = clean(r["Source"] || r["Notes"] || "") || undefined;
              return { name: matName, sharePct, ...(trend ? { trend } : {}), ...(confidence ? { confidence } : {}), ...(source ? { source } : {}) };
            }).filter((m) => m.name);
            if (materials.length > 0) {
              rawMaterials.push({ component: l2Name, materials });
            }
          }
        }

        l2Children.push({
          id: `L2-${j}-${k}`,
          name: l2Name,
          alternatives: l2Alternatives,
          rawMaterials,
        });
      }

      // Also extract any "**L1 → L0: …**" sections directly under the L3 body
      // (i.e., L3 nodes that have L1→L0 tables without an intervening L2 heading)
      const directRawMaterials = [];
      // Only collect these if there are no L2 children (avoids duplication)
      if (l2Children.length === 0) {
        const directL0Sections = [...l3Body.matchAll(/\*\*L1\s*(?:→|->|–>|>)\s*L0:\s*([^*]+)\*\*/g)];
        for (const l0Match of directL0Sections) {
          const componentName = l0Match[1].trim();
          const afterHeading = l3Body.slice(l0Match.index + l0Match[0].length);
          const tableEnd = afterHeading.search(/\n\*\*L1\s*(?:→|->|–>|>)|\n####|\n---/);
          const tableText = tableEnd !== -1 ? afterHeading.slice(0, tableEnd) : afterHeading;
          const materialRows = parseTable(tableText);
          const materials = materialRows.map((r) => {
            const matName = clean(r["L0 Raw Material"] || r["Raw Material"] || Object.values(r)[0] || "");
            const shareStr = r["Share"] || r["Role"] || "0";
            const sharePct = parseFloat(shareStr.replace(/[~%]/g, "")) || 0;
            const trend = clean(r["Trend"] || "").toLowerCase() || undefined;
            const confidence = clean(r["Confidence"] || "").toUpperCase() || undefined;
            const source = clean(r["Source"] || r["Notes"] || "") || undefined;
            return { name: matName, sharePct, ...(trend ? { trend } : {}), ...(confidence ? { confidence } : {}), ...(source ? { source } : {}) };
          }).filter((m) => m.name);
          if (materials.length > 0) {
            directRawMaterials.push({ component: componentName, materials });
          }
        }
      }

      modules.push({
        id: `L3-${j}`,
        name: l3Name,
        isMarquardtAnchor: false,
        alternatives: l3Alternatives,
        ...(l2Children.length > 0 ? { children: l2Children } : {}),
        ...(directRawMaterials.length > 0 ? { rawMaterials: directRawMaterials } : {}),
      });
    }

    l4Subsystems.push({
      id: `L4.${i}`,
      name,
      costSharePct: 0,
      keyDesignChoice: implication,
      isMarquardtAnchor: false,
      confidence: "medium",
      alternatives,
      modules,
    });
  }

  const data = {
    slug: market.slug,
    marketName: market.name,
    naicsCode: market.naics,
    confidence: "medium",
    dataPending: false,
    sensorNote: clean(routingMap["Output type"] || routingMap["Relevant variant"] || ""),
    outputTypes: [],
    marquardtAnchorIds: [],
    l4Subsystems,
  };

  write(path.join(MARKETS_DIR, market.slug, "bom.json"), data);
  return data;
}

// ─────────────────────────────────────────────
// Meta — per market (derived from ranking)
// ─────────────────────────────────────────────

function writeMarketMeta(market, rankingData) {
  const ranked = rankingData.rankedMarkets || [];
  const entry = ranked.find((r) => r.slug === market.slug);

  const meta = {
    slug: market.slug,
    name: market.name,
    naicsCode: market.naics,
    isReference: market.isReference,
    rank: entry?.rank ?? null,
    scores: entry?.scores ?? null,
    recommendation: entry?.recommendation ?? null,
    rationale: entry?.rationale ?? null,
    entryStrategy: entry?.entryStrategy ?? null,
    estimatedTimeToEntry: entry?.estimatedTimeToEntry ?? null,
    estimatedInvestment: entry?.estimatedInvestment ?? null,
  };

  write(path.join(MARKETS_DIR, market.slug, "meta.json"), meta);
  return meta;
}

// ─────────────────────────────────────────────
// Alternatives — derived from VN + JTBD
// ─────────────────────────────────────────────

function writeAlternatives(market) {
  const jtbdFile = path.join(MARKETS_DIR, market.slug, "jtbd.json");
  if (!fs.existsSync(jtbdFile)) return;

  const jtbd = JSON.parse(read(jtbdFile));
  const alternatives = jtbd.alternatives || [];

  const data = {
    naicsCode: market.naics,
    marketName: market.name,
    slug: market.slug,
    alternatives,
  };

  write(path.join(MARKETS_DIR, market.slug, "alternatives.json"), data);
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

async function main() {
  console.log("=== Assa Abloy (GfS Türwächter) — Data Extraction Pipeline ===\n");
  console.log(`Markets loaded from manifest: ${MARKET_MAP.map((m) => m.slug).join(", ")}\n`);

  // Ensure output dirs
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(MARKETS_DIR, { recursive: true });

  // Global files
  extractProduct();
  extractFunctionalPromise();
  extractConstraints();
  extractHomeMarket();
  extractMarketDiscovery();
  const rankingData = extractRanking();

  // Per-market
  for (const market of MARKET_MAP) {
    console.log(`\nProcessing market: ${market.name} [${market.slug}]`);
    fs.mkdirSync(path.join(MARKETS_DIR, market.slug), { recursive: true });

    extractJTBD(market);
    extractODI(market);
    extractVN(market);
    extractKano(market);
    extractCompat(market);
    extractBOM(market);
    writeMarketMeta(market, rankingData);
    writeAlternatives(market);
  }

  // Write global sources registry
  console.log("\nWriting sources registry...");
  write(path.join(DATA_DIR, "sources.json"), globalSources);

  // Write markets index
  console.log("Writing markets index...");
  const marketsIndex = MARKET_MAP.map((m) => ({
    slug: m.slug,
    name: m.name,
    naics: m.naics,
    isReference: m.isReference,
    sourceFile: m.fileKey,
  }));
  write(path.join(DATA_DIR, "markets", "index.json"), marketsIndex);

  // Summary
  const sourceCount = Object.keys(globalSources).length;
  console.log(`\n=== Extraction complete ===`);
  console.log(`Sources registered: ${sourceCount}`);
  console.log(`Markets processed: ${MARKET_MAP.length}`);
  console.log(`New markets (non-reference): ${MARKET_MAP.filter((m) => !m.isReference).length}`);
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
