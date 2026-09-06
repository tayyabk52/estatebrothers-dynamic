import { AdminForm } from "@/components/admin/AdminForm";
import { SafeMediaImage } from "@/components/ui/SafeMediaImage";

export type ExistingMediaItem = {
  id: string;
  media_id: string;
  sort_order: number;
  is_primary?: boolean;
  is_gallery_item?: boolean;
  is_featured?: boolean;
  is_inline?: boolean;
  is_og_candidate?: boolean;
  media_assets?: {
    title: string | null;
    alt_text: string | null;
    public_url: string | null;
    external_url: string | null;
    thumbnail_url: string | null;
    media_type: string;
    status: string;
  } | null;
};

function mediaUrl(item: ExistingMediaItem) {
  const asset = item.media_assets;
  if (!asset) return null;
  if (asset.media_type === "image") {
    return asset.public_url ?? asset.external_url ?? asset.thumbnail_url;
  }
  return asset.thumbnail_url ?? asset.public_url ?? asset.external_url;
}

export function ExistingMediaManager({
  title,
  emptyText,
  items,
  updateActionFor,
  removeActionFor,
  featuredLabel = "Featured / hero media",
}: {
  title: string;
  emptyText: string;
  items: ExistingMediaItem[];
  updateActionFor: (item: ExistingMediaItem) => (formData: FormData) => Promise<void>;
  removeActionFor: (item: ExistingMediaItem) => (formData: FormData) => Promise<void>;
  featuredLabel?: string;
}) {
  return (
    <section className="admin-form-section admin-existing-media">
      <div className="admin-card-head">
        <div>
          <h2>{title}</h2>
          <p>Manage media already attached to this record. Removing media here only detaches it from this record.</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="admin-empty">{emptyText}</div>
      ) : (
        <div className="admin-existing-media-grid">
          {[...items].sort((a, b) => a.sort_order - b.sort_order).map((item) => {
            const asset = item.media_assets;
            const src = mediaUrl(item);
            return (
              <article className="admin-existing-media-card" key={item.id}>
                <div className="admin-existing-media-preview">
                  {src ? (
                    <SafeMediaImage
                      src={src}
                      alt={asset?.alt_text ?? asset?.title ?? "Attached media"}
                      width={360}
                      height={220}
                      sizes="(max-width: 760px) 100vw, 360px"
                    />
                  ) : (
                    <span>{asset?.media_type ?? "media"}</span>
                  )}
                </div>

                <AdminForm action={updateActionFor(item)} className="admin-existing-media-form">
                  <div className="admin-field-row">
                    <label className="admin-field">
                      Sort order
                      <input type="number" name="sort_order" defaultValue={item.sort_order} />
                    </label>
                    <label className="admin-field">
                      Status
                      <input value={asset?.status ?? "unknown"} readOnly className="admin-input-disabled" />
                    </label>
                  </div>
                  <label className="admin-field">
                    Media title
                    <input name="media_title" defaultValue={asset?.title ?? ""} />
                  </label>
                  <label className="admin-field">
                    Alt text
                    <input name="media_alt_text" defaultValue={asset?.alt_text ?? ""} />
                  </label>
                  <div className="admin-field-row">
                    <label className="admin-field admin-field-check">
                      <input type="checkbox" name="is_primary" value="true" defaultChecked={Boolean(item.is_primary ?? item.is_featured)} />
                      {featuredLabel}
                    </label>
                    {"is_gallery_item" in item && (
                      <label className="admin-field admin-field-check">
                        <input type="checkbox" name="is_gallery_item" value="true" defaultChecked={item.is_gallery_item !== false} />
                        Show in gallery
                      </label>
                    )}
                    <label className="admin-field admin-field-check">
                      <input type="checkbox" name="is_og_candidate" value="true" defaultChecked={Boolean(item.is_og_candidate)} />
                      Use for social preview
                    </label>
                  </div>
                  <div className="admin-form-actions admin-form-actions-inline">
                    <button type="submit" className="admin-btn admin-btn-primary">Save media</button>
                  </div>
                </AdminForm>

                <AdminForm action={removeActionFor(item)} className="admin-existing-media-remove">
                  <button type="submit" className="admin-btn admin-btn-danger">Remove from record</button>
                </AdminForm>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
