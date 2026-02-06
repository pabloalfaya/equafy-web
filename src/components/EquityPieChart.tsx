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

export function EquityPieChart({ contributions }: { contributions: any[] }) {
  
  // 1. Agrupar contribuciones por socio (Suma los puntos de cada uno)
  const data = useMemo(() => {
    const grouped: Record<string, number> = {};

    contributions.forEach((c) => {
      const name = c.contributor_name || "Unknown";
      const value = Number(c.risk_adjusted_value) || 0;
      if (grouped[name]) {
        grouped[name] += value;
      } else {
        grouped[name] = value;
      }
    });

    return Object.keys(grouped).map((name) => ({
      name,
      value: grouped[name],
    }));
  }, [contributions]);

  // 2. Calcular total
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  // Si no hay datos, mostramos mensaje vacío
  if (totalValue === 0) {
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
            {/* CORRECCIÓN AQUÍ: Usamos 'any' para evitar el conflicto de tipos */}
            <Tooltip 
                formatter={(value: any) => [`${Number(value).toLocaleString()} pts`, "Points"]}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Texto Central (Total) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-black text-slate-800">{totalValue.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Points</span>
        </div>
      </div>

      {/* --- SECCIÓN LEYENDA (Debajo) --- */}
      <div className="mt-4 space-y-3 px-2 overflow-y-auto custom-scrollbar max-h-[200px]">
        {data.map((entry, index) => {
          const percentage = ((entry.value / totalValue) * 100).toFixed(1);
          return (
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
                <span className="block text-sm font-black text-slate-800">{percentage}%</span>
                <span className="block text-[10px] font-medium text-slate-400">{entry.value.toLocaleString()} pts</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}