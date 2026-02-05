"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface EquityPieChartProps {
  contributions: any[];
}

const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#64748b"];

// --- 1. COMPONENTE PERSONALIZADO PARA EL TOOLTIP ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; // Aquí están todos los datos (name, value, etc.)
    const total = payload[0].payload.total; // Pasaremos el total para calcular %
    
    // Calculamos el porcentaje al vuelo
    const percent = total > 0 ? ((data.value / total) * 100).toFixed(1) : "0";

    return (
      <div className="bg-white p-4 border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-xl min-w-[140px]">
        {/* NOMBRE DEL SOCIO */}
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          {data.name}
        </p>
        
        <div className="flex items-center justify-between gap-3">
          {/* VALOR EN PUNTOS */}
          <span className="text-lg font-bold text-slate-900">
            {Number(data.value).toLocaleString()} <span className="text-xs font-medium text-slate-400">pts</span>
          </span>
          
          {/* PORCENTAJE */}
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
            {percent}%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function EquityPieChart({ contributions }: EquityPieChartProps) {
  // 2. Agrupamos los datos
  const data = contributions.reduce((acc: any[], curr: any) => {
    const name = curr.contributor_name || "Member";
    const value = Number(curr.risk_adjusted_value) || 0;
    
    const existing = acc.find((item) => item.name === name);
    if (existing) {
      existing.value += value;
    } else {
      acc.push({ name, value });
    }
    return acc;
  }, []);

  // 3. Calculamos el total global
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  // Inyectamos el total en cada item para que el Tooltip pueda calcular el %
  const dataWithTotal = data.map(item => ({ ...item, total: totalValue }));

  return (
    <div className="flex flex-col h-full w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm font-sans">
      <h3 className="mb-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
        Equity Distribution
      </h3>
      
      <div className="h-[300px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataWithTotal}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              nameKey="name" // Importante para accesibilidad
            >
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke="none"
                  className="hover:opacity-80 transition-opacity cursor-pointer" 
                />
              ))}
            </Pie>
            
            {/* TEXTO CENTRAL (Total) */}
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
              <tspan x="50%" dy="-0.5em" className="text-2xl font-black fill-slate-900">
                {totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </tspan>
              <tspan x="50%" dy="1.5em" className="text-[10px] font-black fill-slate-400 uppercase tracking-widest">
                Total Points
              </tspan>
            </text>

            {/* USAMOS NUESTRO TOOLTIP PERSONALIZADO */}
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ fill: 'transparent' }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* LEYENDA INFERIOR */}
      <div className="flex flex-wrap justify-center gap-4 mt-6 pt-6 border-t border-slate-100">
        {data.map((item, index) => {
          const percentage = totalValue > 0 
            ? ((item.value / totalValue) * 100).toFixed(1) 
            : "0";

          return (
            <div key={item.name} className="flex items-center gap-2 group transition-all hover:scale-105 cursor-default">
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