"use client";

import { useState, useEffect } from "react";
import { X, Info, Zap, Coins, Briefcase, Calculator } from "lucide-react";
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

  // --- LÓGICA DE MULTIPLICADORES ---
  const getMultiplierForType = (t: string) => {
    if (!projectConfig) return 1;
    const model = projectConfig.equity_model;

    if (model === 'flat') return 1;
    
    if (model === 'just_split') {
      if (t === 'CASH') return 4;
      // Corregido: Tangible e Intangible ahora son x2 junto con Work
      if (['WORK', 'TANGIBLE', 'INTANGIBLE'].includes(t)) return 2;
      return 1; // Otros
    }
    
    if (model === 'custom') {
      const key = `mult_${t.toLowerCase().split(' / ')[0]}`;
      return projectConfig[key] || 1;
    }
    
    return 1;
  };

  useEffect(() => {
    setMultiplier(getMultiplierForType(type));
  }, [type, projectConfig, isOpen]);

  useEffect(() => {
    if (members.length > 0 && !contributorId) setContributorId(members[0].id);
  }, [members, isOpen, contributorId]);

  if (!isOpen) return null;

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
      onSuccess(data);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl animate-in fade-in zoom-in duration-200 font-sans">
        
        {/* Header */}
        <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-6 flex justify-between items-center">
          <div>
            <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Add Contribution</h3>
            <div className="flex items-center gap-2 mt-1">
              <Zap className="w-3 h-3 text-emerald-500" />
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                Model: {projectConfig?.equity_model?.replace('_', ' ') || 'standard'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Contributor</label>
              <select value={contributorId} onChange={(e) => setContributorId(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 font-bold outline-none cursor-pointer appearance-none text-slate-700">
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
            <input type="text" required placeholder="e.g. Server costs or UX Design" value={concept} onChange={(e) => setConcept(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 font-bold outline-none placeholder:text-slate-300 text-slate-700" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Type</label>
              <div className="relative">
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 font-black text-xs uppercase outline-none cursor-pointer appearance-none text-slate-700">
                  <option value="CASH">Cash (x{getMultiplierForType('CASH')})</option>
                  <option value="WORK">Work / Time (x{getMultiplierForType('WORK')})</option>
                  <option value="TANGIBLE">Tangible (x{getMultiplierForType('TANGIBLE')})</option>
                  <option value="INTANGIBLE">Intangible (x{getMultiplierForType('INTANGIBLE')})</option>
                  <option value="OTHERS">Others (x{getMultiplierForType('OTHERS')})</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Amount</label>
              <input type="number" required placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 font-black outline-none text-slate-700" />
            </div>
          </div>

          {/* Resultado del Cálculo */}
          <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl ring-1 ring-white/10">
            <div className="flex items-center justify-between mb-3 opacity-60">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                Multiplier <Calculator className="w-3 h-3" />
              </span>
              <span className="font-black text-sm">x{multiplier}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Equity Points</span>
              <div className="text-right">
                <span className="text-3xl font-black text-emerald-400 tracking-tighter">
                  {Number(riskAdjustedValue).toLocaleString()}
                </span>
                <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Adjusted for risk</p>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full rounded-2xl bg-emerald-500 py-5 text-sm font-black text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-widest active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Processing..." : "Confirm Contribution"}
          </button>
        </form>
      </div>
    </div>
  );
}