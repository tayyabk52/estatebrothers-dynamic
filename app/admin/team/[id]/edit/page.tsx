import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { getTeamMemberByIdAdmin } from "@/lib/db/team";
import { deleteTeamMember, updateTeamMember } from "../../actions";
import { TeamForm } from "../../TeamForm";

export const metadata: Metadata = { title: "Edit Team Member" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTeamMemberPage({ params }: Props) {
  const { id } = await params;
  const member = await getTeamMemberByIdAdmin(id);
  if (!member) notFound();
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Edit team member</h1>
          <Link href="/admin/team" className="admin-back">Back to team</Link>
        </div>
        <DeleteButton action={deleteTeamMember.bind(null, id)} label="Delete team member" />
      </div>
      <TeamForm action={updateTeamMember.bind(null, id)} member={member} />
    </div>
  );
}

