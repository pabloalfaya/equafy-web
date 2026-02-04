"use client";

import { Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ContributionsTableProps {
  contributions: any[]; // Usamos any para evitar que Cursor se queje del tipado interno
  onDelete: (contribution: any) => void;
}

export function ContributionsTable({ contributions, onDelete }: ContributionsTableProps) {
  const supabase = createClient();

  // Calculamos el total de puntos para los porcentajes
  const totalPoints = contributions.reduce((sum, c) => sum + (Number(c.risk_adjusted_value) || 0), 0);

  const handleDelete = async (c: any) => {
    if (!confirm("Are you sure?")) return;
    try {
      const { error } = await supabase.from("contributions").delete().eq("id", c.id);
      if (error) throw error;
      onDelete(c);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (!contributions || contributions.length === 0) {
    return <div className="p-10 text-center text-slate-400">No data found.</div>;
  }

  return (
    <div className="w-full overflow-hidden">
      <table className="w-full text-left text-slate-900 border-separate border-spacing-0">
        <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 sticky top-0 z-10">
          <tr>
            <th className="px-6 py-4 border-b border-slate-100">Member</th>
            <th className="px-6 py-4 border-b border-slate-100">Type</th>
            <th className="px-6 py-4 border-b border-slate-100">Description</th>
            <th className="px-6 py-4 border-b border-slate-100 text-right">Value (Pts)</th>
            <th className="px-6 py-4 border-b border-slate-100 text-right">Equity %</th>
            <th className="px-6 py-4 border-b border-slate-100 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {contributions.map((c) => {
            // Lógica de porcentaje
            const percentage = totalPoints > 0 
              ? ((Number(c.risk_adjusted_value) / totalPoints) * 100).toFixed(1) 
              : "0.0";
            
            // Buscamos la descripción en múltiples campos por si acaso
            const displayDesc = c.description || c.desc || c.details || "—";
            const displayType = (c.contribution_type || c.type || "OTHER").toUpperCase();

            // Estilos de colores
            let pillClass = "bg-slate-100 text-slate-500 border-slate-200";
            if (displayType === 'CASH') pillClass = "bg-emerald-50 text-emerald-600 border-emerald-100";
            if (displayType === 'WORK') pillClass = "bg-blue-50 text-blue-600 border-blue-100";
            if (displayType === 'INTANGIBLE') pillClass = "bg-purple-50 text-purple-600 border-purple-100";
            if (displayType === 'TANGIBLE') pillClass = "bg-amber-50 text-amber-600 border-amber-100";

            return (
              <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-5 font-bold text-slate-900 uppercase">{c.contributor_name}</td>
                <td className="px-6 py-5">
                  <span className={`px-2 py-1 rounded-[6px] text-[9px] font-black border ${pillClass}`}>
                    {displayType}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm font-medium text-slate-500 max-w-[200px] truncate">
                  {displayDesc}
                </td>
                <td className="px-6 py-5 text-right font-black text-slate-900 font-mono">
                  {Number(c.risk_adjusted_value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-5 text-right font-black text-emerald-600 font-mono">
                  {percentage}%
                </td>
                <td className="px-6 py-5 text-center">
                  <button onClick={() => handleDelete(c)} className="p-2 text-slate-300 hover:text-red-500 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}