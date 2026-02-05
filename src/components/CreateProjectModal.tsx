"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, Loader2, ShieldCheck, Scale, Settings, ArrowRight, ArrowLeft, Rocket, CheckCircle2 } from "lucide-react";
import type { Project } from "@/types/database";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

export function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [model, setModel] = useState("just_split");
  const [loading, setLoading] = useState(false);

  // Valores por defecto
  const [mults, setMults] = useState({
    cash: 4,
    work: 2,
    tangible: 2,
    intangible: 2,
    others: 1
  });

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

    let finalMults = { ...mults };
    if (model === 'just_split') {
        finalMults = { cash: 4, work: 2, tangible: 2, intangible: 2, others: 2 };
    } else if (model === 'flat') {
        finalMults = { cash: 1, work: 1, tangible: 1, intangible: 1, others: 1 };
    }

    const { data: project, error } = await supabase
      .from("projects")
      .insert([{ 
        name, 
        created_by: user.id,
        equity_model: model,
        mult_cash: finalMults.cash,
        mult_work: finalMults.work,
        mult_tangible: finalMults.tangible,
        mult_intangible: finalMults.intangible,
        mult_others: finalMults.others
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
        setName("");
        setStep(1);
        onClose();
    } else if (error) {
        alert("Error creating project: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
      <div className="relative w-full max-w-6xl bg-[#0f172a] rounded-[40px] border border-slate-800/50 shadow-2xl p-10 text-white overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Fondo con gradiente sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900 -z-10"></div>
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>

        <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10">
          <X className="w-5 h-5" />
        </button>

        {step === 1 ? (
          <form onSubmit={handleNext} className="max-w-md mx-auto py-16 space-y-10 text-center relative z-10">
            <div>
                <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-500/10">
                    <Rocket className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-5xl font-black mb-4 tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">Name your venture</h2>
                <p className="text-lg text-slate-400 font-medium leading-relaxed">What is the name of this new project?</p>
            </div>
            
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                <input 
                  autoFocus type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apollo Dynamics"
                  className="relative w-full px-8 py-7 rounded-2xl bg-[#1e293b] border-2 border-slate-700/50 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-3xl text-center placeholder:text-slate-600"
                  required
                />
            </div>

            <button type="submit" className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 py-5 rounded-2xl font-black text-lg hover:bg-emerald-50 transition-all group shadow-xl shadow-white/5 active:scale-[0.98]">
                Continue to Logic <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        ) : (
          <div className="space-y-12 animate-in slide-in-from-right-8 duration-500">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-4xl font-black mb-3 uppercase tracking-tighter bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">Choose your logic</h2>
              <p className="text-lg text-slate-400 font-medium">Select the distribution model that fits your team's philosophy.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
              
              {/* === TARJETA CUSTOM (NUEVO DISEÑO CIAN) === */}
              <div onClick={() => setModel('custom')} className={`relative group p-8 rounded-[36px] border-2 transition-all cursor-pointer flex flex-col h-full ${model === 'custom' ? 'border-cyan-500/50 bg-cyan-950/30 ring-4 ring-cyan-500/10 shadow-2xl shadow-cyan-500/10' : 'border-slate-800/60 bg-slate-900/40 hover:border-cyan-500/30 hover:bg-slate-900/60'}`}>
                {model === 'custom' && <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent rounded-[36px] pointer-events-none"></div>}
                <div className="flex items-center gap-4 mb-8 relative z-10">
                    <div className={`p-3 rounded-2xl ${model === 'custom' ? 'bg-cyan-500/20' : 'bg-slate-800'} transition-colors`}>
                        <Settings className={`w-6 h-6 ${model === 'custom' ? 'text-cyan-300' : 'text-slate-400'} transition-colors`} />
                    </div>
                    <div>
                        <span className="font-black text-xl block">Custom</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Manual configuration</span>
                    </div>
                </div>
                
                <div className="space-y-3 mb-8 flex-1 relative z-10">
                    {['Cash', 'Work', 'Intangible', 'Tangible', 'Others'].map((label) => (
                        <div key={label} className={`flex items-center justify-between p-4 rounded-2xl border transition-all group/item ${model === 'custom' ? 'bg-[#0f172a]/80 border-cyan-900/50 hover:border-cyan-500/30' : 'bg-slate-950/50 border-slate-800/50 hover:border-slate-700'}`}>
                            <span className={`text-[11px] font-black uppercase tracking-widest ${model === 'custom' ? 'text-cyan-600' : 'text-slate-500'}`}>{label}</span>
                            <input 
                                type="number" 
                                step="0.1"
                                value={mults[label.toLowerCase() as keyof typeof mults]}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setMults({...mults, [label.toLowerCase()]: parseFloat(e.target.value) || 0})}
                                className={`w-16 bg-transparent text-right font-black text-lg outline-none transition-colors ${model === 'custom' ? 'text-cyan-300 focus:text-cyan-200' : 'text-slate-600'}`}
                            />
                        </div>
                    ))}
                </div>
                
                {/* NUEVO: Logarithmic Risk en Custom */}
                 <div className={`p-4 rounded-2xl border flex justify-between items-center mb-6 relative z-10 ${model === 'custom' ? 'bg-[#0f172a]/80 border-cyan-900/50' : 'bg-slate-950/50 border-slate-800/50'}`}>
                    <span className={`text-[11px] font-black uppercase tracking-widest ${model === 'custom' ? 'text-cyan-600' : 'text-slate-500'}`}>Logarithmic Risk (Optional)</span>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${model === 'custom' ? 'border-cyan-500/50' : 'border-slate-700'}`}>
                        {/* Simulación de checkbox no marcado */}
                    </div>
                </div>

                <div className="relative z-10 mt-auto">
                    <p className={`text-[11px] text-center uppercase font-bold tracking-[0.2em] ${model === 'custom' ? 'text-cyan-400' : 'text-slate-500'}`}>Total manual control</p>
                </div>
              </div>

              {/* === TARJETA JUST SPLIT (NUEVO DISEÑO DORADO/ÁMBAR) === */}
              <div onClick={() => setModel('just_split')} className={`relative group p-8 rounded-[36px] border-2 transition-all cursor-pointer flex flex-col h-full scale-[1.02] z-20 ${model === 'just_split' ? 'border-amber-500/50 bg-amber-950/30 ring-4 ring-amber-500/10 shadow-2xl shadow-amber-500/20' : 'border-slate-800/60 bg-slate-900/40 hover:border-amber-500/30 hover:bg-slate-900/60'}`}>
                {model === 'just_split' && <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent rounded-[36px] pointer-events-none"></div>}
                
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 text-xs font-black px-5 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-amber-500/20 z-30 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Best Choice
                </div>
                
                <div className="flex items-center gap-4 mb-8 relative z-10 pt-2">
                    <div className={`p-3 rounded-2xl ${model === 'just_split' ? 'bg-amber-500/20' : 'bg-slate-800'} transition-colors`}>
                        <ShieldCheck className={`w-6 h-6 ${model === 'just_split' ? 'text-amber-300' : 'text-slate-400'} transition-colors`} />
                    </div>
                    <div>
                        <span className="font-black text-xl block">Just Split Model</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Industry standard</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 flex-1 relative z-10">
                    {[{l:'Cash',v:'x4'},{l:'Work',v:'x2'},{l:'Assets',v:'x2'},{l:'IP',v:'x2'}].map(item => (
                         <div key={item.l} className={`p-5 rounded-2xl border text-center flex flex-col justify-center transition-all ${model === 'just_split' ? 'bg-[#0f172a]/80 border-amber-900/50' : 'bg-slate-950/50 border-slate-800/50'}`}>
                            <span className={`text-[9px] font-black uppercase block mb-2 tracking-widest ${model === 'just_split' ? 'text-amber-600' : 'text-slate-500'}`}>{item.l}</span>
                            <span className={`text-3xl font-black tracking-tighter ${model === 'just_split' ? 'text-white' : 'text-slate-400'}`}>{item.v}</span>
                        </div>
                    ))}
                </div>

                {/* TEXTO CAMBIADO: Logarithmic Risk en Just Split */}
                <div className={`p-4 rounded-2xl border flex justify-between items-center mb-8 relative z-10 ${model === 'just_split' ? 'bg-[#0f172a]/80 border-amber-900/50' : 'bg-slate-950/50 border-slate-800/50'}`}>
                    <span className={`text-[11px] font-black uppercase tracking-widest ${model === 'just_split' ? 'text-amber-600' : 'text-slate-500'}`}>Logarithmic Risk (Optional)</span>
                    <div className={`w-5 h-5 rounded-sm shadow-[0_0_15px_rgba(251,191,36,0.5)] transition-all ${model === 'just_split' ? 'bg-amber-500 scale-110' : 'bg-slate-700'}`}></div>
                </div>
                
                <div className="relative z-10 mt-auto">
                    <p className={`text-[11px] text-center uppercase font-bold tracking-[0.2em] decoration-2 underline-offset-4 ${model === 'just_split' ? 'text-amber-400 underline' : 'text-slate-500'}`}>Recommended</p>
                </div>
              </div>

              {/* === TARJETA FLAT MODEL (DISEÑO MORADO EXISTENTE PERO MEJORADO) === */}
              <div onClick={() => setModel('flat')} className={`relative group p-8 rounded-[36px] border-2 transition-all cursor-pointer flex flex-col h-full ${model === 'flat' ? 'border-purple-500/50 bg-purple-950/30 ring-4 ring-purple-500/10 shadow-2xl shadow-purple-500/10' : 'border-slate-800/60 bg-slate-900/40 hover:border-purple-500/30 hover:bg-slate-900/60'}`}>
                 {model === 'flat' && <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent rounded-[36px] pointer-events-none"></div>}
                <div className="flex items-center gap-4 mb-8 relative z-10">
                    <div className={`p-3 rounded-2xl ${model === 'flat' ? 'bg-purple-500/20' : 'bg-slate-800'} transition-colors`}>
                        <Scale className={`w-6 h-6 ${model === 'flat' ? 'text-purple-300' : 'text-slate-400'} transition-colors`} />
                    </div>
                     <div>
                        <span className="font-black text-xl block">Flat Model</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Equal distribution</span>
                    </div>
                </div>
                <div className="space-y-4 mb-8 flex-1 relative z-10">
                    <div className={`p-6 rounded-3xl border text-center transition-all ${model === 'flat' ? 'bg-[#0f172a]/80 border-purple-900/50' : 'bg-slate-950/50 border-slate-800/50'}`}>
                        <span className={`text-[9px] font-black uppercase block mb-2 tracking-widest ${model === 'flat' ? 'text-purple-400' : 'text-slate-500'}`}>All Contributions</span>
                        <span className={`text-5xl font-black tracking-tighter ${model === 'flat' ? 'text-white' : 'text-slate-400'}`}>x1</span>
                    </div>
                    <div className={`rounded-2xl border border-dashed p-5 text-[11px] font-medium italic text-center leading-relaxed ${model === 'flat' ? 'border-purple-500/30 text-purple-300/70 bg-purple-500/5' : 'border-slate-800 text-slate-500 bg-slate-950/30'}`}>
                        Simple linear split where every unit of contribution is treated equally, regardless of type.
                    </div>
                </div>
                <div className="relative z-10 mt-auto">
                     <p className={`text-[11px] text-center uppercase font-bold tracking-[0.2em] ${model === 'flat' ? 'text-purple-400' : 'text-slate-500'}`}>Fixed Split</p>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-between pt-8 border-t border-slate-800/50 max-w-5xl mx-auto">
                <button onClick={() => setStep(1)} className="flex items-center gap-3 text-slate-400 font-bold hover:text-white transition-colors group px-4 py-2 rounded-xl hover:bg-slate-800">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> BACK
                </button>
                <button onClick={handleSubmit} disabled={loading} className="px-12 py-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-black hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 text-lg relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="relative flex items-center gap-3">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Launch Project <Rocket className="w-6 h-6" /></>}</span>
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}