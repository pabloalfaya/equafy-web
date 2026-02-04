"use client";

import { Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// DEFINIMOS LA INTERFAZ AQUÍ PARA EVITAR ERRORES DE CURSOR
interface TableContribution {
  id: string;
  contributor_name: string;
  contribution_type: string; // Este es el campo que Cursor no encontraba
  description: string;       // Este también
  risk_adjusted_value: number;
  created_at?: string;
}

interface ContributionsTableProps {
  contributions: TableContribution[];
  onDelete: (contribution: TableContribution) => void;
}

export function ContributionsTable({ contributions, onDelete }: ContributionsTableProps) {
  const supabase = createClient();

  // Cálculo del total para los porcentajes
  const totalPoints = contributions.reduce((sum, c) => sum + (c.risk_adjusted_value || 0), 0);

  const handleDelete = async (c: TableContribution) => {
    if (!confirm("Are you sure you want to delete this contribution?")) return;
    try {
      const { error } = await supabase.from("contributions").delete().eq("id", c.id);
      if (error) throw error;
      onDelete(c);
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  if (!contributions || contributions.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        No contributions recorded yet.
      </div>
    );
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
            const percentage = totalPoints > 0 
              ? ((c.risk_adjusted_value / totalPoints) * 100).toFixed(1) 
              : "0.0";
            
            // Colores por tipo de aportación
            let typeStyles = "bg-slate-100 text-slate-500 border-slate-200";
            if (c.contribution_type === 'CASH') typeStyles = "bg-emerald-50 text-emerald-600 border-emerald-100";
            if (c.contribution_type === 'WORK') typeStyles = "bg-blue-50 text-blue-600 border-blue-100";
            if (c.contribution_type === 'INTANGIBLE') typeStyles = "bg-purple-50 text-purple-600 border-purple-100";
            if (c.contribution_type === 'TANGIBLE') typeStyles = "bg-amber-50 text-amber-600 border-amber-100";

            return (
              <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-5 font-bold text-slate-900 uppercase tracking-tight">
                  {c.contributor_name}
                </td>
                <td className="px-6 py-5">
                  <span className={`px-2 py-1 rounded-[6px] text-[9px] font-black uppercase border ${typeStyles}`}>
                    {c.contribution_type || 'OTHER'}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm font-medium text-slate-500 max-w-[200px] truncate">
                  {c.description || "—"}
                </td>
                <td className="px-6 py-5 text-right font-black text-slate-900 font-mono">
                  {c.risk_adjusted_value?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-5 text-right font-black text-emerald-600 font-mono">
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