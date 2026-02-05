"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, FolderPlus, Settings, Scale, ShieldCheck, ChevronRight, ChevronLeft, X, PieChart } from "lucide-react";
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
      setName("");
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
        className="mt-6 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl hover:-translate-y-0.5 active:scale-95"
      >
        <FolderPlus className="w-5 h-5 text-emerald-400" />
        Create New Project
      </button>

      {isOpen && (
        // Mantenemos el fondo blanco aquí
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-6xl bg-[#F8FAFC] border border-white rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] flex flex-col animate-in fade-in zoom-in duration-300 overflow-hidden">
            
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

            <button onClick={() => setIsOpen(false)} className="absolute right-8 top-8 text-slate-400 hover:text-slate-600 transition-colors z-20 bg-white p-2 rounded-full border border-slate-100 shadow-sm">
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10 px-8 py-20 md:px-16 md:py-24">
              {step === 1 ? (
                <div className="max-w-md mx-auto text-center">
                  <span className="text-emerald-500 font-black uppercase tracking-[0.2em] text-[10px] mb-4 block">Initialization</span>
                  <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Project Name</h2>
                  <p className="text-slate-500 mb-12 font-bold">Define the identity of your new venture.</p>
                  
                  <input
                    autoFocus
                    type="text"
                    placeholder="e.g. Equily SaaS..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border-2 border-slate-100 rounded-3xl p-6 mb-12 focus:border-emerald-500 focus:bg-white shadow-sm outline-none transition-all font-black text-slate-800 text-3xl text-center placeholder:text-slate-200"
                  />

                  <button 
                    disabled={!name.trim()}
                    onClick={() => setStep(2)}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white py-6 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl"
                  >
                    Select Equity Model <ChevronRight className="w-5 h-5 text-emerald-400" />
                  </button>
                </div>
              ) : (
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <div className="text-center mb-16">
                    <span className="text-blue-500 font-black uppercase tracking-[0.2em] text-[10px] mb-4 block">Architecture</span>
                    <h2 className="text-4xl font-black text-slate-900 mb-2">Choose your logic</h2>
                    <p className="text-slate-500 font-bold text-sm">Select the mathematical framework for your team.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    
                    {/* CUSTOM MODEL - Restaurado estilo oscuro */}
                    <div 
                      onClick={() => setSelectedModel('CUSTOM')}
                      className={`relative p-10 rounded-[40px] border-2 transition-all cursor-pointer flex flex-col min-h-[520px] shadow-sm ${selectedModel === 'CUSTOM' ? 'border-blue-500 bg-slate-800' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}
                    >
                      <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mb-8 shadow-sm"><Settings className="text-slate-400 w-6 h-6" /></div>
                      <h3 className="text-2xl font-black mb-2 text-white">Custom</h3>
                      <p className="text-slate-400 text-xs font-bold mb-10 uppercase tracking-widest">Full configuration</p>
                      
                      <div className="space-y-3 mt-auto" onClick={(e) => e.stopPropagation()}>
                        {Object.entries(customMults).map(([key, val]) => (
                          <div key={key} className="flex items-center justify-between bg-slate-800 p-4 rounded-2xl border border-slate-700">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{key}</span>
                            <input 
                              type="number" step="0.5" value={val}
                              onChange={(e) => setCustomMults({...customMults, [key]: parseFloat(e.target.value) || 1})}
                              className="w-12 bg-transparent text-right font-black text-blue-500 outline-none text-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* JUST SPLIT MODEL - Restaurado estilo oscuro */}
                    <div 
                      onClick={() => setSelectedModel('JUST_SPLIT')}
                      className={`relative p-10 rounded-[40px] border-2 transition-all cursor-pointer flex flex-col min-h-[520px] shadow-2xl ${selectedModel === 'JUST_SPLIT' ? 'border-emerald-500 bg-slate-800 ring-4 ring-emerald-500/20' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}
                    >
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-xl">Recommended</div>
                      <div className="w-12 h-12 bg-emerald-900/30 border border-emerald-800 rounded-2xl flex items-center justify-center mb-8 shadow-sm"><ShieldCheck className="text-emerald-500 w-6 h-6" /></div>
                      <h3 className="text-2xl font-black mb-2 text-white">Just Split</h3>
                      <p className="text-emerald-500 text-xs font-black mb-10 uppercase tracking-widest">Industry Standard</p>
                      
                      <div className="space-y-4 mt-auto mb-8">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-emerald-900/30 p-4 rounded-2xl border border-emerald-800 text-center">
                              <span className="block text-[10px] font-black text-emerald-500 uppercase mb-1">Cash</span>
                              <span className="font-black text-white text-2xl">x4</span>
                          </div>
                          <div className="bg-blue-900/30 p-4 rounded-2xl border border-blue-800 text-center">
                              <span className="block text-[10px] font-black text-blue-500 uppercase mb-1">Work</span>
                              <span className="font-black text-white text-2xl">x2</span>
                          </div>
                        </div>
                        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-3">
                            <PieChart className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Log Risk</span>
                          </div>
                          <input type="checkbox" checked={useLogRisk} onChange={(e) => setUseLogRisk(e.target.checked)} className="w-6 h-6 accent-emerald-500 cursor-pointer" />
                        </div>
                      </div>
                    </div>

                    {/* FLAT MODEL - Restaurado estilo oscuro */}
                    <div 
                      onClick={() => setSelectedModel('FLAT')}
                      className={`relative p-10 rounded-[40px] border-2 transition-all cursor-pointer flex flex-col min-h-[520px] shadow-sm ${selectedModel === 'FLAT' ? 'border-purple-500 bg-slate-800' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}
                    >
                      <div className="w-12 h-12 bg-purple-900/30 border border-purple-800 rounded-2xl flex items-center justify-center mb-8 shadow-sm"><Scale className="text-purple-400 w-6 h-6" /></div>
                      <h3 className="text-2xl font-black mb-2 text-white">Flat Model</h3>
                      <p className="text-purple-400 text-xs font-black mb-10 uppercase tracking-widest">Simple & Equal</p>
                      
                      <div className="space-y-4 mt-auto">
                        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 text-center">
                            <span className="block text-[10px] font-black text-slate-400 uppercase mb-2">All Contributions</span>
                            <span className="font-black text-white text-4xl">x1</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 text-center italic">Best for service companies.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-8 justify-center items-center pt-10 border-t border-slate-100">
                    <button onClick={() => setStep(1)} className="text-slate-400 font-black hover:text-slate-900 transition-colors text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <button 
                      onClick={handleCreate}
                      disabled={loading}
                      className="bg-slate-900 text-white px-16 py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all flex items-center justify-center shadow-2xl hover:-translate-y-1"
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