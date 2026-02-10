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
                <div>
                  <span className="text-slate-700 font-bold block">💼 Non-Cash Risk</span>
                  <span className="text-xs text-slate-500 font-medium">Work, IP, Tangibles &amp; Relationships</span>
                </div>
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
          <div className="max-h-[60vh] overflow-y-auto space-y-6 pr-1">
            {/* Section 1: Introduction */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-900">
                The Mathematics of Fairness
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Equily uses a <span className="font-semibold text-slate-800">Logarithmic Decay Model</span>.
                Why? Because €1,000 invested when the company is just an idea is infinitely riskier than
                €1,000 invested when the company is already making millions.
              </p>
            </div>

            {/* Section 2: Master Formula */}
            <div className="space-y-3 rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                The Master Formula
              </p>
              <div className="rounded-xl bg-white border border-slate-100 px-4 py-3 overflow-x-auto">
                <code className="font-mono text-sm text-slate-800">
                  Multiplier = k / ln(Total_Value)
                </code>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">k (Constant):</span> 32 (Adjusted for
                  initial market risk).
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">ln:</span> Natural Logarithm (the decay
                  curve).
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">Total_Value:</span> The sum of all
                  contributions to date.
                </p>
              </div>
            </div>

            {/* Section 3: Behavior Rules */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-900">Behavior Rules</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600">
                <li>
                  <span className="font-semibold text-slate-800">Early Stage (High Risk):</span> At
                  €3,000 accumulated, the multiplier is maxed at <span className="font-semibold">x4.00</span>.
                </li>
                <li>
                  <span className="font-semibold text-slate-800">Growth Stage (Decay):</span> As value
                  accumulates, the multiplier drops rapidly at first, then slows down (logarithmic curve).
                </li>
                <li>
                  <span className="font-semibold text-slate-800">Maturity (Stability):</span> The multiplier
                  never drops below <span className="font-semibold">x1.00</span>, ensuring fair value for
                  late contributions.
                </li>
              </ul>
            </div>

            {/* Section 4: Risk Hierarchy */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-900">Risk Hierarchy</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Cash takes the base multiplier. Non-cash (Work, IP, Tangibles &amp; Relationships)
                takes 50% of the base multiplier (Standard Slicing Pie logic). This hierarchy reflects
                that liquid capital is the scarcest and riskiest resource, while other contributions
                carry meaningful but comparatively lower risk.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
