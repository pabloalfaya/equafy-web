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
  const { data } = useMemo(() => {
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

    // 5. Normalizar para que la suma sea exactamente 100% (evitar errores de redondeo)
    const rawSum = chartData.reduce((sum, d) => sum + d.value, 0);
    if (rawSum > 0 && Math.abs(rawSum - 100) > 0.001) {
      chartData = chartData.map((d) => ({
        ...d,
        value: (d.value / rawSum) * 100,
      }));
    }

    // Filtrar miembros con valor 0 para no mostrar segmentos vacíos
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
