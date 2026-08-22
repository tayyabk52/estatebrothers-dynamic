import { UpdatesClient } from "@/components/pages/UpdatesClient";
import { getPublishedUpdates } from "@/lib/db/updates";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildUpdateItemListSchema } from "@/lib/seo/structured-data";
import "@/styles/updates.css";

export const metadata = buildMetadata({
  title: "Updates",
  description:
    "Latest Estate Brothers announcements, Facebook posts, MOU activity, market notes, and property updates.",
  canonicalPath: "/updates",
  keywords: ["real estate news Lahore", "DHA property updates"],
});

export default async function UpdatesPage() {
  const updates = await getPublishedUpdates();

  const updateItemListSchema = buildUpdateItemListSchema(
    updates.map((u) => ({
      slug: u.slug,
      title: u.title,
      summary: u.summary ?? undefined,
      canonicalPath: u.canonicalPath ?? `/updates/${u.slug}`,
      publishedAt: u.publishedAt,
      updatedAt: u.updatedAt,
      author: u.author ?? undefined,
      media: u.media,
    }))
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(updateItemListSchema) }}
      />
      <UpdatesClient updates={updates} />
    </>
  );
}
