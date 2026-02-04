"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { ContributionType, Project } from "@/types/database";

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
  const [concept, setConcept] = useState("");
  const [type, setType] = useState<ContributionType>("cash");
  const [amount, setAmount] = useState("");
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  // Load project multipliers to apply the correct risk model [cite: 2026-02-03]
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

  // Calculate multiplier based on the model saved in DB [cite: 2026-02-03]
  const currentMultiplier = project ? {
    cash: project.mult_cash,
    work: project.mult_work,
    tangible: project.mult_tangible,
    intangible: project.mult_intangible,
    others: project.mult_others
  }[type] : 1;

  const riskAdjustedValue = (parseFloat(amount || "0") * (currentMultiplier || 1)).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !contributorId) return;

    setLoading(true);
    const selectedMember = members.find(m => m.id === contributorId);

    const { data, error } = await supabase
      .from("contributions")
      .insert([{
        project_id: projectId,
        contributor_name: selectedMember?.name || "Unknown",
        concept,
        type,
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
      setConcept("");
      setAmount("");
      onSuccess(data);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-between items-center font-sans">
          <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Add Contribution</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-slate-400 hover:text-slate-600" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-sans">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Contributor</label>
            {members.length === 0 ? (
               <button type="button" onClick={onAddMemberClick} className="w-full rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition-colors">
                 + Add your first Team Member
               </button>
            ) : (
              <div className="flex gap-2">
                <select 
                  value={contributorId} 
                  onChange={(e) => setContributorId(e.target.value)}
                  className="flex-grow rounded-lg border border-slate-200 px-4 py-2 text-slate-700 focus:border-emerald-500 focus:outline-none bg-white font-bold"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <button type="button" onClick={onAddMemberClick} className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold">
                   +
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Concept</label>
            <input type="text" required placeholder="e.g. Server Costs" value={concept} onChange={(e) => setConcept(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-700 focus:border-emerald-500 focus:outline-none italic" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Type</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value as ContributionType)} 
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-700 focus:border-emerald-500 focus:outline-none bg-white font-bold"
              >
                <option value="cash">Cash (x{project?.mult_cash || 4})</option>
                <option value="work">Work (x{project?.mult_work || 2})</option>
                <option value="tangible">Tangible (x{project?.mult_tangible || 1})</option>
                <option value="intangible">Intangible (x{project?.mult_intangible || 2})</option>
                <option value="others">Others (x{project?.mult_others || 1})</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Amount (€)</label>
              <input type="number" required placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-700 focus:border-emerald-500 focus:outline-none font-bold tabular-nums" />
            </div>
          </div>

          <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800">
                Total Value of the Contribution
              </span>
              <span className="text-xl font-black text-emerald-900 tabular-nums">
                {Number(riskAdjustedValue).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
            <button type="submit" disabled={loading || members.length === 0} className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md uppercase tracking-widest">
              {loading ? "Adding..." : "Add Contribution"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}