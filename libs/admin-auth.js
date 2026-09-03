import crypto from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Set right after email+password check out, before the TOTP code is
// verified — proves credentials were correct without re-sending them.
export const PENDING_COOKIE_NAME = "admin_pending";
export const PENDING_MAX_AGE_SECONDS = 60 * 5; // 5 minutes to enter the code

function sign(value) {
  return crypto.createHmac("sha256", process.env.AUTH_SECRET).update(value).digest("hex");
}

function createSignedToken() {
  const issuedAt = Date.now().toString();
  return `${issuedAt}.${sign(issuedAt)}`;
}

function isValidSignedToken(token, maxAgeSeconds) {
  if (!token) return false;

  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) return false;

  const expected = Buffer.from(sign(issuedAt), "hex");
  const actual = Buffer.from(signature, "hex");
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
    return false;
  }

  const age = Date.now() - Number(issuedAt);
  return age >= 0 && age <= maxAgeSeconds * 1000;
}

// Session token = "<issued-at-timestamp>.<hmac signature>" — no database
// row needed, the signature alone proves it was minted by this server.
export const createSessionToken = createSignedToken;
export const createPendingToken = createSignedToken;

export function isValidSessionToken(token) {
  return isValidSignedToken(token, SESSION_MAX_AGE_SECONDS);
}

export function isValidPendingToken(token) {
  return isValidSignedToken(token, PENDING_MAX_AGE_SECONDS);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return isValidSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export function timingSafeEqualStrings(a, b) {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) {
    crypto.timingSafeEqual(aBuf, aBuf); // keep timing roughly constant either way
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}
