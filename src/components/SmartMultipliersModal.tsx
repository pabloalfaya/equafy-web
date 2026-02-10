"use client";

import { useState } from "react";
import { X, Sparkles, Calculator, BookOpen } from "lucide-react";
import { calculateDynamicMultiplier } from "@/utils/riskEngine";

interface SmartMultipliersModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalProjectValue: number;
}

type TabType = "calculator" | "logic";

export function SmartMultipliersModal({
  isOpen,
  onClose,
  totalProjectValue,
}: SmartMultipliersModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("calculator");

  if (!isOpen) return null;

  const { cash, work } = calculateDynamicMultiplier(totalProjectValue);
  const displayValue = totalProjectValue.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 animate-in zoom-in duration-200 font-sans">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">
              Smart Multipliers
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-2 mb-6 p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("calculator")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "calculator"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <Calculator className="w-4 h-4" />
            Calculator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("logic")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "logic"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            The Logic
          </button>
        </div>

        {activeTab === "calculator" && (
          <div className="space-y-6">
            <p className="text-2xl font-black text-slate-900 text-center">
              Current Project Value: €{displayValue}
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="text-slate-700 font-bold">💵 Cash Risk</span>
                <span className="text-xl font-black text-emerald-700">
                  x{cash.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <span className="text-slate-700 font-bold">🛠️ Work/IP Risk</span>
                <span className="text-xl font-black text-blue-700">
                  x{work.toFixed(2)}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium text-center">
              These are the recommended multipliers based on current accumulation.
            </p>
          </div>
        )}

        {activeTab === "logic" && (
          <div className="space-y-4">
            <p className="text-slate-600 font-medium leading-relaxed">
              Equily uses a <strong className="text-slate-800">Logarithmic Decay</strong> formula.
              Early contributions take more risk (higher multiplier). As the project accumulates
              capital (&gt; €500k), the risk decreases, and the multiplier drops closer to x1.
              This ensures fair dynamic equity.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
