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

const RANGE_TO_SINCE = {
  "12h": () => hoursAgo(12),
  "24h": () => hoursAgo(24),
  "7d": () => daysAgo(7),
  "30d": () => daysAgo(30),
  "90d": () => daysAgo(90),
  "12m": () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d;
  },
  all: () => null,
};

function hoursAgo(n) {
  return new Date(Date.now() - n * 60 * 60 * 1000);
}

function daysAgo(n) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

// Sub-day ranges need hourly buckets — a day-level bucket would collapse
// "last 12 hours" into a single point.
function dateFormatForRange(range) {
  if (range === "12h" || range === "24h") return "%Y-%m-%d %H:00";
  if (range === "12m" || range === "all") return "%Y-%m";
  return "%Y-%m-%d";
}

// Returns totals for the admin dashboard: overall/per-source counts within
// the selected range, plus a day-by-day (or month-by-month, for longer
// ranges) breakdown for the chart — optionally narrowed to one source.
export async function getVisitStats({ range = "30d", source = "all" } = {}) {
  await connectMongoDB();

  const since = (RANGE_TO_SINCE[range] ?? RANGE_TO_SINCE["30d"])();
  const match = since ? { createdAt: { $gte: since } } : {};

  const bySourceRows = await Visit.aggregate([
    { $match: match },
    { $group: { _id: "$source", count: { $sum: 1 } } },
  ]);

  const bySource = { ig: 0, yt: 0, other: 0 };
  for (const row of bySourceRows) bySource[row._id] = row.count;
  const total = bySource.ig + bySource.yt + bySource.other;

  const dateFormat = dateFormatForRange(range);
  let timeSeries;

  if (source === "all") {
    // One row per source per date, so the chart can show ig/yt/other as
    // separate bars side by side on the same date, for comparison.
    const rows = await Visit.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: dateFormat, date: "$createdAt" } },
            source: "$source",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    const byDate = new Map();
    for (const row of rows) {
      const date = row._id.date;
      if (!byDate.has(date)) byDate.set(date, { date, ig: 0, yt: 0, other: 0 });
      byDate.get(date)[row._id.source] = row.count;
    }
    timeSeries = Array.from(byDate.values());
  } else {
    const rows = await Visit.aggregate([
      { $match: { ...match, source } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    timeSeries = rows.map((row) => ({ date: row._id, count: row.count }));
  }

  const countryMatch = source === "all" ? match : { ...match, source };
  const countryRows = await Visit.aggregate([
    { $match: countryMatch },
    { $group: { _id: { $ifNull: ["$country", "Unknown"] }, count: { $sum: 1 } } },
    { $sort: { count: 1 } }, // ascending: lowest visits first, highest last
  ]);
  const byCountry = countryRows.map((row) => ({ country: row._id, count: row.count }));

  return {
    total: source === "all" ? total : (bySource[source] ?? 0),
    bySource,
    timeSeries,
    byCountry,
  };
}
