import { Suspense } from "react";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { Nav, NavFallback } from "@/components/layout/Nav";
import { PageEffects } from "@/components/ui/PageEffects";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<NavFallback />}>
        <Nav />
      </Suspense>
      {children}
      <Footer />
      <WhatsAppButton />
      <PageEffects />
      <SpeedInsights />
    </>
  );
}
