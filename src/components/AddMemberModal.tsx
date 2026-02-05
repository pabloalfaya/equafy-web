"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Trash2, Briefcase, Mail, Loader2 } from "lucide-react";
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

  const supabase = createClient();

  // Cargar miembros al abrir el modal
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

    // Lógica: Si hay email, es 'pending' (invitación). Si no, es 'active' (manual).
    const status = email ? 'pending' : 'active';
    
    // CORRECCIÓN CLAVE: Convertimos el rol a minúsculas para cumplir con la restricción SQL
    const sanitizedRole = (role.trim() || "member").toLowerCase();

    const { error } = await supabase.from("project_members").insert([
      { 
        project_id: projectId, 
        name: name, 
        email: email || null, 
        role: sanitizedRole, 
        status: status 
      }
    ]);

    setLoading(false);

    if (error) {
      alert("Error: " + error.message);
    } else {
      // Limpiamos formulario
      setName("");
      setEmail("");
      setRole("");
      
      // Actualizamos lista y notificamos al componente padre
      await fetchMembers();
      onSuccess();
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    
    const { error } = await supabase
      .from("project_members")
      .delete()
      .eq("id", memberId);

    if (!error) {
      fetchMembers();
      onSuccess();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      {/* Fondo clicable para cerrar */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[85vh] z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-emerald-600" />
            Manage Team
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            
            {/* Nombre */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Carmelo" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium" 
              />
            </div>

            {/* Email (Opcional) */}
            <div>
              <label className="flex justify-between text-xs font-bold text-slate-700 uppercase mb-1">
                <span>Email</span>
                <span className="text-emerald-600 normal-case bg-emerald-50 px-2 rounded-full font-bold">Optional - sends invite</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input 
                  type="email" 
                  placeholder="partner@company.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium" 
                />
              </div>
            </div>

            {/* Rol */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Role</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="e.g. CTO, Developer..." 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full rounded-lg bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : "Add Member"}
            </button>
          </form>

          {/* Lista de Miembros */}
          {members.length > 0 && (
            <div className="border-t border-slate-100 pt-6">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Current Team ({members.length})</h4>
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 group hover:border-emerald-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-tight">{member.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 capitalize">
                            {member.role || "member"}
                          </span>
                          {member.email ? (
                             <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                • {member.email}
                             </span>
                          ) : (
                             <span className="text-[10px] text-slate-400 italic">• Manual Entry</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleDeleteMember(member.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Remove member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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