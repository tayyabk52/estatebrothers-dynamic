import type { Metadata } from "next";
import Link from "next/link";
import { createTeamMember } from "../actions";
import { TeamForm } from "../TeamForm";

export const metadata: Metadata = { title: "New Team Member" };

export default function NewTeamMemberPage() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>New team member</h1>
          <Link href="/admin/team" className="admin-back">Back to team</Link>
        </div>
      </div>
      <TeamForm action={createTeamMember} />
    </div>
  );
}

