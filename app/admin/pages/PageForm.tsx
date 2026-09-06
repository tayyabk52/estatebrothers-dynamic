import { AdminForm } from "@/components/admin/AdminForm";
import Link from "next/link";
import type { PageRow } from "@/lib/db/site";

export function PageForm({ action, page }: { action: (formData: FormData) => void | Promise<void>; page?: PageRow }) {
  return (
    <AdminForm action={action} className="admin-form">
      <div className="admin-form-section">
        <h2>Route & content</h2>
        <div className="admin-field-row">
          <label className="admin-field">Route path *<input name="route_path" required defaultValue={page?.route_path ?? "/"} /></label>
          <label className="admin-field">Page key<input name="page_key" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={page?.page_key ?? ""} /></label>
        </div>
        <label className="admin-field">Title *<input name="title" required defaultValue={page?.title ?? ""} /></label>
        <label className="admin-field">Heading<input name="heading" defaultValue={page?.heading ?? ""} /></label>
        <label className="admin-field">Intro<textarea name="intro" rows={3} defaultValue={page?.intro ?? ""} /></label>
        <label className="admin-field">Body<textarea name="body" rows={6} defaultValue={page?.body ?? ""} /></label>
        <input type="hidden" name="existing_hero_media_id" value={page?.hero_media_id ?? ""} />
        <label className="admin-field">
          Hero image URL
          <input name="hero_image_url" placeholder="/images/properties/hero-estatebrothers.webp or https://..." />
        </label>
      </div>
      <div className="admin-form-section">
        <h2>Publishing & SEO</h2>
        <div className="admin-field-row">
          <label className="admin-field">Status<select name="status" defaultValue={page?.status ?? "draft"}><option value="draft">Draft</option><option value="review">Review</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
          <label className="admin-field admin-field-check" style={{ alignSelf: "flex-end" }}><input type="checkbox" name="noindex" value="true" defaultChecked={page?.noindex ?? false} /> noindex</label>
        </div>
        <input type="hidden" name="published_at" value={page?.published_at ?? ""} />
        <label className="admin-field">Meta title<input name="meta_title" maxLength={70} defaultValue={page?.meta_title ?? ""} /></label>
        <label className="admin-field">Meta description<textarea name="meta_description" rows={2} maxLength={180} defaultValue={page?.meta_description ?? ""} /></label>
        <label className="admin-field">OG image URL<input name="og_image" defaultValue={page?.og_image ?? ""} /></label>
        <label className="admin-field">Keywords (comma separated)<input name="keywords" defaultValue={(page?.keywords ?? []).join(", ")} /></label>
      </div>
      <div className="admin-form-actions">
        <Link href="/admin/pages" className="admin-btn admin-btn-ghost">Cancel</Link>
        <button type="submit" className="admin-btn admin-btn-primary">Save page</button>
      </div>
    </AdminForm>
  );
}
