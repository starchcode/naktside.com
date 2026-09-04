"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SOURCE_COLORS = {
  ig: "#C13584",
  yt: "#dc2626",
  fb: "#1877F2",
  sc: "#FF5500",
  other: "#6b7280",
};
const SOURCE_LABELS = {
  ig: "Instagram",
  yt: "YouTube",
  fb: "Facebook",
  sc: "SoundCloud",
  other: "Other",
};

export default function VisitsChart({
  data,
  source,
}: {
  data: Record<string, string | number>[];
  source: string;
}) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-500">No visits in this range yet.</p>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip cursor={{ fillOpacity: 0.2 }} />
          {source === "all" ? (
            <>
              <Legend />
              {(Object.keys(SOURCE_COLORS) as Array<keyof typeof SOURCE_COLORS>).map(
                (key) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    name={SOURCE_LABELS[key]}
                    fill={SOURCE_COLORS[key]}
                    radius={[4, 4, 0, 0]}
                  />
                )
              )}
            </>
          ) : (
            <Bar
              dataKey="count"
              fill={SOURCE_COLORS[source as keyof typeof SOURCE_COLORS] ?? "#dc2626"}
              radius={[4, 4, 0, 0]}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
