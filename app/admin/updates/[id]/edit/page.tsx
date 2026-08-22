import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getUpdateByIdAdmin, getUpdateLinksAdmin } from "@/lib/db/updates";
import { updateUpdate, deleteUpdate } from "../../actions";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { SeoQualityWidget } from "@/components/admin/SeoQualityWidget";
import { SlugFieldWithWarning } from "@/components/admin/SlugFieldWithWarning";

export const metadata: Metadata = { title: "Edit Update" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditUpdatePage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const [update, links, { data: authors }] = await Promise.all([
    getUpdateByIdAdmin(id),
    getUpdateLinksAdmin(id),
    supabase.from("content_authors").select("id, name").order("name"),
  ]);
  if (!update) notFound();

  const updateWithId = updateUpdate.bind(null, id);
  const deleteWithId = deleteUpdate.bind(null, id);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Edit update</h1>
          <Link href="/admin/updates" className="admin-back">← Back to updates</Link>
        </div>
        <div className="admin-row-actions">
          {update.status === "published" && (
            <Link href={`/updates/${update.slug}`} target="_blank" className="admin-btn admin-btn-ghost">View live ↗</Link>
          )}
          <DeleteButton action={deleteWithId} label="Delete update" />
        </div>
      </div>

      <div className="admin-meta-bar">
        <span className="mono">ID: {update.id}</span>
        <span className="mono">Slug: {update.slug}</span>
      </div>

      <form action={updateWithId} className="admin-form">
        <div className="admin-form-section">
          <h2>Core</h2>
          <div className="admin-field-row">
            <label className="admin-field">
              Type *
              <select name="update_type" defaultValue={update.update_type} required>
                <option value="announcement">Announcement</option>
                <option value="facebook">Facebook</option>
                <option value="event">Event</option>
                <option value="market">Market note</option>
                <option value="company">Company</option>
              </select>
            </label>
            <label className="admin-field">
              Publication Status *
              <select name="status" defaultValue={update.status} required>
                <option value="draft">Draft (Private)</option>
                <option value="review">In Review</option>
                <option value="published">Published (Public)</option>
                <option value="archived">Archived (Taken Down)</option>
              </select>
            </label>
          </div>
          <label className="admin-field">
            Title *
            <input type="text" name="title" defaultValue={update.title} required />
          </label>
          
          <SlugFieldWithWarning
            initialSlug={update.slug}
            basePath="/updates"
            required
          />

          <label className="admin-field">Article headline<input type="text" name="headline" defaultValue={update.headline ?? ""} placeholder="e.g. Comprehensive Analysis of DHA Real Estate Trends" /></label>
          <input type="hidden" name="published_at" value={update.published_at ?? ""} />
          <div className="admin-field-row">
            <label className="admin-field">Source<input type="text" name="source" defaultValue={update.source} /></label>
            <label className="admin-field admin-field-check" style={{ alignSelf: "flex-end" }}>
              <input type="checkbox" name="featured" value="true" defaultChecked={update.featured} />
              Featured
            </label>
            <label className="admin-field admin-field-check" style={{ alignSelf: "flex-end" }}>
              <input type="checkbox" name="noindex" value="true" defaultChecked={update.noindex} />
              noindex (hide from search engines)
            </label>
          </div>
          <label className="admin-field">
            Author (E-E-A-T / Required to publish) *
            <select name="author_id" defaultValue={update.author_id ?? ""}>
              <option value="">— None —</option>
              {(authors ?? []).map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </label>
          <div className="admin-field-row">
            <label className="admin-field">Article schema
              <select name="article_schema_type" defaultValue={update.article_schema_type}>
                <option value="Article">Article</option>
                <option value="NewsArticle">NewsArticle</option>
                <option value="BlogPosting">BlogPosting</option>
              </select>
            </label>
            <label className="admin-field">Article section<input type="text" name="article_section" defaultValue={update.article_section ?? ""} placeholder="e.g. Market Analysis" /></label>
          </div>
          <label className="admin-field">Tags (comma separated)<input type="text" name="tags" defaultValue={(update.tags ?? []).join(", ")} placeholder="DHA Lahore, Investment, Property Rates" /></label>
        </div>

        <div className="admin-form-section">
          <h2>Content</h2>
          <label className="admin-field">Summary<textarea name="summary" rows={2} defaultValue={update.summary ?? ""} placeholder="Brief 1-2 sentence article summary for snippets and previews" /></label>
          <label className="admin-field">Body<textarea name="body" rows={10} defaultValue={update.body ?? ""} placeholder="In-depth article text, paragraphs, and insights" /></label>
        </div>

        <div className="admin-form-section">
          <h2>SEO Metadata Overrides</h2>
          <label className="admin-field">Meta title (Recommended 50–60 chars, max 70)<input type="text" name="meta_title" defaultValue={update.meta_title ?? ""} maxLength={70} placeholder="Custom SEO Title" /></label>
          <label className="admin-field">Meta description (Recommended 130–160 chars, max 180)<textarea name="meta_description" rows={2} defaultValue={update.meta_description ?? ""} maxLength={180} placeholder="Custom SEO Meta Description" /></label>
        </div>

        <SeoQualityWidget
          type="update"
          initialData={{
            title: update.title,
            headline: update.headline,
            meta_title: update.meta_title,
            meta_description: update.meta_description,
            summary: update.summary,
            body: update.body,
            author_id: update.author_id,
            tags: update.tags,
            slug: update.slug,
            has_media: Boolean(update.thumbnail_url || update.og_image),
          }}
        />

        <div className="admin-form-section">
          <h2>Add links & media</h2>
          <input type="hidden" name="links_submitted" value="true" />
          {[...links, { id: "new", label: "", url: "", kind: "internal" }].map((link) => (
            <div className="admin-field-row" key={link.id}>
              <label className="admin-field">Link label<input name="link_label" defaultValue={link.label} placeholder="Read more" /></label>
              <label className="admin-field">Link URL<input name="link_url" defaultValue={link.url} placeholder="/buy-sell or https://..." /></label>
              <label className="admin-field">Kind<select name="link_kind" defaultValue={link.kind}><option value="internal">Internal</option><option value="external">External</option></select></label>
            </div>
          ))}
          <label className="admin-field">Upload media<input type="file" name="update_media" multiple accept="image/*,video/*,.pdf" /></label>
          <div className="admin-field-row">
            <label className="admin-field">Media title<input type="text" name="media_title" /></label>
            <label className="admin-field">Alt text<input type="text" name="media_alt_text" placeholder="Describe the image for SEO" /></label>
          </div>
          <div className="admin-field-row">
            <label className="admin-field admin-field-check"><input type="checkbox" name="media_featured" value="true" /> Featured media</label>
            <label className="admin-field admin-field-check"><input type="checkbox" name="media_og" value="true" /> Use as OG candidate</label>
          </div>
          <label className="admin-field">YouTube/Facebook/external media URL<input type="url" name="external_media_url" /></label>
          <div className="admin-field-row">
            <label className="admin-field">External title<input type="text" name="external_media_title" /></label>
            <label className="admin-field">External thumbnail URL<input type="url" name="external_thumbnail_url" /></label>
          </div>
        </div>

        <div className="admin-form-actions">
          <Link href="/admin/updates" className="admin-btn admin-btn-ghost">Cancel</Link>
          <button type="submit" className="admin-btn admin-btn-primary">Save changes</button>
        </div>
      </form>
    </div>
  );
}
