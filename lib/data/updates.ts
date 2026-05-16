import { formatUpdateDate, updates, updateTypes } from "@/data/updates";
export async function getUpdates() { return updates; }
export { updateTypes, formatUpdateDate };
