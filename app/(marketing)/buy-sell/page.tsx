import { BuySellClient } from "@/components/pages/BuySellClient";
import { getAllPublishedListings, getPublishedHouses, getPublishedPlots } from "@/lib/db/listings";
import { buildAgentMap, getPublishedTeamMembers } from "@/lib/db/team";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildItemListSchema, buildBreadcrumbSchema } from "@/lib/seo/structured-data";
import "@/styles/buySell.css";

export const metadata = buildMetadata({
  title: "Buy/Sell",
  description:
    "Browse plots and houses for sale in DHA Lahore with Estate Brothers. Filter by phase, size, and price to find your ideal property.",
  canonicalPath: "/buy-sell",
  keywords: ["plots for sale DHA Lahore", "houses for sale Lahore", "property investment Pakistan"],
});

export default async function BuySellPage() {
  const [plots, houses, agents, allListings] = await Promise.all([
    getPublishedPlots(),
    getPublishedHouses(),
    getPublishedTeamMembers(),
    getAllPublishedListings(),
  ]);

  const agentMap = buildAgentMap(agents);
  const itemListSchema = buildItemListSchema(
    allListings.map((l) => ({
      slug: l.slug,
      type: l.type,
      title: l.type === "house" ? (l as typeof houses[0]).title : undefined,
      phase: l.phase ?? undefined,
      size: l.size ?? undefined,
    }))
  );

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "https://estatebrothers.pk" },
    { name: "Buy/Sell", url: "https://estatebrothers.pk/buy-sell" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BuySellClient plots={plots} houses={houses} agentMap={agentMap} />
    </>
  );
}
