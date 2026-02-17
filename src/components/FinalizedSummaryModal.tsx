"use client";

import { X, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface SummaryRow {
  name: string;
  equityPct: number;
  points: number;
}

interface FinalizedSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  modelName: string;
  finalizedAt: string; // ISO or formatted date string
  totalPoints: number;
  rows: SummaryRow[];
  onDownloadCertificate: () => void;
}

export function FinalizedSummaryModal({
  isOpen,
  onClose,
  projectName,
  modelName,
  finalizedAt,
  totalPoints,
  rows,
  onDownloadCertificate,
}: FinalizedSummaryModalProps) {
  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text("Official Project Summary", pageW / 2, 22, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text(projectName, pageW / 2, 30, { align: "center" });
    doc.setFontSize(9);
    doc.text(`Model: ${modelName}`, pageW / 2, 36, { align: "center" });
    doc.text(`Finalized: ${new Date(finalizedAt).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}`, pageW / 2, 42, { align: "center" });
    doc.text(`Total Points: ${totalPoints.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageW / 2, 48, { align: "center" });

    const tableData = rows.map((r) => [
      r.name,
      `${r.equityPct.toFixed(2)}%`,
      r.points.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    ]);

    autoTable(doc, {
      startY: 56,
      head: [["Name", "Equity %", "Points"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: { 0: { fontStyle: "bold" }, 1: { halign: "right" }, 2: { halign: "right" } },
    });

    const finalY = (doc as any).lastAutoTable?.finalY ?? 56;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "This document represents the finalized equity state as recorded in Equily.",
      pageW / 2,
      finalY + 14,
      { align: "center" }
    );

    doc.save(`${projectName.replace(/[^a-z0-9]/gi, "_")}_Official_Summary.pdf`);
    onDownloadCertificate();
  };

  const formattedTotal = totalPoints.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const displayDate = new Date(finalizedAt).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 text-center mb-1">
            Official Project Summary
          </h2>
          <p className="text-slate-600 font-semibold text-center mb-6">{projectName}</p>

          <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider">Model</span>
              <p className="text-slate-800 font-semibold capitalize">{modelName}</p>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider">Finalized</span>
              <p className="text-slate-800 font-semibold">{displayDate}</p>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider">Total Points</span>
              <p className="text-slate-800 font-semibold tabular-nums">{formattedTotal}</p>
            </div>
          </div>

          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Equity Distribution</h3>
          <div className="rounded-xl border border-slate-200 overflow-hidden mb-8">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Equity %</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Points</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {rows.map((r) => (
                  <tr key={r.name} className="border-b border-slate-100">
                    <td className="py-3 px-4 font-semibold">{r.name}</td>
                    <td className="py-3 px-4 text-right font-semibold tabular-nums">{r.equityPct.toFixed(2)}%</td>
                    <td className="py-3 px-4 text-right tabular-nums">{r.points.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-slate-500 text-center leading-relaxed mb-8">
            This document represents the finalized equity state as recorded in Equily.
          </p>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white font-bold py-4 px-6 hover:bg-emerald-600 transition-colors"
          >
            <Download className="w-5 h-5" /> Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
