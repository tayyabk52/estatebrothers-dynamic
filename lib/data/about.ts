import { aboutStats, branchNotes, credibilityPosts, officeLocations, operatingPoints, servicePillars, teamMembers, videoStories } from "@/data/about";

export async function getAboutData() {
  return { aboutStats, branchNotes, credibilityPosts, officeLocations, operatingPoints, servicePillars, teamMembers, videoStories };
}
