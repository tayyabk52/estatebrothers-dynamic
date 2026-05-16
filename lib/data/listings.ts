import { featuredProperties, heroStats, stats, testimonials } from "@/data/listings";

export async function getFeaturedProperties() { return featuredProperties; }
export async function getTestimonials() { return testimonials; }
export async function getStats() { return stats; }
export async function getHeroStats() { return heroStats; }
