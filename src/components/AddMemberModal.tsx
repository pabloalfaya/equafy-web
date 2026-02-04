"use client";

import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
  onSuccess: () => void;
}

export function AddMemberModal({ isOpen, onClose, projectId, onSuccess }: AddMemberModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !name) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("project_members")
      .insert([{ project_id: projectId, name: name, email: email || null }]);

    setLoading(false);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setName("");
      setEmail("");
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-emerald-600" />
            Add Team Member
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
            <input type="text" required placeholder="e.g. Sarah" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Email (Optional)</label>
            <input type="email" placeholder="sarah@company.com" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            <p className="mt-1 text-xs text-slate-400">Used for invites in the future.</p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
            <button type="submit" disabled={loading} className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
              {loading ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}