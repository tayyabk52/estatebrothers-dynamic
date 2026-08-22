import type { Metadata } from "next";
import Link from "next/link";
import { getAllOfficesAdmin } from "@/lib/db/offices-admin";

export const metadata: Metadata = { title: "Offices" };

const statusBadge = (status: string) =>
  ({ published: "admin-badge-pub", draft: "admin-badge-draft", review: "admin-badge-review", archived: "admin-badge-arc" }[status] ?? "admin-badge-draft");

export default async function OfficesAdminPage() {
  const offices = await getAllOfficesAdmin();

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Office locations</h1>
          <p className="admin-page-subtitle">{offices.length} total</p>
        </div>
        <Link href="/admin/offices/new" className="admin-btn admin-btn-primary">+ Add office</Link>
      </div>

      {offices.length === 0 ? (
        <div className="admin-empty">
          <p>No office locations yet.</p>
          <Link href="/admin/offices/new" className="admin-btn admin-btn-primary">Add your first office</Link>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th><th>City</th><th>Label</th><th>Status</th><th>Sort</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offices.map((office) => (
                <tr key={office.id}>
                  <td><strong>{office.name}</strong></td>
                  <td>{office.city ?? "Pending"}</td>
                  <td>{office.status_label ?? "Pending"}</td>
                  <td><span className={`admin-badge ${statusBadge(office.status)}`}>{office.status}</span></td>
                  <td>{office.sort_order}</td>
                  <td>
                    <Link href={`/admin/offices/${office.id}/edit`} className="admin-btn admin-btn-sm">Edit</Link>
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
