"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, Loader2, ArrowRight, ArrowLeft, Rocket } from "lucide-react";
import type { Project } from "@/types/database";

const STRIPE_MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || "";
const STRIPE_ANNUAL_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID || "";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

const JUST_SPLIT_MULTS = { cash: 4, work: 2, tangible: 2, intangible: 2, others: 1 };

export function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [subscriptionPlan, setSubscriptionPlan] = useState<"monthly" | "annual" | null>(null);
  const [selectedPriceId, setSelectedPriceId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSelectMonthly = () => {
    setSubscriptionPlan("monthly");
    setSelectedPriceId(STRIPE_MONTHLY_PRICE_ID);
  };
  const handleSelectAnnual = () => {
    setSubscriptionPlan("annual");
    setSelectedPriceId(STRIPE_ANNUAL_PRICE_ID);
  };
  const isPaymentReady = subscriptionPlan !== null && !loading;

  const supabase = createClient();

  if (!isOpen) return null;

  const goNext = () => {
    if (step < 2) setStep((s) => s + 1);
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
      const body = {
        projectName: projectNameTrimmed,
        priceId,
        userId: user.id,
        email: user.email ?? "",
        model_type: "JUST_SPLIT",
        mult_cash: JUST_SPLIT_MULTS.cash,
        mult_work: JUST_SPLIT_MULTS.work,
        mult_tangible: JUST_SPLIT_MULTS.tangible,
        mult_intangible: JUST_SPLIT_MULTS.intangible,
        mult_others: JUST_SPLIT_MULTS.others,
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let data: { url?: string; error?: string } = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        const errorMsg = data?.error || response.statusText;
        console.error("[CreateProject] Checkout API failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorMsg,
          body: data,
        });
        throw new Error(errorMsg || `Server error: ${response.status}`);
      }

      if (data.url && typeof data.url === "string") {
        window.location.href = data.url;
        return;
      }

      console.error("[CreateProject] API OK but no checkout URL returned:", data);
      throw new Error("API did not return a Stripe URL: " + JSON.stringify(data));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[CreateProject] Payment error:", message, error);
    } finally {
      setLoading(false);
    }
  };

  const modalMaxWidth = "md:max-w-2xl";
  const modalPadding = "p-4 sm:p-6 md:p-8";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 sm:p-4">
      <div className={`relative w-[95%] max-w-full ${modalMaxWidth} mx-auto bg-white rounded-2xl sm:rounded-[32px] shadow-2xl ${modalPadding} text-slate-900 transition-all duration-300 overflow-y-auto max-h-[95vh]`}>
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

        {/* STEP 2: PAYMENT PLAN */}
        {step === 2 && (
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
                <span className="text-xs font-medium text-emerald-600 block">7-day free trial included</span>
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
                <span className="text-xs font-bold text-emerald-600 block uppercase tracking-wider">Save 2 months</span>
                <span className="text-xs font-medium text-emerald-600 block">7-day free trial included</span>
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