# Target JSON Schema — new_markets archetype

This defines the JSON schema that React components expect.
The `transform_data.py` script converts orchestrator output → this format.

## Top-level files

### overview.json
```json
{
  "company": { "name", "legalForm", "ownership", "founded", "hq",
    "ceo": { "name", "since", "note" },
    "revenue": { "value", "year", "note" },
    "employees": { "value", "year", "note" },
    "sites", "countries", "continents", "rdIntensity",
    "patentsTotal", "patentsGranted", "primaryNaics", "primaryNaicsTitle"
  },
  "globalFootprint": { "regions": [{ "region", "sites": [] }] },
  "divisions": [{ "name", "type", "description", "isSubjectDivision" }],
  "productGroup": { "name", "scope", "families": [{ "name", "technology", "status" }] },
  "product": { "name", "family", "bomLevel", "homeMarketNaics", "homeMarketTitle",
    "variants": [{ "id", "status", "note" }]
  },
  "studyQuestion": {
    "q1": { "german", "english", "answer" },
    "q2": { "german", "english", "answer" }
  },
  "portfolioPriorities": [{ "priority", "market", "fitScore", "fitLabel", "compositeScore",
    "timeToFirstRevenue", "hardwareDelta", "role" }],
  "financials": { ... },
  "sources": [{ "id", "label", "url" }]
}
```

### product.json
```json
{
  "productName", "vendorName",
  "christensen": { "mechanism", "function", "outcome" },
  "technology": { "class", "underlyingMechanism", "unspscCode", "unspscTitle" },
  "functionalPromise": { "statement", "verb", "object", "context" },
  "commodityFunctionalPromise": "string",
  "differentiators": ["string"],
  "features": [{ "scope", "name", "short", "longDescription", "category" }],
  "specifications": [{ "name", "value", "note" }],
  "constraints": [{ "name", "constraintType", "severity", "description", "thresholdValue", "thresholdUnit" }],
  "sources": [{ "id", "label", "prefixedId" }]
}
```

### constraints.json
```json
{
  "constraints": [{
    "name", "constraintType", "description",
    "thresholdValue", "thresholdUnit",
    "isAbsolute": bool, "affectedMarketsHint"
  }],
  "sources": [{ "id", "label", "prefixedId" }]
}
```

### homeMarketCompetition.json
```json
{
  "marketName", "naicsCode", "naicsTitle", "functionalNeed",
  "switchingCost", "switchingCostFactors": { ... },
  "incumbents": [{
    "technologyName", "mechanism", "marketShareEstimate",
    "keyVendors": [], "strengths": [], "weaknesses": [],
    "switchingCostLevel", "switchingCostNarrative"
  }],
  "sources": [{ "id", "label" }]
}
```

### marketDiscovery.json
```json
{
  "commodityFP", "unspscContext", "fpExtension",
  "candidates": [{
    "naics", "title", "fpFit", "adoption", "architectureDistance",
    "rationale", "tamEstimate", "growthRate"
  }],
  "excludedMarkets": [{ "naics", "title", "reason" }],
  "sources": []
}
```

### ranking.json
```json
{
  "productName", "vendorName", "commodityFunctionalPromise",
  "totalMarketsEvaluated", "executiveSummary",
  "weights": { "odi_opportunity", "feature_fit", "constraint_compatibility", ... },
  "rankedMarkets": [{
    "rank", "slug", "marketName", "naicsCode",
    "scores": { "odi", "featureFit", "constraintCompatibility", "composite" },
    "recommendation", "rationale"
  }]
}
```

## Per-market files (markets/{slug}/)

### meta.json
```json
{ "slug", "name", "naicsCode", "isReference", "rank",
  "scores": { "composite", ... }, "recommendation", "rationale" }
```

### valueNetwork.json
```json
{
  "naicsCode", "marketName", "slug", "hierarchy",
  "architectureDistance", "outputTypes": [],
  "l6Systems": [{ "id", "name", "type", "l5Units": [{ "id", "name", "l4Subsystems": [...] }] }],
  "vnUnits": [{ "level", "id", "name", "functionalJob", "parentId", "isProductPosition" }],
  "productPosition": { "level", "unitId", "unitName" },
  "sources": []
}
```

### bom.json
```json
{
  "slug", "marketName", "naicsCode",
  "outputTypes": [{ "id", "name", "notes" }],
  "productAnchorIds": [],
  "l4Subsystems": [{ "id", "name", "costSharePct", "isProductAnchor",
    "l3Modules": [{ "id", "name", "materials": [], "isProductAnchor" }] }],
  "sources": []
}
```

### jtbd.json — already working (entities format)

### odi.json
```json
{
  "naicsCode", "marketName", "slug",
  "summary": { "totalNeeds", "underservedCount", "overservedCount", "avgOpportunityScore" },
  "needs": [{ "id", "statement", "jobStep", "importance", "satisfaction", "opportunity",
    "isUnderserved", "isOverserved", "productRelated",
    "importanceRationale", "satisfactionRationale" }],
  "sources": []
}
```

### compatibility.json
```json
{
  "naicsCode", "marketName", "slug",
  "assessments": [{
    "constraintName", "constraintType", "threshold",
    "verdict": "PASS|CONDITIONAL|FAIL",
    "rationale", "mitigation", "mitigationCost"
  }],
  "result": { "knockouts", "mitigable", "none" },
  "sources": []
}
```

### alternatives.json
```json
{
  "naicsCode", "marketName", "slug",
  "alternatives": [{ "name", "unspsc", "tradeoffs", "category" }]
}
```
