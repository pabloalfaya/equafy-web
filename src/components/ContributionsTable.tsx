"use client";

import { Trash2, Edit2, Calendar } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function ContributionsTable({ contributions, onDelete, onEdit }: any) {
  const supabase = createClient();
  
  const totalPoints = contributions.reduce((sum: number, c: any) => 
    sum + (Number(c.risk_adjusted_value) || 0), 0
  );

  const handleDelete = async (c: any) => {
    if (!confirm("¿Eliminar esta aportación?")) return;
    const { error } = await supabase.from("contributions").delete().eq("id", c.id);
    if (!error) onDelete(c);
  };

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-separate border-spacing-0">
        <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
          <tr>
            <th className="px-6 py-4 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member</th>
            <th className="px-6 py-4 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
            <th className="px-6 py-4 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
            <th className="px-6 py-4 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
            <th className="px-6 py-4 border-b border-slate-100 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Value (Pts)</th>
            <th className="px-6 py-4 border-b border-slate-100 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Equity %</th>
            <th className="px-6 py-4 border-b border-slate-100 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-28">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {contributions.map((c: any) => {
            const percentage = totalPoints > 0 ? ((Number(c.risk_adjusted_value) / totalPoints) * 100).toFixed(1) : "0.0";
            return (
              <tr key={c.id} className="group hover:bg-slate-50/40 transition-all duration-200">
                <td className="px-6 py-5 font-bold text-slate-900 uppercase text-xs">{c.contributor_name}</td>
                <td className="px-6 py-5">
                  <span className="px-2 py-1 rounded-md text-[9px] font-black border uppercase bg-slate-50 text-slate-500">{c.type}</span>
                </td>
                <td className="px-6 py-5 text-sm font-medium text-slate-500 truncate max-w-[150px]">{c.concept || "—"}</td>
                <td className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(c.date).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-5 text-right font-black text-slate-700 font-mono text-sm">{Number(c.risk_adjusted_value).toLocaleString()}</td>
                <td className="px-6 py-5 text-right font-black text-emerald-600 font-mono text-sm">{percentage}%</td>
                <td className="px-6 py-5 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <button onClick={() => onEdit(c)} className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c)} className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}