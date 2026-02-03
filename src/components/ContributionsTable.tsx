"use client";

import { useState } from "react";
import { PieChart as PieChartIcon, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { Contribution } from "@/types/database";

const TYPE_LABELS: Record<string, string> = {
  cash: "Cash",
  labor: "Labor",
  ip: "IP",
  assets: "Assets",
};

interface ContributionsTableProps {
  contributions: Contribution[];
  onDelete: (contribution: Contribution) => void;
}

export function ContributionsTable({
  contributions,
  onDelete,
}: ContributionsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const total = contributions.reduce(
    (sum, c) => sum + (c.risk_adjusted_value ?? 0),
    0
  );

  const handleDelete = async (c: Contribution) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;

    const supabase = createClient();
    const id = c.id;

    if (id) {
      setDeletingId(id);
      const { error } = await supabase
        .from("contributions")
        .delete()
        .eq("id", id);

      setDeletingId(null);
      if (error) {
        alert("Error deleting: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from("contributions")
        .delete()
        .eq("project_id", c.project_id)
        .eq("contributor_name", c.contributor_name)
        .eq("type", c.type)
        .eq("amount", c.amount)
        .eq("risk_multiplier", c.risk_multiplier)
        .eq("risk_adjusted_value", c.risk_adjusted_value);

      if (error) {
        alert("Error deleting: " + error.message);
        return;
      }
    }

    onDelete(c);
  };

  if (contributions.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <PieChartIcon className="mx-auto mb-3 h-14 w-14 text-slate-300" />
        <p className="text-slate-500">No contributions recorded yet</p>
        <p className="mt-1 text-sm text-slate-400">
          Add your first one using the button above
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Contributor
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Concept
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Type
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                Amount
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                Multiplier
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                Risk Adj. Value
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                % Equity
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {contributions.map((c) => {
              const pct =
                total > 0
                  ? (((c.risk_adjusted_value ?? 0) / total) * 100).toFixed(1)
                  : "0";
              const rowKey = c.id ?? `${c.contributor_name}-${c.type}-${c.amount}`;
              const isDeleting = deletingId === c.id;
              
              return (
                <tr
                  key={rowKey}
                  className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50/50"
                >
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {c.contributor_name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {c.concept ? (
                      c.concept
                    ) : (
                      <span className="text-slate-400 italic">--</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {TYPE_LABELS[c.type] ?? c.type}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    {Number(c.amount).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    x{c.risk_multiplier}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-800">
                    {Number(c.risk_adjusted_value).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-emerald-fintech">
                    {pct}%
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleDelete(c)}
                      disabled={isDeleting}
                      className="inline-flex items-center justify-center rounded-lg p-2 text-red-600 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
              <td colSpan={5} className="px-6 py-4 text-slate-700">
                Total
              </td>
              <td className="px-6 py-4 text-right text-slate-800">
                {total.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </td>
              <td className="px-6 py-4 text-right text-emerald-fintech">
                100%
              </td>
              <td className="px-6 py-4" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}