"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// Defined types with English labels
const CONTRIBUTION_TYPES = [
  { value: "CASH", label: "CASH" },
  { value: "WORK", label: "WORK" },
  { value: "TANGIBLE", label: "TANGIBLE" },
  { value: "INTANGIBLE", label: "INTANGIBLE" },
  { value: "OTHERS", label: "OTHERS" },
];

export function AddContributionModal({ isOpen, onClose, projectId, projectConfig, onSuccess, members, editData = null }: any) {
  const [contributorId, setContributorId] = useState("");
  const [concept, setConcept] = useState("");
  const [type, setType] = useState("CASH");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [multiplier, setMultiplier] = useState(1);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  
  const riskAdjustedValue = (parseFloat(amount || "0") * multiplier).toFixed(2);

  // --- MULTIPLIER LOGIC (NORMALIZED) ---
  const getMultiplierForType = (t: string) => {
    if (!projectConfig) return 1;
    
    // Normalize model name to uppercase to handle "Flat", "flat", "FLAT"
    const rawModel = projectConfig.model_type || projectConfig.equity_model || 'CUSTOM';
    const model = rawModel.toString().toUpperCase();

    // 1. Flat Model
    if (model === 'FLAT' || model.includes('FLAT')) {
        return 1;
    }

    // 2. Just Split Model (Recommended)
    if (model === 'JUST_SPLIT' || model.includes('JUST')) { 
      if (t === 'CASH') return 4; 
      return 2; 
    }

    // 3. Custom Model
    const key = `mult_${t.toLowerCase()}`;
    return projectConfig[key] ?? 1;
  };

  // Effect: Load data on open
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        const member = members.find((m: any) => m.name === editData.contributor_name);
        setContributorId(member?.id || ""); 
        setConcept(editData.concept || ""); 
        setType(editData.type || "CASH");
        setAmount(editData.amount?.toString() || ""); 
        setDate(editData.date || new Date().toISOString().split('T')[0]); 
        setMultiplier(editData.multiplier || 1);
      } else {
        setConcept(""); 
        setAmount(""); 
        setType("CASH"); 
        setDate(new Date().toISOString().split('T')[0]);
        if (members.length > 0 && !contributorId) {
            setContributorId(members[0].id);
        }
      }
    }
  }, [isOpen, editData, members]);

  // Effect: Update multiplier dynamically
  useEffect(() => { 
    if (isOpen) {
        const newMult = getMultiplierForType(type);
        
        if (!editData || (editData && type !== editData.type)) {
            setMultiplier(newMult);
        } else if (editData && type === editData.type) {
            setMultiplier(editData.multiplier);
        }
    }
  }, [type, projectConfig, isOpen, editData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const selectedMember = members.find((m: any) => m.id === contributorId);
    
    const payload = { 
        project_id: projectId, 
        contributor_name: selectedMember?.name || "Unknown", 
        concept, 
        type, 
        amount: parseFloat(amount), 
        multiplier, 
        risk_adjusted_value: parseFloat(riskAdjustedValue), 
        date 
    };

    const query = editData 
        ? supabase.from("contributions").update(payload).eq("id", editData.id) 
        : supabase.from("contributions").insert([payload]);

    const { data, error } = await query.select().single();

    if (!error) { 
        if(onSuccess) onSuccess(data);
        onClose(); 
    } else {
        console.error("Error saving contribution:", error);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl p-8 animate-in zoom-in duration-200 font-sans">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">
            {editData ? "Edit Contribution" : "Add Contribution"}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Member Selector */}
          <div>
            <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block uppercase">Member</label>
            <select 
                value={contributorId} 
                onChange={(e) => setContributorId(e.target.value)} 
                className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 font-bold outline-none text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
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
                className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 font-bold outline-none text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" 
            />
          </div>

          {/* Type & Amount Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block uppercase">Type</label>
                <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)} 
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 font-black text-xs uppercase outline-none text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
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
            
            <div>
                <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block uppercase">Value</label>
                <input 
                    type="number" 
                    placeholder="0.00" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 font-black outline-none text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" 
                />
            </div>
          </div>

          {/* Date */}
          <div>
             <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 bg-slate-50 text-xs font-bold text-slate-500 outline-none focus:border-emerald-500 transition-all"
             />
          </div>

          {/* Result Card */}
          <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-lg shadow-emerald-900/20">
             <div className="flex justify-between text-[10px] font-black uppercase opacity-60 mb-2">
                <span>Calculated Risk</span>
                <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-400">x{multiplier} Multiplier</span>
             </div>
             <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-emerald-400">{Number(riskAdjustedValue).toLocaleString()}</span>
                <span className="text-sm font-bold text-emerald-400/60">points</span>
             </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full rounded-2xl bg-emerald-600 py-4 text-sm font-black text-white hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : editData ? "Save Changes" : "Confirm Contribution"}
          </button>

        </form>
      </div>
    </div>
  );
}