import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { getOfficeByIdAdmin } from "@/lib/db/offices-admin";
import { deleteOffice, updateOffice } from "../../actions";
import { OfficeForm } from "../../OfficeForm";

export const metadata: Metadata = { title: "Edit Office" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditOfficePage({ params }: Props) {
  const { id } = await params;
  const office = await getOfficeByIdAdmin(id);
  if (!office) notFound();

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Edit office</h1>
          <Link href="/admin/offices" className="admin-back">Back to offices</Link>
        </div>
        <DeleteButton action={deleteOffice.bind(null, id)} label="Delete office" />
      </div>
      <OfficeForm action={updateOffice.bind(null, id)} office={office} />
    </div>
  );
}
