import type { Metadata } from "next";
import { Inter, Inter_Tight, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import {
  buildOrganizationSchema,
  buildRealEstateAgentSchema,
  buildWebSiteSchema,
} from "@/lib/seo/structured-data";
import { getSiteSettings } from "@/lib/db/site";
import "@/styles/shared.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  adjustFontFallback: true,
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
  adjustFontFallback: true,
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "optional",
  adjustFontFallback: true,
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "optional",
  adjustFontFallback: true,
});

const googleVerification = process.env.NEXT_PUBLIC_GSC_VERIFICATION;
const bingVerification = process.env.NEXT_PUBLIC_BING_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL("https://estatebrothers.pk"),
  title: {
    default: "Estate Brothers",
    template: "%s | Estate Brothers",
  },
  description:
    "Buy, sell, and invest in property across Lahore, Karachi, and Islamabad with Estate Brothers - Pakistan's trusted real estate team.",
  alternates: { canonical: "https://estatebrothers.pk" },
  // Verification tokens: set env vars after obtaining them from Google Search Console and Bing Webmaster Tools.
  verification: {
    ...(googleVerification ? { google: googleVerification } : {}),
    ...(bingVerification ? { other: { "msvalidate.01": bingVerification } } : {}),
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const orgSchema = buildOrganizationSchema(settings);
  const agentSchema = buildRealEstateAgentSchema(settings);
  const websiteSchema = buildWebSiteSchema();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${interTight.variable} ${instrumentSerif.variable} ${jetBrainsMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(agentSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body suppressHydrationWarning>
        <div id="scrollBar" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
