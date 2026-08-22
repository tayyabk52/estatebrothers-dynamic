import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { createUpdate } from "../actions";
import { SeoQualityWidget } from "@/components/admin/SeoQualityWidget";
import { SlugFieldWithWarning } from "@/components/admin/SlugFieldWithWarning";

export const metadata: Metadata = { title: "New Update" };

export default async function NewUpdatePage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: authors } = await supabase.from("content_authors").select("id, name").order("name");

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>New update</h1>
          <Link href="/admin/updates" className="admin-back">← Back to updates</Link>
        </div>
      </div>

      <form action={createUpdate} className="admin-form">
        <div className="admin-form-section">
          <h2>Core</h2>
          <div className="admin-field-row">
            <label className="admin-field">
              Type *
              <select name="update_type" required defaultValue="announcement">
                <option value="announcement">Announcement</option>
                <option value="facebook">Facebook</option>
                <option value="event">Event</option>
                <option value="market">Market note</option>
                <option value="company">Company</option>
              </select>
            </label>
            <label className="admin-field">
              Publication Status *
              <select name="status" required defaultValue="draft">
                <option value="draft">Draft (Private)</option>
                <option value="review">In Review</option>
                <option value="published">Published (Public)</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>
          <label className="admin-field">
            Title *
            <input type="text" name="title" required placeholder="e.g. Estate Brothers expands coverage across DHA Lahore" />
          </label>

          <SlugFieldWithWarning
            basePath="/updates"
          />

          <label className="admin-field">
            Article headline
            <input type="text" name="headline" placeholder="Optional in-depth SEO headline" />
          </label>

          <div className="admin-field-row">
            <label className="admin-field">
              Source
              <input type="text" name="source" defaultValue="website" placeholder="website / facebook / etc." />
            </label>
            <label className="admin-field admin-field-check" style={{ alignSelf: "flex-end" }}>
              <input type="checkbox" name="featured" value="true" />
              Featured (shown prominently)
            </label>
          </div>
          <label className="admin-field">
            Author (E-E-A-T / Required to publish) *
            <select name="author_id" defaultValue="">
              <option value="">— None —</option>
              {(authors ?? []).map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </label>
          <div className="admin-field-row">
            <label className="admin-field">Article schema
              <select name="article_schema_type" defaultValue="Article">
                <option value="Article">Article</option>
                <option value="NewsArticle">NewsArticle</option>
                <option value="BlogPosting">BlogPosting</option>
              </select>
            </label>
            <label className="admin-field">Article section<input type="text" name="article_section" placeholder="Market / Company / Event" /></label>
          </div>
          <label className="admin-field">Tags (comma separated)<input type="text" name="tags" placeholder="DHA Lahore, market update" /></label>
        </div>

        <div className="admin-form-section">
          <h2>Content</h2>
          <label className="admin-field">
            Summary (shown in feed cards and search snippets)
            <textarea name="summary" rows={2} placeholder="Short description shown in the updates feed." />
          </label>
          <label className="admin-field">
            Body (full article content)
            <textarea name="body" rows={8} placeholder="Full article text…" />
          </label>
        </div>

        <div className="admin-form-section">
          <h2>SEO Metadata Overrides</h2>
          <label className="admin-field">Meta title (Recommended 50–60 chars, max 70)<input type="text" name="meta_title" maxLength={70} placeholder="Custom SEO Title" /></label>
          <label className="admin-field">Meta description (Recommended 130–160 chars, max 180)<textarea name="meta_description" rows={2} maxLength={180} placeholder="Custom SEO Meta Description" /></label>
        </div>

        <SeoQualityWidget
          type="update"
          initialData={{
            title: "",
            headline: "",
            meta_title: "",
            meta_description: "",
            summary: "",
            body: "",
            author_id: "",
            slug: "",
          }}
        />

        <div className="admin-form-section">
          <h2>Links & media</h2>
          <input type="hidden" name="links_submitted" value="true" />
          <div className="admin-field-row">
            <label className="admin-field">Link label<input name="link_label" placeholder="Read more" /></label>
            <label className="admin-field">Link URL<input name="link_url" placeholder="/buy-sell or https://..." /></label>
            <label className="admin-field">Kind<select name="link_kind" defaultValue="internal"><option value="internal">Internal</option><option value="external">External</option></select></label>
          </div>
          <label className="admin-field">Upload media<input type="file" name="update_media" multiple accept="image/*,video/*,.pdf" /></label>
          <div className="admin-field-row">
            <label className="admin-field">Media title<input type="text" name="media_title" /></label>
            <label className="admin-field">Alt text<input type="text" name="media_alt_text" placeholder="Describe the image for SEO" /></label>
          </div>
          <div className="admin-field-row">
            <label className="admin-field admin-field-check"><input type="checkbox" name="media_featured" value="true" defaultChecked /> Featured media</label>
            <label className="admin-field admin-field-check"><input type="checkbox" name="media_og" value="true" defaultChecked /> Use as OG candidate</label>
          </div>
          <label className="admin-field">YouTube/Facebook/external media URL<input type="url" name="external_media_url" /></label>
          <div className="admin-field-row">
            <label className="admin-field">External title<input type="text" name="external_media_title" /></label>
            <label className="admin-field">External thumbnail URL<input type="url" name="external_thumbnail_url" /></label>
          </div>
        </div>

        <div className="admin-form-actions">
          <Link href="/admin/updates" className="admin-btn admin-btn-ghost">Cancel</Link>
          <button type="submit" className="admin-btn admin-btn-primary">Create update</button>
        </div>
      </form>
    </div>
  );
}
