import Link from "next/link";
import { PopularSeoLinks } from "@/components/seo/PopularSeoLinks";
import { getSiteSettings } from "@/lib/db/site";
import { CurrentYear } from "@/components/ui/CurrentYear";

export async function Footer() {
  const settings = await getSiteSettings();
  const address = [settings?.address_line_1, settings?.city, settings?.region].filter(Boolean).join(", ");
  const phoneHref = settings?.phone ? `tel:${settings.phone.replace(/[^\d+]/g, "")}` : null;
  const socials = settings?.social_links && typeof settings.social_links === "object" && !Array.isArray(settings.social_links)
    ? settings.social_links : {};
  const externalLinks = [
    { label: "Facebook", url: socials.facebook },
    { label: "Instagram", url: socials.instagram },
    { label: "LinkedIn", url: socials.linkedin },
    { label: "YouTube", url: socials.youtube },
    { label: "Office directions", url: settings?.map_url },
  ].filter((link): link is { label: string; url: string } => typeof link.url === "string" && /^https?:\/\//i.test(link.url));

  return (
    <footer className="footer" id="contact-footer">
      <div className="wrap footer-simple">
        <div className="footer-brand">
          <div className="mark">
            Estate<span className="amp">&amp;</span>Brothers
          </div>
          <p>{settings?.tagline ?? "Trusted real estate partners for buying, selling, and secure investments."}</p>
        </div>

        <nav className="footer-links" aria-label="Footer">
          <Link href="/">Home</Link>
          <Link href="/buy-sell">Buy/Sell</Link>
          <Link href="/about">About</Link>
          <Link href="/updates">Updates</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        <div className="footer-contact">
          {address && <span>{address}</span>}
          {settings?.phone && phoneHref && <a href={phoneHref}>{settings.phone}</a>}
          {settings?.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}
          {externalLinks.length > 0 && (
            <nav className="footer-external-links" aria-label="Estate Brothers social profiles and directions">
              {externalLinks.map((link) => <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a>)}
            </nav>
          )}
        </div>

        <PopularSeoLinks placement="footer" />

        <div className="footer-bot">
          <span>© <CurrentYear /> {settings?.business_name ?? "Estate Brothers"}</span>
          <span>{settings?.business_description ?? "Real estate and investment services"}</span>
        </div>
      </div>
    </footer>
  );
}
