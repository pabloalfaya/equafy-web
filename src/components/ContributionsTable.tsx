"use client";

import { Pencil, Trash2, Calendar, Tag, FileText } from "lucide-react";

// 1. Definimos la interfaz EXACTAMENTE como viene de la base de datos
interface Contribution {
  id: string;
  contributor_name: string;
  concept: string;        // Antes buscábamos "description" (error)
  type: string;           // Antes buscábamos "category" (error)
  risk_adjusted_value: number;
  date: string;           // Usamos la fecha elegida, no el "created_at"
}

interface ContributionsTableProps {
  contributions: any[]; // Usamos any[] temporalmente para evitar conflictos de tipos estrictos
  onDelete: (id: string) => void;
  onEdit: (contribution: any) => void;
  currentUserId?: string;
  isOwner?: boolean;
}

export function ContributionsTable({ contributions, onDelete, onEdit }: ContributionsTableProps) {
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
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
            <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
              
              {/* 1. FECHA (Usamos c.date) */}
              <td className="py-4 px-4 whitespace-nowrap text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-slate-300" />
                    {formatDate(c.date)} 
                </div>
              </td>

              {/* 2. SOCIO */}
              <td className="py-4 px-4 font-bold text-slate-800">
                {c.contributor_name}
              </td>

              {/* 3. TIPO (Usamos c.type) */}
              <td className="py-4 px-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wide">
                    <Tag className="w-3 h-3" />
                    {c.type}
                </span>
              </td>

              {/* 4. CONCEPTO (Usamos c.concept) */}
              <td className="py-4 px-4 max-w-[200px] truncate text-slate-500" title={c.concept}>
                <div className="flex items-center gap-2">
                    <FileText className="w-3 h-3 text-slate-300 shrink-0" />
                    <span className="truncate font-medium">{c.concept}</span>
                </div>
              </td>

              {/* 5. VALOR */}
              <td className="py-4 px-4 text-right font-black text-emerald-600">
                {Number(c.risk_adjusted_value).toLocaleString()}
              </td>

              {/* 6. ACCIONES */}
              <td className="py-4 px-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(c)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-slate-100 rounded-lg transition-all"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(c.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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