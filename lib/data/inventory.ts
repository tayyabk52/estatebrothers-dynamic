import { agents, houseListings, plotListings } from "@/data/inventory";

export async function getAllListings() {
  return [...plotListings, ...houseListings];
}

export async function getListingBySlug(type: string, slug: string) {
  const source = type === "plot" ? plotListings : houseListings;
  return source.find((l) => l.slug === slug) ?? null;
}

export async function getAgent(agentId: string) {
  return agents.find((a) => a.id === agentId) ?? agents[0];
}

export async function getPlotListings() { return plotListings; }
export async function getHouseListings() { return houseListings; }
