"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Project } from "@/types/database";

export function AddContributionModal({ isOpen, onClose, projectId, onSuccess, members, onAddMemberClick }: any) {
  const [contributorId, setContributorId] = useState("");
  const [concept, setConcept] = useState("");
  const [type, setType] = useState("CASH");
  const [amount, setAmount] = useState("");
  // NUEVO: Estado para la fecha, inicializado en 'hoy' [cite: 2026-02-04]
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadProjectConfig() {
      if (projectId && isOpen) {
        const { data } = await supabase.from("projects").select("*").eq("id", projectId).single();
        if (data) setProject(data);
      }
    }
    loadProjectConfig();
  }, [projectId, isOpen, supabase]);

  useEffect(() => {
    if (members.length > 0 && !contributorId) setContributorId(members[0].id);
  }, [members, isOpen, contributorId]);

  if (!isOpen) return null;

  const currentMultiplier = project ? (project as any)[`mult_${type.toLowerCase()}`] || 1 : 1;
  const riskAdjustedValue = (parseFloat(amount || "0") * (Number(currentMultiplier) || 1)).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !contributorId) return;

    setLoading(true);
    const selectedMember = members.find((m: any) => m.id === contributorId);

    // INSERCIÓN: Incluimos el campo 'date'
    const { data, error } = await supabase
      .from("contributions")
      .insert([{
        project_id: projectId,
        contributor_name: selectedMember?.name || "Unknown",
        concept: concept,
        type: type,
        amount: parseFloat(amount),
        multiplier: currentMultiplier,
        risk_adjusted_value: parseFloat(riskAdjustedValue),
        date: date // Guardamos la fecha seleccionada
      }])
      .select()
      .single();

    setLoading(false);

    if (error) {
      alert("Error: " + error.message);
    } else if (data) {
      setConcept("");
      setAmount("");
      // Reseteamos a la fecha actual para la siguiente entrada
      setDate(new Date().toISOString().split('T')[0]); 
      onSuccess(data);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl animate-in fade-in zoom-in duration-200 font-sans">
        <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-6 flex justify-between items-center">
          <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Add Contribution</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-slate-400 hover:text-slate-600" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Contributor</label>
              <select value={contributorId} onChange={(e) => setContributorId(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 font-bold outline-none">
                {members.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            {/* NUEVO: Selector de Fecha */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Date</label>
              <input 
                type="date" 
                required
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 font-bold outline-none text-slate-600" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Description / Concept</label>
            <input type="text" required placeholder="e.g. Server costs" value={concept} onChange={(e) => setConcept(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 italic outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 font-black text-xs uppercase outline-none">
                <option value="CASH">Cash (x{project?.mult_cash || 4})</option>
                <option value="WORK">Work (x{project?.mult_work || 2})</option>
                <option value="TANGIBLE">Tangible (x{project?.mult_tangible || 1})</option>
                <option value="INTANGIBLE">Intangible (x{project?.mult_intangible || 2})</option>
                <option value="OTHERS">Others (x{project?.mult_others || 1})</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Amount (€)</label>
              <input type="number" required placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 font-black outline-none" />
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-500/10 p-5 border border-emerald-500/20 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Value in Pts</span>
            <span className="text-2xl font-black text-emerald-600">{Number(riskAdjustedValue).toLocaleString()}</span>
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-slate-900 py-4 text-sm font-black text-white hover:bg-slate-800 transition-all shadow-xl uppercase tracking-widest">
            {loading ? "Saving..." : "Add Contribution"}
          </button>
        </form>
      </div>
    </div>
  );
}