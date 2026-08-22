import type { Metadata } from "next";
import Link from "next/link";
import { getAllPagesAdmin } from "@/lib/db/pages-admin";

export const metadata: Metadata = { title: "Pages" };

export default async function PagesAdminPage() {
  const pages = await getAllPagesAdmin();
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Pages</h1>
          <p className="admin-page-subtitle">{pages.length} total</p>
        </div>
        <Link href="/admin/pages/new" className="admin-btn admin-btn-primary">+ Add page</Link>
      </div>
      {pages.length === 0 ? (
        <div className="admin-empty"><p>No pages yet.</p><Link href="/admin/pages/new" className="admin-btn admin-btn-primary">Add your first page</Link></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Title</th><th>Route</th><th>Status</th><th>noindex</th><th>Updated</th><th>Actions</th></tr></thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id}>
                  <td><strong>{page.title}</strong></td>
                  <td className="mono">{page.route_path}</td>
                  <td>{page.status}</td>
                  <td>{page.noindex ? "Yes" : "No"}</td>
                  <td className="mono">{new Date(page.updated_at).toLocaleDateString("en-PK")}</td>
                  <td><Link href={`/admin/pages/${page.id}/edit`} className="admin-btn admin-btn-sm">Edit</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

