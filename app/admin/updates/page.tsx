import type { Metadata } from "next";
import Link from "next/link";
import { getAllUpdatesAdmin } from "@/lib/db/updates";

export const metadata: Metadata = { title: "Updates" };

const statusBadge = (status: string) =>
  ({ published: "admin-badge-pub", draft: "admin-badge-draft", review: "admin-badge-review", archived: "admin-badge-arc" }[status] ?? "admin-badge-draft");

export default async function UpdatesAdminPage() {
  const updates = await getAllUpdatesAdmin();

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Updates</h1>
          <p className="admin-page-subtitle">{updates.length} total</p>
        </div>
        <Link href="/admin/updates/new" className="admin-btn admin-btn-primary">+ Add update</Link>
      </div>

      {updates.length === 0 ? (
        <div className="admin-empty">
          <p>No updates yet.</p>
          <Link href="/admin/updates/new" className="admin-btn admin-btn-primary">Add your first update</Link>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th><th>Type</th><th>Status</th><th>Published</th><th>Updated</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {updates.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.title}</strong>
                    <span className="admin-cell-sub mono">{u.slug}</span>
                  </td>
                  <td>{u.update_type}</td>
                  <td><span className={`admin-badge ${statusBadge(u.status)}`}>{u.status}</span></td>
                  <td className="mono">
                    {u.published_at
                      ? new Date(u.published_at).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })
                      : "—"}
                  </td>
                  <td className="mono">{new Date(u.updated_at).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td>
                    <div className="admin-row-actions">
                      <Link href={`/admin/updates/${u.id}/edit`} className="admin-btn admin-btn-sm">Edit</Link>
                      {u.status === "published" && (
                        <Link href={`/updates/${u.slug}`} target="_blank" className="admin-btn admin-btn-sm admin-btn-ghost">View ↗</Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
