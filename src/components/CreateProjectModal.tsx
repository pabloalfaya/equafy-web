"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, FolderPlus, Settings, Scale, ShieldCheck, ChevronRight, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProjectModel } from "@/types/database";

export function CreateProjectModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); // Paso 1: Nombre, Paso 2: Modelo
  const [name, setName] = useState("");
  const [selectedModel, setSelectedModel] = useState<ProjectModel>("JUST_SPLIT");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Session not found");

      // Configuramos los multiplicadores según la selección del usuario
      const modelConfigs = {
        JUST_SPLIT: { cash: 4.0, labor: 2.0 },
        FLAT: { cash: 1.0, labor: 1.0 },
        CUSTOM: { cash: 4.0, labor: 2.0 }
      };

      const { error } = await supabase.from("projects").insert({
        name: name,
        owner_id: user.id,
        model_type: selectedModel,
        mult_cash: modelConfigs[selectedModel].cash,
        mult_labor: modelConfigs[selectedModel].labor,
        mult_ip: 2.0,
        mult_assets: 1.0,
        use_log_risk: false, // Logarithmic Risk desactivado por ahora
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0F1A]/90 backdrop-blur-md p-4">
          <div className="w-full max-w-4xl bg-[#111827] border border-slate-800 rounded-[32px] p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            
            {step === 1 ? (
              /* PASO 1: NOMBRE DEL PROYECTO */
              <div className="max-w-md mx-auto py-10">
                <h2 className="text-3xl font-black text-white mb-2 text-center">Project Name</h2>
                <p className="text-slate-400 mb-8 text-center font-medium">Give your new project a clear name.</p>
                
                <input
                  autoFocus
                  type="text"
                  placeholder="Ex: My Awesome Company..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl bg-slate-800/50 border border-slate-700 p-4 mb-8 focus:border-emerald-500 outline-none transition-all font-bold text-white text-lg"
                />

                <div className="flex gap-3">
                  <button onClick={() => setIsOpen(false)} className="flex-1 py-4 font-bold text-slate-400 hover:bg-white/5 rounded-2xl transition-colors">
                    Cancel
                  </button>
                  <button 
                    disabled={!name.trim()}
                    onClick={() => setStep(2)}
                    className="flex-[2] bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#0B0F1A] py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all"
                  >
                    Select Model <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              /* PASO 2: SELECCIÓN DE MODELO */
              <div className="animate-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-10">
                  <h2 className="text-4xl font-black text-white mb-2">Choose your model</h2>
                  <p className="text-slate-400 font-medium">Select the logic for your equity distribution.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  {/* CUSTOM MODEL */}
                  <div 
                    onClick={() => setSelectedModel('CUSTOM')}
                    className={`relative p-6 rounded-3xl border-2 transition-all cursor-pointer ${selectedModel === 'CUSTOM' ? 'border-slate-600 bg-slate-800/40' : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'}`}
                  >
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center mb-6"><Settings className="text-slate-400 w-5 h-5" /></div>
                    <h3 className="text-xl font-black text-white mb-2">Custom Model</h3>
                    <p className="text-slate-500 text-sm font-medium mb-6">Total control for complex setups.</p>
                    <ul className="space-y-3 text-slate-400 text-xs font-bold">
                      <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-slate-600" /> Fully Editable Multipliers</li>
                      <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-slate-600" /> Manual Configuration</li>
                    </ul>
                  </div>

                  {/* JUST SPLIT (RECOMMENDED) */}
                  <div 
                    onClick={() => setSelectedModel('JUST_SPLIT')}
                    className={`relative p-6 rounded-3xl border-2 transition-all cursor-pointer ${selectedModel === 'JUST_SPLIT' ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)]' : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'}`}
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-[#0B0F1A] text-[10px] font-black px-3 py-1 rounded-full uppercase">Recommended</div>
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6"><ShieldCheck className="text-emerald-500 w-5 h-5" /></div>
                    <h3 className="text-xl font-black text-white mb-2">Just Split Model</h3>
                    <p className="text-emerald-500 text-sm font-bold mb-6">The Industry Standard</p>
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                        <span className="text-[10px] font-black text-emerald-500 uppercase">Capital (Cash)</span>
                        <span className="text-white font-black text-lg">x4</span>
                      </div>
                      <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                        <span className="text-[10px] font-black text-blue-400 uppercase">Work & IP</span>
                        <span className="text-white font-black text-lg">x2</span>
                      </div>
                    </div>
                  </div>

                  {/* FLAT MODEL */}
                  <div 
                    onClick={() => setSelectedModel('FLAT')}
                    className={`relative p-6 rounded-3xl border-2 transition-all cursor-pointer ${selectedModel === 'FLAT' ? 'border-purple-500 bg-purple-500/5' : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'}`}
                  >
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6"><Scale className="text-purple-400 w-5 h-5" /></div>
                    <h3 className="text-xl font-black text-white mb-2">Flat Model</h3>
                    <p className="text-purple-400 text-sm font-bold mb-6 italic underline">Simple fixed split.</p>
                    <ul className="space-y-3 text-slate-400 text-xs font-bold">
                      <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-purple-600" /> Equal Multipliers (x1)</li>
                      <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-purple-600" /> Good for Service Agencies</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:bg-white/5 flex items-center gap-2 transition-colors">
                    <ChevronLeft className="w-5 h-5" /> Back
                  </button>
                  <button 
                    onClick={handleCreate}
                    disabled={loading}
                    className="flex-1 bg-white text-slate-900 py-4 rounded-2xl font-black text-xl hover:bg-slate-200 transition-all flex items-center justify-center"
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