import type { Metadata } from "next";
import Link from "next/link";
import { getAllListingsAdmin } from "@/lib/db/listings";

export const metadata: Metadata = { title: "Listings" };

const statusBadge = (status: string) =>
  ({ published: "admin-badge-pub", draft: "admin-badge-draft", review: "admin-badge-review", archived: "admin-badge-arc" }[status] ?? "admin-badge-draft");

export default async function ListingsAdminPage() {
  const listings = await getAllListingsAdmin();

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Listings</h1>
          <p className="admin-page-subtitle">{listings.length} total</p>
        </div>
        <Link href="/admin/listings/new" className="admin-btn admin-btn-primary">+ Add listing</Link>
      </div>

      {listings.length === 0 ? (
        <div className="admin-empty">
          <p>No listings yet.</p>
          <Link href="/admin/listings/new" className="admin-btn admin-btn-primary">Add your first listing</Link>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th><th>Type</th><th>Phase / City</th><th>Price</th><th>Status</th><th>Updated</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id}>
                  <td>
                    <strong>{l.title}</strong>
                    <span className="admin-cell-sub mono">{l.slug}</span>
                  </td>
                  <td>{l.listing_type_slug}</td>
                  <td>
                    {l.phase ?? "—"}
                    {l.city && <span className="admin-cell-sub">{l.city}</span>}
                  </td>
                  <td>{l.price_label}</td>
                  <td><span className={`admin-badge ${statusBadge(l.status)}`}>{l.status}</span></td>
                  <td className="mono">{new Date(l.updated_at).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td>
                    <div className="admin-row-actions">
                      <Link href={`/admin/listings/${l.id}/edit`} className="admin-btn admin-btn-sm">Edit</Link>
                      {l.status === "published" && (
                        <Link href={`/buy-sell/${l.listing_type_slug}/${l.slug}`} target="_blank" className="admin-btn admin-btn-sm admin-btn-ghost">View ↗</Link>
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
