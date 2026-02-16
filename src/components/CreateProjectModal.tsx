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
  console.log("ID Mensual detectado:", process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID);

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [model, setModel] = useState("just_split");
  const [subscriptionPlan, setSubscriptionPlan] = useState<"monthly" | "annual" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectMonthly = () => setSubscriptionPlan("monthly");
  const handleSelectAnnual = () => setSubscriptionPlan("annual");
  const isPaymentReady = subscriptionPlan !== null && !loading;

  const [mults, setMults] = useState({
    cash: 4,
    work: 2,
    tangible: 1,
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
    if (subscriptionPlan === null) {
      alert("Please select a plan first.");
      return;
    }

    const priceId =
      subscriptionPlan === "monthly"
        ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID;
    console.log("Price ID being sent:", priceId);

    setLoading(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        alert("You must be logged in to continue.");
        setLoading(false);
        return;
      }

      const apiUrl = "/api/stripe/checkout";
      const body = {
        projectName: name.trim(),
        priceId: priceId ?? "",
        userId: user.id,
        email: user.email ?? "",
      };
      console.log("Sending to API...", { apiUrl, projectName: name, priceId });
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let data: { url?: string; error?: string };
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      console.log("API response:", data);

      if (!res.ok) {
        alert(data?.error || "Error starting payment.");
        setLoading(false);
        return;
      }

      if (data.url && typeof data.url === "string") {
        console.log("Redirecting to:", data.url);
        window.location.assign(data.url);
        return;
      }

      throw new Error("API did not return a Stripe URL: " + JSON.stringify(data));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[CreateProject] Error:", err);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className={`relative w-full ${step === 1 ? 'max-w-lg' : 'max-w-5xl'} bg-white rounded-[32px] shadow-2xl p-6 md:p-8 text-slate-900 transition-all duration-300 overflow-y-auto max-h-[95vh]`}>
        
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors z-20">
          <X className="w-5 h-5" />
        </button>

        {step === 1 ? (
          <form onSubmit={handleNext} className="py-8 space-y-6 text-center animate-in fade-in zoom-in duration-300">
            <div>
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Rocket className="w-7 h-7 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-black mb-1 text-slate-900 tracking-tight">Name your venture</h2>
                <p className="text-slate-600 font-bold text-sm">What is the name of this new project?</p>
            </div>
            
            <input 
              autoFocus type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apollo Dynamics"
              className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-lg text-center placeholder:text-slate-300 text-slate-800"
              required
            />

            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-xl font-black hover:bg-emerald-600 transition-all group shadow-lg active:scale-[0.98]">
                Continue to Logic <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="text-center pt-2">
              <h2 className="text-2xl font-black mb-1 uppercase tracking-tight text-slate-900">Choose your logic</h2>
              <p className="text-slate-600 font-bold text-sm">Select the best multiplier set for your team.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* CARD: CUSTOM */}
              <div onClick={() => setModel('custom')} className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col ${model === 'custom' ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500/20' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'}`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${model === 'custom' ? 'bg-blue-500 text-white' : 'bg-white text-slate-400 shadow-sm'}`}><Settings className="w-4 h-4" /></div>
                    <span className="font-black text-slate-800">Custom</span>
                </div>
                <div className="space-y-2 mb-4 flex-1">
                    {['Cash', 'Work', 'Intangible', 'Tangible', 'Others'].map((label) => (
                        <div key={label} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-100 shadow-sm">
                            <span className="text-[9px] font-black uppercase text-slate-500">{label}</span>
                            <input 
                                type="number" 
                                value={mults[label.toLowerCase() as keyof typeof mults]}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setMults({...mults, [label.toLowerCase()]: parseFloat(e.target.value) || 0})}
                                className="w-10 bg-transparent text-right font-black text-blue-700 outline-none rounded"
                            />
                        </div>
                    ))}
                </div>
                <div className="mt-auto text-center">
                  <p className="text-[9px] font-black text-slate-800 uppercase tracking-wider">LOGARITHMIC RISK (OPTIONAL)</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">MANUAL CONTROL</p>
                </div>
              </div>

              {/* CARD: JUST SPLIT */}
              <div onClick={() => setModel('just_split')} className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col ${model === 'just_split' ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/20' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'}`}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase shadow-lg z-10">Best Choice</div>
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${model === 'just_split' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 shadow-sm'}`}><ShieldCheck className="w-4 h-4" /></div>
                    <span className="font-black text-slate-800">Just Split Model</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4 flex-1">
                    {[{l:'CASH',v:'x4'},{l:'WORK',v:'x2'},{l:'ASSETS',v:'x2'},{l:'IP',v:'x2'}].map(item => (
                        <div key={item.l} className="p-3 bg-white rounded-lg border border-slate-100 text-center shadow-sm">
                            <span className="text-[8px] font-black text-emerald-600 uppercase block mb-0.5">{item.l}</span>
                            <span className="text-lg font-black tracking-tighter text-slate-900">{item.v}</span>
                        </div>
                    ))}
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-100 flex justify-between items-center mb-4 shadow-sm">
                    <span className="text-[9px] font-black text-slate-800 uppercase">LOGARITHMIC RISK</span>
                    <div className="w-3.5 h-3.5 bg-emerald-500 rounded-sm shadow-sm shadow-emerald-500/30"></div>
                </div>
                <p className="text-[9px] text-center text-emerald-700 font-black uppercase tracking-widest underline decoration-2 underline-offset-4">Recommended</p>
              </div>

              {/* CARD: FLAT MODEL */}
              <div onClick={() => setModel('flat')} className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col ${model === 'flat' ? 'border-purple-500 bg-purple-50/20 ring-1 ring-purple-500/20' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'}`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${model === 'flat' ? 'bg-purple-500 text-white' : 'bg-white text-slate-400 shadow-sm'}`}><Scale className="w-4 h-4" /></div>
                    <span className="font-black text-slate-800">Flat Model</span>
                </div>
                <div className="space-y-3 mb-4 flex-1">
                    <div className="p-5 bg-white rounded-xl border border-slate-100 text-center shadow-sm">
                        <span className="text-[8px] font-black text-purple-600 uppercase block mb-1">ALL CONTRIBUTIONS</span>
                        <span className="text-3xl font-black tracking-tighter text-slate-900">x1</span>
                    </div>
                    <div className="p-3 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 text-[9px] font-bold italic text-slate-500 text-center leading-tight">
                        Simple linear split where every unit is treated as equal.
                    </div>
                </div>
                <p className="text-[9px] text-center text-purple-700 font-black uppercase tracking-widest mt-auto">Fixed split</p>
              </div>

            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <p className="text-sm font-bold text-slate-700">Select your subscription plan</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleSelectMonthly}
                  className={`rounded-xl p-4 text-left transition-all ${
                    subscriptionPlan === "monthly"
                      ? "border-[3px] border-blue-600 bg-blue-50 ring-2 ring-blue-600/40 shadow-md"
                      : "border-2 border-slate-200 bg-slate-50/50 hover:border-slate-300"
                  }`}
                >
                  <span className="font-bold text-slate-900 block">Monthly</span>
                  <span className="text-lg font-black text-slate-800">19,99€</span>
                  <span className="text-sm font-medium text-slate-500">/month</span>
                </button>
                <button
                  type="button"
                  onClick={handleSelectAnnual}
                  className={`rounded-xl p-4 text-left transition-all ${
                    subscriptionPlan === "annual"
                      ? "border-[3px] border-blue-600 bg-blue-50 ring-2 ring-blue-600/40 shadow-md"
                      : "border-2 border-slate-200 bg-slate-50/50 hover:border-slate-300"
                  }`}
                >
                  <span className="font-bold text-slate-900 block">Annual</span>
                  <span className="text-lg font-black text-slate-800">199,99€</span>
                  <span className="text-sm font-medium text-slate-500">/year</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> BACK
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || subscriptionPlan === null}
                  className={`px-8 py-3.5 rounded-xl font-black transition-all flex items-center gap-2 shadow-lg active:scale-[0.98] ${
                    isPaymentReady
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                      : "bg-slate-300 text-slate-500 cursor-not-allowed disabled:opacity-70"
                  }`}
                >
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Redirecting...</> : <>Proceed to Payment <ArrowRight className="w-4 h-4" /></>}
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}