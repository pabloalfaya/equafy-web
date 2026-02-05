"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // IMPORTANTE: Importamos esto para el "teletransporte"
import { createClient } from "@/utils/supabase/client";
import { Loader2, FolderPlus, Settings, Scale, ShieldCheck, ChevronRight, ChevronLeft, X, PieChart } from "lucide-react";
import { ProjectModel } from "@/types/database";

export function CreateProjectModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // Para asegurar que estamos en el cliente
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

  // Aseguramos que el componente está montado para evitar errores con document.body
  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Contenido del Modal separado para pasarlo al Portal
  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#0F172A] p-4 overflow-y-auto">
      {/* CONTENEDOR DEL MODAL */}
      <div className="relative w-full max-w-6xl bg-[#0F172A] border border-slate-800 rounded-[32px] shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300 overflow-hidden text-white my-auto">
        
        <button onClick={() => setIsOpen(false)} className="absolute right-6 top-6 text-slate-400 hover:text-white transition-colors z-20 bg-slate-900/50 p-2 rounded-full">
          <X className="w-6 h-6" />
        </button>

        <div className="relative z-10 px-8 py-16 md:px-12 md:py-20">
          {step === 1 ? (
            /* --- STEP 1: NAME --- */
            <div className="max-w-md mx-auto text-center">
              <span className="text-emerald-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-4 block">New Project</span>
              <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Project Name</h2>
              <p className="text-slate-400 mb-10 text-sm">Define the name of your new venture.</p>
              
              <input
                autoFocus
                type="text"
                placeholder="e.g. Equily SaaS..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 mb-8 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-bold text-white text-xl text-center placeholder:text-slate-600"
              />

              <button 
                disabled={!name.trim()}
                onClick={() => setStep(2)}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-slate-900 py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
              >
                Select Model <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* --- STEP 2: MODEL SELECTION --- */
            <div className="animate-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-black text-white mb-2">Choose your logic</h2>
                <p className="text-slate-400 text-sm">Select the best multiplier set for your team.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                
                {/* CUSTOM MODEL - DARK */}
                <div 
                  onClick={() => setSelectedModel('CUSTOM')}
                  className={`relative p-6 rounded-3xl border transition-all cursor-pointer flex flex-col min-h-[480px] ${selectedModel === 'CUSTOM' ? 'border-blue-500 bg-slate-900/50' : 'border-slate-800 bg-slate-900/20 hover:border-slate-700'}`}
                >
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center mb-6"><Settings className="text-slate-400 w-5 h-5" /></div>
                  <h3 className="text-xl font-bold mb-1 text-white">Custom</h3>
                  <p className="text-slate-500 text-[10px] italic mb-8">Total manual control.</p>
                  
                  <div className="space-y-3 mt-auto" onClick={(e) => e.stopPropagation()}>
                    {Object.entries(customMults).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between bg-slate-950 px-4 py-3 rounded-lg border border-slate-800">
                        <span className="text-[10px] font-bold text-white uppercase">{key}</span>
                        <input 
                          type="number" step="0.5" value={val}
                          onChange={(e) => setCustomMults({...customMults, [key]: parseFloat(e.target.value) || 1})}
                          className="w-10 bg-transparent text-right font-bold text-blue-400 outline-none text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* JUST SPLIT MODEL - DARK (RECOMMENDED) */}
                <div 
                  onClick={() => setSelectedModel('JUST_SPLIT')}
                  className={`relative p-6 rounded-3xl border transition-all cursor-pointer flex flex-col min-h-[480px] ${selectedModel === 'JUST_SPLIT' ? 'border-emerald-500 bg-slate-900/50 shadow-[0_0_40px_-10px_rgba(16,185,129,0.1)]' : 'border-slate-800 bg-slate-900/20 hover:border-slate-700'}`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-900 text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider">Best Choice</div>
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6"><ShieldCheck className="text-emerald-500 w-5 h-5" /></div>
                  <div className="text-center mb-8">
                      <h3 className="text-xl font-bold mb-1 text-white">Just Split Model</h3>
                      <p className="text-emerald-500 text-[10px] font-bold underline decoration-emerald-500/30 underline-offset-4">Recommended</p>
                  </div>
                  
                  <div className="space-y-3 mt-auto mb-2">
                    {/* Row 1 */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/20 text-center">
                          <span className="block text-[9px] font-bold text-emerald-500 uppercase mb-1">Cash</span>
                          <span className="font-bold text-white text-lg">x4</span>
                      </div>
                      <div className="bg-blue-950/30 p-3 rounded-xl border border-blue-500/20 text-center">
                          <span className="block text-[9px] font-bold text-blue-500 uppercase mb-1">Work</span>
                          <span className="font-bold text-white text-lg">x2</span>
                      </div>
                    </div>
                    {/* Row 2 - Extra items */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                            <span className="block text-[8px] font-bold text-slate-400 uppercase">Tang.</span>
                            <span className="font-bold text-white text-xs">x2</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                            <span className="block text-[8px] font-bold text-slate-400 uppercase">Intan.</span>
                            <span className="font-bold text-white text-xs">x2</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                            <span className="block text-[8px] font-bold text-slate-400 uppercase">Other</span>
                            <span className="font-bold text-white text-xs">x2</span>
                        </div>
                    </div>

                    {/* Log Risk Toggle */}
                    <div className="bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 flex items-center justify-between mt-4" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[10px] font-bold text-white uppercase">Log Risk</span>
                      <div className="relative flex items-center">
                        <input type="checkbox" checked={useLogRisk} onChange={(e) => setUseLogRisk(e.target.checked)} className="peer w-5 h-5 cursor-pointer appearance-none border-2 border-slate-600 rounded bg-slate-900 checked:bg-white checked:border-white transition-all" />
                        <div className="absolute inset-0 pointer-events-none text-slate-900 flex items-center justify-center opacity-0 peer-checked:opacity-100">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FLAT MODEL - DARK */}
                <div 
                  onClick={() => setSelectedModel('FLAT')}
                  className={`relative p-6 rounded-3xl border transition-all cursor-pointer flex flex-col min-h-[480px] ${selectedModel === 'FLAT' ? 'border-purple-500 bg-slate-900/50' : 'border-slate-800 bg-slate-900/20 hover:border-slate-700'}`}
                >
                  <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6"><Scale className="text-purple-500 w-5 h-5" /></div>
                  <div className="text-center mb-8">
                      <h3 className="text-xl font-bold mb-1 text-white">Flat Model</h3>
                      <p className="text-purple-400 text-[10px] italic underline decoration-purple-500/30 underline-offset-4">Simple fixed split.</p>
                  </div>
                  
                  <div className="space-y-3 mt-auto">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                            <span className="block text-[9px] font-bold text-purple-300 uppercase mb-1">Cash</span>
                            <span className="font-bold text-white text-lg">x1</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                            <span className="block text-[9px] font-bold text-purple-300 uppercase mb-1">Work</span>
                            <span className="font-bold text-white text-lg">x1</span>
                        </div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                          <span className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Others (Tang/Intang)</span>
                          <span className="font-bold text-white text-lg">x1</span>
                    </div>

                    <p className="text-[9px] font-bold text-slate-500 text-center uppercase tracking-widest mt-4">All values equal x1</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center border-t border-slate-800 pt-8">
                <button onClick={() => setStep(1)} className="absolute left-12 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button 
                  onClick={handleCreate}
                  disabled={loading}
                  className="bg-white text-slate-900 px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center shadow-lg hover:-translate-y-0.5"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Launch Project 🚀"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button 
        onClick={() => { setIsOpen(true); setStep(1); }}
        className="mt-6 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl hover:-translate-y-0.5 active:scale-95"
      >
        <FolderPlus className="w-5 h-5 text-emerald-400" />
        Create New Project
      </button>

      {/* RENDERIZADO DEL PORTAL: Esto saca el modal fuera de la jerarquía normal */}
      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  );
}