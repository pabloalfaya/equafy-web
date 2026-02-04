"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

// Una paleta de colores moderna y distinguible para los socios
const COLORS = [
  "#10B981", // Emerald (Verde)
  "#3B82F6", // Blue (Azul)
  "#F59E0B", // Amber (Naranja)
  "#EC4899", // Pink (Rosa)
  "#8B5CF6", // Violet (Morado)
  "#6366F1", // Indigo
  "#06B6D4", // Cyan
  "#F43F5E", // Rose
];

export function EquityPieChart({ contributions }: { contributions: any[] }) {
  // 1. Calcular el valor TOTAL de la empresa (Suma de todos los risk_adjusted_value)
  const totalValue = contributions.reduce((sum, c) => sum + (c.risk_adjusted_value || 0), 0);

  // 2. Preparar los datos añadiendo el campo "percent"
  const data = contributions.map((c) => {
    const value = c.risk_adjusted_value || 0;
    // Evitamos dividir por cero
    const percent = totalValue > 0 ? (value / totalValue) * 100 : 0;
    
    return {
      name: c.contributor_name, // Nombre del socio
      value: value,             // Valor en €
      percent: percent.toFixed(1), // Porcentaje con 1 decimal (ej: "33.5")
    };
  });

  // Si no hay datos, mostramos un aviso limpio
  if (totalValue === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
            <span className="text-xl">🍰</span>
          </div>
          <p className="text-sm font-medium">Add contributions to see equity</p>
        </div>
      </div>
    );
  }

  // 3. Diseño de la Leyenda Personalizada (Nombre + Porcentaje)
  const renderLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center gap-2 group cursor-default">
            {/* Bolita de color */}
            <span 
              className="block h-3 w-3 rounded-full shadow-sm ring-2 ring-white" 
              style={{ backgroundColor: entry.color }} 
            />
            
            {/* Nombre */}
            <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
              {entry.value}
            </span>
            
            {/* Etiqueta de Porcentaje */}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 border border-slate-200">
              {entry.payload.percent}%
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%" // Lo subimos un poco para dejar sitio a la leyenda
          innerRadius={90}  // Radio interior (hueco del donut)
          outerRadius={140} // Radio exterior
          paddingAngle={3}  // Espacio blanco entre trozos
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
              className="outline-none hover:opacity-80 transition-opacity duration-300"
            />
          ))}
        </Pie>
        
        <Tooltip 
          formatter={(value: number) => [`€${value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`, "Value"]}
          contentStyle={{ 
            borderRadius: "16px", 
            border: "1px solid #E2E8F0", 
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
            padding: "12px 16px"
          }}
          itemStyle={{ color: "#1E293B", fontWeight: 600 }}
        />
        
        <Legend content={renderLegend} />
      </PieChart>
    </ResponsiveContainer>
  );
}