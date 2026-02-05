"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, Loader2, ShieldCheck, Scale, Sliders, ArrowRight, ArrowLeft } from "lucide-react";
import type { Project } from "@/types/database";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

export function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
  const [step, setStep] = useState(1); // Paso 1: Nombre, Paso 2: Modelo
  const [name, setName] = useState("");
  const [model, setModel] = useState("just_split");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  if (!isOpen) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: project, error } = await supabase
      .from("projects")
      .insert([{ 
        name, 
        created_by: user.id,
        equity_model: model 
      }])
      .select().single();

    if (!error && project) {
        await supabase.from("project_members").insert({
            project_id: project.id,
            user_id: user.id,
            email: user.email!,
            name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Owner",
            role: 'owner',
            status: 'active'
        });
        onProjectCreated(project);
        // Reset para la próxima vez
        setName("");
        setStep(1);
    }
    setLoading(false);
  };

  const models = [
    { 
        id: 'just_split', 
        name: 'Just Split', 
        icon: ShieldCheck, 
        desc: 'The Fair Standard',
        details: 'Multiplies Cash x4 and Work x2 to reward real financial risk.',
        color: 'text-emerald-600 bg-emerald-50 border-emerald-100' 
    },
    { 
        id: 'flat', 
        name: 'Flat Model', 
        icon: Scale, 
        desc: 'Absolute Equality',
        details: '1 unit of value = 1 unit of equity. No risk multipliers applied.',
        color: 'text-purple-600 bg-purple-50 border-purple-100' 
    },
    { 
        id: 'custom', 
        name: 'Custom', 
        icon: Sliders, 
        desc: 'Your Rules',
        details: 'Set your own multipliers for different asset types later.',
        color: 'text-blue-600 bg-blue-50 border-blue-100' 
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="bg-white rounded-[40px] w-full max-w-xl p-10 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-300">
        
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>

        {step === 1 ? (
          <form onSubmit={handleNext} className="space-y-8">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-4 block">Step 01/02</span>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Name your project</h2>
              <p className="text-slate-500 font-medium">Give a name to your new venture to start tracking.</p>
            </div>
            
            <input 
              autoFocus type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apollo Dynamics"
              className="w-full px-8 py-6 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 focus:ring-0 outline-none transition-all font-bold text-2xl placeholder:text-slate-200"
              required
            />

            <button type="submit" className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl group">
                Continue to Models <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        ) : (
          <div className="space-y-8">
            <div>
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 mb-4 transition-colors">
                <ArrowLeft className="w-3 h-3" /> Back to name
              </button>
              <h2 className="text-3xl font-black text-slate-900 mb-1">Choose your DNA</h2>
              <p className="text-slate-500 font-medium italic">How should we value the risk of each founder?</p>
            </div>

            <div className="grid gap-4">
              {models.map((m) => (
                <button
                  key={m.id} onClick={() => setModel(m.id)}
                  className={`flex items-start gap-5 p-6 rounded-[24px] border-2 text-left transition-all ${model === m.id ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-50 hover:border-slate-200 bg-slate-50/50'}`}
                >
                  <div className={`p-4 rounded-2xl shrink-0 ${m.color}`}><m.icon className="w-6 h-6" /></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                        <p className="font-black text-slate-900 text-lg">{m.name}</p>
                        {model === m.id && <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"></div></div>}
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{m.desc}</p>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{m.details}</p>
                  </div>
                </button>
              ))}
            </div>

            <button onClick={handleSubmit} disabled={loading} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-200 active:scale-95">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Launch Project"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}