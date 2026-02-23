"use client";

import { Pencil, Trash2, Tag, StickyNote } from "lucide-react";

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
  contributions: any[];
  onDelete: (id: string) => void;
  onEdit: (contribution: any) => void;
  onRemoveSimulated?: (id: string) => void;
  canEdit?: boolean;
  simulationMode?: boolean;
}

const MAX_NAME_LENGTH = 18;

export function ContributionsTable({ contributions, onDelete, onEdit, onRemoveSimulated, canEdit = true, simulationMode }: ContributionsTableProps) {
  
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
    <div className="min-w-0 w-full md:min-w-max">
      <table className="w-full text-left border-collapse min-w-[360px] sm:min-w-[420px]">
        <thead>
          <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            <th className="py-3 px-2 md:px-4">Date</th>
            <th className="py-3 px-2 md:px-4">Member</th>
            <th className="py-3 px-2 md:px-4">Category</th>
            <th className="py-3 px-1 w-[1%] hidden sm:table-cell">Description</th>
            <th className="py-3 px-2 md:px-4 text-right"><span className="hidden sm:inline">Value </span>(PTS)</th>
            <th className="py-3 px-2 md:px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm text-slate-700">
          {contributions.map((c) => {
            const isSimulated = !!(c as { isSimulated?: boolean }).isSimulated;
            return (
            <tr
              key={c.id}
              className={`border-b transition-colors ${isSimulated ? "bg-amber-50/60 border-amber-100/80 hover:bg-amber-50" : "border-slate-50 hover:bg-slate-50/50"}`}
            >
              
              {/* 1. FECHA (sin icono para ahorrar espacio) */}
              <td className="py-4 px-2 md:px-4 whitespace-nowrap text-slate-500 font-medium text-xs">
                {formatDate(c.date)}
              </td>

              {/* 2. SOCIO (truncado, tooltip con nombre completo) */}
              <td className="py-4 px-2 md:px-4 min-w-[140px] max-w-[180px]" title={c.contributor_name}>
                <span className="block font-bold text-slate-800 truncate">
                  {c.contributor_name.length > MAX_NAME_LENGTH
                    ? `${c.contributor_name.slice(0, MAX_NAME_LENGTH)}…`
                    : c.contributor_name}
                </span>
              </td>

              {/* 3. TIPO (Usamos c.type) */}
              <td className="py-4 px-2 md:px-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${isSimulated ? "bg-amber-200/60 text-amber-900" : "bg-slate-100 text-slate-600"}`}>
                    <Tag className="w-3 h-3" />
                    {c.type}
                    {isSimulated && <span className="ml-1 text-[10px]">(sim)</span>}
                </span>
              </td>

              {/* 4. CONCEPTO: icono de nota, al hacer clic se muestra la descripción */}
              <td className="py-4 px-1 w-[1%] hidden sm:table-cell">
                <button
                  type="button"
                  onClick={() => {
                    if (c.concept?.trim()) window.alert(c.concept);
                    else window.alert("No description");
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title={c.concept?.trim() ? `Description: ${c.concept}` : "No description"}
                >
                  <StickyNote className="w-4 h-4" />
                </button>
              </td>

              {/* 5. VALOR */}
              <td className="py-4 px-2 md:px-4 text-right font-black text-emerald-600">
                {Number(c.risk_adjusted_value).toLocaleString()}
              </td>

              {/* 6. ACCIONES */}
              <td className="py-4 px-2 md:px-4 text-right">
                {isSimulated ? (
                  onRemoveSimulated ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Remove this simulated contribution?")) {
                          onRemoveSimulated(c.id);
                        }
                      }}
                      className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition-all"
                      title="Remove simulation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-amber-600 text-xs font-bold">Simulated</span>
                  )
                ) : canEdit ? (
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
          );
          })}
        </tbody>
      </table>
    </div>
  );
}