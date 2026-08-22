import Link from "next/link";
import { mediaUrl, type PageBlockWithMedia, type PageSectionWithBlocks, type PageWithSections } from "@/lib/db/site";
import { updatePage, updatePageBlock, updatePageSection } from "./actions";

const SECTION_LABELS: Record<string, string> = {
  "hero-stats": "Hero stats",
  "featured-listings": "Featured listings",
  partners: "Partner logos",
  testimonials: "Testimonials",
  "testimonial-stats": "Testimonial stats",
  leadership: "Leadership section",
  services: "Services",
  "operating-model": "Operating model",
};

function friendlySectionName(key: string) {
  return SECTION_LABELS[key] ?? key.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
}

function statusBadge(status: string) {
  return ({ published: "admin-badge-pub", draft: "admin-badge-draft", review: "admin-badge-review", archived: "admin-badge-arc" }[status] ?? "admin-badge-draft");
}

function blockKind(sectionKey: string) {
  if (sectionKey === "hero-stats" || sectionKey === "testimonial-stats") return "stats";
  if (sectionKey === "partners") return "partners";
  if (sectionKey === "testimonials") return "testimonials";
  return "default";
}

function jsonText(value: unknown) {
  return JSON.stringify(value && typeof value === "object" ? value : {}, null, 2);
}

function pageLiveHref(routePath: string) {
  return routePath || "/";
}

export function PageEditorWorkspace({ page }: { page: PageWithSections }) {
  const pageAction = updatePage.bind(null, page.id);
  const sections = page.page_sections ?? [];
  const publishedSections = sections.filter((section) => section.status === "published").length;
  const blockCount = sections.reduce((total, section) => total + (section.page_blocks?.length ?? 0), 0);

  return (
    <div className="admin-editor-grid">
      <div className="admin-editor-main">
        <form action={pageAction} className="admin-form">
          <AdminAccordion
            title="Page identity"
            subtitle="Route, title, and the copy used by the main page hero."
            defaultOpen
            meta={<span className={`admin-badge ${statusBadge(page.status)}`}>{page.status}</span>}
          >
            <div className="admin-field-row">
              <label className="admin-field">Route path *<input name="route_path" required defaultValue={page.route_path} /></label>
              <label className="admin-field">Page key<input name="page_key" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={page.page_key} /></label>
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
        </form>

        <div className="admin-editor-section-head">
          <div>
            <h2>Content sections</h2>
            <p>Edit the visible homepage/about blocks without touching database fields directly.</p>
          </div>
          <span>{sections.length} sections</span>
        </div>

        {sections.map((section, index) => (
          <PageSectionEditor
            key={section.id}
            page={page}
            section={section}
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

function PageSectionEditor({
  page,
  section,
  defaultOpen,
}: {
  page: PageWithSections;
  section: PageSectionWithBlocks;
  defaultOpen: boolean;
}) {
  const sectionMediaUrl = mediaUrl(section.media_assets);
  const sectionAction = updatePageSection.bind(null, section.id, page.route_path);
  const blocks = section.page_blocks ?? [];

  return (
    <AdminAccordion
      title={friendlySectionName(section.section_key)}
      subtitle={`${blocks.length} block${blocks.length === 1 ? "" : "s"} · sort ${section.sort_order}`}
      defaultOpen={defaultOpen}
      meta={
        <>
          <span className={`admin-badge ${statusBadge(section.status)}`}>{section.status}</span>
          {sectionMediaUrl && <span className="admin-pill">Media</span>}
        </>
      }
    >
      <form action={sectionAction} className="admin-section-form">
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
        <div className="admin-field-row">
          <label className="admin-field">Upload image<input type="file" name="section_media" accept="image/*" /></label>
          <label className="admin-field">Image URL<input name="section_media_url" placeholder="/images/... or https://..." /></label>
        </div>
        {sectionMediaUrl && <p className="admin-muted">Current image: {sectionMediaUrl}</p>}
        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn-primary">Save section</button>
        </div>
      </form>

      {blocks.length > 0 && (
        <PageBlockTable page={page} section={section} blocks={blocks} />
      )}
    </AdminAccordion>
  );
}

function PageBlockTable({
  page,
  section,
  blocks,
}: {
  page: PageWithSections;
  section: PageSectionWithBlocks;
  blocks: PageBlockWithMedia[];
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
        <PageBlockEditor key={block.id} page={page} section={section} block={block} kind={kind} />
      ))}
    </div>
  );
}

function PageBlockEditor({
  page,
  section,
  block,
  kind,
}: {
  page: PageWithSections;
  section: PageSectionWithBlocks;
  block: PageBlockWithMedia;
  kind: string;
}) {
  const blockAction = updatePageBlock.bind(null, block.id, page.id, page.route_path);
  const blockMediaUrl = mediaUrl(block.media_assets);

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

      <form action={blockAction} className="admin-block-edit-form">
        <input type="hidden" name="section_key" value={section.section_key} />
        <input type="hidden" name="block_key" value={block.block_key ?? ""} />
        <input type="hidden" name="existing_block_media_id" value={block.media_id ?? ""} />
        <BlockFields block={block} kind={kind} />
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
        <div className="admin-field-row">
          <label className="admin-field">Upload media<input type="file" name="block_media" accept="image/*" /></label>
          <label className="admin-field">Media URL<input name="block_media_url" placeholder="/images/... or https://..." /></label>
        </div>
        {blockMediaUrl && <p className="admin-muted">Current media: {blockMediaUrl}</p>}
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
      </form>
    </details>
  );
}

function BlockFields({ block, kind }: { block: PageBlockWithMedia; kind: string }) {
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
