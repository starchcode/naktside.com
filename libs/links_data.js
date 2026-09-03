import { unstable_cache, updateTag } from "next/cache";
import connectMongoDB from "@/libs/mongodb";
import Link from "@/models/link";

export async function getLinksData() {
  await connectMongoDB();
  const links = await Link.find();
  return links; // Returning plain data instead of NextResponse
}

// Cached until explicitly invalidated — every write below calls
// updateTag("youtube-links") unconditionally, so any create/edit/delete/hide
// through /admin/links refreshes this immediately. No manual "revalidate"
// button needed as a result.
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
  updateTag("youtube-links");
  return serializeLink(link.toObject());
}

export async function updateLink(id, { name, url, type, hidden }) {
  await connectMongoDB();
  const link = await Link.findByIdAndUpdate(
    id,
    { name, url, type, hidden },
    { new: true }
  ).lean();
  updateTag("youtube-links");
  return link ? serializeLink(link) : null;
}

export async function setLinkHidden(id, hidden) {
  await connectMongoDB();
  const link = await Link.findByIdAndUpdate(id, { hidden }, { new: true }).lean();
  updateTag("youtube-links");
  return link ? serializeLink(link) : null;
}

export async function deleteLink(id) {
  await connectMongoDB();
  await Link.findByIdAndDelete(id).lean();
  updateTag("youtube-links");
}
