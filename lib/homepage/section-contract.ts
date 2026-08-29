export type HomeSectionKind =
  | "stats"
  | "partners"
  | "projects"
  | "listings"
  | "leadership"
  | "gallery"
  | "awards"
  | "stories"
  | "testimonials";

export interface HomeSectionDefinition {
  key: string;
  label: string;
  kind: HomeSectionKind;
  defaultSortOrder: number;
  supportsBlocks: boolean;
  supportsSectionMedia: boolean;
  supportsBlockMedia: boolean;
  supportsGallery: boolean;
  description: string;
}

export const HOME_SECTION_DEFINITIONS: readonly HomeSectionDefinition[] = [
  {
    key: "hero-stats",
    label: "Hero stats",
    kind: "stats",
    defaultSortOrder: 5,
    supportsBlocks: true,
    supportsSectionMedia: false,
    supportsBlockMedia: false,
    supportsGallery: false,
    description: "Short factual numbers shown directly below the homepage hero.",
  },
  {
    key: "partners",
    label: "Partner logos",
    kind: "partners",
    defaultSortOrder: 10,
    supportsBlocks: true,
    supportsSectionMedia: false,
    supportsBlockMedia: true,
    supportsGallery: false,
    description: "Published partner logos with descriptive alternative text.",
  },
  {
    key: "featured-projects",
    label: "Featured projects",
    kind: "projects",
    defaultSortOrder: 20,
    supportsBlocks: true,
    supportsSectionMedia: false,
    supportsBlockMedia: true,
    supportsGallery: true,
    description: "Curated project cards with their own image galleries and crawlable destination links.",
  },
  {
    key: "featured-listings",
    label: "Featured listings",
    kind: "listings",
    defaultSortOrder: 30,
    supportsBlocks: true,
    supportsSectionMedia: false,
    supportsBlockMedia: true,
    supportsGallery: false,
    description: "Specific live listings selected from the property database. Block media can override the listing thumbnail.",
  },
  {
    key: "leadership",
    label: "Leadership section",
    kind: "leadership",
    defaultSortOrder: 40,
    supportsBlocks: false,
    supportsSectionMedia: true,
    supportsBlockMedia: false,
    supportsGallery: false,
    description: "Homepage leadership narrative and its section image.",
  },
  {
    key: "life-gallery",
    label: "Gallery / events",
    kind: "gallery",
    defaultSortOrder: 50,
    supportsBlocks: true,
    supportsSectionMedia: false,
    supportsBlockMedia: true,
    supportsGallery: false,
    description: "Image-led company moments with useful titles, captions, and optional links.",
  },
  {
    key: "awards-recognition",
    label: "Awards and recognition",
    kind: "awards",
    defaultSortOrder: 60,
    supportsBlocks: true,
    supportsSectionMedia: false,
    supportsBlockMedia: true,
    supportsGallery: false,
    description: "Verifiable awards, registrations, certificates, and their reference links.",
  },
  {
    key: "team-stories",
    label: "Team stories / videos",
    kind: "stories",
    defaultSortOrder: 70,
    supportsBlocks: true,
    supportsSectionMedia: false,
    supportsBlockMedia: true,
    supportsGallery: false,
    description: "People-led stories with optional poster images and external video links.",
  },
  {
    key: "testimonials",
    label: "Testimonials",
    kind: "testimonials",
    defaultSortOrder: 80,
    supportsBlocks: true,
    supportsSectionMedia: false,
    supportsBlockMedia: true,
    supportsGallery: false,
    description: "Client quotes and attribution. Publish only content approved by the client.",
  },
  {
    key: "testimonial-stats",
    label: "Testimonial stats",
    kind: "stats",
    defaultSortOrder: 90,
    supportsBlocks: true,
    supportsSectionMedia: false,
    supportsBlockMedia: false,
    supportsGallery: false,
    description: "Factual proof numbers attached to the testimonial section.",
  },
] as const;

export function getHomeSectionDefinition(key: string) {
  return HOME_SECTION_DEFINITIONS.find((definition) => definition.key === key) ?? null;
}

export function homeSectionKind(key: string): HomeSectionKind | "default" {
  if (key === "gallery" || key === "events") return "gallery";
  return getHomeSectionDefinition(key)?.kind ?? "default";
}

export function isHomepageSectionKey(key: string) {
  return HOME_SECTION_DEFINITIONS.some((definition) => definition.key === key);
}
