"use client";

import { useState, useEffect } from "react";
import { X, Zap, Coins, Calculator, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function AddContributionModal({ isOpen, onClose, projectId, projectConfig, onSuccess, members, editData = null }: any) {
  const [contributorId, setContributorId] = useState("");
  const [concept, setConcept] = useState("");
  const [type, setType] = useState("CASH");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [multiplier, setMultiplier] = useState(1);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const getMultiplierForType = (t: string) => {
    if (!projectConfig) return 1;
    const model = projectConfig.equity_model;
    if (model === 'flat') return 1;
    if (model === 'just_split') {
      if (t === 'CASH') return 4;
      if (['WORK', 'TANGIBLE', 'INTANGIBLE'].includes(t)) return 2;
    }
    if (model === 'custom') {
      const key = `mult_${t.toLowerCase()}`;
      return projectConfig[key] || 1;
    }
    return 1;
  };

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
        setConcept(""); setAmount(""); setType("CASH"); setDate(new Date().toISOString().split('T')[0]);
        if (members.length > 0) setContributorId(members[0].id);
      }
    }
  }, [isOpen, editData, members]);

  useEffect(() => { if (isOpen && !editData) setMultiplier(getMultiplierForType(type)); }, [type, projectConfig, isOpen, editData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const selectedMember = members.find((m: any) => m.id === contributorId);
    const riskVal = parseFloat((parseFloat(amount || "0") * multiplier).toFixed(2));

    const payload = {
      project_id: projectId,
      contributor_name: selectedMember?.name || "Unknown",
      concept, type, date, amount: parseFloat(amount), multiplier, risk_adjusted_value: riskVal
    };

    const query = editData ? supabase.from("contributions").update(payload).eq("id", editData.id) : supabase.from("contributions").insert([payload]);
    const { data, error } = await query.select().single();

    if (!error && data) {
      onSuccess(data);
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden p-8 animate-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">{editData ? "Edit Contribution" : "Add Contribution"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <select value={contributorId} onChange={(e) => setContributorId(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 font-bold outline-none text-slate-800">
              {members.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 font-bold outline-none text-slate-800" />
          </div>
          <input type="text" placeholder="Description" value={concept} onChange={(e) => setConcept(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 font-bold outline-none text-slate-800" />
          <div className="grid grid-cols-2 gap-4">
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 font-bold outline-none text-slate-800 uppercase text-xs">
              <option value="CASH">Cash</option><option value="WORK">Work</option><option value="TANGIBLE">Tangible</option><option value="INTANGIBLE">Intangible</option><option value="OTHERS">Others</option>
            </select>
            <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 font-bold outline-none text-slate-800" />
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl text-white">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60 mb-2"><span>Points</span><span>Multiplier x{multiplier}</span></div>
            <div className="text-3xl font-black text-emerald-400">{(parseFloat(amount || "0") * multiplier).toLocaleString()}</div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-emerald-700 transition-all">
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : editData ? "Save Changes" : "Confirm"}
          </button>
        </form>
      </div>
    </div>
  );
}