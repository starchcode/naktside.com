import { unstable_cache, updateTag } from "next/cache";
import connectMongoDB from "@/libs/mongodb";
import Link from "@/models/link";

export async function getLinksData() {
  await connectMongoDB();
  const links = await Link.find();
  return links; // Returning plain data instead of NextResponse
}

// Cached until explicitly invalidated — every write below calls
// updateTag("embeddable-links") unconditionally, so any create/edit/delete/hide
// through /admin/links refreshes it immediately. No manual "revalidate"
// button needed as a result.
export const getEmbeddableLinks = unstable_cache(
  async () => {
    await connectMongoDB();
    // $ne: true (not hidden: false) so older docs without the field at all
    // — from before "hidden" existed — still count as visible.
    // Sort by order ascending — ties (including the default of 1 for
    // everything) just come back in whatever order Mongo naturally has
    // them in, no secondary sort key needed.
    const links = await Link.find({
      type: { $in: ["youtube", "soundcloud"] },
      hidden: { $ne: true },
    })
      .sort({ order: 1 })
      .lean();
    return links.map((link) => ({
      id: String(link._id),
      name: link.name,
      url: link.url,
      type: link.type,
    }));
  },
  ["embeddable-links"],
  { revalidate: false, tags: ["embeddable-links"] }
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
    order: link.order ?? 1,
  };
}

function invalidateLinkCaches() {
  updateTag("embeddable-links");
}

export async function getAllLinks() {
  await connectMongoDB();
  const links = await Link.find().sort({ order: 1, createdAt: -1 }).lean();
  return links.map(serializeLink);
}

export async function createLink({ name, url, type, hidden, order }) {
  await connectMongoDB();
  const link = await Link.create({ name, url, type, hidden, order });
  invalidateLinkCaches();
  return serializeLink(link.toObject());
}

export async function updateLink(id, { name, url, type, hidden, order }) {
  await connectMongoDB();
  const link = await Link.findByIdAndUpdate(
    id,
    { name, url, type, hidden, order },
    { new: true }
  ).lean();
  invalidateLinkCaches();
  return link ? serializeLink(link) : null;
}

export async function setLinkHidden(id, hidden) {
  await connectMongoDB();
  const link = await Link.findByIdAndUpdate(id, { hidden }, { new: true }).lean();
  invalidateLinkCaches();
  return link ? serializeLink(link) : null;
}

export async function deleteLink(id) {
  await connectMongoDB();
  await Link.findByIdAndDelete(id).lean();
  invalidateLinkCaches();
}
