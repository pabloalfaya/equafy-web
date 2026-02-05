"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Trash2, Briefcase, Mail, Loader2, Edit2, Check, RotateCcw } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
  onSuccess: () => void;
}

interface Member {
  id: string;
  email: string | null;
  name: string;
  role: string;
}

export function AddMemberModal({ isOpen, onClose, projectId, onSuccess }: AddMemberModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  // Estados para la edición
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");

  const supabase = createClient();

  useEffect(() => {
    if (isOpen && projectId) {
      fetchMembers();
    }
  }, [isOpen, projectId]);

  const fetchMembers = async () => {
    if (!projectId) return;
    const { data } = await supabase
      .from("project_members")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    
    if (data) setMembers(data);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!projectId || !name) return;

    setLoading(true);
    const status = email ? 'pending' : 'active';
    const finalRole = role.trim() || "Member";

    const { error } = await supabase.from("project_members").insert([
      { 
        project_id: projectId, 
        name: name, 
        email: email || null, 
        role: finalRole, 
        status: status 
      }
    ]);

    setLoading(false);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setName("");
      setEmail("");
      setRole("");
      await fetchMembers();
      onSuccess();
    }
  };

  const startEditing = (member: Member) => {
    setEditingId(member.id);
    setEditName(member.name);
    setEditRole(member.role);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditRole("");
  };

  const handleUpdateMember = async (id: string) => {
    if (!editName.trim()) return;

    const { error } = await supabase
      .from("project_members")
      .update({
        name: editName,
        role: editRole || "Member"
      })
      .eq("id", id);

    if (error) {
      alert("Error al actualizar: " + error.message);
    } else {
      setEditingId(null);
      await fetchMembers();
      onSuccess();
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm("Are you sure?")) return;
    const { error } = await supabase.from("project_members").delete().eq("id", memberId);
    if (!error) {
      fetchMembers();
      onSuccess();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[85vh] z-10 font-sans border border-slate-100">
        
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-emerald-600" />
            Manage Team
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-1.5 tracking-wider">Name *</label>
              <input type="text" required placeholder="e.g. Carmelo" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 bg-slate-50/50 focus:bg-white" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-1.5 tracking-wider">Email (Optional)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input type="email" placeholder="partner@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 bg-slate-50/50 focus:bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-1.5 tracking-wider">Role / Position</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input type="text" placeholder="e.g. Worker, CEO, Designer..." value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 bg-slate-50/50 focus:bg-white" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-emerald-600 px-6 py-4 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 uppercase tracking-widest">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Member"}
            </button>
          </form>

          {members.length > 0 && (
            <div className="border-t border-slate-100 pt-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Current Team ({members.length})</h4>
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 group hover:border-emerald-200 transition-all shadow-sm">
                    
                    {editingId === member.id ? (
                      <div className="flex flex-col gap-3 w-full animate-in slide-in-from-top-1 duration-200">
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="text" 
                            value={editName} 
                            onChange={(e) => setEditName(e.target.value)} 
                            className="w-full text-xs font-bold p-2 border border-blue-200 rounded-lg outline-none focus:ring-2 ring-blue-50 bg-blue-50/20"
                            placeholder="Name"
                          />
                          <input 
                            type="text" 
                            value={editRole} 
                            onChange={(e) => setEditRole(e.target.value)} 
                            className="w-full text-[10px] font-bold p-2 border border-blue-200 rounded-lg outline-none focus:ring-2 ring-blue-50 bg-blue-50/20"
                            placeholder="Role"
                          />
                        </div>
                        <div className="flex justify-end gap-2 border-t border-slate-50 pt-2">
                          <button onClick={cancelEditing} className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 px-2 py-1 transition-colors">
                            <RotateCcw className="w-3 h-3" /> CANCEL
                          </button>
                          <button onClick={() => handleUpdateMember(member.id)} className="flex items-center gap-1 text-[10px] font-black text-blue-600 hover:text-blue-700 px-3 py-1 bg-blue-50 rounded-lg transition-all">
                            <Check className="w-3 h-3" /> SAVE CHANGES
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-black text-slate-400">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 leading-tight">{member.name}</p>
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">{member.role}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            type="button" 
                            onClick={() => startEditing(member)} 
                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit Member"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {/* BOTÓN ELIMINAR: Contraste mejorado a text-red-400 */}
                          <button 
                            type="button" 
                            onClick={() => handleDeleteMember(member.id)} 
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Member"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}