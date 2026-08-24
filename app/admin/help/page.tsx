import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminHelpPanel } from "@/features/admin-help/components/AdminHelpPanel";
import { getKnowledgebaseSummaries } from "@/features/admin-help/server/knowledgebase";

export const metadata: Metadata = {
  title: "Admin Help",
};

export default async function AdminHelpPage() {
  await requireAdmin();
  const guides = getKnowledgebaseSummaries();

  return (
    <div className="admin-page admin-help-page">
      <div className="admin-page-header">
        <div>
          <h1>Admin help</h1>
          <p className="admin-page-subtitle">
            Verified technical guides with simple AI explanations for day-to-day admin work.
          </p>
        </div>
      </div>

      <div className="admin-help-grid">
        <section className="admin-card">
          <div className="admin-card-head">
            <div>
              <h2>Ask the assistant</h2>
              <p>Answers come from the local Estate Brothers admin knowledgebase.</p>
            </div>
          </div>
          <AdminHelpPanel />
        </section>

        <aside className="admin-card">
          <div className="admin-card-head">
            <div>
              <h2>Available guides</h2>
              <p>These markdown guides are the source of truth used by the assistant.</p>
            </div>
          </div>
          <div className="admin-help-guide-list">
            {guides.map((guide) => (
              <article key={guide.id}>
                <h3>{guide.title}</h3>
                <p>{guide.description}</p>
                <span className="mono">{guide.keywords.slice(0, 6).join(" · ")}</span>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
