"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BarShapeProps } from "recharts";

// Spreads N hues evenly around the color wheel, so however many countries
// show up, each gets a distinct, evenly-separated shade — not a fixed palette.
function colorForIndex(index: number, total: number) {
  const hue = (index * 360) / Math.max(total, 1);
  return `hsl(${hue}, 65%, 55%)`;
}

export default function CountryChart({
  data,
}: {
  data: { country: string; count: number }[];
}) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-500">No country data in this range yet.</p>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="country" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip cursor={{ fillOpacity: 0.2 }} />
          <Bar
            dataKey="count"
            radius={[4, 4, 0, 0]}
            shape={(props: BarShapeProps) => (
              <Rectangle {...props} fill={colorForIndex(props.index, data.length)} />
            )}
          >
            <LabelList dataKey="count" position="top" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
