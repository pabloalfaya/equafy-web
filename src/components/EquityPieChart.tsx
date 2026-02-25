"use client";

import React, { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { computeMemberEquitySummary } from "@/utils/equityCalculation";
import { formatCurrency } from "@/lib/currency";

// Colores profesionales
const COLORS = [
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#6366f1", // Indigo
];

interface EquityPieChartProps {
  contributions: any[];
  members: any[];
  currency?: string;
  showEvolution?: boolean;
  onToggleEvolution?: () => void;
}

interface ChartDataItem {
  name: string;
  value: number;
  fixed: number;
  dynamic: number;
}

function CustomTooltip(props: { active?: boolean; payload?: Array<{ payload: ChartDataItem }> }) {
  const { active, payload } = props;
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;
  return (
    <div
      className="rounded-xl px-5 py-4"
      style={{
        backgroundColor: "#ffffff",
        boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.15), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        border: "1px solid #e2e8f0",
        minWidth: "140px",
      }}
    >
      <p className="font-bold text-slate-900 mb-2">{item.name}</p>
      <p className="text-sm text-slate-700 mb-0.5">Total: {item.value.toFixed(1)}%</p>
      <p className="text-sm text-slate-700 mb-0.5">Fixed: {item.fixed.toFixed(1)}%</p>
      <p className="text-sm text-slate-700">Dynamic: {item.dynamic.toLocaleString()} pts</p>
    </div>
  );
}

export function EquityPieChart({ contributions, members, currency = "EUR", showEvolution = false, onToggleEvolution }: EquityPieChartProps) {
  const {
    data,
    totalPoints,
    totalCashInvested,
    totalSweatEquity,
    totalContributionsCount,
    cashVsNonCashLabel,
  } = useMemo(() => {
    const memberList = members ?? [];
    const summary = computeMemberEquitySummary(memberList, contributions);

    const totalRiskPoints = summary.reduce((s, r) => s + r.totalPoints, 0);

    const chartData: ChartDataItem[] = memberList.map((member, i) => ({
      name: member.name || "Unknown",
      value: summary[i]?.equityPct ?? 0,
      fixed: Number(member.fixed_equity) || 0,
      dynamic: summary[i]?.totalPoints ?? 0,
    }));

    const filtered = chartData.filter((d) => d.value > 0);

    const totalCashInvested = contributions.reduce(
      (sum, c) => sum + (String((c as { type?: string }).type || "").toLowerCase() === "cash" ? Number((c as { amount?: number }).amount) || 0 : 0),
      0
    );
    const totalSweatEquity = contributions.reduce(
      (sum, c) => sum + (String((c as { type?: string }).type || "").toLowerCase() === "work" ? Number((c as { amount?: number }).amount) || 0 : 0),
      0
    );
    const totalAmount = contributions.reduce(
      (sum, c) => sum + (Number((c as { amount?: number }).amount) || 0),
      0
    );
    const cashPct = totalAmount > 0 ? (totalCashInvested / totalAmount) * 100 : 0;
    const nonCashPct = totalAmount > 0 ? 100 - cashPct : 0;
    const cashVsNonCashLabel =
      totalAmount > 0
        ? `${Math.round(cashPct)}% vs ${Math.round(nonCashPct)}%`
        : "—";

    return {
      data: filtered,
      totalPoints: totalRiskPoints,
      totalCashInvested,
      totalSweatEquity,
      totalContributionsCount: contributions.length,
      cashVsNonCashLabel,
    };
  }, [contributions, members]);

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const formattedTotalPoints = formatCurrency(totalPoints, currency);

  // Si no hay datos, mostramos mensaje vacío
  if (data.length === 0 || totalValue === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 text-sm italic min-h-[200px]">
        No contributions yet
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col justify-between">
      {/* --- SECCIÓN GRÁFICO --- */}
      <div className="h-[220px] relative shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ zIndex: 50 }}
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.15), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                padding: "12px 16px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Centro del rosco: solo 100% */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-black text-slate-800 whitespace-nowrap">
            100%
          </span>
        </div>
      </div>

      {/* --- CAJA INFERIOR: Total Points (valor exacto) --- */}
      <div className="mt-3 flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Total Points
        </span>
        <span className="text-sm font-black text-slate-800 tabular-nums">
          {formattedTotalPoints}
        </span>
      </div>

      {/* --- Métricas: mismo estilo que Total Points --- */}
      <div className="mt-4 space-y-2 overflow-y-auto custom-scrollbar max-h-[280px]">
        <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Cash (no mult.)</span>
          <span className="text-sm font-black text-slate-800 tabular-nums">{formatCurrency(totalCashInvested, currency)}</span>
        </div>
        <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Sweat (no mult.)</span>
          <span className="text-sm font-black text-slate-800 tabular-nums">{formatCurrency(totalSweatEquity, currency)}</span>
        </div>
        <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cash vs Non-Cash</span>
          <span className="text-sm font-black text-slate-800 tabular-nums">{cashVsNonCashLabel}</span>
        </div>
        <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Contributions</span>
          <span className="text-sm font-black text-slate-800 tabular-nums">{totalContributionsCount}</span>
        </div>
        <button
          type="button"
          onClick={() => onToggleEvolution?.()}
          className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl border border-emerald-600 font-bold text-white text-sm shadow-md hover:shadow-lg transition-all"
        >
          <TrendingUp className="w-4 h-4" />
          {showEvolution ? "See contribution log" : "See evolution"}
        </button>
      </div>
    </div>
  );
}
