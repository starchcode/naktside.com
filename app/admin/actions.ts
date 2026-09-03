"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  isAdminAuthenticated,
  timingSafeEqualStrings,
} from "@/libs/admin-auth";
import { getVisitStats as queryVisitStats } from "@/libs/visits_data";

export type LoginState = { error?: string };

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";

  const emailMatches = adminEmail.length > 0 && email === adminEmail;
  const passwordMatches = timingSafeEqualStrings(password, adminPassword);

  if (!emailMatches || !passwordMatches) {
    return { error: "Invalid email or password." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });

  redirect("/admin");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/admin");
}

export async function getVisitStats(filters: { range: string; source: string }) {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Unauthorized");
  }
  return queryVisitStats(filters);
}
