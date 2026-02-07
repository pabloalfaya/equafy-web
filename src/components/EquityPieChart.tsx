"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

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
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="font-bold text-slate-800 mb-1">{item.name}</p>
      <p className="text-sm text-slate-600">Total: {item.value.toFixed(1)} %</p>
      <p className="text-sm text-slate-600">Fixed: {item.fixed.toFixed(1)} %</p>
      <p className="text-sm text-slate-600">Dynamic: {item.dynamic.toLocaleString()} pts</p>
    </div>
  );
}

export function EquityPieChart({ contributions, members }: EquityPieChartProps) {
  const { data } = useMemo(() => {
    const memberList = members ?? [];

    // 2. totalFixedEquity = suma de fixed_equity de todos los miembros
    const totalFixedEquity = memberList.reduce(
      (sum, m) => sum + (Number(m.fixed_equity) || 0),
      0
    );

    // 3. dynamicPoolPercentage = 100 - totalFixedEquity
    const dynamicPoolPercentage = 100 - totalFixedEquity;

    // 4. totalPoints = suma de puntos de todas las contributions
    const totalPoints = contributions.reduce(
      (sum, c) => sum + (Number(c.risk_adjusted_value) || 0),
      0
    );

    // 5. Generar data iterando sobre members
    const chartData: ChartDataItem[] = memberList.map((member) => {
      const memberName = member.name || "Unknown";
      const memberFixed = Number(member.fixed_equity) || 0;

      const memberPoints = contributions
        .filter((c) => (c.contributor_name || "") === memberName)
        .reduce((sum, c) => sum + (Number(c.risk_adjusted_value) || 0), 0);

      const dynamicShare =
        totalPoints > 0
          ? (memberPoints / totalPoints) * dynamicPoolPercentage
          : 0;

      const finalValue = memberFixed + dynamicShare;

      return {
        name: memberName,
        value: finalValue,
        fixed: memberFixed,
        dynamic: memberPoints,
      };
    });

    // Filtrar miembros con valor 0 para no mostrar segmentos vacíos (opcional: podríamos mantenerlos)
    const filtered = chartData.filter((d) => d.value > 0);

    return { data: filtered };
  }, [contributions, members]);

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

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
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Texto Central (Total) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-black text-slate-800">
            {totalValue.toFixed(0)}%
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Total Equity
          </span>
        </div>
      </div>

      {/* --- SECCIÓN LEYENDA (Debajo) --- */}
      <div className="mt-4 space-y-3 px-2 overflow-y-auto custom-scrollbar max-h-[200px]">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center justify-between group py-1">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors truncate max-w-[120px]">
                {entry.name}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-sm font-black text-slate-800">
                {entry.value.toFixed(1)}%
              </span>
              <span className="block text-[10px] font-medium text-slate-400">
                {entry.fixed > 0 && `${entry.fixed.toFixed(0)}% fixed · `}
                {entry.dynamic.toLocaleString()} pts
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
