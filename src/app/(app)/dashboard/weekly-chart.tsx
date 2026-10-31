"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Week = { label: string; pages: number };

// Single series, so no legend: the heading names it. Colours come from the app's theme tokens.
export function WeeklyChart({ data }: { data: Week[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid vertical={false} stroke="var(--line)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: "var(--line)" }}
            tick={{ fill: "var(--ink-muted)", fontSize: 12 }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--ink-muted)", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "var(--paper)" }}
            formatter={(value) => [`${value} pages`, "Read"]}
            labelFormatter={(label) => `Week of ${label}`}
            contentStyle={{ borderRadius: 8, border: "1px solid var(--line)", color: "var(--ink)" }}
          />
          <Bar dataKey="pages" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
