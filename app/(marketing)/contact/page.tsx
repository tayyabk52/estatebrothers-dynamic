import { ContactClient } from "@/components/pages/ContactClient";
import { buildMetadata } from "@/lib/seo/metadata";
import "@/styles/contact.css";

export const metadata = buildMetadata({
  title: "Contact",
  description:
    "Contact Estate Brothers for property buying, selling, or investment inquiries in Lahore. Available 24/7 from DHA Phase 6.",
  canonicalPath: "/contact",
});

export default function ContactPage() {
  return <ContactClient />;
}
