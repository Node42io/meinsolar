/**
 * 01 Product Decomposition — Data-driven from product.json (generic section format).
 */
import { product } from "@/data";
import GenericSectionPage from "@/components/GenericSectionPage";

export default function ProductDecomposition() {
  return (
    <GenericSectionPage
      data={product as any}
      stepNumber="01"
      stepLabel="Product Profile"
      summaryText="This chapter decomposes the product/service into its underlying mechanism, function, outcome, features, specifications, and constraints — establishing the foundation for every market compatibility check that follows."
    />
  );
}
