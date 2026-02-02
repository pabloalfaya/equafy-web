"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  TooltipProps,
} from "recharts";
import type { Contribution, ContributionType } from "@/types/database";

const COLORS = [
  "#047857", // emerald-700
  "#059669", // emerald-600
  "#10b981", // emerald-500
  "#34d399", // emerald-400
  "#6ee7b7", // emerald-300
  "#a7f3d0", // emerald-200
  "#064e3b", // emerald-900
  "#065f46", // emerald-800
];

const TYPE_LABELS: Record<ContributionType, string> = {
  cash: "Efectivo",
  labor: "Trabajo",
  ip: "Propiedad Intelectual",
  assets: "Activos",
};

interface GroupedContributor {
  name: string;
  value: number;
  fill: string;
  byType: Record<ContributionType, number>;
}

interface EquityPieChartProps {
  contributions: Contribution[];
}

function groupByContributor(
  contributions: Contribution[]
): GroupedContributor[] {
  const grouped = contributions.reduce<
    Record<string, { total: number; byType: Record<string, number> }>
  >((acc, c) => {
    const name = c.contributor_name;
    const val = c.risk_adjusted_value ?? 0;
    if (!acc[name]) {
      acc[name] = { total: 0, byType: {} };
    }
    acc[name].total += val;
    acc[name].byType[c.type] = (acc[name].byType[c.type] ?? 0) + val;
    return acc;
  }, {});

  return Object.entries(grouped).map(([name, data], i) => ({
    name,
    value: data.total,
    fill: COLORS[i % COLORS.length],
    byType: data.byType as Record<ContributionType, number>,
  }));
}

function CustomTooltip({
  active,
  payload,
  total,
}: TooltipProps<number, string> & { total: number }) {
  if (!active || !payload?.length || !total) return null;

  const data = payload[0].payload as GroupedContributor;
  const contributorTotal = data.value;
  const percent = total > 0 ? (contributorTotal / total) * 100 : 0;

  const typeEntries = (Object.entries(data.byType) as [ContributionType, number][])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
      style={{ minWidth: "200px" }}
    >
      <p className="mb-2 font-semibold text-slate-800">{data.name}</p>
      <p className="mb-3 text-sm text-slate-600">
        Total: {contributorTotal.toLocaleString("es-ES", { minimumFractionDigits: 2 })} ({percent.toFixed(1)}%)
      </p>
      <div className="space-y-1 border-t border-slate-100 pt-2">
        {typeEntries.map(([type, value]) => {
          const typePercent = contributorTotal > 0 ? (value / contributorTotal) * 100 : 0;
          return (
            <div
              key={type}
              className="flex justify-between gap-4 text-sm"
            >
              <span className="text-slate-600">{TYPE_LABELS[type]}:</span>
              <span className="font-medium text-slate-800">
                {value.toLocaleString("es-ES", { minimumFractionDigits: 2 })} ({typePercent.toFixed(0)}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function EquityPieChart({ contributions }: EquityPieChartProps) {
  const data = groupByContributor(contributions);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (contributions.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
        <p className="text-slate-500">No hay aportaciones para mostrar</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={120}
            paddingAngle={3}
            dataKey="value"
            animationDuration={400}
            animationBegin={0}
            label={({ name, percent }) =>
              `${name} (${((percent ?? 0) * 100).toFixed(1)}%)`
            }
            labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            content={<CustomTooltip total={total} />}
            cursor={{ fill: "transparent" }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-sm text-slate-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
