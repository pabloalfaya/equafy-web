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
        /* FONDO: pt-32 para separar del banner y items-start para que flote arriba pero con aire */
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-[#0B0F1A]/90 backdrop-blur-sm p-4 pt-32 overflow-y-auto">
          {/* CONTENEDOR: Sin altura fija para que no haya scroll interno innecesario */}
          <div className="relative w-full max-w-6xl bg-[#111827] border border-slate-800 rounded-[32px] shadow-2xl animate-in fade-in zoom-in duration-200 mb-20">
            
            <button onClick={() => setIsOpen(false)} className="absolute right-6 top-6 text-slate-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>

            <div className="p-8 md:p-12">
              {step === 1 ? (
                <div className="max-w-xl mx-auto py-10 text-center">
                  <span className="text-emerald-500 font-black uppercase tracking-widest text-[10px] mb-4 block">New Project</span>
                  <h2 className="text-3xl font-black mb-4 text-white">Project Name</h2>
                  <p className="text-slate-400 mb-10 font-medium">Define the name of your new venture.</p>
                  
                  <input
                    autoFocus
                    type="text"
                    placeholder="e.g. Equily SaaS..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 mb-10 focus:border-emerald-500 outline-none transition-all font-bold text-white text-xl text-center"
                  />

                  <button 
                    disabled={!name.trim()}
                    onClick={() => setStep(2)}
                    className="w-full max-w-xs mx-auto bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#0B0F1A] py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-lg"
                  >
                    Select Model <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-black mb-2">Choose your logic</h2>
                    <p className="text-slate-400 font-medium text-sm">Select the best multiplier set for your team.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* CUSTOM */}
                    <div 
                      onClick={() => setSelectedModel('CUSTOM')}
                      className={`relative p-6 rounded-3xl border-2 transition-all cursor-pointer ${selectedModel === 'CUSTOM' ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 bg-slate-900/50'}`}
                    >
                      <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center mb-6"><Settings className="text-slate-400 w-5 h-5" /></div>
                      <h3 className="text-xl font-black mb-2">Custom</h3>
                      <p className="text-slate-500 text-xs font-medium mb-6">Total control.</p>
                      
                      {selectedModel === 'CUSTOM' && (
                        <div className="space-y-2 animate-in fade-in" onClick={(e) => e.stopPropagation()}>
                          {Object.entries(customMults).map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between bg-black/40 p-2 rounded-xl border border-slate-700">
                              <span className="text-[9px] font-black text-slate-500 uppercase">{key}</span>
                              <input 
                                type="number" step="0.5" value={val}
                                onChange={(e) => setCustomMults({...customMults, [key]: parseFloat(e.target.value) || 1})}
                                className="w-10 bg-transparent text-right font-black text-blue-400 outline-none text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* JUST SPLIT */}
                    <div 
                      onClick={() => setSelectedModel('JUST_SPLIT')}
                      className={`relative p-6 rounded-3xl border-2 transition-all cursor-pointer ${selectedModel === 'JUST_SPLIT' ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 bg-slate-900/50'}`}
                    >
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-[#0B0F1A] text-[9px] font-black px-3 py-1 rounded-full uppercase">Best Choice</div>
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6"><ShieldCheck className="text-emerald-500 w-5 h-5" /></div>
                      <h3 className="text-xl font-black mb-2">Just Split</h3>
                      <p className="text-emerald-500 text-xs font-bold mb-6">Standard</p>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                          <span className="text-[9px] font-black text-emerald-500 uppercase italic">Cash x4</span>
                          <span className="text-[9px] font-black text-blue-400 uppercase italic">Work x2</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-black/40 rounded-xl border border-slate-800" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[9px] font-black text-slate-500 uppercase">Log Risk</span>
                        <input type="checkbox" checked={useLogRisk} onChange={(e) => setUseLogRisk(e.target.checked)} className="w-4 h-4 accent-emerald-500" />
                      </div>
                    </div>

                    {/* FLAT */}
                    <div 
                      onClick={() => setSelectedModel('FLAT')}
                      className={`relative p-6 rounded-3xl border-2 transition-all cursor-pointer ${selectedModel === 'FLAT' ? 'border-purple-500 bg-purple-500/5' : 'border-slate-800 bg-slate-900/50'}`}
                    >
                      <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6"><Scale className="text-purple-400 w-5 h-5" /></div>
                      <h3 className="text-xl font-black mb-2">Flat</h3>
                      <p className="text-purple-400 text-xs font-bold mb-6">Equal split (x1).</p>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center items-center border-t border-slate-800 pt-8">
                    <button onClick={() => setStep(1)} className="text-slate-500 font-bold hover:text-white transition-colors text-sm">
                      Back
                    </button>
                    <button 
                      onClick={handleCreate}
                      disabled={loading}
                      className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all flex items-center justify-center shadow-xl"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : "Launch Project 🚀"}
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