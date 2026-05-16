import { UpdatesClient } from "@/components/pages/UpdatesClient";
import { buildMetadata } from "@/lib/seo/metadata";
import "@/styles/updates.css";

export const metadata = buildMetadata({
  title: "Updates",
  description:
    "Latest Estate Brothers announcements, Facebook posts, MOU activity, market notes, and property updates.",
  canonicalPath: "/updates",
});

export default function UpdatesPage() {
  return <UpdatesClient />;
}
