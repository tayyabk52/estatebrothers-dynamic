import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { PageEffects } from "@/components/ui/PageEffects";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {children}
      <Footer />
      <PageEffects />
      <SpeedInsights />
    </>
  );
}
