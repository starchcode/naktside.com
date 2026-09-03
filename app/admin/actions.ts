"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  PENDING_COOKIE_NAME,
  PENDING_MAX_AGE_SECONDS,
  createSessionToken,
  createPendingToken,
  isValidPendingToken,
  isAdminAuthenticated,
  timingSafeEqualStrings,
} from "@/libs/admin-auth";
import { verifyTotp } from "@/libs/totp";
import { isLockedOut, recordFailedAttempt, clearFailedAttempts } from "@/libs/login-attempts";
import { getVisitStats as queryVisitStats } from "@/libs/visits_data";

export type LoginState = { error?: string; step?: "totp" };

const LOCKOUT_MESSAGE = "Too many failed attempts. Try again in 24 hours.";

async function getClientIp() {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headersList.get("x-real-ip") ?? "unknown";
}

// Step 1: email + password. On success, marks credentials as verified via
// a short-lived cookie and asks for the authenticator code — no session
// cookie is set yet.
export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const ip = await getClientIp();
  if (await isLockedOut(ip)) {
    return { error: LOCKOUT_MESSAGE };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";

  const emailMatches = adminEmail.length > 0 && email === adminEmail;
  const passwordMatches = timingSafeEqualStrings(password, adminPassword);

  if (!emailMatches || !passwordMatches) {
    await recordFailedAttempt(ip);
    return { error: "Invalid email or password." };
  }

  const cookieStore = await cookies();
  cookieStore.set(PENDING_COOKIE_NAME, createPendingToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: PENDING_MAX_AGE_SECONDS,
    path: "/",
  });

  return { step: "totp" };
}

// Step 2: the 6-digit authenticator code. Only grants the real session.
export async function verifyTotpCode(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const ip = await getClientIp();
  if (await isLockedOut(ip)) {
    return { error: LOCKOUT_MESSAGE, step: "totp" };
  }

  const cookieStore = await cookies();
  const pending = cookieStore.get(PENDING_COOKIE_NAME)?.value;
  if (!isValidPendingToken(pending)) {
    return { error: "Session expired — please log in again." };
  }

  const code = String(formData.get("code") ?? "").trim();
  if (!verifyTotp(process.env.ADMIN_TOTP_SECRET, code)) {
    await recordFailedAttempt(ip);
    return { error: "Invalid code.", step: "totp" };
  }

  await clearFailedAttempts(ip);
  cookieStore.delete(PENDING_COOKIE_NAME);
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
