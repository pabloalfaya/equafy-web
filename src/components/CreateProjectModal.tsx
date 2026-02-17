"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, Loader2, ShieldCheck, Scale, Settings, ArrowRight, ArrowLeft, Rocket } from "lucide-react";
import type { Project } from "@/types/database";

const STRIPE_MONTHLY_PRICE_ID = "price_1SyaxgBmr0mjMQ09JTxc07Sh";
const STRIPE_ANNUAL_PRICE_ID = "price_1SyaxgBmr0mjMQ09DH21w1z3";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

export function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [model, setModel] = useState("just_split");
  const [subscriptionPlan, setSubscriptionPlan] = useState<"monthly" | "annual" | null>(null);
  const [selectedPriceId, setSelectedPriceId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSelectMonthly = () => {
    setSubscriptionPlan("monthly");
    setSelectedPriceId("price_1SyaxgBmr0mjMQ09JTxc07Sh");
    console.log("Plan selected:", "price_1SyaxgBmr0mjMQ09JTxc07Sh");
  };
  const handleSelectAnnual = () => {
    setSubscriptionPlan("annual");
    setSelectedPriceId("price_1SyaxgBmr0mjMQ09DH21w1z3");
    console.log("Plan selected:", "price_1SyaxgBmr0mjMQ09DH21w1z3");
  };
  const isPaymentReady = subscriptionPlan !== null && !loading;

  const [mults, setMults] = useState({
    cash: 4,
    work: 2,
    tangible: 2,
    intangible: 2,
    others: 1
  });

  const supabase = createClient();

  const JUST_SPLIT_MULTS = { cash: 4, work: 2, tangible: 2, intangible: 2, others: 1 };
  const FLAT_MULTS = { cash: 1, work: 1, tangible: 1, intangible: 1, others: 1 };

  const handleModelSelect = (modelType: "flat" | "just_split" | "custom") => {
    setModel(modelType);
    switch (modelType) {
      case "flat":
        setMults(FLAT_MULTS);
        break;
      case "just_split":
        setMults(JUST_SPLIT_MULTS);
        break;
      case "custom":
        break;
      default:
        break;
    }
  };

  if (!isOpen) return null;

  const goNext = () => {
    if (step < 3) setStep((s) => s + 1);
  };
  const goBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };
  const canGoNextFromStep1 = name.trim().length > 0;
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canGoNextFromStep1) setStep(2);
  };

  const handlePayment = async () => {
    try {
      const priceId =
        subscriptionPlan === "monthly"
          ? STRIPE_MONTHLY_PRICE_ID
          : subscriptionPlan === "annual"
            ? STRIPE_ANNUAL_PRICE_ID
            : selectedPriceId || "";
      if (!priceId) {
        throw new Error("Please select a plan (Monthly or Annual).");
      }

      setLoading(true);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setLoading(false);
        throw new Error("You must be logged in to continue.");
      }

      const apiUrl = "/api/stripe/checkout";
      const projectNameTrimmed = name.trim();
      const modelTypeDb = model === "flat" ? "FLAT" : model === "just_split" ? "JUST_SPLIT" : "CUSTOM";
      const body = {
        projectName: projectNameTrimmed,
        priceId,
        userId: user.id,
        email: user.email ?? "",
        model_type: modelTypeDb,
        mult_cash: mults.cash,
        mult_work: mults.work,
        mult_tangible: mults.tangible,
        mult_intangible: mults.intangible,
        mult_others: mults.others,
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Server error: " + response.statusText);
      }

      let data: { url?: string; error?: string };
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (data.url && typeof data.url === "string") {
        window.location.href = data.url;
        return;
      }

      throw new Error("API did not return a Stripe URL: " + JSON.stringify(data));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[CreateProject] Payment error:", message);
    } finally {
      setLoading(false);
    }
  };

  const modalMaxWidth = step === 2 ? "md:max-w-5xl" : "md:max-w-2xl";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4">
      <div className={`relative w-[95%] max-w-full ${modalMaxWidth} mx-auto bg-white rounded-2xl sm:rounded-[32px] shadow-2xl p-4 sm:p-6 md:p-8 text-slate-900 transition-all duration-300 overflow-y-auto max-h-[95vh]`}>
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors z-20">
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: PROJECT NAME */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="py-8 space-y-6 text-center animate-in fade-in zoom-in duration-300">
            <div>
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-7 h-7 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black mb-1 text-slate-900 tracking-tight">Project name</h2>
              <p className="text-slate-600 font-bold text-sm">What is the name of this new project?</p>
            </div>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apollo Dynamics"
              className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-lg text-center placeholder:text-slate-300 text-slate-800"
            />
            <button
              type="submit"
              disabled={!canGoNextFromStep1}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-xl font-black hover:bg-emerald-600 transition-all group shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        )}

        {/* STEP 2: EQUITY MODEL (LOGIC) */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="text-center pt-2">
              <h2 className="text-2xl font-black mb-1 uppercase tracking-tight text-slate-900">Equity model</h2>
              <p className="text-slate-600 font-bold text-sm">Select the multiplier set for your team.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div onClick={() => handleModelSelect("custom")} className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col ${model === "custom" ? "border-blue-500 bg-blue-50/30 ring-1 ring-blue-500/20" : "border-slate-100 bg-slate-50/50 hover:border-slate-200"}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${model === "custom" ? "bg-blue-500 text-white" : "bg-white text-slate-400 shadow-sm"}`}><Settings className="w-4 h-4" /></div>
                  <span className="font-black text-slate-800">Custom</span>
                </div>
                <div className="space-y-2 mb-4 flex-1">
                  {["Cash", "Work", "Intangible", "Tangible", "Others"].map((label) => (
                    <div key={label} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-100 shadow-sm">
                      <span className="text-[9px] font-black uppercase text-slate-500">{label}</span>
                      <input
                        type="number"
                        value={mults[label.toLowerCase() as keyof typeof mults]}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setMults({ ...mults, [label.toLowerCase()]: parseFloat(e.target.value) || 0 })}
                        className="w-10 bg-transparent text-right font-black text-blue-700 outline-none rounded"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-auto text-center">
                  <p className="text-[9px] font-black text-slate-800 uppercase tracking-wider">Manual control</p>
                </div>
              </div>
              <div onClick={() => handleModelSelect("just_split")} className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col ${model === "just_split" ? "border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/20" : "border-slate-100 bg-slate-50/50 hover:border-slate-200"}`}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase shadow-lg z-10">Best choice</div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${model === "just_split" ? "bg-emerald-500 text-white" : "bg-white text-slate-400 shadow-sm"}`}><ShieldCheck className="w-4 h-4" /></div>
                  <span className="font-black text-slate-800">Just Split Model</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4 flex-1">
                  {[{ l: "CASH", v: "x4" }, { l: "WORK", v: "x2" }, { l: "ASSETS", v: "x2" }, { l: "IP", v: "x2" }].map((item) => (
                    <div key={item.l} className="p-3 bg-white rounded-lg border border-slate-100 text-center shadow-sm">
                      <span className="text-[8px] font-black text-emerald-600 uppercase block mb-0.5">{item.l}</span>
                      <span className="text-lg font-black tracking-tighter text-slate-900">{item.v}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-center text-emerald-700 font-black uppercase tracking-widest">Recommended</p>
              </div>
              <div onClick={() => handleModelSelect("flat")} className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col ${model === "flat" ? "border-purple-500 bg-purple-50/20 ring-1 ring-purple-500/20" : "border-slate-100 bg-slate-50/50 hover:border-slate-200"}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${model === "flat" ? "bg-purple-500 text-white" : "bg-white text-slate-400 shadow-sm"}`}><Scale className="w-4 h-4" /></div>
                  <span className="font-black text-slate-800">Flat Model</span>
                </div>
                <div className="space-y-3 mb-4 flex-1">
                  <div className="p-5 bg-white rounded-xl border border-slate-100 text-center shadow-sm">
                    <span className="text-[8px] font-black text-purple-600 uppercase block mb-1">All contributions</span>
                    <span className="text-3xl font-black tracking-tighter text-slate-900">x1</span>
                  </div>
                  <div className="p-3 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 text-[9px] font-bold italic text-slate-500 text-center leading-tight">
                    Simple linear split where every unit is treated as equal.
                  </div>
                </div>
                <p className="text-[9px] text-center text-purple-700 font-black uppercase tracking-widest mt-auto">Fixed split</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={goBack} className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-900 transition-colors min-w-0">
                <ArrowLeft className="w-4 h-4 flex-shrink-0" /> Back
              </button>
              <button type="button" onClick={goNext} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl font-black bg-slate-900 text-white hover:bg-emerald-600 transition-all shadow-lg active:scale-[0.98]">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT PLAN */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="text-center pt-2">
              <h2 className="text-2xl font-black mb-1 uppercase tracking-tight text-slate-900">Payment plan</h2>
              <p className="text-slate-600 font-bold text-sm">Select your subscription.</p>
            </div>
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
                <span className="text-lg font-black text-slate-800 block">19,99€</span>
                <span className="text-xs font-medium text-emerald-600 block">14-day free trial included</span>
                <span className="text-sm font-medium text-slate-500">/month billed monthly</span>
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
                <span className="text-lg font-black text-slate-800 block">199,99€</span>
                <span className="text-xs font-medium text-emerald-600 block">14-day free trial included</span>
                <span className="text-sm font-medium text-slate-500">/year billed annually</span>
              </button>
            </div>
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={goBack} className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-900 transition-colors min-w-0">
                <ArrowLeft className="w-4 h-4 flex-shrink-0" /> Back
              </button>
              <button
                type="button"
                onClick={handlePayment}
                disabled={loading || subscriptionPlan === null}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl font-black transition-all shadow-lg active:scale-[0.98] ${
                  isPaymentReady ? "bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer" : "bg-slate-300 text-slate-500 cursor-not-allowed disabled:opacity-70"
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