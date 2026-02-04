"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Project } from "@/types/database";

interface AddContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
  onSuccess: (contribution: any) => void;
  members: { id: string; name: string }[]; 
  onAddMemberClick: () => void;
}

export function AddContributionModal({ isOpen, onClose, projectId, onSuccess, members, onAddMemberClick }: AddContributionModalProps) {
  const [contributorId, setContributorId] = useState("");
  const [description, setDescription] = useState(""); // CAMBIADO: de 'concept' a 'description'
  const [type, setType] = useState("CASH"); // CAMBIADO: ahora por defecto en MAYÚSCULAS
  const [amount, setAmount] = useState("");
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadProjectConfig() {
      if (projectId && isOpen) {
        const { data } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single();
        if (data) setProject(data);
      }
    }
    loadProjectConfig();
  }, [projectId, isOpen, supabase]);

  useEffect(() => {
    if (members.length > 0 && !contributorId) {
      setContributorId(members[0].id);
    }
  }, [members, isOpen, contributorId]);

  if (!isOpen) return null;

  // Mapeo de multiplicadores usando las claves en MAYÚSCULAS
  const currentMultiplier = project ? {
    CASH: project.mult_cash,
    WORK: project.mult_work,
    TANGIBLE: project.mult_tangible,
    INTANGIBLE: project.mult_intangible,
    OTHERS: project.mult_others
  }[type] : 1;

  const riskAdjustedValue = (parseFloat(amount || "0") * (Number(currentMultiplier) || 1)).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !contributorId) return;

    setLoading(true);
    const selectedMember = members.find(m => m.id === contributorId);

    // SINCRONIZACIÓN CON LA BASE DE DATOS:
    const { data, error } = await supabase
      .from("contributions")
      .insert([{
        project_id: projectId,
        contributor_name: selectedMember?.name || "Unknown",
        description: description,      // Nombre correcto de la columna
        contribution_type: type,        // Nombre correcto de la columna
        amount: parseFloat(amount),
        multiplier: currentMultiplier,
        risk_adjusted_value: parseFloat(riskAdjustedValue)
      }])
      .select()
      .single();

    setLoading(false);

    if (error) {
      alert("Error: " + error.message);
    } else if (data) {
      setDescription("");
      setAmount("");
      onSuccess(data);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-6 flex justify-between items-center">
          <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Add Contribution</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-slate-400 hover:text-slate-600" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 font-sans">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Contributor</label>
            {members.length === 0 ? (
               <button type="button" onClick={onAddMemberClick} className="w-full rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition-colors">
                 + Add your first Team Member
               </button>
            ) : (
              <div className="flex gap-2">
                <select 
                  value={contributorId} 
                  onChange={(e) => setContributorId(e.target.value)}
                  className="flex-grow rounded-xl border border-slate-200 px-4 py-3 text-slate-700 focus:border-emerald-500 outline-none bg-slate-50 font-bold"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <button type="button" onClick={onAddMemberClick} className="px-4 py-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold">+</button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Description</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Website Design or Server Costs" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 focus:border-emerald-500 outline-none bg-slate-50 font-medium italic" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Type</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)} 
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 focus:border-emerald-500 outline-none bg-slate-50 font-black text-xs uppercase"
              >
                <option value="CASH">Cash (x{project?.mult_cash || 4})</option>
                <option value="WORK">Work (x{project?.mult_work || 2})</option>
                <option value="TANGIBLE">Tangible (x{project?.mult_tangible || 1})</option>
                <option value="INTANGIBLE">Intangible (x{project?.mult_intangible || 2})</option>
                <option value="OTHERS">Others (x{project?.mult_others || 1})</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Amount (€)</label>
              <input 
                type="number" 
                required 
                placeholder="0.00" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 focus:border-emerald-500 outline-none bg-slate-50 font-black tabular-nums" 
              />
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-500/10 p-5 border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Value in Points</span>
              <span className="text-2xl font-black text-emerald-600 tabular-nums">
                {Number(riskAdjustedValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="rounded-xl px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">Cancel</button>
            <button 
              type="submit" 
              disabled={loading || members.length === 0} 
              className="rounded-xl bg-slate-900 px-10 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xl uppercase tracking-[0.2em]"
            >
              {loading ? "Adding..." : "Add Contribution"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}