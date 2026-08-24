import Link from "next/link";
import type { TeamMemberRow } from "@/lib/supabase/types";

type TeamFormMember = TeamMemberRow & {
  image_media?: { alt_text: string | null } | null;
  og_media?: { public_url: string | null; external_url: string | null; thumbnail_url: string | null } | null;
};

export function TeamForm({
  action,
  member,
}: {
  action: (formData: FormData) => void | Promise<void>;
  member?: TeamFormMember;
}) {
  const profilePath =
    member?.has_profile_page ? member.canonical_path || (member.slug ? `/team/${member.slug}` : "") : "";
  const ogImage = member?.og_image ?? member?.og_media?.public_url ?? member?.og_media?.external_url ?? member?.og_media?.thumbnail_url ?? "";

  return (
    <form action={action} className="admin-form">
      <div className="admin-form-section">
        <h2>Profile</h2>
        <label className="admin-field">Name *<input name="name" required defaultValue={member?.name ?? ""} /></label>
        <label className="admin-field">Slug<input name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={member?.slug ?? ""} /></label>
        <div className="admin-field-row">
          <label className="admin-field">Job title<input name="job_title" defaultValue={member?.job_title ?? ""} /></label>
          <label className="admin-field">Sort order<input type="number" name="sort_order" defaultValue={member?.sort_order ?? 0} /></label>
        </div>
        <div className="admin-field-row">
          <label className="admin-field">Phone<input name="phone" defaultValue={member?.phone ?? ""} /></label>
          <label className="admin-field">WhatsApp<input name="whatsapp" defaultValue={member?.whatsapp ?? ""} /></label>
        </div>
        <label className="admin-field">Email<input type="email" name="email" defaultValue={member?.email ?? ""} /></label>
        <label className="admin-field">Bio<textarea name="bio" rows={4} defaultValue={member?.bio ?? ""} /></label>
      </div>

      <div className="admin-form-section">
        <h2>Profile image</h2>
        <input type="hidden" name="existing_image_media_id" value={member?.image_media_id ?? ""} />
        <input type="hidden" name="existing_image_url" value={member?.image_url ?? ""} />
        <input type="hidden" name="existing_og_media_id" value={member?.og_media_id ?? ""} />
        <input type="hidden" name="existing_og_image" value={ogImage} />
        <label className="admin-field">
          Upload image
          <input type="file" name="team_image" accept="image/*" />
        </label>
        <label className="admin-field">
          Image URL
          <input name="image_url" placeholder="/images/team/name.jpg or https://..." defaultValue={member?.image_url ?? ""} />
        </label>
        <label className="admin-field">
          Image alt text
          <input
            name="image_alt_text"
            placeholder="e.g. Abdul Rehman, Estate Brothers property consultant in DHA Lahore"
            defaultValue={member?.image_media?.alt_text ?? (member?.name ? `${member.name}${member.job_title ? `, ${member.job_title}` : ""}` : "")}
          />
        </label>
        <div className="admin-field-row">
          <label className="admin-field">
            Upload OG image
            <input type="file" name="team_og_image" accept="image/*" />
          </label>
          <label className="admin-field">
            OG image URL
            <input name="og_image" placeholder="/og-default.jpg or https://..." defaultValue={ogImage} />
          </label>
        </div>
      </div>

      <div className="admin-form-section">
        <h2>Publishing</h2>
        <div className="admin-field-row">
          <label className="admin-field">
            Status
            <select name="status" defaultValue={member?.status ?? "draft"}>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="admin-field admin-field-check" style={{ alignSelf: "flex-end" }}>
            <input type="checkbox" name="public_profile" value="true" defaultChecked={member?.public_profile ?? false} />
            Show publicly on About page
          </label>
          <label className="admin-field admin-field-check" style={{ alignSelf: "flex-end" }}>
            <input type="checkbox" name="has_profile_page" value="true" defaultChecked={member?.has_profile_page ?? false} />
            Create SEO profile page
          </label>
        </div>
        {profilePath && (
          <p className="admin-field-hint">Canonical profile path: <span className="mono">{profilePath}</span></p>
        )}
      </div>

      <div className="admin-form-section">
        <h2>SEO profile content</h2>
        <label className="admin-field">
          Profile summary
          <textarea name="profile_summary" rows={2} maxLength={260} defaultValue={member?.profile_summary ?? ""} />
        </label>
        <label className="admin-field">
          Full profile body
          <textarea name="profile_body" rows={8} defaultValue={member?.profile_body ?? ""} />
        </label>
        <label className="admin-field">
          Keywords / expertise (comma separated)
          <input name="keywords" defaultValue={(member?.keywords ?? []).join(", ")} placeholder="DHA Lahore, plots, investment advisory" />
        </label>
        <label className="admin-field">Meta title<input name="meta_title" maxLength={70} defaultValue={member?.meta_title ?? ""} /></label>
        <label className="admin-field">Meta description<textarea name="meta_description" rows={2} maxLength={180} defaultValue={member?.meta_description ?? ""} /></label>
        <p className="admin-field-hint">
          Published SEO profile pages require job title, image, alt text, summary, full body, keywords, and meta description.
        </p>
      </div>

      <div className="admin-form-actions">
        <Link href="/admin/team" className="admin-btn admin-btn-ghost">Cancel</Link>
        <button type="submit" className="admin-btn admin-btn-primary">Save team member</button>
      </div>
    </form>
  );
}
