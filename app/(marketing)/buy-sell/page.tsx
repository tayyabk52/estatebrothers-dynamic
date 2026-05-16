import { BuySellClient } from "@/components/pages/BuySellClient";
import { buildMetadata } from "@/lib/seo/metadata";
import "@/styles/buySell.css";

export const metadata = buildMetadata({
  title: "Buy/Sell",
  description:
    "Browse plots and houses for sale in DHA Lahore with Estate Brothers. Filter by phase, size, and price to find your ideal property.",
  canonicalPath: "/buy-sell",
});

export default function BuySellPage() {
  return <BuySellClient />;
}
