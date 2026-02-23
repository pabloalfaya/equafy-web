"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { parseCap } from "@/utils/equityCalculation";

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

export function EquityPieChart({ contributions, members }: EquityPieChartProps) {
  const {
    data,
    totalPoints,
    totalCashInvested,
    totalSweatEquity,
    totalContributionsCount,
    cashVsNonCashLabel,
    activeMembersCount,
  } = useMemo(() => {
    const memberList = members ?? [];

    // 1. TotalFixedEquity = suma de % fijos de todos los miembros
    const totalFixedEquity = memberList.reduce(
      (sum, m) => sum + (Number(m.fixed_equity) || 0),
      0
    );

    // 2. DynamicPoolAvailable = 100 - TotalFixedEquity
    const dynamicPoolAvailable = Math.max(0, 100 - totalFixedEquity);

    // 3. TotalRiskPoints = suma de puntos de TODAS las aportaciones actuales
    const totalRiskPoints = contributions.reduce(
      (sum, c) => sum + (Number(c.risk_adjusted_value) || 0),
      0
    );

    // 4. Para cada miembro: UserFixed, UserDynamic, UserTotal
    let chartData: ChartDataItem[] = memberList.map((member) => {
      const memberName = member.name || "Unknown";
      const userFixed = Number(member.fixed_equity) || 0;

      const memberPoints = contributions
        .filter((c) => (c.contributor_name || "") === memberName)
        .reduce((sum, c) => sum + (Number(c.risk_adjusted_value) || 0), 0);

      // Si TotalRiskPoints es 0: repartir DynamicPool a partes iguales entre miembros, o 0
      let userDynamic: number;
      if (totalRiskPoints > 0) {
        userDynamic = (memberPoints / totalRiskPoints) * dynamicPoolAvailable;
      } else {
        userDynamic =
          memberList.length > 0 ? dynamicPoolAvailable / memberList.length : 0;
      }

      const userTotal = userFixed + userDynamic;

      return {
        name: memberName,
        value: userTotal,
        fixed: userFixed,
        dynamic: memberPoints,
      };
    });

    // 5. Normalizar suma teórica a 100%
    const rawSum = chartData.reduce((sum, d) => sum + d.value, 0);
    if (rawSum > 0) {
      chartData = chartData.map((d) => ({
        ...d,
        value: (d.value / rawSum) * 100,
      }));
    }

    // 6. Apply equity cap (hard cap) and redistribute excess proportionally
    const caps = memberList.map((m) => parseCap(m as { id: string; name: string; equity_cap?: number | null; equityCap?: number | null }));
    let finalValues = chartData.map((d) => d.value);
    let excess = 0;
    for (let i = 0; i < finalValues.length; i++) {
      const cap = caps[i];
      if (cap != null && finalValues[i] > cap) {
        excess += finalValues[i] - cap;
        finalValues[i] = cap;
      }
    }
    let uncappedTheoreticalSum = 0;
    for (let i = 0; i < finalValues.length; i++) {
      const cap = caps[i];
      if (cap == null || chartData[i].value <= cap) uncappedTheoreticalSum += chartData[i].value;
    }
    if (excess > 0 && uncappedTheoreticalSum > 0) {
      for (let i = 0; i < finalValues.length; i++) {
        const cap = caps[i];
        if (cap == null || chartData[i].value <= cap)
          finalValues[i] += excess * (chartData[i].value / uncappedTheoreticalSum);
      }
    }
    const totalAfter = finalValues.reduce((s, v) => s + v, 0);
    if (totalAfter > 0) finalValues = finalValues.map((v) => (v / totalAfter) * 100);
    chartData = chartData.map((d, i) => ({ ...d, value: finalValues[i] }));

    // Filtrar miembros con valor 0 para no mostrar segmentos vacíos
    const filtered = chartData.filter((d) => d.value > 0);

    // Métricas para el panel: cash, sweat, total contributions, ratio, active members
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
      activeMembersCount: filtered.length,
    };
  }, [contributions, members]);

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const formattedTotalPoints = totalPoints.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Cash (without multipliers)</span>
          <span className="text-sm font-black text-slate-800 tabular-nums">{totalCashInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Sweat (without multipliers)</span>
          <span className="text-sm font-black text-slate-800 tabular-nums">{totalSweatEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cash vs Non-Cash</span>
          <span className="text-sm font-black text-slate-800 tabular-nums">{cashVsNonCashLabel}</span>
        </div>
        <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Contributions</span>
          <span className="text-sm font-black text-slate-800 tabular-nums">{totalContributionsCount}</span>
        </div>
        <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Members</span>
          <span className="text-sm font-black text-slate-800 tabular-nums">{activeMembersCount}</span>
        </div>
      </div>
    </div>
  );
}
