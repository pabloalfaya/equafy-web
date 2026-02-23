"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { buildEquityEvolutionData, type ContributionForEvolution, type MemberForEvolution } from "@/utils/equityEvolutionData";

const COLORS_MEMBERS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#6366f1"];
const COLORS_TYPES = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];

const MOCK_POINTS_THIS_MONTH = 450;
const MOCK_PCT_VS_LAST_MONTH = 12;

export type EvolutionView = "byMember" | "totalValue" | "byType";

interface EquityEvolutionPanelProps {
  contributions?: ContributionForEvolution[];
  members?: MemberForEvolution[];
}

export function EquityEvolutionPanel({ contributions = [], members = [] }: EquityEvolutionPanelProps) {
  const [view, setView] = useState<EvolutionView>("byMember");

  const evolution = useMemo(
    () => buildEquityEvolutionData(contributions ?? [], members ?? []),
    [contributions, members]
  );

  const { byMember, totalValue, byType, memberNames, typeNames } = evolution;

  const chartDataByMember = byMember.map((row) => {
    const out: Record<string, string | number> = { monthLabel: row.monthLabel };
    memberNames.forEach((name) => (out[name] = row[name] ?? 0));
    return out;
  });

  const chartDataTotal = totalValue.map((row) => ({
    monthLabel: row.monthLabel,
    total: row.total,
  }));

  const chartDataByType = byType.map((row) => {
    const out: Record<string, string | number> = { monthLabel: row.monthLabel };
    typeNames.forEach((t) => (out[t] = row[t] ?? 0));
    return out;
  });

  const hasData = byMember.length > 0;

  return (
    <div className="h-full flex flex-col gap-6 min-h-0">
      <div className="flex-shrink-0">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Equity History</h3>

        {/* View tabs */}
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            type="button"
            onClick={() => setView("byMember")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              view === "byMember"
                ? "bg-emerald-500 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            By Member (%)
          </button>
          <button
            type="button"
            onClick={() => setView("totalValue")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              view === "totalValue"
                ? "bg-emerald-500 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Total Value
          </button>
          <button
            type="button"
            onClick={() => setView("byType")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              view === "byType"
                ? "bg-emerald-500 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            By Type
          </button>
        </div>

        <div className="h-[240px] rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          {!hasData ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              No contribution data yet. Add contributions to see evolution.
            </div>
          ) : view === "byMember" ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartDataByMember} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="monthLabel" tick={{ fontSize: 10, fill: "#64748b" }} stroke="#cbd5e1" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} stroke="#cbd5e1" tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                  }}
                  formatter={(value: number | undefined, name?: string) => [value != null ? `${value}%` : "—", name ?? ""]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend wrapperStyle={{ fontSize: "10px" }} iconType="line" />
                {memberNames.map((name, i) => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={COLORS_MEMBERS[i % COLORS_MEMBERS.length]}
                    strokeWidth={2}
                    dot={false}
                    name={name}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : view === "totalValue" ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartDataTotal} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="monthLabel" tick={{ fontSize: 10, fill: "#64748b" }} stroke="#cbd5e1" />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} stroke="#cbd5e1" tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                  }}
                  formatter={(value: number | undefined) => [value != null ? value.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—", "Total points"]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Area type="monotone" dataKey="total" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} name="Total points" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartDataByType} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="monthLabel" tick={{ fontSize: 10, fill: "#64748b" }} stroke="#cbd5e1" />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} stroke="#cbd5e1" tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                  }}
                  formatter={(value: number | undefined, name?: string) => [value != null ? value.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—", name ?? ""]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend wrapperStyle={{ fontSize: "10px" }} iconType="line" />
                {typeNames.map((t, i) => (
                  <Line
                    key={t}
                    type="monotone"
                    dataKey={t}
                    stroke={COLORS_TYPES[i % COLORS_TYPES.length]}
                    strokeWidth={2}
                    dot={false}
                    name={t}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Points velocity / Burn rate</h3>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
          <p className="text-2xl font-black text-slate-800 tabular-nums">
            +{MOCK_POINTS_THIS_MONTH.toLocaleString()} points this month
          </p>
          <p className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-emerald-600">
            <span aria-hidden>↑</span>
            <span>{MOCK_PCT_VS_LAST_MONTH}% vs last month</span>
          </p>
        </div>
      </div>
    </div>
  );
}
