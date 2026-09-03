"use server";

import { getLinkClickCount as queryClickCount, incrementLinkClick } from "@/libs/links_data";

export async function getLinkClickCount(id: string) {
  return queryClickCount(id);
}

export async function recordLinkClick(id: string) {
  await incrementLinkClick(id);
}
