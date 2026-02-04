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
  const [useLogRisk, setUseLogRisk] = useState(false); // Estado para el interruptor de la foto
  const [loading, setLoading] = useState(false);
  
  const supabase = createClient();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Session not found");

      // Configuramos los multiplicadores EXACTOS de las fotos
      const modelConfigs = {
        JUST_SPLIT: { cash: 4.0, work: 2.0, intangible: 2.0, tangible: 2.0, others: 2.0 },
        FLAT: { cash: 1.0, work: 1.0, intangible: 1.0, tangible: 1.0, others: 1.0 },
        CUSTOM: { cash: 4.0, work: 2.0, intangible: 2.0, tangible: 1.0, others: 1.0 }
      };

      const { error } = await supabase.from("projects").insert({
        name: name,
        owner_id: user.id,
        model_type: selectedModel,
        mult_cash: modelConfigs[selectedModel].cash,
        mult_work: modelConfigs[selectedModel].work,
        mult_tangible: modelConfigs[selectedModel].tangible,
        mult_intangible: modelConfigs[selectedModel].intangible,
        mult_others: modelConfigs[selectedModel].others,
        use_log_risk: useLogRisk, // Sincronizado con el UI
        current_valuation: 0
      });

      if (error) throw error;

      setIsOpen(false);
      setName("");
      window.location.reload(); 
      
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error: " + (error.message || "Could not create project"));
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
        // Z-index alto y centrado para evitar cortes por el banner
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B0F1A]/95 backdrop-blur-md p-4 text-white">
          <div className="relative w-full max-w-5xl bg-[#111827] border border-slate-800 rounded-[32px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
            
            {/* Cabecera Fija */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Step {step} of 2</span>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contenido Desplazable (Scrollable) para evitar que se corte */}
            <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
              {step === 1 ? (
                <div className="max-w-md mx-auto py-10">
                  <h2 className="text-3xl font-black mb-2 text-center">Project Name</h2>
                  <p className="text-slate-400 mb-8 text-center font-medium">Give your new project a clear name.</p>
                  
                  <input
                    autoFocus
                    type="text"
                    placeholder="Ex: My Awesome Company..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl bg-slate-800/50 border border-slate-700 p-4 mb-8 focus:border-emerald-500 outline-none transition-all font-bold text-white text-lg"
                  />

                  <button 
                    disabled={!name.trim()}
                    onClick={() => setStep(2)}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#0B0F1A] py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all"
                  >
                    Select Model <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <div className="text-center mb-10">
                    <h2 className="text-4xl font-black mb-2">Choose your model</h2>
                    <p className="text-slate-400 font-medium">Select the logic for your equity distribution.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {/* CUSTOM MODEL */}
                    <div 
                      onClick={() => setSelectedModel('CUSTOM')}
                      className={`relative p-6 rounded-3xl border-2 transition-all cursor-pointer ${selectedModel === 'CUSTOM' ? 'border-slate-600 bg-slate-800/40' : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'}`}
                    >
                      <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center mb-6"><Settings className="text-slate-400 w-5 h-5" /></div>
                      <h3 className="text-xl font-black mb-2">Custom Model</h3>
                      <p className="text-slate-500 text-sm font-medium">Total control for complex setups.</p>
                    </div>

                    {/* JUST SPLIT (RECOMMENDED) */}
                    <div 
                      onClick={() => setSelectedModel('JUST_SPLIT')}
                      className={`relative p-6 rounded-3xl border-2 transition-all cursor-pointer ${selectedModel === 'JUST_SPLIT' ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'}`}
                    >
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-[#0B0F1A] text-[10px] font-black px-3 py-1 rounded-full uppercase">Recommended</div>
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6"><ShieldCheck className="text-emerald-500 w-5 h-5" /></div>
                      <h3 className="text-xl font-black mb-2">Just Split Model</h3>
                      <p className="text-emerald-500 text-sm font-bold mb-6 italic">The Industry Standard</p>
                      
                      {/* Visualización de multiplicadores */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Capital (Cash)</span>
                          <span className="font-black text-white">x4</span>
                        </div>
                        <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                          <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">Work & IP</span>
                          <span className="font-black text-white">x2</span>
                        </div>
                      </div>

                      {/* Logarithmic Risk Toggle */}
                      <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-slate-800">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Logarithmic Risk</span>
                        <input 
                          type="checkbox" 
                          checked={useLogRisk} 
                          onChange={(e) => setUseLogRisk(e.target.checked)}
                          className="w-4 h-4 accent-emerald-500" 
                        />
                      </div>
                    </div>

                    {/* FLAT MODEL */}
                    <div 
                      onClick={() => setSelectedModel('FLAT')}
                      className={`relative p-6 rounded-3xl border-2 transition-all cursor-pointer ${selectedModel === 'FLAT' ? 'border-purple-500 bg-purple-500/5' : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'}`}
                    >
                      <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6"><Scale className="text-purple-400 w-5 h-5" /></div>
                      <h3 className="text-xl font-black mb-2">Flat Model</h3>
                      <p className="text-purple-400 text-sm font-bold mb-6 italic">Simple fixed split.</p>
                      <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                          <span className="text-[9px] font-black text-purple-400 uppercase tracking-tighter">All Multipliers</span>
                          <span className="font-black text-white">x1</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pie de página Fijo */}
            <div className="p-8 border-t border-slate-800 bg-[#0B0F1A]/50 flex gap-4">
              <button onClick={() => setStep(1)} className="px-6 py-4 rounded-2xl font-bold text-slate-500 hover:text-white flex items-center gap-2 transition-colors">
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              <button 
                onClick={handleCreate}
                disabled={loading || step === 1}
                className="flex-1 bg-white text-[#0B0F1A] py-4 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all flex items-center justify-center"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Launch Project 🚀"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}