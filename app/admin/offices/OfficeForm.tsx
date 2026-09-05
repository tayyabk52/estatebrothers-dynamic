import Link from "next/link";
import { OfficeImageField } from "@/components/admin/OfficeImageField";
import { mediaUrl, type OfficeLocationWithMedia } from "@/lib/db/site";

export function OfficeForm({
  action,
  office,
}: {
  action: (formData: FormData) => void | Promise<void>;
  office?: OfficeLocationWithMedia;
}) {
  const currentImage = mediaUrl(office?.image_media);

  return (
    <form action={action} className="admin-form">
      <div className="admin-form-section">
        <h2>Office</h2>
        <div className="admin-field-row">
          <label className="admin-field">Name *<input name="name" required defaultValue={office?.name ?? ""} /></label>
          <label className="admin-field">Slug<input name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={office?.slug ?? ""} /></label>
        </div>
        <div className="admin-field-row">
          <label className="admin-field">Status label<input name="status_label" defaultValue={office?.status_label ?? ""} /></label>
          <label className="admin-field">Sort order<input type="number" name="sort_order" defaultValue={office?.sort_order ?? 0} /></label>
        </div>
        <label className="admin-field">Detail<textarea name="detail" rows={4} defaultValue={office?.detail ?? ""} /></label>
      </div>

      <div className="admin-form-section">
        <h2>Contact</h2>
        <div className="admin-field-row">
          <label className="admin-field">Phone<input name="phone" defaultValue={office?.phone ?? ""} /></label>
          <label className="admin-field">Email<input type="email" name="email" defaultValue={office?.email ?? ""} /></label>
        </div>
      </div>

      <div className="admin-form-section">
        <h2>Address & map</h2>
        <label className="admin-field">Address line 1<input name="address_line_1" defaultValue={office?.address_line_1 ?? ""} /></label>
        <label className="admin-field">Address line 2<input name="address_line_2" defaultValue={office?.address_line_2 ?? ""} /></label>
        <div className="admin-field-row">
          <label className="admin-field">City<input name="city" defaultValue={office?.city ?? ""} /></label>
          <label className="admin-field">Region<input name="region" defaultValue={office?.region ?? ""} /></label>
          <label className="admin-field">Postal code<input name="postal_code" defaultValue={office?.postal_code ?? ""} /></label>
          <label className="admin-field">Country<input name="country_code" maxLength={2} defaultValue={office?.country_code ?? "PK"} /></label>
        </div>
        <div className="admin-field-row">
          <label className="admin-field">Latitude<input type="number" step="0.0000001" name="latitude" defaultValue={office?.latitude ?? ""} /></label>
          <label className="admin-field">Longitude<input type="number" step="0.0000001" name="longitude" defaultValue={office?.longitude ?? ""} /></label>
        </div>
        <label className="admin-field">Google Maps URL<input type="url" name="map_url" defaultValue={office?.map_url ?? ""} /></label>
      </div>

      <div className="admin-form-section">
        <h2>Office image</h2>
        <input type="hidden" name="existing_image_media_id" value={office?.image_media_id ?? ""} />
        <input type="hidden" name="existing_image_url" value={currentImage ?? ""} />
        <OfficeImageField currentSrc={currentImage} alt={office?.name ?? "Office"} />
        <label className="admin-field">Image URL<input name="image_url" defaultValue={currentImage ?? ""} placeholder="/images/... or https://..." /></label>
      </div>

      <div className="admin-form-section">
        <h2>Publishing</h2>
        <label className="admin-field">
          Status
          <select name="status" defaultValue={office?.status ?? "draft"}>
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </div>

      <div className="admin-form-actions">
        <Link href="/admin/offices" className="admin-btn admin-btn-ghost">Cancel</Link>
        <button type="submit" className="admin-btn admin-btn-primary">Save office</button>
      </div>
    </form>
  );
}
