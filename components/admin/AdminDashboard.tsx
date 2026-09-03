"use client";

import { useEffect, useState, useTransition } from "react";
import { getVisitStats, logout } from "@/app/admin/actions";
import VisitsChart from "./VisitsChart";

const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12m", label: "Last 12 months" },
  { value: "all", label: "All time" },
];

const SOURCE_OPTIONS = [
  { value: "all", label: "All sources" },
  { value: "ig", label: "Instagram" },
  { value: "yt", label: "YouTube" },
  { value: "other", label: "Other" },
];

const IDLE_LOGOUT_MS = 5 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"] as const;

type Stats = {
  total: number;
  bySource: { ig: number; yt: number; other: number };
  timeSeries: Record<string, string | number>[];
};

export default function AdminDashboard() {
  const [range, setRange] = useState("30d");
  const [source, setSource] = useState("all");
  const [stats, setStats] = useState<Stats | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      setStats(await getVisitStats({ range, source }));
    });
  }, [range, source]);

  // Auto-logout after 5 minutes with no mouse/keyboard/scroll/touch activity.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        logout();
      }, IDLE_LOGOUT_MS);
    };

    resetTimer();
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      clearTimeout(timer);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Visitor dashboard</h1>
        <form action={logout}>
          <button className="rounded-full border border-gray-400 px-3 py-1 text-sm transition-opacity hover:opacity-60">
            Log out
          </button>
        </form>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Range
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
          >
            {RANGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Source
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
          >
            {SOURCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!stats ? (
        <p className="text-gray-500">{isPending ? "Loading…" : ""}</p>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total" value={stats.total} />
            <StatCard label="Instagram" value={stats.bySource.ig} />
            <StatCard label="YouTube" value={stats.bySource.yt} />
            <StatCard label="Other" value={stats.bySource.other} />
          </div>

          <VisitsChart data={stats.timeSeries} source={source} />
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 px-4 py-3 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
