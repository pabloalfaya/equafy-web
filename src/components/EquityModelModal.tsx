"use client";

import { useState, useEffect, useRef } from "react";
import { X, ShieldCheck, Scale, Settings, Info } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const JUST_SPLIT_MULTS = { cash: 4, work: 2, tangible: 2, intangible: 2, others: 1 };
const FLAT_MULTS = { cash: 1, work: 1, tangible: 1, intangible: 1, others: 1 };

interface EquityModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  currentModel?: string;
  currentMults?: Record<string, number>;
  onSuccess?: () => void;
  isOnboarding?: boolean;
}

export function EquityModelModal({
  isOpen,
  onClose,
  projectId,
  currentModel = "just_split",
  currentMults = JUST_SPLIT_MULTS,
  onSuccess,
  isOnboarding = false,
}: EquityModelModalProps) {
  const toModel = (v?: string): "flat" | "just_split" | "custom" => {
    const s = (v || "").toLowerCase();
    if (s === "flat") return "flat";
    if (s.includes("custom")) return "custom";
    return "just_split";
  };
  const [model, setModel] = useState<"flat" | "just_split" | "custom">(() => toModel(currentModel));
  const [mults, setMults] = useState(() => ({ ...JUST_SPLIT_MULTS, ...currentMults }));
  const [loading, setLoading] = useState(false);

  const wasOpen = useRef(false);
  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      setModel(toModel(currentModel));
      setMults({ ...JUST_SPLIT_MULTS, ...currentMults });
    }
    wasOpen.current = isOpen;
  }, [isOpen, currentModel, currentMults]);

  const handleModelSelect = (modelType: "flat" | "just_split" | "custom") => {
    setModel(modelType);
    switch (modelType) {
      case "flat":
        setMults(FLAT_MULTS);
        break;
      case "just_split":
        setMults(JUST_SPLIT_MULTS);
        break;
      case "custom":
        break;
      default:
        break;
    }
  };

  const handleSave = async () => {
    const supabase = createClient();
    setLoading(true);
    try {
      const modelTypeDb = model === "flat" ? "FLAT" : model === "just_split" ? "JUST_SPLIT" : "CUSTOM";
      const payload = {
        model_type: modelTypeDb,
        mult_cash: Number(mults.cash) || 1,
        mult_work: Number(mults.work) || 1,
        mult_tangible: Number(mults.tangible) || 1,
        mult_intangible: Number(mults.intangible) || 1,
        mult_others: Number(mults.others) || 1,
        model_onboarding_dismissed: true,
      };
      const { data, error } = await supabase
        .from("projects")
        .update(payload)
        .eq("id", projectId)
        .select("id")
        .single();

      if (error) {
        console.error("Error updating equity model:", error);
        return;
      }
      if (!data) {
        console.error("Error updating equity model: no rows updated (check projectId and RLS)");
        return;
      }
      await onSuccess?.();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    const supabase = createClient();
    setLoading(true);
    const { error } = await supabase
      .from("projects")
      .update({ model_onboarding_dismissed: true })
      .eq("id", projectId);
    setLoading(false);
    if (!error) onSuccess?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4">
      <div className="relative w-[95%] max-w-full md:max-w-4xl lg:max-w-5xl mx-auto bg-white rounded-2xl sm:rounded-[32px] shadow-2xl p-4 sm:p-5 md:p-6 text-slate-900 overflow-y-auto max-h-[95vh]">
        <button onClick={isOnboarding ? handleDismiss : onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors z-20">
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4">
          <div className="text-center pt-0 sm:pt-1 pr-12">
            <h2 className="text-lg sm:text-xl font-black mb-0.5 uppercase tracking-tight text-slate-900">
              {isOnboarding ? "Initial setup" : "Change equity model"}
            </h2>
            <p className="text-slate-600 font-bold text-xs sm:text-sm">
              Select the multiplier set for your team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div onClick={() => handleModelSelect("custom")} className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col ${model === "custom" ? "border-blue-500 bg-blue-50/30 ring-1 ring-blue-500/20" : "border-slate-100 bg-slate-50/50 hover:border-slate-200"}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-md ${model === "custom" ? "bg-blue-500 text-white" : "bg-white text-slate-400 shadow-sm"}`}><Settings className="w-3.5 h-3.5" /></div>
                <span className="font-black text-sm text-slate-800">Custom</span>
              </div>
              <div className="space-y-1 mb-2 flex-1">
                {["Cash", "Work", "Intangible", "Tangible", "Others"].map((label) => (
                  <div key={label} className="flex items-center justify-between p-1.5 sm:p-2 bg-white rounded-md border border-slate-100 shadow-sm">
                    <span className="text-[8px] sm:text-[9px] font-black uppercase text-slate-500">{label}</span>
                    <input
                      type="number"
                      value={mults[label.toLowerCase() as keyof typeof mults]}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setMults({ ...mults, [label.toLowerCase()]: parseFloat(e.target.value) || 0 })}
                      className="w-9 bg-transparent text-right font-black text-sm text-blue-700 outline-none rounded"
                    />
                  </div>
                ))}
              </div>
              <p className="text-[8px] sm:text-[9px] font-black text-slate-800 uppercase tracking-wider text-center">Manual control</p>
            </div>

            <div onClick={() => handleModelSelect("just_split")} className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col ${model === "just_split" ? "border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/20" : "border-slate-100 bg-slate-50/50 hover:border-slate-200"}`}>
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase shadow-lg z-10">Recommended</div>
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-md ${model === "just_split" ? "bg-emerald-500 text-white" : "bg-white text-slate-400 shadow-sm"}`}><ShieldCheck className="w-3.5 h-3.5" /></div>
                <span className="font-black text-sm text-slate-800">Just Split Model</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mb-2 flex-1">
                {[{ l: "CASH", v: "x4" }, { l: "WORK", v: "x2" }, { l: "ASSETS", v: "x2" }, { l: "IP", v: "x2" }].map((item) => (
                  <div key={item.l} className="p-2 sm:p-2.5 bg-white rounded-md border border-slate-100 text-center shadow-sm">
                    <span className="text-[7px] sm:text-[8px] font-black text-emerald-600 uppercase block mb-0.5">{item.l}</span>
                    <span className="text-base sm:text-lg font-black tracking-tighter text-slate-900">{item.v}</span>
                  </div>
                ))}
              </div>
              <p className="text-[8px] sm:text-[9px] text-center text-emerald-700 font-black uppercase tracking-widest">Best choice</p>
            </div>

            <div onClick={() => handleModelSelect("flat")} className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col ${model === "flat" ? "border-purple-500 bg-purple-50/20 ring-1 ring-purple-500/20" : "border-slate-100 bg-slate-50/50 hover:border-slate-200"}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-md ${model === "flat" ? "bg-purple-500 text-white" : "bg-white text-slate-400 shadow-sm"}`}><Scale className="w-3.5 h-3.5" /></div>
                <span className="font-black text-sm text-slate-800">Flat Model</span>
              </div>
              <div className="space-y-2 mb-2 flex-1">
                <div className="p-2.5 sm:p-3 bg-white rounded-lg border border-slate-100 text-center shadow-sm">
                  <span className="text-[7px] sm:text-[8px] font-black text-purple-600 uppercase block mb-0.5">All contributions</span>
                  <span className="text-xl sm:text-2xl font-black tracking-tighter text-slate-900">x1</span>
                </div>
                <p className="p-2 bg-slate-50/50 rounded-md border border-dashed border-slate-200 text-[8px] font-bold italic text-slate-500 text-center leading-tight">
                  Simple linear split where every unit is treated as equal.
                </p>
              </div>
              <p className="text-[8px] sm:text-[9px] text-center text-purple-700 font-black uppercase tracking-widest mt-auto">Fixed split</p>
            </div>
          </div>

          <p className="text-center text-xs sm:text-sm text-gray-500 flex items-center justify-center gap-1.5 flex-wrap">
            <Info className="w-3.5 h-3.5 shrink-0 text-gray-400" />
            <span>Note: Multipliers can be adjusted anytime in Equity Settings.</span>
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            {isOnboarding && (
              <button type="button" onClick={handleDismiss} className="text-xs font-bold text-slate-500 hover:text-slate-700">
                Skip (use Just Split)
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-xl font-black bg-slate-900 text-white hover:bg-emerald-600 transition-all shadow-lg active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? "Saving..." : "Save model"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
