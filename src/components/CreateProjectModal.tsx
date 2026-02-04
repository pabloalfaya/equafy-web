"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, FolderPlus, Settings, Scale, ShieldCheck, ChevronRight, ChevronLeft, X } from "lucide-react";
import { ProjectModel } from "@/types/database";

export function CreateProjectModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); 
  const [name, setName] = useState("");
  const [selectedModel, setSelectedModel] = useState<ProjectModel>("JUST_SPLIT");
  const [useLogRisk, setUseLogRisk] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [customMults, setCustomMults] = useState({
    cash: 4.0,
    work: 2.0,
    intangible: 2.0,
    tangible: 1.0,
    others: 1.0
  });

  const supabase = createClient();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Session not found");

      const finalConfig = selectedModel === 'JUST_SPLIT' 
        ? { cash: 4.0, work: 2.0, intangible: 2.0, tangible: 2.0, others: 2.0 }
        : selectedModel === 'FLAT'
        ? { cash: 1.0, work: 1.0, intangible: 1.0, tangible: 1.0, others: 1.0 }
        : customMults;

      const { error } = await supabase.from("projects").insert({
        name: name,
        owner_id: user.id,
        model_type: selectedModel,
        mult_cash: finalConfig.cash,
        mult_work: finalConfig.work,
        mult_tangible: finalConfig.tangible,
        mult_intangible: finalConfig.intangible,
        mult_others: finalConfig.others,
        use_log_risk: useLogRisk,
        current_valuation: 0
      });

      if (error) throw error;
      setIsOpen(false);
      window.location.reload(); 
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => { setIsOpen(true); setStep(1); }}
        className="mt-6 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg"
      >
        <FolderPlus className="w-5 h-5 text-emerald-400" />
        Create New Project
      </button>

      {isOpen && (
        /* FONDO: pt-40 para bajarlo del banner. overflow-hidden para quitar el scroll de la página */
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-[#0B0F1A]/95 backdrop-blur-md p-4 pt-40">
          
          {/* CONTENEDOR: w-full y max-w-7xl para hacerlo mucho más grande y ancho */}
          <div className="relative w-full max-w-7xl bg-[#111827] border border-slate-800 rounded-[48px] shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
            
            <button onClick={() => setIsOpen(false)} className="absolute right-8 top-8 text-slate-500 hover:text-white transition-colors">
              <X className="w-8 h-8" />
            </button>

            <div className="p-12 md:p-20">
              {step === 1 ? (
                <div className="max-w-3xl mx-auto py-16 text-center">
                  <span className="text-emerald-500 font-black uppercase tracking-[0.4em] text-xs mb-6 block">New Project</span>
                  <h2 className="text-5xl font-black mb-6 text-white tracking-tighter">Project Name</h2>
                  <p className="text-slate-400 mb-12 text-lg font-medium">Define the name of your new venture.</p>
                  
                  <input
                    autoFocus
                    type="text"
                    placeholder="e.g. Equily SaaS..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent border-b-4 border-slate-800 p-6 mb-16 focus:border-emerald-500 outline-none transition-all font-black text-white text-4xl text-center placeholder:text-slate-900"
                  />

                  <button 
                    disabled={!name.trim()}
                    onClick={() => setStep(2)}
                    className="w-full max-w-md mx-auto bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#0B0F1A] py-6 rounded-3xl font-black text-2xl flex items-center justify-center gap-3 transition-all shadow-2xl"
                  >
                    Select Model <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl font-black mb-4">Choose your logic</h2>
                    <p className="text-slate-400 font-medium text-lg">Select the best multiplier set for your team.</p>
                  </div>

                  {/* GRID: Gap-10 para que las cajas respiren */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
                    
                    {/* CUSTOM */}
                    <div 
                      onClick={() => setSelectedModel('CUSTOM')}
                      className={`relative p-10 rounded-[40px] border-2 transition-all cursor-pointer flex flex-col min-h-[480px] ${selectedModel === 'CUSTOM' ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'}`}
                    >
                      <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-8"><Settings className="text-slate-400 w-7 h-7" /></div>
                      <h3 className="text-3xl font-black mb-4">Custom</h3>
                      <p className="text-slate-500 text-sm font-medium mb-10 italic">Full manual control.</p>
                      
                      <div className="space-y-3 mt-auto" onClick={(e) => e.stopPropagation()}>
                        {Object.entries(customMults).map(([key, val]) => (
                          <div key={key} className="flex items-center justify-between bg-black/40 p-3 rounded-2xl border border-slate-800">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{key}</span>
                            <input 
                              type="number" step="0.5" value={val}
                              onChange={(e) => setCustomMults({...customMults, [key]: parseFloat(e.target.value) || 1})}
                              className="w-16 bg-transparent text-right font-black text-blue-400 outline-none text-xl"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* JUST SPLIT */}
                    <div 
                      onClick={() => setSelectedModel('JUST_SPLIT')}
                      className={`relative p-10 rounded-[40px] border-2 transition-all cursor-pointer flex flex-col min-h-[480px] ${selectedModel === 'JUST_SPLIT' ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_80px_rgba(16,185,129,0.1)]' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'}`}
                    >
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-emerald-500 text-[#0B0F1A] text-xs font-black px-8 py-2 rounded-full uppercase tracking-widest">Recommended</div>
                      <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-8"><ShieldCheck className="text-emerald-500 w-7 h-7" /></div>
                      <h3 className="text-3xl font-black mb-4">Just Split</h3>
                      <p className="text-emerald-500 text-sm font-bold mb-10 italic">Standard</p>
                      
                      <div className="space-y-5 mt-auto">
                        <div className="flex justify-between items-center bg-black/40 p-6 rounded-[24px] border border-white/5">
                          <span className="text-xs font-black text-emerald-500 uppercase italic">Capital (Cash)</span>
                          <span className="font-black text-4xl text-white">x4</span>
                        </div>
                        <div className="flex justify-between items-center bg-black/40 p-6 rounded-[24px] border border-white/5">
                          <span className="text-xs font-black text-blue-400 uppercase italic">Work & IP</span>
                          <span className="font-black text-4xl text-white">x2</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-black/40 rounded-[24px] border border-slate-800" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[10px] font-black text-slate-500 uppercase">Log Risk</span>
                          <input type="checkbox" checked={useLogRisk} onChange={(e) => setUseLogRisk(e.target.checked)} className="w-6 h-6 accent-emerald-500" />
                        </div>
                      </div>
                    </div>

                    {/* FLAT */}
                    <div 
                      onClick={() => setSelectedModel('FLAT')}
                      className={`relative p-10 rounded-[40px] border-2 transition-all cursor-pointer flex flex-col min-h-[480px] ${selectedModel === 'FLAT' ? 'border-purple-500 bg-purple-500/5' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'}`}
                    >
                      <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-8"><Scale className="text-purple-400 w-7 h-7" /></div>
                      <h3 className="text-3xl font-black mb-4">Flat</h3>
                      <p className="text-purple-400 text-sm font-bold mb-10 italic underline">Simple fixed split.</p>
                      <div className="mt-auto bg-black/40 p-12 rounded-[32px] border border-white/5 text-center">
                        <span className="text-[18px] font-black text-purple-400 uppercase tracking-widest italic">All Multipliers x1</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-8 justify-center items-center border-t border-slate-800 pt-12">
                    <button onClick={() => setStep(1)} className="text-slate-500 font-bold hover:text-white transition-colors text-lg flex items-center gap-2">
                      <ChevronLeft className="w-6 h-6" /> Back
                    </button>
                    <button 
                      onClick={handleCreate}
                      disabled={loading}
                      className="bg-white text-slate-900 px-16 py-6 rounded-3xl font-black text-2xl hover:bg-emerald-400 hover:scale-[1.02] transition-all flex items-center justify-center shadow-2xl"
                    >
                      {loading ? <Loader2 className="animate-spin text-slate-900" /> : "Launch Project 🚀"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}