/**
 * 04 Home Market Competition — Data-driven from homeMarketCompetition.json (generic section format).
 */
import { homeMarket } from "@/data";
import GenericSectionPage from "@/components/GenericSectionPage";

export default function HomeMarketCompetition() {
  return (
    <GenericSectionPage
      data={homeMarket as any}
      stepNumber="04"
      stepLabel="Home Market Competition"
      summaryText="This chapter analyzes the competitive landscape in the home market — who the incumbents are, what their strengths and weaknesses are, and where opportunities exist for displacement or differentiation."
    />
  );
}
