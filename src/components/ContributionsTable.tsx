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

  const handleDelete = async (contribution: Contribution) => {
    if (!confirm("Are you sure you want to delete this contribution? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("contributions")
        .delete()
        .eq("id", contribution.id);

      if (error) throw error;
      onDelete(contribution);
    } catch (error: any) {
      alert("Error deleting contribution: " + error.message);
    }
  };

  if (contributions.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500">
        No contributions yet. Add one to see it here.
      </div>
    );
  }

  return (
    <table className="w-full text-left text-slate-900">
      <thead className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 sticky top-0">
        <tr>
          {/* ENCABEZADOS TRADUCIDOS AL INGLÉS */}
          <th className="px-6 py-4 rounded-tl-2xl">MEMBER</th>
          <th className="px-6 py-4">TYPE</th>
          <th className="px-6 py-4">DESCRIPTION</th>
          <th className="px-6 py-4 text-right">VALUE (PTS)</th>
          <th className="px-6 py-4 rounded-tr-2xl text-center">ACTIONS</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {contributions.map((contribution) => {
            let typeColorClass = "bg-slate-100 text-slate-700";
            switch (contribution.contribution_type) {
                case 'CASH': typeColorClass = "bg-emerald-100 text-emerald-700"; break;
                case 'WORK': typeColorClass = "bg-blue-100 text-blue-700"; break;
                case 'TANGIBLE': typeColorClass = "bg-amber-100 text-amber-700"; break;
                case 'INTANGIBLE': typeColorClass = "bg-purple-100 text-purple-700"; break;
                case 'OTHER': typeColorClass = "bg-slate-100 text-slate-700"; break;
            }

            return (
                <tr key={contribution.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5 font-bold">{contribution.contributor_name}</td>
                    <td className="px-6 py-5">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${typeColorClass}`}>
                            {contribution.contribution_type}
                        </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-600 max-w-xs truncate">{contribution.description}</td>
                    <td className="px-6 py-5 text-right font-black font-mono text-slate-900">
                        {contribution.risk_adjusted_value?.toFixed(2)}
                    </td>
                    <td className="px-6 py-5 text-center">
                        <button
                            onClick={() => handleDelete(contribution)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            title="Delete Contribution"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </td>
                </tr>
            );
        })}
      </tbody>
    </table>
  );
}