"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, Loader2, ShieldCheck, Scale, Settings, ArrowRight, ArrowLeft, Rocket } from "lucide-react";
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

  // Estados para los multiplicadores del modo Custom
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
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-6xl bg-white rounded-[40px] shadow-2xl p-10 text-slate-900 overflow-hidden animate-in fade-in zoom-in duration-300">
        
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-6 h-6" />
        </button>

        {step === 1 ? (
          <form onSubmit={handleNext} className="max-w-md mx-auto py-16 space-y-10 text-center">
            <div>
                <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Rocket className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-4xl font-black mb-2 tracking-tight">Name your venture</h2>
                <p className="text-slate-500 font-medium">What is the name of this new project?</p>
            </div>
            
            <input 
              autoFocus type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apollo Dynamics"
              className="w-full px-8 py-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-2xl text-center"
              required
            />

            <button type="submit" className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-emerald-600 transition-all group">
                Continue to Logic <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        ) : (
          <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter">Choose your logic</h2>
              <p className="text-slate-500 font-medium">Select the best multiplier set for your team.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* TARJETA CUSTOM */}
              <div onClick={() => setModel('custom')} className={`relative p-8 rounded-[32px] border-2 transition-all cursor-pointer flex flex-col ${model === 'custom' ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'}`}>
                <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-lg ${model === 'custom' ? 'bg-blue-500 text-white' : 'bg-white text-slate-400 shadow-sm'}`}><Settings className="w-4 h-4" /></div>
                    <span className="font-bold text-lg">Custom</span>
                </div>
                <div className="space-y-3 mb-8 flex-1">
                    {['Cash', 'Work', 'Intangible', 'Tangible', 'Others'].map((label) => (
                        <div key={label} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                            <span className="text-[10px] font-black uppercase text-slate-400">{label}</span>
                            <input 
                                type="number" 
                                value={mults[label.toLowerCase() as keyof typeof mults]}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setMults({...mults, [label.toLowerCase()]: parseFloat(e.target.value) || 0})}
                                className="w-12 bg-transparent text-right font-black text-blue-600 outline-none focus:bg-blue-50 rounded px-1"
                            />
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-center text-slate-400 uppercase font-bold tracking-widest mt-4">Logarithmic Risk (Optional)</p>
                <p className="text-[10px] text-center text-slate-300 uppercase font-bold tracking-widest mt-1">Manual control</p>
              </div>

              {/* TARJETA JUST SPLIT */}
              <div onClick={() => setModel('just_split')} className={`relative p-8 rounded-[32px] border-2 transition-all cursor-pointer flex flex-col ${model === 'just_split' ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'}`}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase shadow-lg">Best Choice</div>
                <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-lg ${model === 'just_split' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 shadow-sm'}`}><ShieldCheck className="w-4 h-4" /></div>
                    <span className="font-bold text-lg">Just Split Model</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6 flex-1">
                    {[{l:'CASH',v:'x4'},{l:'WORK',v:'x2'},{l:'ASSETS',v:'x2'},{l:'IP',v:'x2'}].map(item => (
                        <div key={item.l} className="p-4 bg-white rounded-xl border border-slate-100 text-center shadow-sm">
                            <span className="text-[8px] font-black text-emerald-500 uppercase block mb-1">{item.l}</span>
                            <span className="text-xl font-black tracking-tighter text-slate-900">{item.v}</span>
                        </div>
                    ))}
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-100 flex justify-between items-center mb-6 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Logarithmic Risk</span>
                    <div className="w-4 h-4 bg-emerald-500 rounded-sm"></div>
                </div>
                <p className="text-[10px] text-center text-emerald-600 uppercase font-bold tracking-widest underline decoration-2 underline-offset-4">Recommended</p>
              </div>

              {/* TARJETA FLAT MODEL */}
              <div onClick={() => setModel('flat')} className={`relative p-8 rounded-[32px] border-2 transition-all cursor-pointer flex flex-col ${model === 'flat' ? 'border-purple-500 bg-purple-50/30' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'}`}>
                <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-lg ${model === 'flat' ? 'bg-purple-500 text-white' : 'bg-white text-slate-400 shadow-sm'}`}><Scale className="w-4 h-4" /></div>
                    <span className="font-bold text-lg">Flat Model</span>
                </div>
                <div className="space-y-3 mb-8 flex-1">
                    <div className="p-6 bg-white rounded-xl border border-slate-100 text-center shadow-sm">
                        <span className="text-[8px] font-black text-purple-500 uppercase block mb-1">ALL CONTRIBUTIONS</span>
                        <span className="text-3xl font-black tracking-tighter text-slate-900">x1</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-[10px] font-medium italic text-slate-400 text-center">
                        Simple linear split where every unit is equal.
                    </div>
                </div>
                <p className="text-[10px] text-center text-purple-600 uppercase font-bold tracking-widest mt-auto">Fixed split</p>
              </div>

            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> BACK
                </button>
                <button onClick={handleSubmit} disabled={loading} className="px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all flex items-center gap-3 shadow-xl shadow-emerald-100">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Launch Project <Rocket className="w-5 h-5" /></>}
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}