"use client";

import { X, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface SummaryRow {
  name: string;
  role: string;
  points: number;
  fixed: number;
  capFormatted: string;
  equityPct: number;
}

interface FinalizedSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  modelName: string;
  finalizedAt: string;
  totalPoints: number;
  rows: SummaryRow[];
  onDownloadCertificate: () => void;
}

const SLATE_800 = [30, 41, 59] as [number, number, number]; // #1e293b
const SLATE_50 = [248, 250, 252] as [number, number, number];
const SLATE_200 = [226, 232, 240] as [number, number, number];

function loadLogoAsDataUrl(): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = "/logo-web.png";
  });
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

  const totalFixed = rows.reduce((s, r) => s + r.fixed, 0);
  const totalEquityPct = rows.reduce((s, r) => s + r.equityPct, 0);

  const buildPDF = (logoDataUrl: string | null) => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    let startY = 18;

    if (logoDataUrl) {
      doc.addImage(logoDataUrl, "PNG", 14, 10, 28, 28);
      startY = 44;
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(...SLATE_800);
      doc.text("EQUILY", 14, 22);
      startY = 28;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...SLATE_800);
    doc.text("OFFICIAL PROJECT FREEZE CERTIFICATE", pageW / 2, startY, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text(projectName, pageW / 2, startY + 8, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Model: ${modelName}`, pageW / 2, startY + 14, { align: "center" });
    doc.text(`Generated on: ${new Date(finalizedAt).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}`, pageW / 2, startY + 20, { align: "center" });

    const tableStartY = startY + 28;

    const tableData = rows.map((r) => [
      r.name,
      r.role,
      r.points.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      `${r.fixed.toFixed(2)}%`,
      r.capFormatted,
      `${r.equityPct.toFixed(2)}%`,
    ]);

    const footData = [
      [
        "TOTAL",
        "",
        totalPoints.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        `${totalFixed.toFixed(2)}%`,
        "—",
        `${totalEquityPct.toFixed(2)}%`,
      ],
    ];

    autoTable(doc, {
      startY: tableStartY,
      head: [["Member", "Role", "Risk Value (Points)", "Fixed Equity", "Cap / Limit", "Equity %"]],
      body: tableData,
      foot: footData,
      theme: "grid",
      headStyles: { fillColor: SLATE_800, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 10 },
      footStyles: { fillColor: SLATE_200, textColor: [33, 33, 33], fontStyle: "bold", fontSize: 10 },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: "bold", halign: "left" },
        1: { halign: "left" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right", fontStyle: "bold" },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.row.index % 2 === 1) {
          data.cell.styles.fillColor = SLATE_50;
        }
        if (data.section === "foot") {
          const colIdx = data.column.index;
          if (colIdx >= 2) data.cell.styles.halign = "right";
          else data.cell.styles.halign = "left";
        }
      },
    });

    const finalY = (doc as any).lastAutoTable?.finalY ?? tableStartY;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "This document represents the finalized equity state as recorded in Equily.",
      pageW / 2,
      finalY + 12,
      { align: "center" }
    );

    doc.save(`${projectName.replace(/[^a-z0-9]/gi, "_")}_Official_Freeze_Certificate.pdf`);
    onDownloadCertificate();
  };

  const handleDownloadPDF = async () => {
    const logoDataUrl = await loadLogoAsDataUrl();
    buildPDF(logoDataUrl);
  };

  const displayDate = new Date(finalizedAt).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 text-center mb-1 tracking-tight">
            Official Project Freeze Certificate
          </h2>
          <p className="text-slate-600 font-semibold text-center mb-2">{projectName}</p>
          <p className="text-slate-500 text-sm text-center mb-6">
            Model: {modelName} · Generated on: {displayDate}
          </p>

          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Equity Distribution</h3>
          <div className="rounded-xl border border-slate-200 overflow-hidden mb-8">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#1e293b] text-white">
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">Member</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">Role</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-right">Risk Value (Points)</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-right">Fixed Equity</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-right">Cap / Limit</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-right">Equity %</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {rows.map((r, i) => (
                  <tr
                    key={r.name}
                    className={`border-b border-slate-100 ${i % 2 === 1 ? "bg-slate-50" : ""}`}
                  >
                    <td className="py-3 px-4 font-semibold">{r.name}</td>
                    <td className="py-3 px-4">{r.role}</td>
                    <td className="py-3 px-4 text-right tabular-nums">{r.points.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-right tabular-nums">{r.fixed.toFixed(2)}%</td>
                    <td className="py-3 px-4 text-right tabular-nums">{r.capFormatted}</td>
                    <td className="py-3 px-4 text-right font-semibold tabular-nums">{r.equityPct.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-200 border-t-2 border-slate-300 font-bold text-slate-800">
                  <td className="py-3 px-4">TOTAL</td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4 text-right tabular-nums">{totalPoints.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="py-3 px-4 text-right tabular-nums">{totalFixed.toFixed(2)}%</td>
                  <td className="py-3 px-4 text-right">—</td>
                  <td className="py-3 px-4 text-right tabular-nums">{totalEquityPct.toFixed(2)}%</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="text-sm text-slate-500 text-center leading-relaxed mb-8 font-medium italic">
            This document represents the finalized equity state as recorded in Equily.
          </p>

          <button
            type="button"
            onClick={() => void handleDownloadPDF()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white font-bold py-4 px-6 hover:bg-emerald-600 transition-colors"
          >
            <Download className="w-5 h-5" /> Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
