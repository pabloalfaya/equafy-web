"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Contribution } from "@/types/database";

interface EquityPieChartProps {
  contributions: Contribution[];
}

interface ChartDataItem {
  name: string;
  value: number;
}

const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#64748b"];

export function EquityPieChart({ contributions }: EquityPieChartProps) {
  // 1. Agrupamos los datos por socio
  const data = contributions.reduce((acc: ChartDataItem[], curr) => {
    const name = curr.contributor_name || "Member";
    const value = curr.risk_adjusted_value || 0;
    
    const existing = acc.find((item) => item.name === name);
    if (existing) {
      existing.value += value;
    } else {
      acc.push({ name, value });
    }
    return acc;
  }, []);

  // 2. Calculamos el total global para sacar los porcentajes
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col h-full w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm font-sans">
      <h3 className="mb-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
        Equity Distribution
      </h3>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(2)} pts`, "Value"]}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 3. LEYENDA PERSONALIZADA CON PORCENTAJES */}
      <div className="flex flex-wrap justify-center gap-4 mt-6 pt-6 border-t border-slate-100">
        {data.map((item, index) => {
          const percentage = totalValue > 0 
            ? ((item.value / totalValue) * 100).toFixed(1) 
            : "0";

          return (
            <div key={item.name} className="flex items-center gap-2 group transition-all hover:scale-105">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
                {item.name}
                <span className="ml-2 text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                  {percentage}%
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}