"use server";

import { isAdminAuthenticated } from "@/libs/admin-auth";
import {
  getAllLinks,
  createLink,
  updateLink,
  deleteLink,
  setLinkHidden,
} from "@/libs/links_data";

const LINK_TYPES = ["youtube", "instagram", "soundcloud"];

export type LinkRecord = {
  id: string;
  name: string;
  url: string;
  type: string;
  clickCount: number;
  hidden: boolean;
  order: number;
};

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Unauthorized");
  }
}

function parseLinkForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const hidden = formData.get("hidden") === "on";
  const orderRaw = Number(formData.get("order"));
  const order = Number.isFinite(orderRaw) && orderRaw > 0 ? orderRaw : 1;

  if (!name || !url || !LINK_TYPES.includes(type)) {
    throw new Error("Name, URL and a valid type are required.");
  }

  return { name, url, type, hidden, order };
}

export async function listLinks(): Promise<LinkRecord[]> {
  await requireAdmin();
  return getAllLinks();
}

export async function createLinkAction(formData: FormData) {
  await requireAdmin();
  return createLink(parseLinkForm(formData));
}

export async function updateLinkAction(id: string, formData: FormData) {
  await requireAdmin();
  return updateLink(id, parseLinkForm(formData));
}

export async function deleteLinkAction(id: string) {
  await requireAdmin();
  await deleteLink(id);
}

export async function toggleLinkHiddenAction(id: string, hidden: boolean) {
  await requireAdmin();
  return setLinkHidden(id, hidden);
}
