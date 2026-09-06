import type { Metadata } from "next";
import { AdminForm } from "@/components/admin/AdminForm";
import Link from "next/link";
import { getAllTeamMembersAdmin } from "@/lib/db/team";
import { createListing } from "../actions";
import { SeoQualityWidget } from "@/components/admin/SeoQualityWidget";
import { SlugFieldWithWarning } from "@/components/admin/SlugFieldWithWarning";
import { MediaAltManager } from "@/components/admin/MediaAltManager";
import { AIGenerateButton } from "@/components/admin/AIGenerateButton";

export const metadata: Metadata = { title: "New Listing" };

export default async function NewListingPage() {
  const team = await getAllTeamMembersAdmin();

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>New listing</h1>
          <Link href="/admin/listings" className="admin-back">← Back to listings</Link>
        </div>
      </div>
      <AdminForm action={createListing} className="admin-form">
        <div className="admin-form-section">
          <h2>Core</h2>
          <div className="admin-field-row">
            <label className="admin-field">
              Type *
              <select name="listing_type_slug" required defaultValue="plot">
                <option value="plot">Plot</option>
                <option value="house">House</option>
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
            <label className="admin-field">
              Availability Status
              <select name="availability" defaultValue="available">
                <option value="available">Available for Sale</option>
                <option value="sold">Sold</option>
                <option value="under_offer">Under Offer</option>
                <option value="reserved">Reserved</option>
              </select>
            </label>
          </div>
          <label className="admin-field">
            Title *
            <input type="text" name="title" required placeholder="e.g. DHA Phase 6 1 Kanal Plot" />
          </label>

          <SlugFieldWithWarning
            basePath="/buy-sell/plot"
          />
        </div>

        <div className="admin-form-section">
          <h2>Location</h2>
          <div className="admin-field-row">
            <label className="admin-field">Phase<input type="text" name="phase" placeholder="DHA Phase 6" /></label>
            <label className="admin-field">City<input type="text" name="city" placeholder="Lahore" defaultValue="Lahore" /></label>
          </div>
          <div className="admin-field-row">
            <label className="admin-field">Block<input type="text" name="block" placeholder="C Block" /></label>
            <label className="admin-field">Project<input type="text" name="project" placeholder="Main Boulevard" /></label>
          </div>
          <div className="admin-field-row">
            <label className="admin-field">Neighborhood<input type="text" name="neighborhood" placeholder="Safari Garden" /></label>
            <label className="admin-field">Property type<input type="text" name="property_type" defaultValue="Land" placeholder="Land / Commercial" /></label>
          </div>
        </div>

        <div className="admin-form-section">
          <h2>Size & Price</h2>
          <div className="admin-field-row">
            <label className="admin-field">Size label<input type="text" name="size_label" placeholder="1 Kanal" /></label>
            <label className="admin-field">Area value<input type="number" name="area_value" step="0.01" /></label>
            <label className="admin-field">Area unit<input type="text" name="area_unit" placeholder="sqyd" /></label>
          </div>
          <div className="admin-field-row">
            <label className="admin-field">Price label<input type="text" name="price_label" placeholder="PKR 5.85 Cr" defaultValue="On Call" /></label>
            <label className="admin-field">Price numeric (PKR)<input type="number" name="price_numeric" step="1" /></label>
          </div>
          <label className="admin-field">Listing subtitle / badge<input type="text" name="listing_status" placeholder="Available / Possession / File / For Sale" /></label>
        </div>

        <div className="admin-form-section">
          <h2>House details (leave blank for plots)</h2>
          <div className="admin-field-row">
            <label className="admin-field">Bedrooms<input type="number" name="bedrooms" min="0" /></label>
            <label className="admin-field">Bathrooms<input type="number" name="bathrooms" min="0" /></label>
          </div>
        </div>

        <AIGenerateButton />

        <div className="admin-form-section">
          <h2>Contact & Description</h2>
          <label className="admin-field">
            Contact person
            <select name="contact_person_id">
              <option value="">— None —</option>
              {team.map((m) => (
                <option key={m.id} value={m.id}>{m.name}{m.job_title ? ` (${m.job_title})` : ""}</option>
              ))}
            </select>
          </label>
          <label className="admin-field">Summary<textarea name="summary" rows={2} placeholder="Brief 1-2 sentence overview of the property" /></label>
          <label className="admin-field">Description<textarea name="description" rows={4} placeholder="Detailed description of features, floor plan, and unique selling points" /></label>
        </div>

        <div className="admin-form-section">
          <h2>Plot payment details</h2>
          <p className="admin-help">These fields render as structured sections on plot detail pages. Enter one item per line.</p>
          <label className="admin-field">Payment plan (Label | Amount)<textarea name="payment_plan" rows={6} placeholder={"Booking | PKR 4 Lac\n36 monthly installments | PKR 15,000 each"} /></label>
          <label className="admin-field">Project facilities<textarea name="amenities" rows={5} placeholder={"Gated community\nCentral parks\nSchool"} /></label>
          <label className="admin-field">Terms<textarea name="terms" rows={4} placeholder="One term per line" /></label>
          <div className="admin-field-row">
            <label className="admin-field">Source updated date<input type="date" name="source_updated_at" /></label>
            <label className="admin-field">Public listing reference<input type="text" name="source_listing_id" placeholder="plot-project-size" /></label>
          </div>
        </div>

        <div className="admin-form-section">
          <h2>SEO Metadata Overrides</h2>
          <label className="admin-field">
            Custom Meta Title (Recommended 50–60 chars, max 70)
            <input type="text" name="meta_title" maxLength={70} placeholder="e.g. 1 Kanal Modern Plot for Sale in DHA Phase 6 Lahore" />
          </label>
          <label className="admin-field">
            Custom Meta Description (Recommended 130–160 chars, max 180)
            <textarea name="meta_description" rows={2} maxLength={180} placeholder="e.g. 1 Kanal plot for sale in DHA Phase 6 Lahore. Ideal location, direct deal, verified paperwork. Contact Estate Brothers today." />
          </label>
        </div>

        <SeoQualityWidget
          type="listing"
          initialData={{
            title: "",
            meta_title: "",
            meta_description: "",
            summary: "",
            description: "",
            phase: "",
            city: "Lahore",
            size_label: "",
            price_label: "On Call",
            price_numeric: null,
            listing_type_slug: "plot",
            slug: "",
          }}
        />

        <div className="admin-form-section">
          <h2>Media & Photos</h2>
          <MediaAltManager suggestedContext="property in DHA Lahore" />
        </div>

        <div className="admin-form-actions">
          <Link href="/admin/listings" className="admin-btn admin-btn-ghost">Cancel</Link>
          <button type="submit" className="admin-btn admin-btn-primary">Create listing</button>
        </div>
      </AdminForm>
    </div>
  );
}
