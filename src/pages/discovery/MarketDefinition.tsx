/**
 * MarketDefinition — explains what NAICS is and why it's used.
 * Fully data-driven, no hardcoded product or company names.
 */

import SectionAnchor from "@/components/SectionAnchor";
import ClickableCode from "@/components/ClickableCode";

export default function MarketDefinition() {
  return (
    <section id="market-definition" className="container">
      <SectionAnchor id="market-definition" title="Market Definition" />
      <div className="md">
        <p>
          Every candidate market in this report is defined by a{" "}
          <strong>NAICS code</strong> — a 6-digit industry classification number
          issued by the U.S. Census Bureau. NAICS stands for the
          North American Industry Classification System. It organizes all
          economic activity into a hierarchy: 2-digit sectors narrow to
          3-digit subsectors, then 4-digit industry groups, then 5-digit
          industries, and finally 6-digit national-level detail. For example,
          NAICS <ClickableCode kind="naics" code="221118" /> identifies
          "Other Electric Power Generation" as a distinct industry with its own
          workforce, revenue, and establishment count data.
        </p>

        <p>
          NAICS was chosen as the market taxonomy for this analysis for three
          reasons. First, it provides{" "}
          <strong>stable, legally defined industry boundaries</strong> —
          two analysts using the same code will be looking at the same set of
          establishments, eliminating definitional ambiguity. Second, NAICS
          codes unlock <strong>government-grade data</strong>: the U.S.
          Economic Census, County Business Patterns, and IBISWorld industry
          reports all index to NAICS, giving us comparable size, growth, and
          concentration metrics across all candidate markets. Third, using a frozen
          external taxonomy prevents the LLM research layer from silently
          redefining markets across pipeline runs — each code is a
          reproducible anchor.
        </p>

        <p>
          In the discovery phase, the pipeline cross-classifies
          the product's commodity functional promise against NAICS industry
          descriptions to find all industries where the product capability is a
          recognized need. This surfaces candidate markets beyond the
          product team's immediate frame of reference — including emergent
          adjacencies and application domains.
        </p>

        <p>
          In this report, every NAICS code appears as a{" "}
          <ClickableCode kind="naics" code="221118" /> badge. Clicking any
          badge opens the official NAICS registry entry in a new tab, where
          you can verify the industry definition, see example establishments,
          and cross-reference with Census data.
        </p>
      </div>
    </section>
  );
}
