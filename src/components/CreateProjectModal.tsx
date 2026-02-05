"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, Loader2 } from "lucide-react";
import type { Project } from "@/types/database";

// Definimos las propiedades que acepta el componente
interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

export function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Si isOpen es falso, no renderizamos nada (modal invisible)
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        setLoading(false);
        return;
    }

    // 1. Crear Proyecto
    const { data: project, error } = await supabase
      .from("projects")
      .insert([{ name, created_by: user.id }])
      .select()
      .single();

    if (error) {
      alert("Error creating project: " + error.message);
      setLoading(false);
      return;
    }

    // 2. Añadir al creador como miembro Owner
    if (project) {
        await supabase.from("project_members").insert({
            project_id: project.id,
            user_id: user.id,
            email: user.email!,
            name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Owner",
            role: 'owner',
            status: 'active'
        });
        
        onProjectCreated(project);
        setName("");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      {/* Fondo clicable para cerrar */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200 z-10">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold text-slate-900 mb-1">Create New Project</h2>
        <p className="text-sm text-slate-500 mb-6">Start a new equity split for your startup.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Project Name</label>
            <input 
              autoFocus
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-semibold"
              required
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}