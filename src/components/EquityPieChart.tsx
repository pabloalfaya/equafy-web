"use client";

import React, { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
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

// Mock: equity % per member over last 12 months (lines cross — founder down, investor up)
const MOCK_EQUITY_HISTORY = [
  { month: "Mar", Founder: 48, "Co-founder": 32, Investor: 20 },
  { month: "Apr", Founder: 46, "Co-founder": 31, Investor: 23 },
  { month: "May", Founder: 44, "Co-founder": 30, Investor: 26 },
  { month: "Jun", Founder: 42, "Co-founder": 29, Investor: 29 },
  { month: "Jul", Founder: 40, "Co-founder": 28, Investor: 32 },
  { month: "Aug", Founder: 38, "Co-founder": 27, Investor: 35 },
  { month: "Sep", Founder: 36, "Co-founder": 26, Investor: 38 },
  { month: "Oct", Founder: 34, "Co-founder": 25, Investor: 41 },
  { month: "Nov", Founder: 33, "Co-founder": 24, Investor: 43 },
  { month: "Dec", Founder: 32, "Co-founder": 23, Investor: 45 },
  { month: "Jan", Founder: 31, "Co-founder": 22, Investor: 47 },
  { month: "Feb", Founder: 30, "Co-founder": 21, Investor: 49 },
];

const MOCK_POINTS_THIS_MONTH = 450;
const MOCK_PCT_VS_LAST_MONTH = 12; // % change vs last month

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
  const [showEvolution, setShowEvolution] = useState(false);
  const {
    data,
    totalPoints,
    totalCashInvested,
    totalSweatEquity,
    totalContributionsCount,
    cashVsNonCashLabel,
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
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Cash (no mult.)</span>
          <span className="text-sm font-black text-slate-800 tabular-nums">{totalCashInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Sweat (no mult.)</span>
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
        <button
          type="button"
          onClick={() => setShowEvolution((v) => !v)}
          className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 font-bold text-slate-700 text-sm transition-colors"
        >
          {showEvolution ? "Hide evolution" : "See evolution"}
        </button>
      </div>

      {/* Sección expandible: Equity History + Points Velocity */}
      {showEvolution && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Equity History</h3>
          <div className="h-[200px] rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_EQUITY_HISTORY} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748b" }} stroke="#cbd5e1" />
                <YAxis domain={[0, 60]} tick={{ fontSize: 10, fill: "#64748b" }} stroke="#cbd5e1" tickFormatter={(v) => `${v}%`} />
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
                <Line type="monotone" dataKey="Founder" stroke="#10b981" strokeWidth={2} dot={false} name="Founder" />
                <Line type="monotone" dataKey="Co-founder" stroke="#3b82f6" strokeWidth={2} dot={false} name="Co-founder" />
                <Line type="monotone" dataKey="Investor" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Investor" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Points velocity / Burn rate</h3>
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
      )}
    </div>
  );
}
