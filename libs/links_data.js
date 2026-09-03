import { unstable_cache, updateTag } from "next/cache";
import connectMongoDB from "@/libs/mongodb";
import Link from "@/models/link";

export async function getLinksData() {
  await connectMongoDB();
  const links = await Link.find();
  return links; // Returning plain data instead of NextResponse
}

// Which videos exist, their name/url, barely changes — so this is cached
// until the next deploy (Vercel resets its Data Cache on every deploy),
// instead of hitting Mongo on every homepage visit. The click count is
// deliberately NOT part of this — see getLinkClickCount/incrementLinkClick
// below, which stay live so the "clicks" display is accurate.
export const getYoutubeLinks = unstable_cache(
  async () => {
    await connectMongoDB();
    // $ne: true (not hidden: false) so older docs without the field at all
    // — from before "hidden" existed — still count as visible.
    const links = await Link.find({ type: "youtube", hidden: { $ne: true } }).lean();
    return links.map((link) => ({
      id: String(link._id),
      name: link.name,
      url: link.url,
    }));
  },
  ["youtube-links"],
  { revalidate: false, tags: ["youtube-links"] }
);

export async function getLinkClickCount(id) {
  await connectMongoDB();
  const link = await Link.findById(id).select("clickCount").lean();
  return link?.clickCount ?? 0;
}

export async function incrementLinkClick(id) {
  await connectMongoDB();
  await Link.findByIdAndUpdate(id, { $inc: { clickCount: 1 } });
}

function serializeLink(link) {
  return {
    id: String(link._id),
    name: link.name,
    url: link.url,
    type: link.type,
    clickCount: link.clickCount ?? 0,
    hidden: link.hidden ?? false,
  };
}

export async function getAllLinks() {
  await connectMongoDB();
  const links = await Link.find().sort({ createdAt: -1 }).lean();
  return links.map(serializeLink);
}

export async function createLink({ name, url, type, hidden }) {
  await connectMongoDB();
  const link = await Link.create({ name, url, type, hidden });
  if (type === "youtube") updateTag("youtube-links");
  return serializeLink(link.toObject());
}

export async function updateLink(id, { name, url, type, hidden }) {
  await connectMongoDB();
  const before = await Link.findById(id).select("type").lean();
  const link = await Link.findByIdAndUpdate(
    id,
    { name, url, type, hidden },
    { new: true }
  ).lean();

  // Revalidate if it was a YouTube link, still is, or just became one —
  // covers every case that could change what the homepage should show,
  // including the hidden flag flipping either way.
  if (before?.type === "youtube" || type === "youtube") updateTag("youtube-links");

  return link ? serializeLink(link) : null;
}

export async function setLinkHidden(id, hidden) {
  await connectMongoDB();
  const link = await Link.findByIdAndUpdate(id, { hidden }, { new: true }).lean();
  if (link?.type === "youtube") updateTag("youtube-links");
  return link ? serializeLink(link) : null;
}

export async function deleteLink(id) {
  await connectMongoDB();
  const removed = await Link.findByIdAndDelete(id).lean();
  if (removed?.type === "youtube") updateTag("youtube-links");
}
