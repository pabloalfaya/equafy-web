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
        /* SOLUCIÓN AL BANNER: bg-[#0B0F1A] sólido y pt-40 para que el contenido empiece debajo del banner de EQUILY */
        <div className="fixed inset-0 z-[999] bg-[#0B0F1A] overflow-y-auto pt-40 pb-20 px-4 md:px-10">
          <div className="relative w-full max-w-7xl mx-auto flex flex-col items-center animate-in fade-in zoom-in duration-300">
            
            <button 
              onClick={() => setIsOpen(false)} 
              className="absolute -top-16 right-0 bg-slate-800 p-4 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {step === 1 ? (
              <div className="w-full max-w-3xl py-20 text-center">
                <span className="text-emerald-500 font-black uppercase tracking-[0.4em] text-xs mb-4 block">New Venture</span>
                <h2 className="text-5xl md:text-7xl font-black mb-10 text-white tracking-tighter">What's the name of your project?</h2>
                <input
                  autoFocus
                  type="text"
                  placeholder="Enter project name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border-b-4 border-slate-800 p-6 mb-16 focus:border-emerald-500 outline-none transition-all font-black text-white text-4xl md:text-6xl text-center placeholder:text-slate-900"
                />
                <button 
                  disabled={!name.trim()}
                  onClick={() => setStep(2)}
                  className="bg-white text-slate-900 px-16 py-8 rounded-3xl font-black text-2xl hover:bg-emerald-400 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 mx-auto shadow-2xl"
                >
                  Configure Model <ChevronRight className="w-8 h-8" />
                </button>
              </div>
            ) : (
              <div className="w-full animate-in slide-in-from-bottom-6 duration-500">
                <div className="text-center mb-20">
                  <h2 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">Choose your equity logic</h2>
                  <p className="text-slate-500 text-xl font-medium">Select how you want to reward different types of contributions.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                  {/* CUSTOM MODEL */}
                  <div 
                    onClick={() => setSelectedModel('CUSTOM')}
                    className={`relative p-10 rounded-[48px] border-2 transition-all cursor-pointer flex flex-col min-h-[500px] ${selectedModel === 'CUSTOM' ? 'border-blue-500 bg-blue-500/5 shadow-[0_0_60px_rgba(59,130,246,0.1)]' : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'}`}
                  >
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-8"><Settings className="text-slate-400 w-8 h-8" /></div>
                    <h3 className="text-3xl font-black mb-4">Custom</h3>
                    <p className="text-slate-500 text-sm font-medium mb-10">Total control over every multiplier.</p>
                    
                    {selectedModel === 'CUSTOM' && (
                      <div className="space-y-4 mt-auto animate-in fade-in" onClick={(e) => e.stopPropagation()}>
                        {Object.entries(customMults).map(([key, val]) => (
                          <div key={key} className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-slate-800">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{key}</span>
                            <input 
                              type="number" step="0.5" value={val}
                              onChange={(e) => setCustomMults({...customMults, [key]: parseFloat(e.target.value) || 1})}
                              className="w-16 bg-transparent text-right font-black text-blue-400 outline-none text-xl"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* JUST SPLIT MODEL */}
                  <div 
                    onClick={() => setSelectedModel('JUST_SPLIT')}
                    className={`relative p-10 rounded-[48px] border-2 transition-all cursor-pointer flex flex-col min-h-[500px] ${selectedModel === 'JUST_SPLIT' ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_80px_rgba(16,185,129,0.1)]' : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'}`}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-[#0B0F1A] text-xs font-black px-8 py-2.5 rounded-full uppercase tracking-[0.2em] shadow-2xl">Recommended</div>
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-8"><ShieldCheck className="text-emerald-500 w-8 h-8" /></div>
                    <h3 className="text-3xl font-black mb-4">Just Split</h3>
                    <p className="text-emerald-500 text-sm font-bold mb-10 italic">The Industry Standard</p>
                    <div className="space-y-5 mt-auto">
                      <div className="flex justify-between items-center bg-black/40 p-6 rounded-[24px] border border-white/5">
                        <span className="text-xs font-black text-emerald-500 uppercase">Capital</span>
                        <span className="font-black text-4xl text-white">x4</span>
                      </div>
                      <div className="flex justify-between items-center bg-black/40 p-6 rounded-[24px] border border-white/5">
                        <span className="text-xs font-black text-blue-400 uppercase">Work & IP</span>
                        <span className="font-black text-4xl text-white">x2</span>
                      </div>
                      <div className="flex items-center justify-between p-5 bg-black/40 rounded-[24px] border border-slate-800" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logarithmic Risk</span>
                        <input type="checkbox" checked={useLogRisk} onChange={(e) => setUseLogRisk(e.target.checked)} className="w-7 h-7 accent-emerald-500 rounded-lg" />
                      </div>
                    </div>
                  </div>

                  {/* FLAT MODEL */}
                  <div 
                    onClick={() => setSelectedModel('FLAT')}
                    className={`relative p-10 rounded-[48px] border-2 transition-all cursor-pointer flex flex-col min-h-[500px] ${selectedModel === 'FLAT' ? 'border-purple-500 bg-purple-500/5' : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'}`}
                  >
                    <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-8"><Scale className="text-purple-400 w-8 h-8" /></div>
                    <h3 className="text-3xl font-black mb-4">Flat</h3>
                    <p className="text-purple-400 text-sm font-bold mb-10 italic underline">Simple fixed split.</p>
                    <div className="mt-auto bg-black/40 p-12 rounded-[32px] border border-white/5 text-center">
                      <span className="text-[16px] font-black text-purple-400 uppercase tracking-widest">Multipliers x1</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-8 items-center justify-center pt-20">
                  <button onClick={() => setStep(1)} className="text-slate-500 font-black hover:text-white transition-colors flex items-center gap-2 uppercase text-xs tracking-[0.2em]">
                    <ChevronLeft className="w-6 h-6" /> Back to name
                  </button>
                  <button 
                    onClick={handleCreate}
                    disabled={loading}
                    className="w-full max-w-xl bg-white text-slate-900 py-8 rounded-[32px] font-black text-3xl hover:bg-emerald-400 hover:scale-[1.02] transition-all flex items-center justify-center shadow-2xl"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "Launch Project 🚀"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}