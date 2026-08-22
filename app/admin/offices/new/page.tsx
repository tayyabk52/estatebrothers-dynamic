import type { Metadata } from "next";
import Link from "next/link";
import { createOffice } from "../actions";
import { OfficeForm } from "../OfficeForm";

export const metadata: Metadata = { title: "New Office" };

export default function NewOfficePage() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>New office</h1>
          <Link href="/admin/offices" className="admin-back">Back to offices</Link>
        </div>
      </div>
      <OfficeForm action={createOffice} />
    </div>
  );
}
