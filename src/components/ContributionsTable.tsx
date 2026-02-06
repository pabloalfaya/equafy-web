"use client";

import { Pencil, Trash2, Calendar, Tag, FileText } from "lucide-react";

interface Contribution {
  id: string;
  contributor_name: string;
  description: string;
  category: string;
  risk_adjusted_value: number;
  created_at: string;
}

interface ContributionsTableProps {
  contributions: Contribution[];
  onDelete: (id: string) => void;
  onEdit: (contribution: Contribution) => void;
  currentUserId?: string; // Para saber si puede editar
  isOwner?: boolean;      // Para saber si puede borrar todo
}

export function ContributionsTable({ contributions, onDelete, onEdit, isOwner }: ContributionsTableProps) {
  
  // Función simple para formatear fecha (ej: 12 Feb 2026)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  if (contributions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-400 italic">No contributions yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
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
            <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
              
              {/* 1. FECHA */}
              <td className="py-4 px-4 whitespace-nowrap text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-slate-300" />
                    {formatDate(c.created_at)}
                </div>
              </td>

              {/* 2. SOCIO */}
              <td className="py-4 px-4 font-bold text-slate-800">
                {c.contributor_name}
              </td>

              {/* 3. ROL / CATEGORÍA */}
              <td className="py-4 px-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wide">
                    <Tag className="w-3 h-3" />
                    {c.category}
                </span>
              </td>

              {/* 4. DESCRIPCIÓN */}
              <td className="py-4 px-4 max-w-[200px] truncate text-slate-500" title={c.description}>
                <div className="flex items-center gap-2">
                    <FileText className="w-3 h-3 text-slate-300 shrink-0" />
                    <span className="truncate">{c.description}</span>
                </div>
              </td>

              {/* 5. VALOR */}
              <td className="py-4 px-4 text-right font-black text-emerald-600">
                {Number(c.risk_adjusted_value).toLocaleString()}
              </td>

              {/* 6. ACCIONES */}
              <td className="py-4 px-4 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onEdit(c)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(c.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}