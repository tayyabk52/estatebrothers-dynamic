import { AdminForm } from "@/components/admin/AdminForm";
import { deleteSeoLandingPage } from "./actions";
import { mediaUrl } from "@/lib/db/site";
import { SafeMediaImage } from "@/components/ui/SafeMediaImage";
import type { SeoLandingPage } from "@/lib/db/seo";

interface Props {
  page?: SeoLandingPage | null;
  action: (formData: FormData) => Promise<void>;
  matchingCount?: number;
}

function formatDateTimeLocal(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 16);
}

export function SeoLandingPageForm({ page, action, matchingCount }: Props) {
  const heroImage = mediaUrl(page?.hero_media);
  const ogImage = mediaUrl(page?.og_media);
  const heroExternalUrl = page?.hero_media?.source_type === "external" ? page.hero_media.external_url ?? "" : "";
  const ogExternalUrl = page?.og_media?.source_type === "external" ? page.og_media.external_url ?? "" : "";
  const isIndexable = page?.status === "published" && !page.noindex;
  const requestedPlacements = [
    page?.show_in_footer ? "footer" : null,
    page?.show_on_home ? "homepage" : null,
    page?.show_on_buy_sell ? "Buy/Sell page" : null,
  ].filter(Boolean);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{page ? "Edit SEO landing page" : "Create SEO landing page"}</h1>
          <p className="admin-page-subtitle">
            Curated public SEO pages tied to useful content and relevant published listings.
          </p>
        </div>
        <div className="admin-row-actions">
          <a className="admin-btn admin-btn-ghost" href="/admin/seo-landing-pages">
            Back to landing pages
          </a>
          {page ? (
            <a className="admin-btn admin-btn-ghost" href={page.canonical_path} target="_blank">
              View page ↗
            </a>
          ) : null}
        </div>
      </div>

      {page ? (
        <div className="admin-meta-bar">
          <span className="mono">ID: {page.id}</span>
          <span className="mono">Slug: {page.slug}</span>
          <span className="mono">Path: {page.canonical_path}</span>
          <span className="mono">Matches: {matchingCount ?? 0}</span>
        </div>
      ) : null}

      <AdminForm action={action} className="admin-form">
        <div className="admin-form-section">
          <div>
            <p className="admin-kicker">SEO landing page</p>
            <h2>Content</h2>
          </div>
          <label className="admin-field">
            <span>Title</span>
            <input name="title" defaultValue={page?.title ?? ""} required />
          </label>
          <label className="admin-field">
            <span>H1 heading</span>
            <input name="heading" defaultValue={page?.heading ?? ""} required />
          </label>
          <label className="admin-field">
            <span>Intro</span>
            <textarea name="intro" rows={4} defaultValue={page?.intro ?? ""} required />
          </label>
          <label className="admin-field">
            <span>Body</span>
            <textarea name="body" rows={14} defaultValue={page?.body ?? ""} />
          </label>
        </div>

        <div className="admin-form-section">
          <h2>Publishing</h2>
          <div className="admin-field-row">
            <label className="admin-field">
              <span>Status</span>
              <select name="status" defaultValue={page?.status ?? "draft"}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label className="admin-field">
              <span>Page type</span>
              <select name="page_type" defaultValue={page?.page_type ?? "listing_category"}>
                <option value="listing_category">Listing category</option>
                <option value="area">Area guide</option>
              </select>
            </label>
          </div>
          <div className="admin-field-row">
            <label className="admin-field">
              <span>Slug</span>
              <input name="slug" defaultValue={page?.slug ?? ""} placeholder="dha-lahore-plots-for-sale" />
            </label>
            <label className="admin-field">
              <span>Canonical path</span>
              <input
                name="canonical_path"
                defaultValue={page?.canonical_path ?? ""}
                placeholder="/dha-lahore-plots-for-sale"
              />
            </label>
          </div>
          <div className="admin-field-row">
            <label className="admin-field">
              <span>Published at</span>
              <input
                name="published_at"
                type="datetime-local"
                defaultValue={formatDateTimeLocal(page?.published_at)}
              />
            </label>
            <label className="admin-field">
              <span>Sort order</span>
              <input name="sort_order" type="number" defaultValue={page?.sort_order ?? 0} />
            </label>
          </div>
          <label className="admin-field admin-field-check">
            <input name="noindex" type="checkbox" defaultChecked={page?.noindex ?? true} />
            <span>Noindex this page until it is reviewed for production indexing</span>
          </label>
          <div className="admin-note">
            <strong>{isIndexable ? "Indexable" : "Not indexable"}.</strong>{" "}
            {matchingCount != null ? `${matchingCount} published listings currently match this page.` : null}
          </div>
          <div className="admin-note">
            <strong>{isIndexable ? "Public links are active" : "Public links are inactive"}.</strong>{" "}
            {isIndexable
              ? requestedPlacements.length
                ? `This page can appear in the ${requestedPlacements.join(", ")}.`
                : "Choose at least one placement before saving an indexable page."
              : "Placement choices are saved for review, but links appear only when the page is published and noindex is off."}
          </div>
          <div className="admin-field-row">
            <label className="admin-field admin-field-check">
              <input name="show_in_footer" type="checkbox" defaultChecked={page?.show_in_footer ?? false} />
              <span>Footer popular searches</span>
            </label>
            <label className="admin-field admin-field-check">
              <input name="show_on_home" type="checkbox" defaultChecked={page?.show_on_home ?? false} />
              <span>Homepage popular searches</span>
            </label>
            <label className="admin-field admin-field-check">
              <input name="show_on_buy_sell" type="checkbox" defaultChecked={page?.show_on_buy_sell ?? false} />
              <span>Buy/Sell popular searches</span>
            </label>
          </div>
          <div className="admin-field-row">
            <label className="admin-field">
              <span>Public link label</span>
              <input name="public_link_label" defaultValue={page?.public_link_label ?? page?.title ?? ""} />
            </label>
            <label className="admin-field">
              <span>Public link description</span>
              <textarea name="public_link_description" rows={3} defaultValue={page?.public_link_description ?? ""} />
            </label>
          </div>
        </div>

        <div className="admin-form-section">
          <h2>Listing filters</h2>
          <div className="admin-field-row">
            <label className="admin-field">
              <span>Listing type</span>
              <select name="listing_type_slug" defaultValue={page?.listing_type_slug ?? ""}>
                <option value="">Any</option>
                <option value="plot">Plot</option>
                <option value="house">House</option>
              </select>
            </label>
            <label className="admin-field">
              <span>City</span>
              <input name="city" defaultValue={page?.city ?? ""} placeholder="Lahore" />
            </label>
          </div>
          <div className="admin-field-row">
            <label className="admin-field">
              <span>Phase</span>
              <input name="phase" defaultValue={page?.phase ?? ""} placeholder="Phase 6" />
            </label>
            <label className="admin-field">
              <span>Neighborhood</span>
              <input name="neighborhood" defaultValue={page?.neighborhood ?? ""} placeholder="DHA Lahore" />
            </label>
            <label className="admin-field">
              <span>Listing status</span>
              <input name="listing_status" defaultValue={page?.listing_status ?? ""} placeholder="Available" />
            </label>
          </div>
          <label className="admin-field">
            <span>Advanced filters JSON</span>
            <textarea
              name="filters_json"
              rows={6}
              defaultValue={JSON.stringify(page?.filters ?? {}, null, 2)}
            />
          </label>
        </div>

        <div className="admin-form-section">
          <h2>Search metadata</h2>
          <label className="admin-field">
            <span>Meta title</span>
            <input name="meta_title" defaultValue={page?.meta_title ?? ""} required />
          </label>
          <label className="admin-field">
            <span>Meta description</span>
            <textarea name="meta_description" rows={4} maxLength={180} defaultValue={page?.meta_description ?? ""} required />
          </label>
          <label className="admin-field">
            <span>Keywords</span>
            <input
              name="keywords"
              defaultValue={(page?.keywords ?? []).join(", ")}
              placeholder="DHA Lahore plots, plots for sale"
            />
          </label>
          <p className="admin-muted">
            Metadata is used for title tags, descriptions, canonicals, Open Graph, and social previews. The site name is appended automatically unless the title already ends with “Estate Brothers”.
          </p>
        </div>

        <div className="admin-form-section">
          <h2>Hero image</h2>
          {heroImage ? (
            <div className="admin-media-preview">
              <SafeMediaImage
                src={heroImage}
                alt={page?.hero_media?.alt_text ?? page?.title ?? ""}
                width={420}
                height={220}
                sizes="420px"
              />
              <p>{heroImage}</p>
            </div>
          ) : null}
          <input type="hidden" name="existing_hero_media_id" value={page?.hero_media_id ?? ""} />
          <div className="admin-field-row">
            <label className="admin-field">
              <span>Upload hero image</span>
              <input name="hero_media_file" type="file" accept="image/*" />
            </label>
            <label className="admin-field">
              <span>External hero image URL</span>
              <input name="hero_external_url" type="url" defaultValue={heroExternalUrl} />
            </label>
          </div>
          <label className="admin-field">
            <span>Hero alt text</span>
            <input name="hero_alt_text" defaultValue={page?.hero_media?.alt_text ?? ""} />
          </label>
          {page?.hero_media_id ? (
            <label className="admin-field admin-field-check">
              <input name="remove_hero_media" type="checkbox" />
              <span>Remove current hero image</span>
            </label>
          ) : null}
        </div>

        <div className="admin-form-section">
          <h2>Open Graph image</h2>
          {ogImage ? (
            <div className="admin-media-preview">
              <SafeMediaImage
                src={ogImage}
                alt={page?.og_media?.alt_text ?? page?.title ?? ""}
                width={420}
                height={220}
                sizes="420px"
              />
              <p>{ogImage}</p>
            </div>
          ) : null}
          <input type="hidden" name="existing_og_media_id" value={page?.og_media_id ?? ""} />
          <div className="admin-field-row">
            <label className="admin-field">
              <span>Upload OG image</span>
              <input name="og_media_file" type="file" accept="image/*" />
            </label>
            <label className="admin-field">
              <span>External OG image URL</span>
              <input name="og_external_url" type="url" defaultValue={ogExternalUrl} />
            </label>
          </div>
          <label className="admin-field">
            <span>OG alt text</span>
            <input name="og_alt_text" defaultValue={page?.og_media?.alt_text ?? ""} />
          </label>
          {page?.og_media_id ? (
            <label className="admin-field admin-field-check">
              <input name="remove_og_media" type="checkbox" />
              <span>Remove current OG image</span>
            </label>
          ) : null}
        </div>

        <div className="admin-form-actions">
          <a href="/admin/seo-landing-pages" className="admin-btn admin-btn-ghost">Cancel</a>
          <button className="admin-btn admin-btn-primary" type="submit">
            Save SEO landing page
          </button>
        </div>
      </AdminForm>
      {page ? <AdminForm action={deleteSeoLandingPage.bind(null, page.id)} className="admin-destructive-row"><button className="admin-btn admin-btn-danger" type="submit">Delete SEO landing page</button></AdminForm> : null}
    </div>
  );
}
