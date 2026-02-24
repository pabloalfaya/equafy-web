"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { recalculateAndPersistProjectValuation } from "@/utils/projectRecalculator";
import { logAudit } from "@/utils/auditLog";
import { formatCurrency, getCurrencyLabel } from "@/lib/currency";

// Defined types with English labels
const CONTRIBUTION_TYPES = [
  { value: "CASH", label: "CASH" },
  { value: "WORK", label: "WORK" },
  { value: "TANGIBLE", label: "TANGIBLE" },
  { value: "INTANGIBLE", label: "INTANGIBLE" },
  { value: "OTHERS", label: "OTHERS" },
];

// Defaults cuando no hay config en BD (coinciden con schema)
const DEFAULT_MULTIPLIERS: Record<string, number> = {
  mult_cash: 4,
  mult_work: 2,
  mult_tangible: 1,
  mult_intangible: 2,
  mult_others: 1,
};

type AddContributionTab = "add" | "simulate";

export function AddContributionModal({ isOpen, onClose, projectId, projectConfig, onSuccess, members, editData = null, canEdit = true, onAddSimulated }: { isOpen: boolean; onClose: () => void; projectId: string; projectConfig?: any; onSuccess?: (c: any) => void; members: any[]; editData?: any; canEdit?: boolean; onAddSimulated?: (data: { contributor_name: string; concept: string; type: string; amount: number; multiplier: number; risk_adjusted_value: number; date: string }) => void }) {
  const [activeTab, setActiveTab] = useState<AddContributionTab>("add");
  const [contributorId, setContributorId] = useState("");
  const [concept, setConcept] = useState("");
  const [type, setType] = useState("CASH");
  const [amount, setAmount] = useState("");
  const [workInputMode, setWorkInputMode] = useState<"hours" | "fixed">("hours");
  const [hoursWorked, setHoursWorked] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [multiplier, setMultiplier] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeMultipliers, setActiveMultipliers] = useState<Record<string, number>>(DEFAULT_MULTIPLIERS);

  const supabase = createClient();

  // Lee multiplicadores desde BD al abrir el modal (siempre datos frescos)
  useEffect(() => {
    if (isOpen && projectId) {
      const loadMultipliers = async () => {
        const { data } = await supabase
          .from("projects")
          .select("mult_cash, mult_work, mult_tangible, mult_intangible, mult_others")
          .eq("id", projectId)
          .single();
        if (data) {
          setActiveMultipliers({
            mult_cash: Number(data.mult_cash) ?? DEFAULT_MULTIPLIERS.mult_cash,
            mult_work: Number(data.mult_work) ?? DEFAULT_MULTIPLIERS.mult_work,
            mult_tangible: Number(data.mult_tangible) ?? DEFAULT_MULTIPLIERS.mult_tangible,
            mult_intangible: Number(data.mult_intangible) ?? DEFAULT_MULTIPLIERS.mult_intangible,
            mult_others: Number(data.mult_others) ?? DEFAULT_MULTIPLIERS.mult_others,
          });
        } else if (projectConfig) {
          setActiveMultipliers({
            mult_cash: Number(projectConfig.mult_cash) ?? DEFAULT_MULTIPLIERS.mult_cash,
            mult_work: Number(projectConfig.mult_work) ?? DEFAULT_MULTIPLIERS.mult_work,
            mult_tangible: Number(projectConfig.mult_tangible) ?? DEFAULT_MULTIPLIERS.mult_tangible,
            mult_intangible: Number(projectConfig.mult_intangible) ?? DEFAULT_MULTIPLIERS.mult_intangible,
            mult_others: Number(projectConfig.mult_others) ?? DEFAULT_MULTIPLIERS.mult_others,
          });
        }
      };
      loadMultipliers();
    }
  }, [isOpen, projectId, projectConfig]);

  const getMultiplierForType = (t: string): number => {
    const key = `mult_${t.toLowerCase()}` as keyof typeof DEFAULT_MULTIPLIERS;
    const val = activeMultipliers[key];
    return typeof val === "number" && !Number.isNaN(val) ? val : (DEFAULT_MULTIPLIERS[key] ?? 1);
  };

  const selectedMember = members.find((m: any) => m.id === contributorId);
  const memberHourlyRate = selectedMember?.hourly_rate != null ? Number(selectedMember.hourly_rate) : null;
  const workMultiplier = getMultiplierForType("WORK");
  const currency = projectConfig?.currency ?? "EUR";
  const baseValue = type === "WORK" && workInputMode === "hours"
    ? (parseFloat(hoursWorked || "0") || 0) * (memberHourlyRate ?? 0)
    : parseFloat(amount || "0") || 0;
  const riskAdjustedValue = (baseValue * multiplier).toFixed(2);
  const isWorkByHoursNoRate = type === "WORK" && workInputMode === "hours" && (memberHourlyRate == null || memberHourlyRate === 0);

  // Effect: Load data on open
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setActiveTab("add");
        const member = members.find((m: any) => m.name === editData.contributor_name);
        setContributorId(member?.id || ""); 
        setConcept(editData.concept || ""); 
        setType(editData.type || "CASH");
        setAmount(editData.amount?.toString() || ""); 
        setWorkInputMode("fixed");
        setHoursWorked("");
        setDate(editData.date || new Date().toISOString().split('T')[0]); 
        setMultiplier(editData.multiplier || 1);
      } else {
        setActiveTab("add");
        setConcept(""); 
        setAmount(""); 
        setType("CASH"); 
        setWorkInputMode("fixed");
        setHoursWorked("");
        setDate(new Date().toISOString().split('T')[0]);
        if (members.length > 0 && !contributorId) {
            setContributorId(members[0].id);
        }
      }
    }
  }, [isOpen, editData, members]);

  // Effect: Update multiplier when type or activeMultipliers change
  useEffect(() => { 
    if (isOpen) {
        if (editData && type === editData.type) {
            setMultiplier(editData.multiplier);
        } else {
            setMultiplier(getMultiplierForType(type));
        }
    }
  }, [type, isOpen, editData, activeMultipliers]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit && activeTab === "add") return;
    if (isWorkByHoursNoRate && type === "WORK" && workInputMode === "hours") return;

    const selectedMember = members.find((m: any) => m.id === contributorId);
    const amt = type === "WORK" && workInputMode === "hours"
      ? (parseFloat(hoursWorked || "0") || 0) * (memberHourlyRate ?? 0)
      : parseFloat(amount || "0") || 0;
    const riskVal = parseFloat(riskAdjustedValue);

    if (activeTab === "simulate" && onAddSimulated) {
      onAddSimulated({
        contributor_name: selectedMember?.name || "Unknown",
        concept,
        type,
        amount: amt,
        multiplier,
        risk_adjusted_value: riskVal,
        date,
      });
      onClose();
      return;
    }

    setLoading(true);

    const payload = { 
        project_id: projectId, 
        contributor_name: selectedMember?.name || "Unknown", 
        concept, 
        type, 
        amount: amt, 
        multiplier, 
        risk_adjusted_value: riskVal, 
        date 
    };

    const query = editData 
        ? supabase.from("contributions").update(payload).eq("id", editData.id) 
        : supabase.from("contributions").insert([payload]);

    const { data, error } = await query.select().single();

    if (error) {
        console.error("Error saving contribution:", error);
        setLoading(false);
        return;
    }

    const actionType = editData ? "EDIT_CONTRIBUTION" : "ADD_CONTRIBUTION";
    const memberName = selectedMember?.name ?? "Unknown";

    let desc: string;
    if (editData) {
      const oldAmt = Number(editData.amount) || 0;
      desc = `Edited contribution for ${memberName}: Changed ${formatCurrency(oldAmt, currency)} to ${formatCurrency(amt, currency)} in ${type}`;
    } else {
      desc = `Added contribution of ${formatCurrency(amt, currency)} in ${type} for ${memberName}`;
    }
    try {
      await logAudit({ supabase, projectId, actionType, description: desc });
    } catch (err) {
      console.error("❌ ERROR GUARDANDO AUDIT LOG:", err);
    }

    const { error: recalcError } = await recalculateAndPersistProjectValuation(
      supabase,
      projectId,
      projectConfig
    );

    if (recalcError) {
        console.error("Error recalculating project valuation:", recalcError);
    }

    if (onSuccess) onSuccess(data);
    onClose();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md max-h-[min(90vh,32rem)] flex flex-col rounded-[32px] bg-white shadow-2xl animate-in zoom-in duration-200 font-sans my-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 pb-0 shrink-0">
          <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">
            {editData ? "Edit Contribution" : "Add Contribution"}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!editData && (
          <div className="flex gap-2 mx-5 mt-4 mb-2 p-1 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("add")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${activeTab === "add" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:text-slate-800"}`}
            >
              Add Contribution
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("simulate")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${activeTab === "simulate" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:text-slate-800"}`}
            >
              Simulate Contribution
            </button>
          </div>
        )}

        {/* Form — scrollable body + fixed footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-4 space-y-3">
          
          {/* Member Selector */}
          <div>
            <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block uppercase">Member</label>
            <select 
                value={contributorId} 
                onChange={(e) => setContributorId(e.target.value)} 
                disabled={!canEdit}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50 font-bold outline-none text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {members.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          {/* Concept Input */}
          <div>
            <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block uppercase">Description</label>
            <input 
                type="text" 
                placeholder="Ex: MVP Development..." 
                value={concept} 
                onChange={(e) => setConcept(e.target.value)} 
                disabled={!canEdit}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50 font-bold outline-none text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed" 
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block uppercase">Type</label>
            <select 
              value={type} 
              onChange={(e) => { const v = e.target.value; setType(v); if (v === "WORK") setWorkInputMode("hours"); else setWorkInputMode("fixed"); setHoursWorked(""); }} 
              disabled={!canEdit}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50 font-black text-xs uppercase outline-none text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {CONTRIBUTION_TYPES.map((t) => {
                const multVal = getMultiplierForType(t.value);
                return (
                  <option key={t.value} value={t.value}>
                    {t.label} (x{multVal})
                  </option>
                );
              })}
            </select>
          </div>

          {/* WORK: toggle Calculate by Hours vs Fixed Value */}
          {type === "WORK" && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-400 ml-1 mb-2 block uppercase">How to value</label>
                <div className="flex gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => { setWorkInputMode("hours"); setAmount(""); }}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${workInputMode === "hours" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:text-slate-800"}`}
                  >
                    Calculate by Hours
                  </button>
                  <button
                    type="button"
                    onClick={() => { setWorkInputMode("fixed"); setHoursWorked(""); }}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${workInputMode === "fixed" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:text-slate-800"}`}
                  >
                    Fixed Value
                  </button>
                </div>
              </div>
              {workInputMode === "hours" ? (
                <div>
                  <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block uppercase">Hours worked</label>
                  <input 
                    type="number" 
                    min={0}
                    step={0.25}
                    placeholder="e.g. 40"
                    value={hoursWorked} 
                    onChange={(e) => setHoursWorked(e.target.value)} 
                    disabled={!canEdit}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50 font-black outline-none text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed" 
                  />
                  {memberHourlyRate != null && memberHourlyRate > 0 && (
                    <p className="text-xs text-slate-500 mt-1 ml-1">
                      Hourly rate: {formatCurrency(memberHourlyRate, currency)} × {hoursWorked || "0"} h = {formatCurrency((parseFloat(hoursWorked || "0") || 0) * memberHourlyRate, currency)} (before multiplier)
                    </p>
                  )}
                  {isWorkByHoursNoRate && (
                    <p className="text-xs font-bold text-red-600 mt-2 ml-1">
                      This member has no Hourly Rate (FMV) set. Add it in Team → Edit member, or use &quot;Fixed Value&quot; to enter the amount directly.
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block uppercase">{getCurrencyLabel(currency)}</label>
                  <input 
                    type="number" 
                    min={0}
                    step={0.01}
                    placeholder="0.00" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    disabled={!canEdit}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50 font-black outline-none text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed" 
                  />
                </div>
              )}
            </>
          )}

          {/* Value for non-WORK types */}
          {type !== "WORK" && (
            <div>
              <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block uppercase">Value</label>
              <input 
                type="number" 
                min={0}
                step={0.01}
                placeholder="0.00" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                disabled={!canEdit}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50 font-black outline-none text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed" 
              />
            </div>
          )}

          {/* Date */}
          <div>
             <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={!canEdit}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 bg-slate-50 text-xs font-bold text-slate-500 outline-none focus:border-emerald-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
             />
          </div>

          </div>

          {/* Footer: result + submit — always visible */}
          <div className="shrink-0 px-5 pb-5 pt-2 space-y-3 border-t border-slate-100">
          {/* Result Card — preview of total points */}
          <div className="rounded-2xl bg-slate-900 p-4 text-white shadow-lg shadow-emerald-900/20">
             <div className="flex justify-between text-[10px] font-black uppercase opacity-60 mb-1">
                <span>{type === "WORK" ? "Value × Work multiplier" : "Calculated Risk"}</span>
                <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-400">x{multiplier} Multiplier</span>
             </div>
             <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-emerald-400">{Number(riskAdjustedValue).toLocaleString()}</span>
                <span className="text-sm font-bold text-emerald-400/60">points</span>
             </div>
             {type === "WORK" && baseValue > 0 && (
               <p className="text-xs text-slate-400 mt-1">
                 {formatCurrency(baseValue, currency)} × {multiplier} = {riskAdjustedValue} points
               </p>
             )}
          </div>

          {/* Submit Button */}
          {(canEdit || (activeTab === "simulate" && onAddSimulated)) && (
            <button 
              type="submit" 
              disabled={loading || isWorkByHoursNoRate} 
              className="w-full rounded-2xl py-3 text-sm font-black text-white hover:shadow-lg transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/30"
            >
              {loading ? "Saving..." : activeTab === "simulate" ? "Simulate Contribution" : editData ? "Save Changes" : "Confirm Contribution"}
            </button>
          )}

          </div>
        </form>
      </div>
    </div>
  );
}