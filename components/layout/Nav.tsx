"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home", key: "home", n: "" },
  { href: "/buy-sell", label: "Buy/Sell", key: "buy-sell", n: "08" },
  { href: "/about", label: "About", key: "about", n: "10+" },
  { href: "/updates", label: "Updates", key: "updates", n: "" },
  { href: "/contact", label: "Contact", key: "contact", n: "" },
];

function BrandLogo() {
  return (
    <span className="brand-logo">
      <Image src="/images/brand/headerlogo.svg" alt="Estate Brothers" width={120} height={32} />
    </span>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => { setOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-brand" aria-label="Estate Brothers home">
            <BrandLogo />
          </Link>

          <div className="nav-links">
            {links.slice(0, 4).map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={isActive(link.href) ? "active" : ""}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="nav-right">
            <Link href="/contact" className="nav-btn">
              <span>Contact Us</span>
              <span className="arrow">→</span>
            </Link>
            <button
              type="button"
              className={`nav-burger${open ? " open" : ""}`}
              aria-label="Menu"
              onClick={() => setOpen((value) => !value)}
            >
              <span className="bar" />
              <span className="bar" />
            </button>
          </div>
        </div>
      </nav>

      <div className={`nav-menu${open ? " open" : ""}`}>
        <div className="nav-menu-hd">
          <Link href="/" className="nav-brand nav-brand-menu" aria-label="Estate Brothers home" onClick={() => setOpen(false)}>
            <BrandLogo />
          </Link>
          <button type="button" className="nav-burger open" aria-label="Close" onClick={() => setOpen(false)}>
            <span className="bar" />
            <span className="bar" />
          </button>
        </div>

        <div className="nav-menu-links">
          {links.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={isActive(link.href) ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              <span>{link.label}</span>
              {link.n && <span className="n">{link.n}</span>}
            </Link>
          ))}
        </div>

        <div className="nav-menu-foot">
          <span>Estate Brothers · DHA Phase 6 Lahore · 4 branches</span>
          <Link href="/contact" className="cta" onClick={() => setOpen(false)}>
            Contact Us →
          </Link>
        </div>
      </div>
    </>
  );
}
