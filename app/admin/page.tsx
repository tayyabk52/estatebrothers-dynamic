import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard" };

async function getStats() {
  const supabase = await createClient();
  const [listings, updates, team, offices] = await Promise.all([
    supabase.from("real_estate_listings").select("status"),
    supabase.from("updates").select("status"),
    supabase.from("team_members").select("status"),
    supabase.from("office_locations").select("status"),
  ]);

  const countByStatus = (rows: { status: string }[] | null) => ({
    total: rows?.length ?? 0,
    published: rows?.filter((r) => r.status === "published").length ?? 0,
    draft: rows?.filter((r) => r.status === "draft").length ?? 0,
  });

  return {
    listings: countByStatus(listings.data),
    updates: countByStatus(updates.data),
    team: countByStatus(team.data),
    offices: countByStatus(offices.data),
  };
}

export default async function DashboardPage() {
  await requireAdmin();
  const stats = await getStats();

  const cards = [
    { label: "Listings", ...stats.listings, href: "/admin/listings", action: "/admin/listings/new", actionLabel: "Add listing" },
    { label: "Updates", ...stats.updates, href: "/admin/updates", action: "/admin/updates/new", actionLabel: "Add update" },
    { label: "Team members", ...stats.team, href: "/admin/team", action: null, actionLabel: null },
    { label: "Offices", ...stats.offices, href: "/admin/offices", action: "/admin/offices/new", actionLabel: "Add office" },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="admin-page-subtitle">Estate Brothers content overview</p>
        </div>
      </div>

      <div className="admin-stat-grid">
        {cards.map((card) => (
          <div key={card.label} className="admin-stat-card">
            <div className="admin-stat-head">
              <span className="admin-stat-label">{card.label}</span>
              {card.action && (
                <Link href={card.action} className="admin-btn admin-btn-sm">
                  {card.actionLabel}
                </Link>
              )}
            </div>
            <div className="admin-stat-numbers">
              <div>
                <strong>{card.total}</strong>
                <span>total</span>
              </div>
              <div>
                <strong className="admin-stat-pub">{card.published}</strong>
                <span>published</span>
              </div>
              <div>
                <strong className="admin-stat-draft">{card.draft}</strong>
                <span>draft</span>
              </div>
            </div>
            <Link href={card.href} className="admin-stat-view">View all →</Link>
          </div>
        ))}
      </div>

      <div className="admin-info-box">
        <h2>Admin access verified</h2>
        <p>
          This dashboard only loads for users present in <code>admin_users</code> with an active
          owner or editor role.
        </p>
      </div>
    </div>
  );
}
