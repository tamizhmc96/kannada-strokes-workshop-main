// The live site content. It is bundled from src/content.json at build time, so
// the only way it changes is a new build — which is exactly what the admin
// "Save" triggers (it commits content.json to GitHub → Vercel redeploys).

import contentData from "@/content.json";
import { mergeContent, type SiteContent } from "./content-schema";

export const SITE_CONTENT: SiteContent = mergeContent(contentData);

export function useSiteContent(): SiteContent {
  return SITE_CONTENT;
}
