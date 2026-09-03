"use client";

import { useEffect, useState, useTransition } from "react";
import { getVisitStats } from "@/app/admin/actions";
import VisitsChart from "./VisitsChart";
import CountryChart from "./CountryChart";

const RANGE_OPTIONS = [
  { value: "12h", label: "Last 12 hours" },
  { value: "24h", label: "Last 24 hours" },
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

type Stats = {
  total: number;
  bySource: { ig: number; yt: number; other: number };
  timeSeries: Record<string, string | number>[];
  byCountry: { country: string; count: number }[];
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

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Admin dashboard</h1>

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

          <h2 className="mt-10 mb-4 text-lg font-semibold">Visits by country</h2>
          <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Countries" value={stats.byCountry.length} />
            {stats.byCountry.map((row) => (
              <StatCard key={row.country} label={row.country} value={row.count} />
            ))}
          </div>
          <CountryChart data={stats.byCountry} />
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
