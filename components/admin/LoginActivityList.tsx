"use client";

import { useEffect, useState, useTransition } from "react";
import { listLoginActivity } from "@/app/admin/actions";

const PAGE_SIZE = 10;

type Item = {
  id: string;
  outcome: string;
  step: string;
  country: string;
  createdAt: string;
};

export default function LoginActivityList() {
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [isPending, startTransition] = useTransition();

  const load = (nextPage: number, replace: boolean) => {
    startTransition(async () => {
      const result = await listLoginActivity({
        page: nextPage,
        pageSize: PAGE_SIZE,
        from: from || undefined,
        to: to || undefined,
      });
      setItems((prev) => (replace ? result.items : [...prev, ...result.items]));
      setHasMore(result.hasMore);
      setPage(nextPage);
    });
  };

  // Re-run from page 1 whenever the date range changes.
  useEffect(() => {
    load(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Login attempts</h1>

      <div className="mb-6 flex flex-wrap gap-4">
        <label className="flex flex-col gap-1 text-sm">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
          />
        </label>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500">{isPending ? "Loading…" : "No login attempts in this range."}</p>
      ) : (
        <ul className="divide-y divide-gray-100 text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-x-6 gap-y-1 py-3">
              <span
                className={
                  item.outcome === "success"
                    ? "w-16 font-semibold text-green-600"
                    : "w-16 font-semibold text-red-600"
                }
              >
                {item.outcome === "success" ? "Success" : "Failed"}
              </span>
              <span className="w-24 text-gray-500">
                {item.step === "password" ? "Password" : "Code"}
              </span>
              <span className="w-16 text-gray-500">{item.country}</span>
              <span className="text-gray-400">
                {new Date(item.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <button
          onClick={() => load(page + 1, false)}
          disabled={isPending}
          className="mt-6 rounded-full border border-gray-400 px-4 py-2 text-sm transition-opacity hover:opacity-60 disabled:opacity-40"
        >
          {isPending ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}
