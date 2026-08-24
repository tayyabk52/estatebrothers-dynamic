"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export interface AdminNavLink {
  href: string;
  label: string;
}

function initials(label = "Estate Brothers") {
  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "EB";
}

export function AdminShellChrome({
  children,
  navLinks,
  logoutSlot,
}: {
  children: React.ReactNode;
  navLinks: AdminNavLink[];
  logoutSlot: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const sidebarModeClass = collapsed ? "is-collapsed" : "is-expanded";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (window.localStorage.getItem("estate-admin-sidebar") === "collapsed") {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("estate-admin-sidebar", collapsed ? "collapsed" : "expanded");
  }, [collapsed]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const activeLink = useMemo(
    () =>
      navLinks
        .filter((link) => (link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href)))
        .sort((a, b) => b.href.length - a.href.length)[0] ?? navLinks[0],
    [navLinks, pathname]
  );

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className={`admin-shell ${sidebarModeClass}`}>
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <div className="admin-sidebar-brand">
          <span className="admin-brand-copy">
            <span>Estate Brothers</span>
            <span className="admin-sidebar-tag">Admin</span>
          </span>
          <button
            type="button"
            className="admin-sidebar-toggle"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        <nav className="admin-nav">
          {navLinks.map((link) => {
            const active = activeLink?.href === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`admin-nav-link${active ? " active" : ""}`}
                aria-current={active ? "page" : undefined}
                title={link.label}
              >
                <span className="admin-nav-initial">{initials(link.label).slice(0, 2)}</span>
                <span className="admin-nav-label">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-nav-link admin-nav-link-muted" title="View public site">
            <span className="admin-nav-initial">↗</span>
            <span className="admin-nav-label">View site</span>
          </Link>
          {logoutSlot}
        </div>
      </aside>

      <section className="admin-content-shell">
        <header className="admin-mobile-bar" data-admin-mobile="true">
          <strong>Estate Brothers</strong>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="admin-mobile-menu"
            onClick={() => setMobileOpen((value) => !value)}
          >
            Menu
          </button>
        </header>
        <nav
          id="admin-mobile-menu"
          className={`admin-mobile-sheet${mobileOpen ? " open" : ""}`}
          aria-label="Mobile admin navigation"
        >
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <header className="admin-topbar" data-admin-desktop="true">
          <div className="admin-crumb">
            Admin <span>/</span> <strong>{activeLink?.label ?? "Dashboard"}</strong>
          </div>
          <div className="admin-account">
            <span>Active editor account</span>
            <div className="admin-avatar" aria-hidden>
              EB
            </div>
          </div>
        </header>
        <main className="admin-main">{children}</main>
      </section>
    </div>
  );
}
