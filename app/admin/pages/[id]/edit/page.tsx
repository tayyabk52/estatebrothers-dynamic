import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { getPageByIdAdmin } from "@/lib/db/pages-admin";
import { deletePage } from "../../actions";
import { PageEditorWorkspace } from "../../PageEditorWorkspace";

export const metadata: Metadata = { title: "Edit Page" };

interface Props { params: Promise<{ id: string }> }

export default async function EditPage({ params }: Props) {
  const { id } = await params;
  const page = await getPageByIdAdmin(id);
  if (!page) notFound();
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1>Edit page</h1><Link href="/admin/pages" className="admin-back">Back to pages</Link></div>
        <DeleteButton action={deletePage.bind(null, id)} label="Delete page" />
      </div>
      <PageEditorWorkspace page={page} />
    </div>
  );
}
