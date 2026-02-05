"use client";

import { useState, useEffect } from "react";
import { X, Info } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function AddContributionModal({ isOpen, onClose, projectId, projectConfig, onSuccess, members }: any) {
  const [contributorId, setContributorId] = useState("");
  const [concept, setConcept] = useState("");
  const [type, setType] = useState("CASH");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [multiplier, setMultiplier] = useState(1);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  // LÓGICA DE MULTIPLICADORES INTELIGENTES
  useEffect(() => {
    if (!projectConfig) return;

    const model = projectConfig.equity_model;

    if (model === 'flat') {
      setMultiplier(1);
    } else if (model === 'just_split') {
      // Reglas estándar de Just Split
      if (type === 'CASH') setMultiplier(4);
      else if (type === 'WORK' || type === 'INTANGIBLE') setMultiplier(2);
      else setMultiplier(1);
    } else if (model === 'custom') {
      // Si es custom, usamos los valores guardados en el proyecto o 1 por defecto
      const customMult = projectConfig[`mult_${type.toLowerCase()}`] || 1;
      setMultiplier(customMult);
    }
  }, [type, projectConfig, isOpen]);

  useEffect(() => {
    if (members.length > 0 && !contributorId) setContributorId(members[0].id);
  }, [members, isOpen, contributorId]);

  if (!isOpen) return null;

  // Cálculo de la parte de la empresa (Puntos de riesgo)
  const riskAdjustedValue = (parseFloat(amount || "0") * multiplier).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !contributorId) return;

    setLoading(true);
    const selectedMember = members.find((m: any) => m.id === contributorId);

    const { data, error } = await supabase
      .from("contributions")
      .insert([{
        project_id: projectId,
        contributor_name: selectedMember?.name || "Unknown",
        concept: concept,
        type: type,
        amount: parseFloat(amount),
        multiplier: multiplier,
        risk_adjusted_value: parseFloat(riskAdjustedValue),
        date: date
      }])
      .select()
      .single();

    setLoading(false);

    if (error) {
      alert("Error: " + error.message);
    } else if (data) {
      setConcept("");
      setAmount("");
      setMultiplier(1);
      onSuccess(data);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl animate-in fade-in zoom-in duration-200 font-sans">
        <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-6 flex justify-between items-center">
          <div>
            <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Add Contribution</h3>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">
              Model: {projectConfig?.equity_model?.replace('_', ' ') || 'standard'}
            </p>
          </div>
          <button onClick={onClose}><X className="h-5 w-5 text-slate-400 hover:text-slate-600" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Contributor</label>
              <select value={contributorId} onChange={(e) => setContributorId(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 font-bold outline-none appearance-none">
                {members.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Date</label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 font-bold outline-none text-slate-600" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Description / Concept</label>
            <input type="text" required placeholder="e.g. Server costs or UX Design" value={concept} onChange={(e) => setConcept(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 font-bold outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 font-black text-xs uppercase outline-none appearance-none">
                <option value="CASH">Cash</option>
                <option value="WORK">Work / Time</option>
                <option value="TANGIBLE">Tangible Asset</option>
                <option value="INTANGIBLE">Intangible / IP</option>
                <option value="OTHERS">Others</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Value (Units)</label>
              <input type="number" required placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 font-black outline-none" />
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-500/10 p-5 border border-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 flex items-center gap-1">
                    Risk Multiplier <Info className="w-3 h-3" />
                </span>
                <span className="font-black text-emerald-600 text-sm">x{multiplier}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Calculated Points</span>
                <span className="text-2xl font-black text-emerald-600">{Number(riskAdjustedValue).toLocaleString()}</span>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-slate-900 py-4 text-sm font-black text-white hover:bg-slate-800 transition-all shadow-xl uppercase tracking-widest active:scale-95">
            {loading ? "Processing..." : "Log Contribution"}
          </button>
        </form>
      </div>
    </div>
  );
}