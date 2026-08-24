import { notFound } from "next/navigation";
import { SeoLandingPageForm } from "../../SeoLandingPageForm";
import { updateSeoLandingPage } from "../../actions";
import { getAllPublishedListings } from "@/lib/db/listings";
import { getSeoLandingPageByIdAdmin } from "@/lib/db/seo-admin";
import { listingMatchesSeoLandingPage } from "@/lib/db/seo";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit SEO landing page",
};

export default async function EditSeoLandingPage({ params }: PageProps) {
  const { id } = await params;
  const page = await getSeoLandingPageByIdAdmin(id);
  if (!page) notFound();

  const listings = await getAllPublishedListings();
  const matchingCount = listings.filter((listing) => listingMatchesSeoLandingPage(listing, page)).length;

  return (
    <SeoLandingPageForm
      page={page}
      action={updateSeoLandingPage.bind(null, page.id)}
      matchingCount={matchingCount}
    />
  );
}
