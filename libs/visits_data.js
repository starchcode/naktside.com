import { after } from "next/server";
import { headers } from "next/headers";
import connectMongoDB from "@/libs/mongodb";
import Visit, { VISIT_SOURCES } from "@/models/visit";

const VALID_SOURCES = new Set(VISIT_SOURCES);

// Reads ?utm_source= off the request and the visitor's coarse country
// (from Vercel's geo header — the raw IP is never read or stored), then
// schedules the write for *after* the response has already been sent, so
// it never delays the page. Anything other than a recognized source
// (a direct visit, no param at all) is recorded as "other".
export async function trackVisit(searchParams) {
  const { utm_source } = await searchParams;
  const raw = String(
    Array.isArray(utm_source) ? utm_source[0] : utm_source ?? ""
  ).toLowerCase();
  const source = VALID_SOURCES.has(raw) ? raw : "other";

  // Request-time APIs like headers() must be read now, during render —
  // they can't be called from inside the after() callback itself.
  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country") ?? undefined;

  after(async () => {
    await connectMongoDB();
    await Visit.create({ source, country });
  });
}
