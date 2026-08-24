import { readFile } from "node:fs/promises";
import path from "node:path";

export interface AdminHelpDocMeta {
  id: string;
  title: string;
  description: string;
  file: string;
  routes: string[];
  keywords: string[];
}

export interface AdminHelpDoc extends AdminHelpDocMeta {
  content: string;
}

const KNOWLEDGEBASE_DIR = path.join(process.cwd(), "features", "admin-help", "knowledgebase");

export const ADMIN_HELP_DOCS: AdminHelpDocMeta[] = [
  {
    id: "about-page",
    title: "About page guide",
    description: "How proof stats, awards, services, stories, operating model, and branch support should be managed.",
    file: "about-page.md",
    routes: ["/admin/pages"],
    keywords: ["about", "award", "certificate", "recognition", "proof", "stats", "story", "video", "service", "operating", "branch"],
  },
  {
    id: "pages-editor",
    title: "Pages editor guide",
    description: "Technical guide for pages, sections, blocks, status, sort order, and media links.",
    file: "pages-editor.md",
    routes: ["/admin/pages"],
    keywords: ["page", "section", "block", "route", "status", "sort", "cms", "field"],
  },
  {
    id: "seo-basics",
    title: "SEO basics",
    description: "Plain rules for titles, descriptions, headings, images, structured data, and indexing.",
    file: "seo-basics.md",
    routes: ["/admin", "/admin/pages", "/admin/listings", "/admin/updates", "/admin/seo-landing-pages"],
    keywords: ["seo", "title", "description", "heading", "canonical", "index", "noindex", "schema", "structured", "google"],
  },
  {
    id: "media-guidelines",
    title: "Media guidelines",
    description: "How to use image, video, alt text, thumbnails, and Supabase media safely.",
    file: "media-guidelines.md",
    routes: ["/admin/pages", "/admin/listings", "/admin/updates", "/admin/team", "/admin/offices"],
    keywords: ["media", "image", "video", "thumbnail", "alt", "caption", "supabase", "storage", "photo"],
  },
  {
    id: "listings",
    title: "Listings guide",
    description: "How to manage property listing facts, media, status, and SEO descriptions.",
    file: "listings.md",
    routes: ["/admin/listings"],
    keywords: ["listing", "plot", "house", "property", "price", "availability", "sold", "phase"],
  },
  {
    id: "updates",
    title: "Updates guide",
    description: "How to manage articles, market notes, authors, publishing, and SEO previews.",
    file: "updates.md",
    routes: ["/admin/updates"],
    keywords: ["update", "article", "blog", "author", "news", "market", "published"],
  },
];

export function getKnowledgebaseSummaries() {
  return ADMIN_HELP_DOCS.map(({ id, title, description, routes, keywords }) => ({
    id,
    title,
    description,
    routes,
    keywords,
  }));
}

export async function readKnowledgeDoc(meta: AdminHelpDocMeta): Promise<AdminHelpDoc> {
  const content = await readFile(path.join(KNOWLEDGEBASE_DIR, meta.file), "utf8");
  return { ...meta, content };
}

export async function selectKnowledgeDocs(question: string, currentPath = "") {
  const normalizedQuestion = question.toLowerCase();
  const normalizedPath = currentPath.toLowerCase();
  const scored = ADMIN_HELP_DOCS.map((doc) => {
    let score = 0;
    if (doc.routes.some((route) => normalizedPath.startsWith(route))) score += 3;
    for (const keyword of doc.keywords) {
      if (normalizedQuestion.includes(keyword.toLowerCase())) score += 2;
    }
    if (doc.id === "seo-basics") score += 1;
    return { doc, score };
  })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ doc }) => doc);

  const docs = scored.length ? scored : ADMIN_HELP_DOCS.filter((doc) => ["pages-editor", "seo-basics"].includes(doc.id));
  return Promise.all(docs.map(readKnowledgeDoc));
}
