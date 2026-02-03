"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { Contribution } from "@/types/database";

const COLORS = [
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#f59e0b", // Amber
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#ef4444", // Red
  "#6366f1", // Indigo
];

export function EquityPieChart({ contributions }: { contributions: Contribution[] }) {
  // 1. Limpieza de datos segura
  const data = contributions
    .map((c) => ({
      name: c.contributor_name || "Unknown",
      value: Number(c.risk_adjusted_value ?? 0), // El '?? 0' evita errores si viene null
    }))
    .filter((item) => item.value > 0);

  // 2. Si no hay datos, mostrar mensaje simple
  if (data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-slate-400">
        <p className="text-sm font-medium">No data available</p>
      </div>
    );
  }

  // 3. Renderizado del gráfico
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={160}
          paddingAngle={4}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
              stroke="#fff" 
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" height={36} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}