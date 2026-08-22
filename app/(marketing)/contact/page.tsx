import { ContactClient } from "@/components/pages/ContactClient";
import { getPublishedFAQs, getPublishedOfficeLocations, getPublishedPage, getSiteSettings, mediaUrl } from "@/lib/db/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildFAQSchema } from "@/lib/seo/structured-data";
import "@/styles/contact.css";

export async function generateMetadata() {
  const page = await getPublishedPage("/contact");
  return buildMetadata({
    title: page?.meta_title ?? "Contact",
    description: page?.meta_description,
    canonicalPath: "/contact",
    image: page?.og_image ?? mediaUrl(page?.hero_media) ?? "/og-default.jpg",
    keywords: page?.keywords ?? ["contact real estate agent Lahore", "property inquiry Lahore"],
  });
}

export default async function ContactPage() {
  const [settings, faqs, offices] = await Promise.all([
    getSiteSettings(),
    getPublishedFAQs("/contact"),
    getPublishedOfficeLocations(),
  ]);
  const faqSchema = faqs.length
    ? buildFAQSchema(faqs.map((faq) => ({ question: faq.question, answer: faq.answer })))
    : null;
  const socialLinks = settings?.social_links && typeof settings.social_links === "object" && !Array.isArray(settings.social_links)
    ? settings.social_links as Record<string, string>
    : {};

  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <ContactClient
        businessName={settings?.business_name ?? "Estate Brothers"}
        email={settings?.email}
        phone={settings?.phone}
        instagram={socialLinks.instagram}
        officeItems={offices.map((office) => ({
          id: office.id,
          city: office.city,
          address: [office.address_line_1, office.address_line_2, office.region].filter(Boolean).join("\n"),
        }))}
      />
    </>
  );
}
