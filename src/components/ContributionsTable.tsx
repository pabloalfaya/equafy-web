"use client";

import { Trash2, Calendar, Fingerprint } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function ContributionsTable({ contributions, onDelete }: any) {
  const supabase = createClient();
  
  // Cálculo del valor total para los porcentajes de la parte de la empresa
  const totalPoints = contributions.reduce((sum: number, c: any) => 
    sum + (Number(c.risk_adjusted_value) || 0), 0
  );

  const handleDelete = async (c: any) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta aportación? Esta acción no se puede deshacer.")) return;
    
    const { error } = await supabase.from("contributions").delete().eq("id", c.id);
    
    if (error) {
      alert("Error al eliminar: " + error.message);
    } else {
      onDelete(c);
    }
  };

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-separate border-spacing-0">
        <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
          <tr>
            <th className="px-6 py-4 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member</th>
            <th className="px-6 py-4 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
            <th className="px-6 py-4 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Description</th>
            <th className="px-6 py-4 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
            <th className="px-6 py-4 border-b border-slate-100 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Value (Pts)</th>
            <th className="px-6 py-4 border-b border-slate-100 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Equity %</th>
            <th className="px-6 py-4 border-b border-slate-100 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-20">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {contributions.map((c: any) => {
            const percentage = totalPoints > 0 
              ? ((Number(c.risk_adjusted_value) / totalPoints) * 100).toFixed(1) 
              : "0.0";
            
            const displayDesc = c.concept || c.description || "—";
            const displayType = (c.type || "OTHER").toUpperCase();

            // Formateo de fecha: 05 Feb 2026
            const displayDate = c.date 
              ? new Date(c.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
              : "—";

            // Colores de las etiquetas (Pills)
            let pillClass = "bg-slate-50 text-slate-500 border-slate-100";
            if (displayType === 'CASH') pillClass = "bg-emerald-50 text-emerald-600 border-emerald-100";
            if (displayType === 'WORK') pillClass = "bg-blue-50 text-blue-600 border-blue-100";
            if (displayType === 'INTANGIBLE') pillClass = "bg-purple-50 text-purple-600 border-purple-100";
            if (displayType === 'TANGIBLE') pillClass = "bg-amber-50 text-amber-600 border-amber-100";

            return (
              <tr key={c.id} className="group hover:bg-slate-50/40 transition-all duration-200">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-emerald-400 transition-colors"></div>
                    <span className="font-bold text-slate-900 uppercase text-xs tracking-tight">{c.contributor_name}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-2 py-1 rounded-md text-[9px] font-black border uppercase tracking-wider ${pillClass}`}>
                    {displayType}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <p className="text-sm font-medium text-slate-500 max-w-[180px] truncate" title={displayDesc}>
                    {displayDesc}
                  </p>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    <Calendar className="w-3 h-3 opacity-50" />
                    {displayDate}
                  </div>
                </td>
                <td className="px-6 py-5 text-right font-black text-slate-700 font-mono text-sm">
                  {Number(c.risk_adjusted_value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-5 text-right">
                  <span className="font-black text-emerald-600 font-mono text-sm bg-emerald-50/50 px-2 py-1 rounded-lg">
                    {percentage}%
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  {/* Botón que aparece al hacer hover en la fila */}
                  <button 
                    onClick={() => handleDelete(c)} 
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                    title="Eliminar aportación"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {contributions.length === 0 && (
        <div className="py-20 text-center">
          <Fingerprint className="w-12 h-12 text-slate-100 mx-auto mb-4" />
          <p className="text-slate-400 font-bold">No hay aportaciones registradas aún.</p>
        </div>
      )}
    </div>
  );
}