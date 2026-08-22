import type { Metadata } from "next";
import Link from "next/link";
import { AdminLogoutButton } from "@/components/ui/AdminLogoutButton";
import "@/styles/admin.css";

export const metadata: Metadata = {
  title: { template: "%s | Admin", default: "Admin" },
  robots: { index: false, follow: false },
};

const navLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/updates", label: "Updates" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/offices", label: "Offices" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/site", label: "Site settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span>Estate Brothers</span>
          <span className="admin-sidebar-tag">Admin</span>
        </div>
        <nav className="admin-nav">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="admin-nav-link">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-nav-link admin-nav-link-muted">
            ← View site
          </Link>
          <AdminLogoutButton />
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
