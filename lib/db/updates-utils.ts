export const updateTypeLabels: Record<string, string> = {
  announcement: "Announcements",
  facebook: "Facebook",
  event: "Events",
  market: "Market notes",
  company: "Company",
};

export function formatUpdateDate(value: string): string {
  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
