"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Trash2, Briefcase } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
  onSuccess: () => void;
}

interface Member {
  id: string;
  email: string; // Ajustado a 'email' según tu código anterior
  name: string;
  role: string;
}

export function AddMemberModal({ isOpen, onClose, projectId, onSuccess }: AddMemberModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(""); // Nuevo estado para el rol
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]); // Estado para la lista

  const supabase = createClient();

  // Cargar miembros al abrir el modal
  useEffect(() => {
    if (isOpen && projectId) {
      fetchMembers();
    }
  }, [isOpen, projectId]);

  const fetchMembers = async () => {
    if (!projectId) return;
    
    const { data, error } = await supabase
      .from("project_members")
      .select("*")
      .eq("project_id", projectId);
    
    if (data) setMembers(data);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!projectId || !name) return;

    setLoading(true);

    const { error } = await supabase.from("project_members").insert([
      { 
        project_id: projectId, 
        name: name, 
        email: email || null,
        role: role || "Member" // Guardamos el rol (o Member por defecto)
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
      
      // Actualizamos la lista local y notificamos al padre
      await fetchMembers();
      onSuccess();
      
      // NOTA: He quitado el onClose() aquí para que puedas seguir gestionando el equipo
      // Si prefieres que se cierre al añadir, descomenta la siguiente línea:
      // onClose();
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
      onSuccess(); // Para actualizar contadores en el padre si hace falta
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[85vh]">
        
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
        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Name</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Sarah" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email (Optional)</label>
              <input 
                type="email" 
                placeholder="sarah@company.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" 
              />
            </div>

            {/* Nuevo campo de Rol */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Role / Position</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="e.g. CTO, Developer..." 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full rounded-lg bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 shadow-md active:scale-95 transition-all"
            >
              {loading ? "Adding..." : "Add Member"}
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
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            {member.role || "Member"}
                          </span>
                          {member.email && <span className="text-[10px] text-slate-400">• {member.email}</span>}
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