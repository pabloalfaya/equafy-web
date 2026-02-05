"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Trash2, Edit2, Check, RotateCcw, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function AddMemberModal({ isOpen, onClose, projectId, onSuccess }: any) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");

  const supabase = createClient();

  const fetchMembers = async () => {
    if (!projectId) return;
    const { data } = await supabase.from("project_members").select("*").eq("project_id", projectId).order("created_at", { ascending: true });
    if (data) setMembers(data);
  };

  useEffect(() => { if (isOpen && projectId) fetchMembers(); }, [isOpen, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.from("project_members").insert([{ project_id: projectId, name, role: role || "Member" }]);
    setName(""); setRole(""); await fetchMembers(); onSuccess(); setLoading(false);
  };

  const handleUpdate = async (id: string) => {
    await supabase.from("project_members").update({ name: editName, role: editRole }).eq("id", id);
    setEditingId(null); await fetchMembers(); onSuccess();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete member?")) { await supabase.from("project_members").delete().eq("id", id); await fetchMembers(); onSuccess(); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6 border-b pb-4 border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><UserPlus className="h-5 w-5 text-emerald-600" /> Manage Team</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 font-bold outline-none" required />
          <input placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 font-bold outline-none" />
          <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-black uppercase tracking-widest">{loading ? "..." : "Add"}</button>
        </form>
        <div className="space-y-3">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group">
              {editingId === m.id ? (
                <div className="flex gap-2 w-full"><input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 p-1 border rounded text-xs" /><input value={editRole} onChange={(e) => setEditRole(e.target.value)} className="flex-1 p-1 border rounded text-xs" /><button onClick={() => handleUpdate(m.id)}><Check className="w-4 h-4 text-emerald-600" /></button></div>
              ) : (
                <><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-white border flex items-center justify-center font-bold text-slate-400 text-xs">{m.name.charAt(0)}</div><div><p className="text-sm font-black text-slate-800">{m.name}</p><span className="text-[10px] font-black text-emerald-600 uppercase">{m.role}</span></div></div><div className="flex gap-1"><button onClick={() => { setEditingId(m.id); setEditName(m.name); setEditRole(m.role); }} className="p-2 text-slate-600"><Edit2 className="w-4 h-4" /></button><button onClick={() => handleDelete(m.id)} className="p-2 text-red-600"><Trash2 className="w-4 h-4" /></button></div></>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}