"use client";

import { Contribution } from "@/types/database";
import { Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ContributionsTableProps {
  contributions: Contribution[];
  onDelete: (contribution: Contribution) => void;
}

export function ContributionsTable({ contributions, onDelete }: ContributionsTableProps) {
  const supabase = createClient();

  // Cálculo del total de puntos para los porcentajes
  const totalPoints = contributions.reduce((sum, c) => sum + (c.risk_adjusted_value || 0), 0);

  const handleDelete = async (contribution: Contribution) => {
    if (!confirm("Are you sure you want to delete this contribution?")) return;
    try {
      const { error } = await supabase.from("contributions").delete().eq("id", contribution.id);
      if (error) throw error;
      onDelete(contribution);
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  if (contributions.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500 font-medium">
        No contributions yet. Add one to see it here.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-slate-900 border-separate border-spacing-0">
        <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 sticky top-0 z-10">
          <tr>
            {/* Cabeceras en Inglés */}
            <th className="px-6 py-4 border-b border-slate-100">MEMBER</th>
            <th className="px-6 py-4 border-b border-slate-100">TYPE</th>
            <th className="px-6 py-4 border-b border-slate-100">DESCRIPTION</th>
            <th className="px-6 py-4 border-b border-slate-100 text-right">VALUE (PTS)</th>
            <th className="px-6 py-4 border-b border-slate-100 text-right">EQUITY %</th>
            <th className="px-6 py-4 border-b border-slate-100 text-center">ACTIONS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {contributions.map((c) => {
            const percentage = totalPoints > 0 ? ((c.risk_adjusted_value / totalPoints) * 100).toFixed(1) : "0";
            
            // Estilos para las etiquetas de tipo
            let typeStyles = "bg-slate-100 text-slate-600 border-slate-200";
            if (c.contribution_type === 'CASH') typeStyles = "bg-emerald-50 text-emerald-600 border-emerald-100";
            if (c.contribution_type === 'WORK') typeStyles = "bg-blue-50 text-blue-600 border-blue-100";
            if (c.contribution_type === 'INTANGIBLE') typeStyles = "bg-purple-50 text-purple-600 border-purple-100";
            if (c.contribution_type === 'TANGIBLE') typeStyles = "bg-amber-50 text-amber-600 border-amber-100";

            return (
              <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-5 font-bold text-slate-900 uppercase truncate max-w-[150px]">
                  {c.contributor_name}
                </td>
                <td className="px-6 py-5">
                  {/* Restaurado: El texto dentro de la etiqueta ahora es visible */}
                  <span className={`px-2 py-1 rounded text-[9px] font-black uppercase border ${typeStyles}`}>
                    {c.contribution_type}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm font-medium text-slate-500 max-w-xs truncate">
                  {/* Restaurado: Descripción visible */}
                  {c.description || "—"}
                </td>
                <td className="px-6 py-5 text-right font-black text-slate-900 font-mono">
                  {c.risk_adjusted_value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-5 text-right font-black text-emerald-600 font-mono">
                  {/* Restaurado: Porcentaje de Equity */}
                  {percentage}%
                </td>
                <td className="px-6 py-5 text-center">
                  <button 
                    onClick={() => handleDelete(c)} 
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
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