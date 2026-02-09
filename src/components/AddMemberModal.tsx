"use client";

import { useState } from "react";
import { X, Trash2, UserPlus, Mail, Shield, User, Pencil, Ban } from "lucide-react";

type TabType = "add" | "edit";
import { createClient } from "@/utils/supabase/client";
import { logAudit } from "@/utils/auditLog";

interface Member {
  id: string;
  name: string;
  email?: string | null;
  role?: string;
  access_level?: "editor" | "viewer";
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  members: Member[];
  onUpdate: () => void;
  canEdit?: boolean;
}

export function AddMemberModal({ isOpen, onClose, projectId, members, onUpdate, canEdit = true }: AddMemberModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("add");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [accessLevel, setAccessLevel] = useState<"editor" | "viewer">("editor");
  const [loading, setLoading] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);

  const supabase = createClient();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !canEdit) return;

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim() === "" ? null : email.trim(),
        role: role.trim() || "Member",
        access_level: accessLevel,
      };

      let error;

      if (editingId) {
        const { error: updateError } = await supabase
          .from("project_members")
          .update(payload)
          .eq("id", editingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("project_members")
          .insert({
            ...payload,
            project_id: projectId,
            status: "active",
          });
        error = insertError;
      }

      if (error) {
        console.error("Error saving member:", error);
        alert(`Error: ${error.message}`);
        return;
      }

      try {
const actionType = editingId ? "EDIT_MEMBER" : "ADD_MEMBER";
      const desc = editingId
        ? `Updated member: ${payload.name}`
        : `Added member: ${payload.name}`;
        await logAudit({ supabase, projectId, actionType, description: desc });
      } catch (auditErr) {
        console.error("Error saving audit log (member still saved):", auditErr);
      }

      resetForm();
      onUpdate();
    } catch (error) {
      console.error("Error saving member:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
      setName("");
      setEmail("");
      setRole("");
      setAccessLevel("editor");
      setEditingId(null);
  };

  const startEdit = (member: Member) => {
      setName(member.name);
      setEmail(member.email || "");
      setRole(member.role || "");
      setAccessLevel((member.access_level as "editor" | "viewer") || "editor");
      setEditingId(member.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This might affect existing contributions.")) return;
    const member = members.find((m) => m.id === id);
    const { error } = await supabase.from("project_members").delete().eq("id", id);
    if (!error) {
      try {
        await logAudit({
          supabase,
          projectId,
          actionType: "REMOVE_MEMBER",
          description: `Removed member: ${member?.name ?? id}`,
        });
      } catch (auditErr) {
        console.error("Error saving audit log:", auditErr);
      }
      if (editingId === id) resetForm();
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
            <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">
                {editingId ? "Edit Member" : "Manage Team"}
            </h3>
          </div>
          <button onClick={() => { resetForm(); onClose(); }} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("add")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
              activeTab === "add"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Add Member
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
              activeTab === "edit"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Edit Team
          </button>
        </div>

        {/* Tab: Add Member */}
        {activeTab === "add" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block uppercase">Name *</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-300" />
                <input 
                  type="text" 
                  placeholder="e.g. Jane Doe" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  disabled={!canEdit}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block uppercase">
                Email (Optional - Invite to Project)
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-300" />
                <input 
                  type="email" 
                  placeholder="jane@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  disabled={!canEdit}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1 ml-1">
                If added, they will automatically see this project in their dashboard.
              </p>
            </div>

            {/* Job Title */}
            <div>
              <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block uppercase">Job Title</label>
              <div className="relative">
                <Shield className="absolute left-4 top-3.5 w-4 h-4 text-slate-300" />
                <input 
                  type="text" 
                  placeholder="e.g. Co-Founder & CTO" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  disabled={!canEdit}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Permissions */}
            <div>
              <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block uppercase">Permissions</label>
              <select
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value as "editor" | "viewer")}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
              >
                <option value="editor">Can Edit</option>
                <option value="viewer">View Only</option>
              </select>
            </div>

            <div className="flex gap-2">
              {editingId && canEdit && (
                <button 
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-xl transition-all"
                  title="Cancel Edit"
                >
                  <Ban className="w-5 h-5" />
                </button>
              )}
              {canEdit && (
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingId ? "Update Member" : "Add Member"}
                </button>
              )}
            </div>
          </form>
        )}

        {/* Tab: Edit Team */}
        {activeTab === "edit" && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 ml-1 block uppercase mb-2">
              Current Team ({members.length})
            </label>
            <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {members.length === 0 ? (
                <p className="text-center text-slate-400 text-sm italic py-4">No members yet.</p>
              ) : (
                members.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-center justify-between p-3 border rounded-xl transition-all ${editingId === m.id ? "bg-emerald-50 border-emerald-200 ring-1 ring-emerald-200" : "bg-slate-50 border-slate-100 hover:border-slate-200"}`}
                  >
                    <div className="flex flex-col overflow-hidden mr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 text-sm truncate">{m.name}</span>
                        {m.role === "owner" ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">Owner</span>
                        ) : (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${m.access_level === "viewer" ? "bg-slate-200 text-slate-600" : "bg-emerald-100 text-emerald-700"}`}>
                            {m.access_level === "viewer" ? "Viewer" : "Editor"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                        {m.role && m.role !== "owner" && <span className="uppercase font-bold text-emerald-600">{m.role}</span>}
                        {m.role && m.role !== "owner" && m.email && <span>|</span>}
                        {m.email && <span>{m.email}</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {canEdit && (
                        <>
                          <button 
                            onClick={() => { startEdit(m); setActiveTab("add"); }}
                            className="p-2 text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                            title="Edit member"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {m.role !== "owner" && (
                            <button 
                              onClick={() => handleDelete(m.id)}
                              className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Remove member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}