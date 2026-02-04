"use client";

import { Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function ContributionsTable({ contributions, onDelete }: any) {
  const supabase = createClient();
  const totalPoints = contributions.reduce((sum: number, c: any) => sum + (Number(c.risk_adjusted_value) || 0), 0);

  const handleDelete = async (c: any) => {
    if (!confirm("Delete this contribution?")) return;
    await supabase.from("contributions").delete().eq("id", c.id);
    onDelete(c);
  };

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
          {contributions.map((c: any) => {
            const percentage = totalPoints > 0 ? ((Number(c.risk_adjusted_value) / totalPoints) * 100).toFixed(1) : "0.0";
            
            // BUSCAMOS EN LOS CAMPOS REALES DE TU DB
            const displayDesc = c.concept || c.description || "—";
            const displayType = (c.type || c.contribution_type || "OTHER").toUpperCase();

            let pillClass = "bg-slate-50 text-slate-500 border-slate-200";
            if (displayType === 'CASH') pillClass = "bg-emerald-50 text-emerald-600 border-emerald-100";
            if (displayType === 'WORK') pillClass = "bg-blue-50 text-blue-600 border-blue-100";
            if (displayType === 'INTANGIBLE') pillClass = "bg-purple-50 text-purple-600 border-purple-100";
            if (displayType === 'TANGIBLE') pillClass = "bg-amber-50 text-amber-600 border-amber-100";

            return (
              <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-5 font-bold text-slate-900 uppercase">{c.contributor_name}</td>
                <td className="px-6 py-5">
                  <span className={`px-2 py-1 rounded-[6px] text-[9px] font-black border uppercase ${pillClass}`}>
                    {displayType}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm font-medium text-slate-500 max-w-[200px] truncate">
                  {displayDesc}
                </td>
                <td className="px-6 py-5 text-right font-black font-mono">{Number(c.risk_adjusted_value).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-6 py-5 text-right font-black text-emerald-600 font-mono">{percentage}%</td>
                <td className="px-6 py-5 text-center">
                  <button onClick={() => handleDelete(c)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
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