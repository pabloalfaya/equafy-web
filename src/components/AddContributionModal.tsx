"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface AddContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
  onSuccess: (contribution: any) => void;
  // NUEVO: Recibimos la lista de miembros
  members: { id: string; name: string }[]; 
  onAddMemberClick: () => void; // Para abrir el otro modal desde aquí
}

export function AddContributionModal({ isOpen, onClose, projectId, onSuccess, members, onAddMemberClick }: AddContributionModalProps) {
  const [contributorId, setContributorId] = useState("");
  const [concept, setConcept] = useState("");
  const [type, setType] = useState("Cash");
  const [amount, setAmount] = useState("");
  const [multiplier, setMultiplier] = useState(4);
  const [loading, setLoading] = useState(false);

  // Auto-seleccionar el primer miembro si existe
  useEffect(() => {
    if (members.length > 0 && !contributorId) {
      setContributorId(members[0].id);
    }
  }, [members, isOpen, contributorId]);

  if (!isOpen) return null;

  const riskAdjustedValue = (parseFloat(amount || "0") * multiplier).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !contributorId) return;

    setLoading(true);
    const supabase = createClient();
    
    // Buscamos el nombre basado en el ID seleccionado
    const selectedMember = members.find(m => m.id === contributorId);

    const { data, error } = await supabase
      .from("contributions")
      .insert([{
        project_id: projectId,
        contributor_name: selectedMember?.name || "Unknown", // Guardamos el nombre para el gráfico
        concept,
        type,
        amount: parseFloat(amount),
        multiplier,
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
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Add Contribution</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-slate-400 hover:text-slate-600" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* SELECCIÓN DE MIEMBRO (DESPLEGABLE) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Contributor</label>
            {members.length === 0 ? (
               <button type="button" onClick={onAddMemberClick} className="w-full rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition-colors">
                 + Add your first Team Member
               </button>
            ) : (
              <div className="flex gap-2">
                <select 
                  value={contributorId} 
                  onChange={(e) => setContributorId(e.target.value)}
                  className="flex-grow rounded-lg border border-slate-200 px-4 py-2 text-slate-700 focus:border-emerald-500 focus:outline-none"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <button type="button" onClick={onAddMemberClick} className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold" title="Add new member">
                   +
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Concept</label>
            <input type="text" required placeholder="e.g. Server Costs" value={concept} onChange={(e) => setConcept(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-700 focus:border-emerald-500 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Type</label>
              <select value={type} onChange={(e) => {
                setType(e.target.value);
                setMultiplier(e.target.value === "Cash" ? 4 : 2);
              }} className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-700 focus:border-emerald-500 focus:outline-none">
                <option value="Cash">Cash (x4)</option>
                <option value="Labor">Labor (x2)</option>
                <option value="IP">IP / Assets (x2)</option>
                <option value="Commission">Commission (x1)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Amount (€)</label>
              <input type="number" required placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-700 focus:border-emerald-500 focus:outline-none" />
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 flex justify-between items-center border border-slate-100">
            <span className="text-sm font-medium text-slate-500">Risk Adjusted Value:</span>
            <span className="text-lg font-black text-slate-900">{riskAdjustedValue}</span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
            <button type="submit" disabled={loading || members.length === 0} className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-all">
              Add Contribution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}