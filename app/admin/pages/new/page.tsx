import type { Metadata } from "next";
import Link from "next/link";
import { createPage } from "../actions";
import { PageForm } from "../PageForm";

export const metadata: Metadata = { title: "New Page" };

export default function NewPage() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1>New page</h1><Link href="/admin/pages" className="admin-back">Back to pages</Link></div>
      </div>
      <PageForm action={createPage} />
    </div>
  );
}

