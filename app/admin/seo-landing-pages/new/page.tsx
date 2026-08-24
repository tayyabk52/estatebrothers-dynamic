import { SeoLandingPageForm } from "../SeoLandingPageForm";
import { createSeoLandingPage } from "../actions";

export const metadata = {
  title: "New SEO landing page",
};

export default function NewSeoLandingPage() {
  return <SeoLandingPageForm action={createSeoLandingPage} />;
}
