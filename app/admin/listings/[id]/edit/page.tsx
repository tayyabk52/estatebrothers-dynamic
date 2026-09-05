import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getListingByIdAdmin } from "@/lib/db/listings";
import { getAllTeamMembersAdmin } from "@/lib/db/team";
import { updateListing, deleteListing, updateListingMediaItem, removeListingMediaItem } from "../../actions";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { SeoQualityWidget } from "@/components/admin/SeoQualityWidget";
import { SlugFieldWithWarning } from "@/components/admin/SlugFieldWithWarning";
import { MediaAltManager } from "@/components/admin/MediaAltManager";
import { AIGenerateButton } from "@/components/admin/AIGenerateButton";
import { ExistingMediaManager } from "@/components/admin/ExistingMediaManager";

export const metadata: Metadata = { title: "Edit Listing" };

interface Props {
  params: Promise<{ id: string }>;
}

function attributes(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function textLines(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").join("\n") : "";
}

function paymentLines(value: unknown) {
  if (!Array.isArray(value)) return "";
  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const row = item as Record<string, unknown>;
    return typeof row.label === "string" && typeof row.amount === "string"
      ? [`${row.label} | ${row.amount}`]
      : [];
  }).join("\n");
}

export default async function EditListingPage({ params }: Props) {
  const { id } = await params;
  const [listing, team] = await Promise.all([getListingByIdAdmin(id), getAllTeamMembersAdmin()]);
  if (!listing) notFound();

  const updateWithId = updateListing.bind(null, id);
  const deleteWithId = deleteListing.bind(null, id);
  const existingMedia = listing.listing_media ?? [];
  const firstMediaAlt = existingMedia.find((item) => item.media_assets?.alt_text)?.media_assets?.alt_text ?? listing.title;
  const detailAttributes = attributes(listing.attributes);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Edit listing</h1>
          <Link href="/admin/listings" className="admin-back">← Back to listings</Link>
        </div>
        <div className="admin-row-actions">
          {listing.status === "published" && (
            <Link
              href={`/buy-sell/${listing.listing_type_slug}/${listing.slug}`}
              target="_blank"
              className="admin-btn admin-btn-ghost"
            >
              View live ↗
            </Link>
          )}
          <DeleteButton action={deleteWithId} label="Delete listing" />
        </div>
      </div>

      <div className="admin-meta-bar">
        <span className="mono">ID: {listing.id}</span>
        <span className="mono">Slug: {listing.slug}</span>
        <span className="mono">Path: {listing.canonical_path}</span>
      </div>

      <form action={updateWithId} className="admin-form">
        <div className="admin-form-section">
          <h2>Core</h2>
          <div className="admin-field-row">
            <label className="admin-field">
              Type
              <input type="text" name="listing_type_slug" value={listing.listing_type_slug} disabled className="admin-input-disabled" readOnly />
            </label>
            <label className="admin-field">
              Publication Status *
              <select name="status" defaultValue={listing.status} required>
                <option value="draft">Draft (Private)</option>
                <option value="review">In Review</option>
                <option value="published">Published (Public)</option>
                <option value="archived">Archived (Taken Down)</option>
              </select>
            </label>
            <label className="admin-field">
              Availability Status
              <select name="availability" defaultValue={listing.availability ?? "available"}>
                <option value="available">Available for Sale</option>
                <option value="sold">Sold (Preserve Search Ranking)</option>
                <option value="under_offer">Under Offer</option>
                <option value="reserved">Reserved</option>
              </select>
            </label>
          </div>
          <label className="admin-field">
            Title *
            <input type="text" name="title" defaultValue={listing.title} required />
          </label>
          
          <SlugFieldWithWarning
            initialSlug={listing.slug}
            basePath={`/buy-sell/${listing.listing_type_slug}`}
            required
          />

          <input type="hidden" name="published_at" value={listing.published_at ?? ""} />
          <label className="admin-field admin-field-check">
            <input type="checkbox" name="noindex" value="true" defaultChecked={listing.noindex} />
            noindex (hide from search engines while keeping page live)
          </label>
        </div>

        <div className="admin-form-section">
          <h2>Location</h2>
          <div className="admin-field-row">
            <label className="admin-field">Phase<input type="text" name="phase" defaultValue={listing.phase ?? ""} placeholder="e.g. DHA Phase 6" /></label>
            <label className="admin-field">City<input type="text" name="city" defaultValue={listing.city ?? ""} placeholder="e.g. Lahore" /></label>
          </div>
          <div className="admin-field-row">
            <label className="admin-field">Block<input type="text" name="block" defaultValue={listing.block ?? ""} placeholder="e.g. Sector C" /></label>
            <label className="admin-field">Project<input type="text" name="project" defaultValue={listing.project ?? ""} placeholder="e.g. Main Boulevard" /></label>
          </div>
          <div className="admin-field-row">
            <label className="admin-field">Neighborhood<input type="text" name="neighborhood" defaultValue={listing.neighborhood ?? ""} placeholder="e.g. Safari Garden" /></label>
            <label className="admin-field">Property type<input type="text" name="property_type" defaultValue={typeof detailAttributes.property_type === "string" ? detailAttributes.property_type : "Land"} placeholder="Land / Commercial" /></label>
          </div>
        </div>

        <div className="admin-form-section">
          <h2>Size & Price</h2>
          <div className="admin-field-row">
            <label className="admin-field">Size label<input type="text" name="size_label" defaultValue={listing.size_label ?? ""} placeholder="e.g. 1 Kanal / 5 Marla" /></label>
            <label className="admin-field">Area value<input type="number" name="area_value" defaultValue={listing.area_value ?? ""} step="0.01" /></label>
            <label className="admin-field">Area unit<input type="text" name="area_unit" defaultValue={listing.area_unit ?? ""} placeholder="e.g. sqyd / marla / kanal" /></label>
          </div>
          <div className="admin-field-row">
            <label className="admin-field">Price label<input type="text" name="price_label" defaultValue={listing.price_label} placeholder="e.g. PKR 4.5 Cr" /></label>
            <label className="admin-field">Price numeric (PKR)<input type="number" name="price_numeric" defaultValue={listing.price_numeric ?? ""} step="1" /></label>
          </div>
          <label className="admin-field">Listing subtitle / badge<input type="text" name="listing_status" defaultValue={listing.listing_status ?? ""} placeholder="e.g. Possession / Direct Deal / File" /></label>
        </div>

        <div className="admin-form-section">
          <h2>House details</h2>
          <div className="admin-field-row">
            <label className="admin-field">Bedrooms<input type="number" name="bedrooms" defaultValue={listing.bedrooms ?? ""} min="0" /></label>
            <label className="admin-field">Bathrooms<input type="number" name="bathrooms" defaultValue={listing.bathrooms ?? ""} min="0" /></label>
          </div>
        </div>

        <AIGenerateButton />

        <div className="admin-form-section">
          <h2>Contact & Description</h2>
          <label className="admin-field">
            Contact person
            <select name="contact_person_id" defaultValue={listing.contact_person_id ?? ""}>
              <option value="">— None —</option>
              {team.map((m) => (
                <option key={m.id} value={m.id}>{m.name}{m.job_title ? ` (${m.job_title})` : ""}</option>
              ))}
            </select>
          </label>
          <label className="admin-field">Summary<textarea name="summary" rows={2} defaultValue={listing.summary ?? ""} placeholder="Brief 1-2 sentence overview of the property" /></label>
          <label className="admin-field">Description<textarea name="description" rows={5} defaultValue={listing.description ?? ""} placeholder="Detailed description of features, floor plan, and unique selling points" /></label>
        </div>

        <div className="admin-form-section">
          <h2>Plot payment details</h2>
          <p className="admin-help">These fields render as structured sections on plot detail pages. Enter one item per line.</p>
          <label className="admin-field">Payment plan (Label | Amount)<textarea name="payment_plan" rows={6} defaultValue={paymentLines(detailAttributes.payment_plan)} placeholder={"Booking | PKR 4 Lac\n36 monthly installments | PKR 15,000 each"} /></label>
          <label className="admin-field">Project facilities<textarea name="amenities" rows={5} defaultValue={textLines(detailAttributes.amenities)} placeholder={"Gated community\nCentral parks\nSchool"} /></label>
          <label className="admin-field">Terms<textarea name="terms" rows={4} defaultValue={textLines(detailAttributes.terms)} placeholder="One term per line" /></label>
          <div className="admin-field-row">
            <label className="admin-field">Source updated date<input type="date" name="source_updated_at" defaultValue={typeof detailAttributes.source_updated_at === "string" ? detailAttributes.source_updated_at : ""} /></label>
            <label className="admin-field">Public listing reference<input type="text" name="source_listing_id" defaultValue={typeof detailAttributes.source_listing_id === "string" ? detailAttributes.source_listing_id : ""} placeholder="plot-project-size" /></label>
          </div>
        </div>

        <div className="admin-form-section">
          <h2>SEO Metadata Overrides</h2>
          <label className="admin-field">
            Custom Meta Title (Recommended 50–60 chars, max 70)
            <input type="text" name="meta_title" defaultValue={listing.meta_title ?? ""} maxLength={70} placeholder="e.g. 1 Kanal Modern House for Sale in DHA Phase 6 Lahore" />
          </label>
          <label className="admin-field">
            Custom Meta Description (Recommended 130–160 chars, max 180)
            <textarea name="meta_description" rows={2} defaultValue={listing.meta_description ?? ""} maxLength={180} placeholder="e.g. Explore this luxury 1 Kanal house for sale in DHA Phase 6 Lahore. Featuring 5 master bedrooms, designer kitchen, and prime location. Contact Estate Brothers." />
          </label>
        </div>

        <SeoQualityWidget
          type="listing"
          initialData={{
            title: listing.title,
            meta_title: listing.meta_title,
            meta_description: listing.meta_description,
            summary: listing.summary,
            description: listing.description,
            phase: listing.phase,
            city: listing.city,
            size_label: listing.size_label,
            price_label: listing.price_label,
            price_numeric: listing.price_numeric != null ? Number(listing.price_numeric) : null,
            bedrooms: listing.bedrooms,
            bathrooms: listing.bathrooms,
            listing_type_slug: listing.listing_type_slug,
            slug: listing.slug,
            has_media: Boolean(listing.thumbnail_url || listing.og_image || existingMedia.length),
            media_alt_text: firstMediaAlt,
          }}
        />

        <div className="admin-form-section">
          <h2>Media & Photos</h2>
          <MediaAltManager suggestedContext={`${listing.size_label ?? ""} ${listing.listing_type_slug ?? "property"} in ${listing.phase ?? "DHA Lahore"}`} />
        </div>

        <div className="admin-form-actions">
          <Link href="/admin/listings" className="admin-btn admin-btn-ghost">Cancel</Link>
          <button type="submit" className="admin-btn admin-btn-primary">Save changes</button>
        </div>
      </form>

      <ExistingMediaManager
        title="Existing media"
        emptyText="No media is currently attached to this listing."
        items={existingMedia}
        featuredLabel="Primary listing image"
        updateActionFor={(item) => updateListingMediaItem.bind(null, id, item.id)}
        removeActionFor={(item) => removeListingMediaItem.bind(null, id, item.id)}
      />
    </div>
  );
}
