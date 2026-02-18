"use client";

import { Pencil, Trash2, Calendar, Tag, FileText } from "lucide-react";

interface Contribution {
  id: string;
  contributor_name: string;
  concept: string;
  type: string;
  risk_adjusted_value: number;
  date: string;
}

interface ContributionsTableProps {
  contributions: any[];
  onDelete: (id: string) => void;
  onEdit: (contribution: any) => void;
  canEdit?: boolean;
}

function formatDate(dateString: string) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

export function ContributionsTable({ contributions, onDelete, onEdit, canEdit = true }: ContributionsTableProps) {
  if (contributions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-400 italic">No contributions yet.</p>
      </div>
    );
  }

  return (
    <>
      {/* Card layout: visible on small/medium screens (no horizontal scroll) */}
      <div className="xl:hidden space-y-3">
        {contributions.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:border-slate-200 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-bold text-slate-800">{c.contributor_name}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-bold uppercase">
                    <Tag className="w-3 h-3" />
                    {c.type}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Calendar className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  <span>{formatDate(c.date)}</span>
                </div>
                {c.concept && (
                  <div className="flex items-center gap-2 mt-1.5 text-slate-500 text-sm min-w-0">
                    <FileText className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <span className="truncate" title={c.concept}>{c.concept}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-black text-emerald-600 text-sm tabular-nums">
                  {Number(c.risk_adjusted_value).toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">pts</span>
                {canEdit && (
                  <div className="flex items-center gap-0.5 ml-1">
                    <button
                      type="button"
                      onClick={() => onEdit(c)}
                      className="p-1.5 text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this contribution?")) {
                          onDelete(c.id);
                        }
                      }}
                      className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table layout: visible from xl (1280px) so all columns fit without scroll */}
      <div className="hidden xl:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Member</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 text-right">Value (PTS)</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-700">
            {contributions.map((c) => (
              <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-4 whitespace-nowrap text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-slate-300" />
                    {formatDate(c.date)}
                  </div>
                </td>
                <td className="py-4 px-4 font-bold text-slate-800">{c.contributor_name}</td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wide">
                    <Tag className="w-3 h-3" />
                    {c.type}
                  </span>
                </td>
                <td className="py-4 px-4 max-w-[200px] truncate text-slate-500" title={c.concept}>
                  <div className="flex items-center gap-2">
                    <FileText className="w-3 h-3 text-slate-300 shrink-0" />
                    <span className="truncate font-medium">{c.concept}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right font-black text-emerald-600">
                  {Number(c.risk_adjusted_value).toLocaleString()}
                </td>
                <td className="py-4 px-4 text-right">
                  {canEdit ? (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(c)}
                        className="p-1.5 text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this contribution?")) {
                            onDelete(c.id);
                          }
                        }}
                        className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-300 text-xs font-medium">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}