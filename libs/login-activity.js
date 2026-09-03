import { after } from "next/server";
import connectMongoDB from "@/libs/mongodb";
import LoginActivity from "@/models/login-activity";

// `country` must be read (from headers()) by the caller, before scheduling
// this — request-time APIs can't be read from inside after()'s callback.
export function recordLoginActivity({ outcome, step, country }) {
  after(async () => {
    await connectMongoDB();
    await LoginActivity.create({ outcome, step, country });
  });
}

export async function getLoginActivity({ page = 1, pageSize = 10, from, to } = {}) {
  await connectMongoDB();

  const match = {};
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) {
      // Treat "to" as the whole day, not midnight at its start.
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      match.createdAt.$lte = end;
    }
  }

  const total = await LoginActivity.countDocuments(match);
  const items = await LoginActivity.find(match)
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

  return {
    items: items.map((item) => ({
      id: String(item._id),
      outcome: item.outcome,
      step: item.step,
      country: item.country ?? "Unknown",
      createdAt: item.createdAt.toISOString(),
    })),
    hasMore: page * pageSize < total,
  };
}
