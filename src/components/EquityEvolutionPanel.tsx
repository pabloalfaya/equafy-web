"use client";

import { useMemo, useState } from "react";import {
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
import { buildEquityEvolutionData, type ContributionForEvolution, type MemberForEvolution, type TimeScale } from "@/utils/equityEvolutionData";

const COLORS_MEMBERS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#6366f1"];
const COLORS_TYPES = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];

export type EvolutionView = "byMember" | "totalValue" | "byType";
function computeVelocity(
  contribs: { date: string; risk_adjusted_value?: number | null }[],
  scale: TimeScale
): { points: number; pctVsLast: number | null; periodLabel: string; lastPeriodLabel: string } {
  const now = new Date();
  const pts = (c: { date: string; risk_adjusted_value?: number | null }) => Number(c.risk_adjusted_value) || 0;
  const inPeriod = (d: Date, start: Date, end: Date) => d >= start && d <= end;

  if (scale === "daily") {
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setHours(23, 59, 59, 999);
    const thisPts = contribs.filter((c) => inPeriod(new Date(c.date), todayStart, todayEnd)).reduce((s, c) => s + pts(c), 0);
    const lastPts = contribs.filter((c) => inPeriod(new Date(c.date), yesterdayStart, yesterdayEnd)).reduce((s, c) => s + pts(c), 0);
    const pct = lastPts > 0 ? Math.round(((thisPts - lastPts) / lastPts) * 100) : null;
    return { points: thisPts, pctVsLast: pct, periodLabel: "today", lastPeriodLabel: "yesterday" };
  }

  if (scale === "weekly") {
    const day = now.getDay();
    const toMonday = day === 0 ? -6 : 1 - day;
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() + toMonday);
    thisWeekStart.setHours(0, 0, 0, 0);
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
    thisWeekEnd.setHours(23, 59, 59, 999);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(lastWeekStart);
    lastWeekEnd.setDate(lastWeekEnd.getDate() + 6);
    lastWeekEnd.setHours(23, 59, 59, 999);
    const thisPts = contribs.filter((c) => inPeriod(new Date(c.date), thisWeekStart, thisWeekEnd)).reduce((s, c) => s + pts(c), 0);
    const lastPts = contribs.filter((c) => inPeriod(new Date(c.date), lastWeekStart, lastWeekEnd)).reduce((s, c) => s + pts(c), 0);
    const pct = lastPts > 0 ? Math.round(((thisPts - lastPts) / lastPts) * 100) : null;
    return { points: thisPts, pctVsLast: pct, periodLabel: "this week", lastPeriodLabel: "last week" };
  }

  if (scale === "annual") {
    const thisYearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
    const thisYearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0);
    const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
    const thisPts = contribs.filter((c) => inPeriod(new Date(c.date), thisYearStart, thisYearEnd)).reduce((s, c) => s + pts(c), 0);
    const lastPts = contribs.filter((c) => inPeriod(new Date(c.date), lastYearStart, lastYearEnd)).reduce((s, c) => s + pts(c), 0);
    const pct = lastPts > 0 ? Math.round(((thisPts - lastPts) / lastPts) * 100) : null;
    return { points: thisPts, pctVsLast: pct, periodLabel: "this year", lastPeriodLabel: "last year" };
  }

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const thisPts = contribs.filter((c) => inPeriod(new Date(c.date), thisMonthStart, thisMonthEnd)).reduce((s, c) => s + pts(c), 0);
  const lastPts = contribs.filter((c) => inPeriod(new Date(c.date), lastMonthStart, lastMonthEnd)).reduce((s, c) => s + pts(c), 0);
  const pct = lastPts > 0 ? Math.round(((thisPts - lastPts) / lastPts) * 100) : null;
  return { points: thisPts, pctVsLast: pct, periodLabel: "this month", lastPeriodLabel: "last month" };
}

interface EquityEvolutionPanelProps {
  contributions?: ContributionForEvolution[];
  members?: MemberForEvolution[];
}

export function EquityEvolutionPanel({ contributions = [], members = [] }: EquityEvolutionPanelProps) {
  const [view, setView] = useState<EvolutionView>("byMember");
  const [timeScale, setTimeScale] = useState<TimeScale>("monthly");

  const evolution = useMemo(
    () => buildEquityEvolutionData(contributions ?? [], members ?? [], timeScale),
    [contributions, members, timeScale]
  );

  const velocity = useMemo(() => {
    const contribs = [...(contributions ?? [])].filter((c): c is ContributionForEvolution & { date: string } => Boolean(c.date));
    return computeVelocity(contribs, timeScale);
  }, [contributions, timeScale]);

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
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Equity History</h3>
          <div className="flex flex-wrap gap-2 justify-end">
            {(["daily", "weekly", "monthly", "annual"] as const).map((scale) => (
              <button
                key={scale}
                type="button"
                onClick={() => setTimeScale(scale)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors ${
                  timeScale === scale
                    ? "bg-slate-700 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {scale === "daily" ? "Daily" : scale === "weekly" ? "Weekly" : scale === "monthly" ? "Monthly" : "Annual"}
              </button>
            ))}
          </div>
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
                    border: "2px solid #94a3b8",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                    fontSize: "13px",
                    padding: "12px 16px",
                    opacity: 1,
                  }}
                  itemStyle={{ color: "#0f172a", fontWeight: 600 }}
                  labelStyle={{ color: "#0f172a", fontWeight: 700, marginBottom: "6px" }}
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

        {/* View tabs debajo del gráfico */}
        <div className="flex flex-wrap gap-2 mt-3 justify-center">
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
      </div>
      <div className="flex-shrink-0">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Points velocity / Burn rate</h3>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
          <p className="text-2xl font-black text-slate-800 tabular-nums">
            {velocity.points > 0 ? "+" : ""}{velocity.points.toLocaleString()} points {velocity.periodLabel}
          </p>
          {velocity.pctVsLast != null ? (
            <p className={`mt-2 inline-flex items-center gap-1 text-sm font-bold ${velocity.pctVsLast >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              <span aria-hidden>{velocity.pctVsLast >= 0 ? "↑" : "↓"}</span>
              <span>{Math.abs(velocity.pctVsLast)}% vs {velocity.lastPeriodLabel}</span>
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-500 font-medium">
              No data in {velocity.lastPeriodLabel} to compare
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
