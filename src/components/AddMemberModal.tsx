"use client";

import { useState, useEffect } from "react";
import { X, Trash2, UserPlus, Mail, Shield, User } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Member {
  id: string;
  name: string;
  email?: string;
  role: string;
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  members: Member[];
  onUpdate: () => void;
}

export function AddMemberModal({ isOpen, onClose, projectId, members, onUpdate }: AddMemberModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);

    const { error } = await supabase.from("project_members").insert({
      project_id: projectId,
      // We assume the current user is adding this, but we don't link the member to a specific auth user_id yet 
      // unless they are already in the system. For now, we create a placeholder record.
      // Note: In a real invite system, you'd send an email. Here we just store the data.
      user_id: (await supabase.auth.getUser()).data.user?.id, // Temporary: owner owns the record logic
      name: name,
      email: email || null,
      role: role,
      status: 'active'
    });

    if (error) {
      console.error("Error adding member:", error);
      alert("Error adding member. Please try again.");
    } else {
      setName("");
      setEmail("");
      setRole("member");
      onUpdate();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this member? Contributions linked to them might be affected.")) return;

    const { error } = await supabase.from("project_members").delete().eq("id", id);
    if (!error) {
      onUpdate();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 animate-in zoom-in duration-200 font-sans">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Manage Team</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Add Form */}
        <form onSubmit={handleAdd} className="space-y-4 mb-8">
          <div>
            <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block uppercase">Name *</label>
            <div className="relative">
                <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-300" />
                <input 
                    type="text" 
                    placeholder="e.g. John Doe" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                    required
                />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block uppercase">Email (Optional)</label>
            <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-300" />
                <input 
                    type="email" 
                    placeholder="john@example.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block uppercase">Role</label>
            <div className="relative">
                <Shield className="absolute left-4 top-3.5 w-4 h-4 text-slate-300" />
                <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all appearance-none"
                >
                    <option value="member">Partner / Member</option>
                    <option value="advisor">Advisor</option>
                    <option value="observer">Observer</option>
                    <option value="owner">Owner</option>
                </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Member"}
          </button>
        </form>

        {/* Member List */}
        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
          <label className="text-xs font-bold text-slate-400 ml-1 block uppercase mb-2">Current Team ({members.length})</label>
          
          {members.length === 0 ? (
            <p className="text-center text-slate-400 text-sm italic py-4">No members yet.</p>
          ) : (
            members.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl group hover:border-slate-200 transition-all">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 text-sm">{m.name}</span>
                  <div className="flex gap-2 text-[10px] uppercase font-black tracking-wider">
                     <span className="text-emerald-600">{m.role}</span>
                     {m.email && <span className="text-slate-400 normal-case font-medium tracking-normal border-l border-slate-300 pl-2">{m.email}</span>}
                  </div>
                </div>
                {/* No permitimos borrar al Owner principal por seguridad visual aquí */}
                {m.role !== 'owner' && (
                    <button 
                        onClick={() => handleDelete(m.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}