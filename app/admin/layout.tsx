import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { AdminShellChrome } from "@/components/admin/AdminShellChrome";
import { AdminActionNotice } from "@/components/admin/AdminActionNotice";
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
  { href: "/admin/seo-landing-pages", label: "SEO landing pages" },
  { href: "/admin/contact-submissions", label: "Contact inquiries" },
  { href: "/admin/site", label: "Site settings" },
];

async function DynamicMarker() {
  await connection();
  return null;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <DynamicMarker />
      </Suspense>
      <Suspense fallback={null}>
        <AdminShellChrome navLinks={navLinks} logoutSlot={<AdminLogoutButton />}>
          <Suspense fallback={null}><AdminActionNotice /></Suspense>
          {children}
        </AdminShellChrome>
      </Suspense>
    </>
  );
}
