import type { Metadata } from "next";
import Link from "next/link";
import { getAllTeamMembersAdmin } from "@/lib/db/team";

export const metadata: Metadata = { title: "Team" };

const statusBadge = (status: string) =>
  ({ published: "admin-badge-pub", draft: "admin-badge-draft", review: "admin-badge-review", archived: "admin-badge-arc" }[status] ?? "admin-badge-draft");

export default async function TeamAdminPage() {
  const members = await getAllTeamMembersAdmin();

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Team members</h1>
          <p className="admin-page-subtitle">{members.length} total</p>
        </div>
        <Link href="/admin/team/new" className="admin-btn admin-btn-primary">+ Add team member</Link>
      </div>

      {members.length === 0 ? (
        <div className="admin-empty">
          <p>No team members yet.</p>
          <Link href="/admin/team/new" className="admin-btn admin-btn-primary">Add your first team member</Link>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th><th>Title</th><th>Phone</th><th>Status</th><th>Profile page</th><th>Sort</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td><strong>{member.name}</strong></td>
                  <td>{member.job_title ?? "Pending"}</td>
                  <td className="mono">{member.phone ?? "Pending"}</td>
                  <td><span className={`admin-badge ${statusBadge(member.status)}`}>{member.status}</span></td>
                  <td>
                    {member.has_profile_page && member.canonical_path ? (
                      <Link href={member.canonical_path} target="_blank">View profile</Link>
                    ) : (
                      <span className="admin-muted">Not enabled</span>
                    )}
                  </td>
                  <td>{member.sort_order}</td>
                  <td>
                    <Link href={`/admin/team/${member.id}/edit`} className="admin-btn admin-btn-sm">Edit</Link>
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

