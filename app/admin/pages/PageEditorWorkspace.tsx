import { AdminForm } from "@/components/admin/AdminForm";
import Link from "next/link";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { mediaUrl, type PageBlockWithMedia, type PageSectionWithBlocks, type PageWithSections } from "@/lib/db/site";
import {
  HOME_SECTION_DEFINITIONS,
  getHomeSectionDefinition,
  homeSectionKind,
} from "@/lib/homepage/section-contract";
import {
  createPageBlock,
  createPageSection,
  deletePageBlock,
  deletePageBlockGalleryMedia,
  deletePageSection,
  updatePage,
  updatePageBlock,
  updatePageBlockGalleryMedia,
  updatePageSection,
  uploadPageBlockGalleryMedia,
} from "./actions";

const SECTION_LABELS: Record<string, string> = {
  "about-proof": "About proof stats",
  "awards-recognition": "Awards and recognition",
  "branches-support": "Branch support panel",
  "hero-stats": "Hero stats",
  "featured-projects": "Featured projects",
  "featured-listings": "Featured listings",
  "life-gallery": "Gallery / events",
  partners: "Partner logos",
  testimonials: "Testimonials",
  "testimonial-stats": "Testimonial stats",
  "team-stories": "Team stories",
  leadership: "Leadership section",
  services: "Services",
  "operating-model": "Operating model",
};

const ABOUT_SECTION_OPTIONS = [
  { value: "about-proof", label: "Proof stats" },
  { value: "awards-recognition", label: "Awards and recognition" },
  { value: "services", label: "Service pillars" },
  { value: "team-stories", label: "Team stories / videos" },
  { value: "operating-model", label: "Operating model" },
  { value: "branches-support", label: "Branch support panel" },
];

const HOME_SECTION_OPTIONS = HOME_SECTION_DEFINITIONS.map((definition) => ({
  value: definition.key,
  label: definition.label,
}));

export interface PageEditorListingOption {
  id: string;
  slug: string;
  title: string;
  listing_type_slug: string;
  status: string;
  noindex: boolean;
  phase: string | null;
  city: string | null;
}

function friendlySectionName(key: string) {
  return SECTION_LABELS[key] ?? key.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
}

function statusBadge(status: string) {
  return ({ published: "admin-badge-pub", draft: "admin-badge-draft", review: "admin-badge-review", archived: "admin-badge-arc" }[status] ?? "admin-badge-draft");
}

function blockKind(sectionKey: string) {
  const homepageKind = homeSectionKind(sectionKey);
  if (homepageKind !== "default") return homepageKind;
  if (sectionKey === "hero-stats" || sectionKey === "testimonial-stats" || sectionKey === "about-proof") return "stats";
  if (sectionKey === "awards-recognition") return "awards";
  if (sectionKey === "life-gallery" || sectionKey === "gallery" || sectionKey === "events") return "gallery";
  if (sectionKey === "partners") return "partners";
  if (sectionKey === "team-stories") return "stories";
  if (sectionKey === "testimonials") return "testimonials";
  return "default";
}

function jsonText(value: unknown) {
  return JSON.stringify(value && typeof value === "object" ? value : {}, null, 2);
}

function emptyBlock(sectionId: string, sortOrder: number): PageBlockWithMedia {
  return {
    id: "",
    section_id: sectionId,
    block_key: "",
    title: null,
    body: null,
    media_id: null,
    icon_name: null,
    link_label: null,
    link_url: null,
    link_kind: null,
    listing_id: null,
    attributes: {},
    sort_order: sortOrder,
    status: "draft",
    created_at: "",
    updated_at: "",
  };
}

function pageLiveHref(routePath: string) {
  return routePath || "/";
}

export function PageEditorWorkspace({
  page,
  listings,
}: {
  page: PageWithSections;
  listings: PageEditorListingOption[];
}) {
  const pageAction = updatePage.bind(null, page.id);
  const isProductionHomepage = page.route_path === "/";
  const sections = page.page_sections ?? [];
  const publishedSections = sections.filter((section) => section.status === "published").length;
  const blockCount = sections.reduce((total, section) => total + (section.page_blocks?.length ?? 0), 0);

  return (
    <div className="admin-editor-grid">
      <div className="admin-editor-main">
        <AdminForm action={pageAction} className="admin-form">
          <AdminAccordion
            title="Page identity"
            subtitle="Route, title, and the copy used by the main page hero."
            defaultOpen
            meta={<span className={`admin-badge ${statusBadge(page.status)}`}>{page.status}</span>}
          >
            <div className="admin-field-row">
              <label className="admin-field">Route path *<input name="route_path" required readOnly={isProductionHomepage} defaultValue={page.route_path} /></label>
              <label className="admin-field">Page key<input name="page_key" readOnly={isProductionHomepage} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={page.page_key} /></label>
            </div>
            <label className="admin-field">Title *<input name="title" required defaultValue={page.title} /></label>
            <label className="admin-field">Main heading<input name="heading" defaultValue={page.heading ?? ""} /></label>
            <label className="admin-field">Intro text<textarea name="intro" rows={3} defaultValue={page.intro ?? ""} /></label>
            <label className="admin-field">Body note<textarea name="body" rows={4} defaultValue={page.body ?? ""} /></label>
          </AdminAccordion>

          <AdminAccordion
            title="Hero image"
            subtitle="Image used by the page hero and social previews when configured."
            meta={page.hero_media_id ? <span className="admin-pill">Image attached</span> : <span className="admin-pill admin-pill-muted">No image</span>}
          >
            <input type="hidden" name="existing_hero_media_id" value={page.hero_media_id ?? ""} />
            <label className="admin-field">
              Hero image URL
              <input name="hero_image_url" placeholder="/images/properties/hero-estatebrothers.webp or https://..." />
            </label>
            {mediaUrl(page.hero_media) && <p className="admin-muted">Current hero image: {mediaUrl(page.hero_media)}</p>}
          </AdminAccordion>

          <AdminAccordion
            title="SEO & publishing"
            subtitle="Search result text, social image, keywords, and indexing state."
            meta={page.noindex ? <span className="admin-badge admin-badge-arc">noindex</span> : <span className="admin-badge admin-badge-pub">indexable</span>}
          >
            <div className="admin-field-row">
              {isProductionHomepage ? (
                <>
                  <input type="hidden" name="status" value="published" />
                  <input type="hidden" name="noindex" value="false" />
                  <div className="admin-field admin-locked-field"><span>Publishing</span><strong>Published and indexable</strong><small>The production homepage route and indexing state are protected.</small></div>
                </>
              ) : (
                <>
                  <label className="admin-field">
                    Status
                    <select name="status" defaultValue={page.status}>
                      <option value="draft">Draft</option>
                      <option value="review">Review</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </label>
                  <label className="admin-field admin-field-check" style={{ alignSelf: "flex-end" }}>
                    <input type="checkbox" name="noindex" value="true" defaultChecked={page.noindex} /> noindex
                  </label>
                </>
              )}
            </div>
            <input type="hidden" name="published_at" value={page.published_at ?? ""} />
            <label className="admin-field">Meta title<input name="meta_title" maxLength={70} defaultValue={page.meta_title} /></label>
            <label className="admin-field">Meta description<textarea name="meta_description" rows={2} maxLength={180} defaultValue={page.meta_description} /></label>
            <label className="admin-field">OG image URL<input name="og_image" defaultValue={page.og_image ?? ""} /></label>
            <label className="admin-field">Keywords (comma separated)<input name="keywords" defaultValue={(page.keywords ?? []).join(", ")} /></label>
          </AdminAccordion>

          <div className="admin-form-actions admin-editor-savebar">
            <Link href="/admin/pages" className="admin-btn admin-btn-ghost">Cancel</Link>
            <button type="submit" className="admin-btn admin-btn-primary">Save page settings</button>
          </div>
        </AdminForm>

        <div className="admin-editor-section-head">
          <div>
            <h2>Content sections</h2>
            <p>Edit the visible homepage/about blocks without touching database fields directly.</p>
          </div>
          <span>{sections.length} sections</span>
        </div>

        <AddSectionForm page={page} />

        {sections.map((section, index) => (
          <PageSectionEditor
            key={section.id}
            page={page}
            section={section}
            listings={listings}
            defaultOpen={index === 0}
          />
        ))}
      </div>

      <aside className="admin-editor-aside">
        <div className="admin-editor-summary">
          <h2>Page summary</h2>
          <dl>
            <div><dt>Route</dt><dd>{page.route_path}</dd></div>
            <div><dt>Status</dt><dd><span className={`admin-badge ${statusBadge(page.status)}`}>{page.status}</span></dd></div>
            <div><dt>Sections</dt><dd>{publishedSections}/{sections.length} published</dd></div>
            <div><dt>Blocks</dt><dd>{blockCount}</dd></div>
            <div><dt>SEO</dt><dd>{page.meta_title && page.meta_description ? "Ready" : "Needs title/description"}</dd></div>
          </dl>
          <div className="admin-editor-summary-actions">
            <Link href={pageLiveHref(page.route_path)} target="_blank" className="admin-btn admin-btn-ghost">View live page</Link>
            <Link href="/admin/pages" className="admin-btn admin-btn-ghost">All pages</Link>
          </div>
          <p className="admin-muted">Save page settings separately from each section or block. This keeps edits small and easier to recover.</p>
        </div>
      </aside>
    </div>
  );
}

function AdminAccordion({
  title,
  subtitle,
  meta,
  defaultOpen = false,
  children,
}: {
  title: string;
  subtitle?: string;
  meta?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="admin-accordion" open={defaultOpen}>
      <summary>
        <span>
          <strong>{title}</strong>
          {subtitle && <small>{subtitle}</small>}
        </span>
        {meta && <span className="admin-accordion-meta">{meta}</span>}
      </summary>
      <div className="admin-accordion-body">{children}</div>
    </details>
  );
}

function AddSectionForm({ page }: { page: PageWithSections }) {
  const action = createPageSection.bind(null, page.id, page.route_path);
  const nextSort = ((page.page_sections ?? []).at(-1)?.sort_order ?? 0) + 10;
  const isAbout = page.route_path === "/about";
  const isHome = page.route_path === "/";
  const existingKeys = new Set((page.page_sections ?? []).map((section) => section.section_key));
  const availableHomeSections = HOME_SECTION_OPTIONS.filter((option) => !existingKeys.has(option.value));

  return (
    <details className="admin-accordion">
      <summary>
        <span>
          <strong>Add content section</strong>
          <small>Create a CMS-backed section for this page.</small>
        </span>
        <span className="admin-accordion-meta"><span className="admin-pill">New section</span></span>
      </summary>
      <AdminForm action={action} className="admin-section-form">
        <input type="hidden" name="existing_section_media_id" value="" />
        <div className="admin-field-row">
          <label className="admin-field">
            Section type
            {isHome ? (
              <select name="section_key" defaultValue={availableHomeSections[0]?.value} disabled={!availableHomeSections.length}>
                {availableHomeSections.map((option) => (
                  <option value={option.value} key={option.value}>{option.label}</option>
                ))}
              </select>
            ) : isAbout ? (
              <select name="section_key" defaultValue="awards-recognition">
                {ABOUT_SECTION_OPTIONS.map((option) => (
                  <option value={option.value} key={option.value}>{option.label}</option>
                ))}
              </select>
            ) : (
              <input name="section_key" required placeholder="section-key" />
            )}
          </label>
          <label className="admin-field">Sort order<input type="number" name="sort_order" defaultValue={nextSort} /></label>
          <label className="admin-field">
            Status
            <select name="status" defaultValue="draft">
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        </div>
        <label className="admin-field">Eyebrow<input name="eyebrow" /></label>
        <label className="admin-field">Heading<input name="heading" /></label>
        <label className="admin-field">Intro / subheading<textarea name="subheading" rows={2} /></label>
        <label className="admin-field">Body<textarea name="body" rows={3} /></label>
        {isHome && (
          <p className="admin-field-help">Add the section first. Only sections that visibly use a section image will show image controls in their editor.</p>
        )}
        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn-primary" disabled={isHome && !availableHomeSections.length}>
            {isHome && !availableHomeSections.length ? "All homepage sections added" : "Add section"}
          </button>
        </div>
      </AdminForm>
    </details>
  );
}

function PageSectionEditor({
  page,
  section,
  listings,
  defaultOpen,
}: {
  page: PageWithSections;
  section: PageSectionWithBlocks;
  listings: PageEditorListingOption[];
  defaultOpen: boolean;
}) {
  const sectionMediaUrl = mediaUrl(section.media_assets);
  const sectionDefinition = page.route_path === "/" ? getHomeSectionDefinition(section.section_key) : null;
  const supportsSectionMedia = page.route_path !== "/" || Boolean(sectionDefinition?.supportsSectionMedia);
  const sectionAction = updatePageSection.bind(null, section.id, page.route_path);
  const blocks = section.page_blocks ?? [];
  const publishedBlockCount = blocks.filter((block) => block.status === "published").length;

  return (
    <AdminAccordion
      title={friendlySectionName(section.section_key)}
      subtitle={`${publishedBlockCount}/${blocks.length} published blocks - sort ${section.sort_order}`}
      defaultOpen={defaultOpen}
      meta={
        <>
          <span className={`admin-badge ${statusBadge(section.status)}`}>{section.status}</span>
          {sectionMediaUrl && (
            <span className="admin-pill">
              {supportsSectionMedia ? "Media" : "Legacy section media preserved"}
            </span>
          )}
        </>
      }
    >
      {sectionDefinition && (
        <p className="admin-section-guidance">
          <strong>How this section is used:</strong> {sectionDefinition.description}
          {(sectionDefinition.kind === "stats" || sectionDefinition.kind === "testimonials" || sectionDefinition.kind === "awards") && (
            <> Keep every published claim approved and supported by current business records.</>
          )}
        </p>
      )}
      <AdminForm action={sectionAction} className="admin-section-form">
        <input type="hidden" name="page_id" value={page.id} />
        <input type="hidden" name="section_key" value={section.section_key} />
        <input type="hidden" name="existing_section_media_id" value={section.media_id ?? ""} />
        <div className="admin-field-row">
          <label className="admin-field">Eyebrow<input name="eyebrow" defaultValue={section.eyebrow ?? ""} /></label>
          <label className="admin-field">Sort order<input type="number" name="sort_order" defaultValue={section.sort_order} /></label>
          <label className="admin-field">
            Status
            <select name="status" defaultValue={section.status}>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        </div>
        <label className="admin-field">Heading<input name="heading" defaultValue={section.heading ?? ""} /></label>
        <label className="admin-field">Intro / subheading<textarea name="subheading" rows={2} defaultValue={section.subheading ?? ""} /></label>
        <label className="admin-field">Body<textarea name="body" rows={3} defaultValue={section.body ?? ""} /></label>
        {supportsSectionMedia && (
          <div className="admin-media-control">
            <div className="admin-field-row">
              <label className="admin-field">Upload image<input type="file" name="section_media" accept="image/*" /></label>
              <label className="admin-field">Image URL<input name="section_media_url" placeholder="/images/... or https://..." /></label>
            </div>
            <label className="admin-field">Image alt text<input name="section_media_alt" defaultValue={section.media_assets?.alt_text ?? ""} placeholder="Describe the person or scene shown" /></label>
            {sectionMediaUrl && (
              <>
                <img className="admin-current-media" src={sectionMediaUrl} alt={section.media_assets?.alt_text ?? "Current section media"} />
                <label className="admin-field admin-field-check">
                  <input type="checkbox" name="remove_section_media" value="true" /> remove current section image
                </label>
              </>
            )}
          </div>
        )}
        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn-primary">Save section</button>
        </div>
      </AdminForm>

      {blocks.length > 0 && (
        <PageBlockTable page={page} section={section} blocks={blocks} listings={listings} />
      )}

      {(page.route_path !== "/" || getHomeSectionDefinition(section.section_key)?.supportsBlocks !== false) && (
        <AddBlockForm page={page} section={section} listings={listings} nextSort={(blocks.at(-1)?.sort_order ?? 0) + 10} />
      )}
    </AdminAccordion>
  );
}

function AddBlockForm({
  page,
  section,
  listings,
  nextSort,
}: {
  page: PageWithSections;
  section: PageSectionWithBlocks;
  listings: PageEditorListingOption[];
  nextSort: number;
}) {
  const action = createPageBlock.bind(null, section.id, page.id, page.route_path);
  const kind = blockKind(section.section_key);
  const sectionDefinition = page.route_path === "/" ? getHomeSectionDefinition(section.section_key) : null;
  const supportsBlockMedia = page.route_path !== "/" || Boolean(sectionDefinition?.supportsBlockMedia);

  return (
    <details className="admin-block-row admin-block-row-default">
      <summary>
        <strong>Add block</strong><span>{friendlySectionName(section.section_key)}</span><span>New CMS item</span>
        <span><span className="admin-badge admin-badge-draft">draft</span></span>
        <span>{nextSort}</span>
        <span className="admin-btn admin-btn-sm">Add</span>
      </summary>
      <AdminForm action={action} className="admin-block-edit-form">
        <input type="hidden" name="section_key" value={section.section_key} />
        <input type="hidden" name="existing_block_media_id" value="" />
        <label className="admin-field">Block key<input name="block_key" placeholder="new-block-key" /></label>
        <BlockFields block={emptyBlock(section.id, nextSort)} kind={kind} listings={listings} />
        <div className="admin-field-row">
          <label className="admin-field">
            Status
            <select name="status" defaultValue="draft">
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="admin-field">Sort order<input type="number" name="sort_order" defaultValue={nextSort} /></label>
        </div>
        {supportsBlockMedia && (
          <div className="admin-media-control">
            <div className="admin-field-row">
              <label className="admin-field">Upload image<input type="file" name="block_media" accept="image/*" /></label>
              <label className="admin-field">Image URL<input name="block_media_url" placeholder="/images/... or https://..." /></label>
            </div>
            <label className="admin-field">Image alt text<input name="block_media_alt" placeholder="Describe what is visibly shown" /></label>
          </div>
        )}
        {kind === "projects" && (
          <label className="admin-field">
            Project gallery images
            <input type="file" name="project_gallery_files" accept="image/*" multiple />
            <span>Optional: upload multiple images. The first image becomes the project gallery primary image.</span>
          </label>
        )}
        <details className="admin-advanced-json">
          <summary>Advanced JSON</summary>
          <label className="admin-field">
            Attributes JSON
            <textarea name="attributes" rows={4} defaultValue="{}" />
          </label>
        </details>
        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn-primary">Add block</button>
        </div>
      </AdminForm>

      <div className="admin-destructive-row">
        <DeleteButton
          action={deletePageSection.bind(null, section.id, page.id, page.route_path)}
          label={`Delete ${friendlySectionName(section.section_key)} section`}
        />
      </div>
    </details>
  );
}

function PageBlockTable({
  page,
  section,
  blocks,
  listings,
}: {
  page: PageWithSections;
  section: PageSectionWithBlocks;
  blocks: PageBlockWithMedia[];
  listings: PageEditorListingOption[];
}) {
  const kind = blockKind(section.section_key);

  return (
    <div className="admin-block-table" role="table" aria-label={`${friendlySectionName(section.section_key)} blocks`}>
      <div className={`admin-block-table-head admin-block-table-head-${kind}`} role="row">
        {kind === "stats" ? (
          <>
            <span>Number</span><span>Unit</span><span>Label</span><span>Status</span><span>Sort</span><span>Actions</span>
          </>
        ) : kind === "partners" ? (
          <>
            <span>Logo</span><span>Partner</span><span>Alt text</span><span>Status</span><span>Sort</span><span>Actions</span>
          </>
        ) : kind === "awards" ? (
          <>
            <span>Media</span><span>Award / certificate</span><span>Category</span><span>Status</span><span>Sort</span><span>Actions</span>
          </>
        ) : kind === "projects" ? (
          <>
            <span>Media</span><span>Project</span><span>Location / link</span><span>Status</span><span>Sort</span><span>Actions</span>
          </>
        ) : kind === "listings" ? (
          <>
            <span>Media</span><span>Selected listing</span><span>Canonical route</span><span>Status</span><span>Sort</span><span>Actions</span>
          </>
        ) : kind === "gallery" ? (
          <>
            <span>Media</span><span>Gallery item</span><span>Caption</span><span>Status</span><span>Sort</span><span>Actions</span>
          </>
        ) : kind === "stories" ? (
          <>
            <span>Story</span><span>Person / team</span><span>Summary</span><span>Status</span><span>Sort</span><span>Actions</span>
          </>
        ) : kind === "testimonials" ? (
          <>
            <span>Client</span><span>Role</span><span>Quote</span><span>Status</span><span>Sort</span><span>Actions</span>
          </>
        ) : (
          <>
            <span>Title</span><span>Summary</span><span>Media</span><span>Status</span><span>Sort</span><span>Actions</span>
          </>
        )}
      </div>

      {blocks.map((block) => (
        <PageBlockEditor key={block.id} page={page} section={section} block={block} kind={kind} listings={listings} />
      ))}
    </div>
  );
}

function PageBlockEditor({
  page,
  section,
  block,
  kind,
  listings,
}: {
  page: PageWithSections;
  section: PageSectionWithBlocks;
  block: PageBlockWithMedia;
  kind: string;
  listings: PageEditorListingOption[];
}) {
  const blockAction = updatePageBlock.bind(null, block.id, page.id, page.route_path);
  const blockMediaUrl = mediaUrl(block.media_assets);
  const galleryPrimary = [...(block.page_block_media ?? [])]
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)
    .find((item) => mediaUrl(item.media_assets));
  const summaryMediaUrl = blockMediaUrl ?? mediaUrl(galleryPrimary?.media_assets);
  const selectedListing = listings.find((listing) => listing.id === block.listing_id);
  const sectionDefinition = page.route_path === "/" ? getHomeSectionDefinition(section.section_key) : null;
  const supportsBlockMedia = page.route_path !== "/" || Boolean(sectionDefinition?.supportsBlockMedia);

  return (
    <details className={`admin-block-row admin-block-row-${kind}`}>
      <summary>
        {kind === "stats" ? (
          <>
            <strong>{block.title ?? "0"}</strong><span>{block.icon_name}</span><span>{block.body}</span>
          </>
        ) : kind === "partners" ? (
          <>
            <span className="admin-media-thumb">{blockMediaUrl ? <img src={blockMediaUrl} alt="" /> : "No logo"}</span>
            <strong>{block.title ?? "Partner"}</strong><span>{block.body}</span>
          </>
        ) : kind === "awards" ? (
          <>
            <span className="admin-media-thumb">{blockMediaUrl ? <img src={blockMediaUrl} alt="" /> : "No media"}</span>
            <strong>{block.title ?? "Award"}</strong><span>{block.icon_name}</span>
          </>
        ) : kind === "projects" ? (
          <>
            <span className="admin-media-thumb">{summaryMediaUrl ? <img src={summaryMediaUrl} alt="" /> : "No media"}</span>
            <strong>{block.title ?? "Project"}</strong><span>{block.link_label ?? block.link_url}</span>
          </>
        ) : kind === "listings" ? (
          <>
            <span className="admin-media-thumb">{blockMediaUrl ? <img src={blockMediaUrl} alt="" /> : "Listing image"}</span>
            <strong>{selectedListing?.title ?? "Listing not selected"}</strong>
            <span>{selectedListing ? `/buy-sell/${selectedListing.listing_type_slug}/${selectedListing.slug}` : "No route"}</span>
          </>
        ) : kind === "gallery" ? (
          <>
            <span className="admin-media-thumb">{blockMediaUrl ? <img src={blockMediaUrl} alt="" /> : "No media"}</span>
            <strong>{block.title ?? "Gallery item"}</strong><span>{block.body}</span>
          </>
        ) : kind === "stories" ? (
          <>
            <strong>{block.title ?? "Story"}</strong><span>{block.link_label}</span><span>{block.body}</span>
          </>
        ) : kind === "testimonials" ? (
          <>
            <strong>{block.title ?? "Client"}</strong><span>{block.link_label}</span><span>{block.body}</span>
          </>
        ) : (
          <>
            <strong>{block.title ?? block.block_key ?? "Block"}</strong><span>{block.body}</span><span>{blockMediaUrl ? "Attached" : "No media"}</span>
          </>
        )}
        <span><span className={`admin-badge ${statusBadge(block.status)}`}>{block.status}</span></span>
        <span>{block.sort_order}</span>
        <span className="admin-btn admin-btn-sm">Edit</span>
      </summary>

      <AdminForm action={blockAction} className="admin-block-edit-form">
        <input type="hidden" name="section_key" value={section.section_key} />
        <input type="hidden" name="block_key" value={block.block_key ?? ""} />
        <input type="hidden" name="existing_block_media_id" value={block.media_id ?? ""} />
        <BlockFields block={block} kind={kind} listings={listings} />
        <div className="admin-field-row">
          <label className="admin-field">
            Status
            <select name="status" defaultValue={block.status}>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="admin-field">Sort order<input type="number" name="sort_order" defaultValue={block.sort_order} /></label>
        </div>
        {supportsBlockMedia && (
          <div className="admin-media-control">
            <div className="admin-field-row">
              <label className="admin-field">Replace with uploaded image<input type="file" name="block_media" accept="image/*" /></label>
              <label className="admin-field">Replace with image URL<input name="block_media_url" placeholder="/images/... or https://..." /></label>
            </div>
            <label className="admin-field">Image alt text<input name="block_media_alt" defaultValue={block.media_assets?.alt_text ?? ""} placeholder="Describe what is visibly shown" /></label>
            {blockMediaUrl && (
              <>
                <img className="admin-current-media" src={blockMediaUrl} alt={block.media_assets?.alt_text ?? "Current block media"} />
                <label className="admin-field admin-field-check">
                  <input type="checkbox" name="remove_block_media" value="true" /> remove current block image
                </label>
              </>
            )}
          </div>
        )}
        <details className="admin-advanced-json">
          <summary>Advanced JSON</summary>
          <label className="admin-field">
            Attributes JSON
            <textarea name="attributes" rows={4} defaultValue={jsonText(block.attributes)} />
          </label>
        </details>
        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn-primary">Save block</button>
        </div>
      </AdminForm>
      {kind === "projects" && <ProjectGalleryManager page={page} block={block} />}
      <div className="admin-destructive-row">
        <DeleteButton action={deletePageBlock.bind(null, block.id, page.id, page.route_path)} label="Delete block" />
      </div>
    </details>
  );
}

function ProjectGalleryManager({
  page,
  block,
}: {
  page: PageWithSections;
  block: PageBlockWithMedia;
}) {
  const uploadAction = uploadPageBlockGalleryMedia.bind(null, block.id, page.id, page.route_path);
  const gallery = block.page_block_media ?? [];

  return (
    <section className="admin-project-gallery">
      <div className="admin-project-gallery-head">
        <div>
          <h4>Project image gallery</h4>
          <p>Upload multiple images for this featured project. These images render on the homepage project card.</p>
        </div>
        <span className="admin-pill">{gallery.length} images</span>
      </div>

      <AdminForm action={uploadAction} className="admin-project-gallery-upload">
        <input type="hidden" name="project_title" value={block.title ?? block.block_key ?? "Project"} />
        <label className="admin-field">
          Add gallery images
          <input type="file" name="project_gallery_files" accept="image/*" multiple />
          <span>Images are uploaded to the Supabase site-assets bucket and linked to this project block.</span>
        </label>
        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn-primary">Upload selected images</button>
        </div>
      </AdminForm>

      {gallery.length > 0 ? (
        <div className="admin-project-gallery-list">
          {gallery.map((item) => {
            const itemMediaUrl = mediaUrl(item.media_assets);
            const updateAction = updatePageBlockGalleryMedia.bind(null, item.id, page.id, page.route_path);
            const deleteAction = deletePageBlockGalleryMedia.bind(null, item.id, page.id, page.route_path);

            return (
              <article className="admin-project-gallery-item" key={item.id}>
                <div className="admin-project-gallery-preview">
                  {itemMediaUrl ? <img src={itemMediaUrl} alt="" /> : <span>No image</span>}
                </div>
                <AdminForm action={updateAction} className="admin-project-gallery-fields">
                  <div className="admin-field-row">
                    <label className="admin-field">Image title<input name="media_title" defaultValue={item.media_assets?.title ?? ""} /></label>
                    <label className="admin-field">Sort<input type="number" name="sort_order" defaultValue={item.sort_order} /></label>
                  </div>
                  <label className="admin-field">Alt text<input name="alt_text" defaultValue={item.media_assets?.alt_text ?? ""} /></label>
                  <label className="admin-field">Caption<input name="caption" defaultValue={item.caption ?? item.media_assets?.caption ?? ""} /></label>
                  <label className="admin-field admin-field-check">
                    <input type="checkbox" name="is_primary" value="true" defaultChecked={item.is_primary} /> primary project image
                  </label>
                  <div className="admin-form-actions">
                    <button type="submit" className="admin-btn admin-btn-primary">Save image</button>
                  </div>
                </AdminForm>
                <AdminForm action={deleteAction} className="admin-project-gallery-remove">
                  <button type="submit" className="admin-btn admin-btn-danger">Remove from project</button>
                </AdminForm>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="admin-muted">No gallery images yet. The project card will use its main media image or the EB placeholder.</p>
      )}
    </section>
  );
}

function BlockFields({
  block,
  kind,
  listings,
}: {
  block: PageBlockWithMedia;
  kind: string;
  listings: PageEditorListingOption[];
}) {
  if (kind === "stats") {
    return (
      <div className="admin-field-row">
        <label className="admin-field">Number<input name="title" defaultValue={block.title ?? ""} /></label>
        <label className="admin-field">Unit<input name="icon_name" defaultValue={block.icon_name ?? ""} /></label>
        <label className="admin-field">Label<input name="body" defaultValue={block.body ?? ""} /></label>
        <input type="hidden" name="link_label" value={block.link_label ?? ""} />
        <input type="hidden" name="link_url" value={block.link_url ?? ""} />
        <input type="hidden" name="link_kind" value={block.link_kind ?? ""} />
      </div>
    );
  }

  if (kind === "partners") {
    return (
      <>
        <label className="admin-field">Partner name<input name="title" defaultValue={block.title ?? ""} /></label>
        <label className="admin-field">Logo alt text<input name="body" defaultValue={block.body ?? ""} /></label>
        <input type="hidden" name="link_label" value={block.link_label ?? ""} />
        <input type="hidden" name="link_url" value={block.link_url ?? ""} />
        <input type="hidden" name="link_kind" value={block.link_kind ?? ""} />
        <input type="hidden" name="icon_name" value={block.icon_name ?? ""} />
      </>
    );
  }

  if (kind === "awards") {
    return (
      <>
        <label className="admin-field">Award / certificate title<input name="title" defaultValue={block.title ?? ""} /></label>
        <label className="admin-field">Visible description<textarea name="body" rows={3} defaultValue={block.body ?? ""} /></label>
        <div className="admin-field-row">
          <label className="admin-field">Category label<input name="icon_name" placeholder="MEMBERSHIP / AWARD / REGISTRATION" defaultValue={block.icon_name ?? ""} /></label>
          <label className="admin-field">Issuer / source<input name="link_label" defaultValue={block.link_label ?? ""} /></label>
        </div>
        <label className="admin-field">Reference URL<input name="link_url" defaultValue={block.link_url ?? ""} /></label>
        <input type="hidden" name="link_kind" value={block.link_kind ?? ""} />
      </>
    );
  }

  if (kind === "projects") {
    return (
      <>
        <label className="admin-field">Project name<input name="title" defaultValue={block.title ?? ""} /></label>
        <label className="admin-field">SEO-friendly project summary<textarea name="body" rows={3} defaultValue={block.body ?? ""} /></label>
        <div className="admin-field-row">
          <label className="admin-field">Location / area<input name="link_label" placeholder="DHA Lahore / The East Block, Lahore" defaultValue={block.link_label ?? ""} /></label>
          <label className="admin-field">Stable link URL<input name="link_url" placeholder="/buy-sell or /buy-sell/plot/example-slug" defaultValue={block.link_url ?? ""} /></label>
        </div>
        <div className="admin-field-row">
          <label className="admin-field">Project label<input name="icon_name" placeholder="Residential plots / Commercial files" defaultValue={block.icon_name ?? ""} /></label>
          <label className="admin-field">
            Link kind
            <select name="link_kind" defaultValue={block.link_kind ?? "internal"}>
              <option value="internal">Internal</option>
              <option value="external">External</option>
              <option value="">None</option>
            </select>
          </label>
        </div>
      </>
    );
  }

  if (kind === "listings") {
    return (
      <>
        <label className="admin-field">
          Listing from inventory
          <select name="listing_id" required defaultValue={block.listing_id ?? ""}>
            <option value="">Choose a listing</option>
            {listings.map((listing) => (
              <option value={listing.id} key={listing.id}>
                {listing.title} - {listing.phase ?? listing.city ?? listing.listing_type_slug} ({listing.status}{listing.noindex ? ", noindex" : ""})
              </option>
            ))}
          </select>
          <span>The public card always uses the selected listing&apos;s current title, price, details, and canonical URL.</span>
        </label>
        <input type="hidden" name="title" value={block.title ?? ""} />
        <input type="hidden" name="body" value={block.body ?? ""} />
        <input type="hidden" name="link_label" value={block.link_label ?? ""} />
        <input type="hidden" name="link_url" value={block.link_url ?? ""} />
        <input type="hidden" name="link_kind" value={block.link_kind ?? "internal"} />
        <input type="hidden" name="icon_name" value={block.icon_name ?? ""} />
      </>
    );
  }

  if (kind === "gallery") {
    return (
      <>
        <label className="admin-field">Gallery title<input name="title" defaultValue={block.title ?? ""} /></label>
        <label className="admin-field">Caption / context<textarea name="body" rows={3} defaultValue={block.body ?? ""} /></label>
        <div className="admin-field-row">
          <label className="admin-field">Label / event type<input name="icon_name" placeholder="Event / Site visit / Client moment" defaultValue={block.icon_name ?? ""} /></label>
          <label className="admin-field">Optional link URL<input name="link_url" defaultValue={block.link_url ?? ""} /></label>
        </div>
        <input type="hidden" name="link_label" value={block.link_label ?? ""} />
        <input type="hidden" name="link_kind" value={block.link_kind ?? ""} />
      </>
    );
  }

  if (kind === "stories") {
    return (
      <>
        <label className="admin-field">Story title<input name="title" defaultValue={block.title ?? ""} /></label>
        <label className="admin-field">Visible summary<textarea name="body" rows={3} defaultValue={block.body ?? ""} /></label>
        <div className="admin-field-row">
          <label className="admin-field">Story code / duration<input name="icon_name" placeholder="TH / 02:40" defaultValue={block.icon_name ?? ""} /></label>
          <label className="admin-field">Person or team<input name="link_label" defaultValue={block.link_label ?? ""} /></label>
        </div>
        <label className="admin-field">Video URL / embed URL<input name="link_url" defaultValue={block.link_url ?? ""} /></label>
        <input type="hidden" name="link_kind" value={block.link_kind ?? ""} />
      </>
    );
  }

  if (kind === "testimonials") {
    return (
      <>
        <div className="admin-field-row">
          <label className="admin-field">Client name<input name="title" defaultValue={block.title ?? ""} /></label>
          <label className="admin-field">Role / context<input name="link_label" defaultValue={block.link_label ?? ""} /></label>
        </div>
        <label className="admin-field">Quote<textarea name="body" rows={4} defaultValue={block.body ?? ""} /></label>
        <input type="hidden" name="link_url" value={block.link_url ?? ""} />
        <input type="hidden" name="link_kind" value={block.link_kind ?? ""} />
        <input type="hidden" name="icon_name" value={block.icon_name ?? ""} />
      </>
    );
  }

  return (
    <>
      <label className="admin-field">Title<input name="title" defaultValue={block.title ?? ""} /></label>
      <label className="admin-field">Body<textarea name="body" rows={3} defaultValue={block.body ?? ""} /></label>
      <div className="admin-field-row">
        <label className="admin-field">Link label<input name="link_label" defaultValue={block.link_label ?? ""} /></label>
        <label className="admin-field">Link URL<input name="link_url" defaultValue={block.link_url ?? ""} /></label>
      </div>
      <div className="admin-field-row">
        <label className="admin-field">
          Link kind
          <select name="link_kind" defaultValue={block.link_kind ?? ""}>
            <option value="">None</option>
            <option value="internal">Internal</option>
            <option value="external">External</option>
          </select>
        </label>
        <label className="admin-field">Icon name<input name="icon_name" defaultValue={block.icon_name ?? ""} /></label>
      </div>
    </>
  );
}
