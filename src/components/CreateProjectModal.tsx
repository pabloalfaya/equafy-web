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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B0F1A] p-0 sm:p-6 md:p-10">
          {/* ELIMINADO EL MAX-H Y EL SCROLL FORZADO: Ahora el modal respira y crece */}
          <div className="relative w-full max-w-7xl h-full sm:h-auto bg-[#111827] sm:border border-slate-800 sm:rounded-[48px] shadow-2xl flex flex-col overflow-visible animate-in fade-in zoom-in duration-300">
            
            <button onClick={() => setIsOpen(false)} className="absolute right-8 top-8 z-10 bg-slate-800 p-3 rounded-full text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>

            <div className="flex-grow p-8 md:p-16">
              {step === 1 ? (
                <div className="max-w-2xl mx-auto py-20 text-center">
                  <span className="text-emerald-500 font-black uppercase tracking-[0.3em] text-xs mb-4 block">New Venture</span>
                  <h2 className="text-5xl md:text-6xl font-black mb-6 text-white tracking-tighter">What's the name of your project?</h2>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Enter project name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent border-b-4 border-slate-800 p-4 mb-12 focus:border-emerald-500 outline-none transition-all font-black text-white text-3xl md:text-5xl text-center placeholder:text-slate-800"
                  />
                  <button 
                    disabled={!name.trim()}
                    onClick={() => setStep(2)}
                    className="group bg-white text-slate-900 px-12 py-6 rounded-3xl font-black text-2xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 mx-auto shadow-2xl shadow-white/5"
                  >
                    Configure Model <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ) : (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Choose your equity logic</h2>
                    <p className="text-slate-500 text-lg font-medium">Select how you want to reward different types of contributions.</p>
                  </div>

                  {/* GRID MÁS AMPLIO: He aumentado el gap y el padding para que no se vea apretado */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    
                    {/* CUSTOM MODEL */}
                    <div 
                      onClick={() => setSelectedModel('CUSTOM')}
                      className={`relative p-8 rounded-[40px] border-2 transition-all cursor-pointer flex flex-col min-h-[400px] ${selectedModel === 'CUSTOM' ? 'border-blue-500 bg-blue-500/5 ring-4 ring-blue-500/10' : 'border-slate-800 bg-slate-900/30 hover:border-slate-600'}`}
                    >
                      <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-8"><Settings className="text-slate-400 w-7 h-7" /></div>
                      <h3 className="text-2xl font-black mb-3">Custom</h3>
                      <p className="text-slate-500 text-sm font-medium mb-8">Total control over every single multiplier.</p>
                      
                      <div className="mt-auto space-y-3" onClick={(e) => e.stopPropagation()}>
                        {Object.entries(customMults).map(([key, val]) => (
                          <div key={key} className="flex items-center justify-between bg-black/40 p-3 rounded-2xl border border-slate-800">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{key}</span>
                            <input 
                              type="number" step="0.5" value={val}
                              onChange={(e) => setCustomMults({...customMults, [key]: parseFloat(e.target.value) || 1})}
                              className="w-14 bg-transparent text-right font-black text-blue-400 outline-none text-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* JUST SPLIT MODEL */}
                    <div 
                      onClick={() => setSelectedModel('JUST_SPLIT')}
                      className={`relative p-8 rounded-[40px] border-2 transition-all cursor-pointer flex flex-col min-h-[400px] ${selectedModel === 'JUST_SPLIT' ? 'border-emerald-500 bg-emerald-500/5 ring-4 ring-emerald-500/10' : 'border-slate-800 bg-slate-900/30 hover:border-slate-600'}`}
                    >
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-emerald-500 text-[#0B0F1A] text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.2em] shadow-xl">Best Choice</div>
                      <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-8"><ShieldCheck className="text-emerald-500 w-7 h-7" /></div>
                      <h3 className="text-2xl font-black mb-3">Just Split</h3>
                      <p className="text-emerald-500 text-sm font-bold mb-8 italic">The Industry Standard</p>
                      
                      <div className="space-y-4 mt-auto">
                        <div className="flex justify-between items-center bg-black/40 p-5 rounded-2xl border border-white/5">
                          <span className="text-[10px] font-black text-emerald-500 uppercase">Capital</span>
                          <span className="font-black text-3xl text-white">x4</span>
                        </div>
                        <div className="flex justify-between items-center bg-black/40 p-5 rounded-2xl border border-white/5">
                          <span className="text-[10px] font-black text-blue-400 uppercase">Work & IP</span>
                          <span className="font-black text-3xl text-white">x2</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[10px] font-black text-emerald-500 uppercase">Logarithmic Risk</span>
                          <input type="checkbox" checked={useLogRisk} onChange={(e) => setUseLogRisk(e.target.checked)} className="w-6 h-6 accent-emerald-500 rounded-lg" />
                        </div>
                      </div>
                    </div>

                    {/* FLAT MODEL */}
                    <div 
                      onClick={() => setSelectedModel('FLAT')}
                      className={`relative p-8 rounded-[40px] border-2 transition-all cursor-pointer flex flex-col min-h-[400px] ${selectedModel === 'FLAT' ? 'border-purple-500 bg-purple-500/5 ring-4 ring-purple-500/10' : 'border-slate-800 bg-slate-900/30 hover:border-slate-600'}`}
                    >
                      <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-8"><Scale className="text-purple-400 w-7 h-7" /></div>
                      <h3 className="text-2xl font-black mb-3">Flat</h3>
                      <p className="text-purple-400 text-sm font-bold mb-8">Fair and simple equal split.</p>
                      <div className="mt-auto bg-black/40 p-8 rounded-[32px] border border-white/5 text-center">
                        <span className="text-[14px] font-black text-purple-400 uppercase tracking-widest">All Multipliers x1</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 items-center justify-center pt-8">
                    <button onClick={() => setStep(1)} className="text-slate-500 font-bold hover:text-white transition-colors flex items-center gap-2">
                      <ChevronLeft className="w-5 h-5" /> Back to name
                    </button>
                    <button 
                      onClick={handleCreate}
                      disabled={loading}
                      className="w-full max-w-lg bg-white text-slate-900 py-6 rounded-[24px] font-black text-2xl hover:scale-[1.02] transition-all flex items-center justify-center shadow-2xl"
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