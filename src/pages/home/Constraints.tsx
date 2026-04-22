/**
 * 03 Constraints Analysis — Data-driven from constraints.json (generic section format).
 */
import { constraints } from "@/data";
import GenericSectionPage from "@/components/GenericSectionPage";

export default function Constraints() {
  return (
    <GenericSectionPage
      data={constraints as any}
      stepNumber="03"
      stepLabel="Constraints"
      summaryText="This chapter maps the physical, regulatory, operational, and economic constraints that bound the product's addressable market. Absolute constraints eliminate markets entirely; conditional constraints can be mitigated with engineering or commercial adaptation."
    />
  );
}
