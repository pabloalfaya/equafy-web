"use client";

import { useState } from "react";
import { PieChart as PieChartIcon, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { Contribution, ContributionType } from "@/types/database";

const TYPE_LABELS: Record<ContributionType, string> = {
  cash: "Cash",
  work: "Work",
  tangible: "Tangible",
  intangible: "Intangible",
  others: "Others",
};

export function ContributionsTable({ contributions, onDelete }: { contributions: Contribution[], onDelete: (c: Contribution) => void }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const total = contributions.reduce((sum, c) => sum + (c.risk_adjusted_value || 0), 0);

  const handleDelete = async (c: Contribution) => {
    if (!window.confirm("¿Eliminar aportación?")) return;
    const supabase = createClient();
    setDeletingId(c.id);
    await supabase.from("contributions").delete().eq("id", c.id);
    setDeletingId(null);
    onDelete(c);
  };

  if (contributions.length === 0) return <div className="p-12 text-center text-slate-500 font-sans italic">No hay aportaciones aún.</div>;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm font-sans">
      <table className="w-full text-slate-900">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <th className="px-6 py-4 text-left font-sans">Socio</th>
            <th className="px-6 py-4 text-left font-sans">Tipo</th>
            <th className="px-6 py-4 text-right font-sans text-emerald-600">Parte de la empresa</th>
            <th className="px-6 py-4 text-right font-sans">%</th>
            <th className="px-6 py-4 text-center font-sans">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-sans italic">
          {contributions.map((c) => (
            <tr key={c.id} className="transition hover:bg-slate-50/50">
              <td className="px-6 py-4 font-bold not-italic">{c.contributor_name}</td>
              <td className="px-6 py-4">
                <span className="bg-slate-100 px-2 py-0.5 rounded text-[9px] font-black uppercase not-italic">
                  {TYPE_LABELS[c.type] || c.type}
                </span>
              </td>
              <td className="px-6 py-4 text-right font-black tabular-nums not-italic">{Number(c.risk_adjusted_value).toLocaleString("de-DE")}</td>
              <td className="px-6 py-4 text-right font-black text-emerald-600 not-italic">
                {total > 0 ? ((c.risk_adjusted_value / total) * 100).toFixed(1) : 0}%
              </td>
              <td className="px-6 py-4 text-center font-sans">
                <button onClick={() => handleDelete(c)} disabled={deletingId === c.id} className="text-red-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}