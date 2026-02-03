"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { Contribution } from "@/types/database";

// Paleta de colores vibrante para distinguir bien a los socios
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

interface EquityPieChartProps {
  contributions: Contribution[];
}

export function EquityPieChart({ contributions }: EquityPieChartProps) {
  // Preparamos los datos
  const data = contributions
    .map((c) => ({
      name: c.contributor_name || "Unknown",
      value: Number(c.risk_adjusted_value) || 0,
    }))
    .filter((item) => item.value > 0);

  // Si no hay datos, mostramos un círculo gris vacío
  if (data.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
        <div className="mb-4 h-32 w-32 rounded-full border-4 border-dashed border-slate-200 bg-slate-50" />
        <p className="text-sm font-medium">No data to display</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={80} // Radio interno (Donut)
          outerRadius={160} // Radio externo
          paddingAngle={4}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [`${value.toFixed(2)} pts`, "Risk Value"]}
          contentStyle={{ 
            borderRadius: '12px', 
            border: 'none', 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            fontWeight: 'bold'
          }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle"
          // He simplificado esto para evitar errores de TypeScript
          formatter={(value) => (
            <span className="ml-1 font-bold text-slate-600">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}