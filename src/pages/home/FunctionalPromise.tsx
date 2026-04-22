/**
 * 02 Functional Promise — Data-driven from functionalPromise.json (generic section format).
 */
import { functionalPromise } from "@/data";
import GenericSectionPage from "@/components/GenericSectionPage";

export default function FunctionalPromise() {
  return (
    <GenericSectionPage
      data={functionalPromise as any}
      stepNumber="02"
      stepLabel="Functional Promise"
      summaryText="The functional promise captures what the product/service does independent of its specific technology — the solution-agnostic value statement that drives market discovery. The commodity-level promise is the search query used to find new NAICS markets."
    />
  );
}
