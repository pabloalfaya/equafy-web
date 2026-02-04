"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Contribution } from "@/types/database";

interface EquityPieChartProps {
  contributions: Contribution[];
}

// Esta interfaz es la "llave" que quita el color rojo
interface ChartDataItem {
  name: string;
  value: number;
}

const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#64748b"];

export function EquityPieChart({ contributions }: EquityPieChartProps) {
  // Forzamos el tipado a ChartDataItem[] para que reconozca 'name' y 'value'
  const data = contributions.reduce((acc: ChartDataItem[], curr) => {
    const name = curr.contributor_name || "Socio";
    const value = curr.risk_adjusted_value || 0;
    
    const existing = acc.find((item) => item.name === name);
    if (existing) {
      existing.value += value;
    } else {
      acc.push({ name, value });
    }
    return acc;
  }, []);

  return (
    <div className="h-[400px] w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm font-sans">
      <h3 className="mb-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
        Reparto de la empresa
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value.toFixed(2)} pts`, "Parte"]}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}