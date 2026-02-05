"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, Loader2, ShieldCheck, Scale, Sliders } from "lucide-react";
import type { Project } from "@/types/database";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

export function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [model, setModel] = useState("just_split");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // 1. Crear Proyecto con el modelo elegido
    const { data: project, error } = await supabase
      .from("projects")
      .insert([{ 
        name, 
        created_by: user.id,
        equity_model: model 
      }])
      .select()
      .single();

    if (error) {
      alert("Error: " + error.message);
      setLoading(false);
      return;
    }

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

  const models = [
    { id: 'just_split', name: 'Just Split', icon: ShieldCheck, desc: 'Risk-adjusted (x4 Cash, x2 Work).', color: 'text-emerald-600 bg-emerald-50' },
    { id: 'flat', name: 'Flat Model', icon: Scale, desc: 'Linear split (1 unit = 1 share).', color: 'text-purple-600 bg-purple-50' },
    { id: 'custom', name: 'Custom', icon: Sliders, desc: 'Define your own multipliers.', color: 'text-blue-600 bg-blue-50' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        
        <h2 className="text-2xl font-black text-slate-900 mb-1">New Project</h2>
        <p className="text-sm text-slate-500 mb-8">Setup your **equity** rules from the start.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Company Name</label>
            <input 
              autoFocus type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My New Venture"
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-lg"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-3 tracking-widest">Select Equity Model</label>
            <div className="grid gap-3">
              {models.map((m) => (
                <button
                  key={m.id} type="button" onClick={() => setModel(m.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${model === m.id ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className={`p-3 rounded-xl ${m.color}`}><m.icon className="w-5 h-5" /></div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{m.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{m.desc}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${model === m.id ? 'border-emerald-500 bg-emerald-500' : 'border-slate-200'}`}>
                    {model === m.id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={loading} className="flex-1 px-6 py-4 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 active:scale-[0.98]">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Launch Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}