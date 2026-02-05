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
      <div className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl p-10 text-slate-900 overflow-hidden animate-in fade-in zoom-in duration-300">
        
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-6 h-6" />
        </button>

        {step === 1 ? (
          <form onSubmit={handleNext} className="space-y-8 py-4">
            <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-4 block">Step 01/02</span>
                <h2 className="text-3xl font-black mb-2 tracking-tight">Name your project</h2>
                <p className="text-slate-500 font-medium">Give a name to your new venture to start tracking.</p>
            </div>
            
            <input 
              autoFocus type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apollo Dynamics"
              className="w-full px-8 py-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-2xl"
              required
            />

            <button type="submit" className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl">
                Continue to Models <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div>
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 mb-4 transition-colors">
                <ArrowLeft className="w-3 h-3" /> Back to name
              </button>
              <h2 className="text-3xl font-black mb-1 tracking-tight">Choose your DNA</h2>
              <p className="text-slate-500 font-medium italic">How should we value the risk of each founder?</p>
            </div>

            <div className="space-y-4">
              
              {/* JUST SPLIT */}
              <button onClick={() => setModel('just_split')} className={`w-full p-6 rounded-[28px] border-2 transition-all text-left flex items-start gap-5 ${model === 'just_split' ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}>
                <div className={`p-4 rounded-2xl ${model === 'just_split' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400'} shadow-sm`}>
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                        <p className="font-black text-lg">Just Split</p>
                        {model === 'just_split' && <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"></div></div>}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">The Fair Standard</p>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Multiplies Cash x4 and Work x2. <span className="font-bold text-slate-700 underline underline-offset-2">Logarithmic Risk (Optional)</span>
                    </p>
                </div>
              </button>

              {/* FLAT MODEL */}
              <button onClick={() => setModel('flat')} className={`w-full p-6 rounded-[28px] border-2 transition-all text-left flex items-start gap-5 ${model === 'flat' ? 'border-purple-500 bg-purple-50/30' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}>
                <div className={`p-4 rounded-2xl ${model === 'flat' ? 'bg-purple-500 text-white' : 'bg-white text-slate-400'} shadow-sm`}>
                    <Scale className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                        <p className="font-black text-lg">Flat Model</p>
                        {model === 'flat' && <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"></div></div>}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-purple-600 mb-2">Absolute Equality</p>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">1 unit of value = 1 unit of equity. No risk multipliers applied.</p>
                </div>
              </button>

              {/* CUSTOM */}
              <button onClick={() => setModel('custom')} className={`w-full p-6 rounded-[28px] border-2 transition-all text-left flex items-start gap-5 ${model === 'custom' ? 'border-blue-500 bg-blue-50/30' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}>
                <div className={`p-4 rounded-2xl ${model === 'custom' ? 'bg-blue-500 text-white' : 'bg-white text-slate-400'} shadow-sm`}>
                    <Settings className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                        <p className="font-black text-lg">Custom</p>
                        {model === 'custom' && <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"></div></div>}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">Your Rules</p>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Set your own multipliers later. <span className="font-bold text-slate-700 underline underline-offset-2">Logarithmic Risk (Optional)</span>
                    </p>
                </div>
              </button>

            </div>

            <button onClick={handleSubmit} disabled={loading} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Launch Project"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}