import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/db/site";
import { saveSiteSettings } from "./actions";

export const metadata: Metadata = { title: "Site Settings" };

export default async function SiteSettingsPage() {
  const settings = await getSiteSettings();
  const socials = settings?.social_links && typeof settings.social_links === "object" && !Array.isArray(settings.social_links)
    ? settings.social_links as Record<string, string>
    : {};

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Site settings</h1>
          <p className="admin-page-subtitle">Global NAP, social links, and SEO defaults.</p>
        </div>
      </div>
      <form action={saveSiteSettings} className="admin-form">
        <div className="admin-form-section">
          <h2>Business</h2>
          <label className="admin-field">Business name<input name="business_name" defaultValue={settings?.business_name ?? "Estate Brothers"} /></label>
          <label className="admin-field">Legal name<input name="legal_name" defaultValue={settings?.legal_name ?? ""} /></label>
          <label className="admin-field">Tagline<input name="tagline" defaultValue={settings?.tagline ?? ""} /></label>
          <label className="admin-field">Description<textarea name="business_description" rows={4} defaultValue={settings?.business_description ?? ""} /></label>
        </div>
        <div className="admin-form-section">
          <h2>Contact</h2>
          <div className="admin-field-row">
            <label className="admin-field">Phone<input name="phone" defaultValue={settings?.phone ?? ""} /></label>
            <label className="admin-field">WhatsApp<input name="whatsapp" defaultValue={settings?.whatsapp ?? ""} /></label>
            <label className="admin-field">Email<input type="email" name="email" defaultValue={settings?.email ?? ""} /></label>
          </div>
        </div>
        <div className="admin-form-section">
          <h2>Address & map</h2>
          <label className="admin-field">Address line 1<input name="address_line_1" defaultValue={settings?.address_line_1 ?? ""} /></label>
          <label className="admin-field">Address line 2<input name="address_line_2" defaultValue={settings?.address_line_2 ?? ""} /></label>
          <div className="admin-field-row">
            <label className="admin-field">City<input name="city" defaultValue={settings?.city ?? ""} /></label>
            <label className="admin-field">Region<input name="region" defaultValue={settings?.region ?? ""} /></label>
            <label className="admin-field">Postal code<input name="postal_code" defaultValue={settings?.postal_code ?? ""} /></label>
            <label className="admin-field">Country<input name="country_code" maxLength={2} defaultValue={settings?.country_code ?? "PK"} /></label>
          </div>
          <div className="admin-field-row">
            <label className="admin-field">Latitude<input type="number" step="0.0000001" name="latitude" defaultValue={settings?.latitude ?? ""} /></label>
            <label className="admin-field">Longitude<input type="number" step="0.0000001" name="longitude" defaultValue={settings?.longitude ?? ""} /></label>
          </div>
          <label className="admin-field">Google Maps URL<input type="url" name="map_url" defaultValue={settings?.map_url ?? ""} /></label>
        </div>
        <div className="admin-form-section">
          <h2>SEO & socials</h2>
          <label className="admin-field">Default meta title<input name="default_meta_title" defaultValue={settings?.default_meta_title ?? ""} /></label>
          <label className="admin-field">Default meta description<textarea name="default_meta_description" rows={2} defaultValue={settings?.default_meta_description ?? ""} /></label>
          <label className="admin-field">Default OG image URL<input name="default_og_image" defaultValue={settings?.default_og_image ?? ""} /></label>
          <label className="admin-field">Logo URL<input name="logo_url" defaultValue={settings?.logo_url ?? ""} /></label>
          <label className="admin-field">Service areas (comma separated)<input name="service_areas" defaultValue={(settings?.service_areas ?? []).join(", ")} /></label>
          <label className="admin-field">Knows about (comma separated)<input name="knows_about" defaultValue={(settings?.knows_about ?? []).join(", ")} /></label>
          <div className="admin-field-row">
            <label className="admin-field">Facebook<input name="facebook" defaultValue={socials.facebook ?? ""} /></label>
            <label className="admin-field">Instagram<input name="instagram" defaultValue={socials.instagram ?? ""} /></label>
          </div>
          <div className="admin-field-row">
            <label className="admin-field">Google verification<input name="google_site_verification" defaultValue={settings?.google_site_verification ?? ""} /></label>
            <label className="admin-field">Bing verification<input name="bing_site_verification" defaultValue={settings?.bing_site_verification ?? ""} /></label>
          </div>
        </div>
        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn-primary">Save settings</button>
        </div>
      </form>
    </div>
  );
}

