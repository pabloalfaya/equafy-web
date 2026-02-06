"use client";

import { Trash2, Edit2, Calendar } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function ContributionsTable({ contributions, onDelete, onEdit }: any) {
  const supabase = createClient();
  const totalPoints = contributions.reduce((sum: number, c: any) => sum + (Number(c.risk_adjusted_value) || 0), 0);

  const handleDelete = async (c: any) => {
    if (!confirm("¿Eliminar aportación?")) return;
    const { error } = await supabase.from("contributions").delete().eq("id", c.id);
    if (!error) onDelete(c);
  };

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-separate border-spacing-0">
        <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
          <tr>
            <th className="px-6 py-4 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">Socio</th>
            <th className="px-6 py-4 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valor (Pts)</th>
            <th className="px-6 py-4 border-b border-slate-100 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-28">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {contributions.map((c: any) => (
            <tr key={c.id} className="group hover:bg-slate-50/40 transition-all">
              <td className="px-6 py-5 font-bold text-slate-900 text-xs uppercase">{c.contributor_name}</td>
              <td className="px-6 py-5 text-right font-black text-slate-700 font-mono text-sm">{Number(c.risk_adjusted_value).toLocaleString()}</td>
              <td className="px-6 py-5 text-center">
                <div className="flex justify-center gap-1">
                  <button onClick={() => onEdit(c)} className="p-2 text-slate-600 hover:text-blue-600 transition-all"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(c)} className="p-2 text-red-600 hover:text-red-700 transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}