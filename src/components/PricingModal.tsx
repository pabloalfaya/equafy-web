"use client";

import { useState } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";

const PRICE_MONTHLY = "19.99";
const PRICE_YEARLY = "199.99";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priceMonthlyId = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY ?? "";
  const priceYearlyId = process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY ?? "";

  const handleStartTrial = async () => {
    const priceId = plan === "monthly" ? priceMonthlyId : priceYearlyId;
    if (!priceId) {
      setError("Price not configured. Please contact support.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Checkout failed");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 animate-in zoom-in duration-200 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">
              Start your 7-day free trial
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggle Monthly / Yearly */}
        <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200 mb-6">
          <button
            type="button"
            onClick={() => setPlan("monthly")}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
              plan === "monthly"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setPlan("yearly")}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
              plan === "yearly"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Yearly
          </button>
        </div>

        {/* Price display */}
        <div className="mb-6 p-6 rounded-2xl bg-slate-50 border border-slate-100">
          {plan === "monthly" ? (
            <p className="text-2xl font-black text-slate-900">
              {PRICE_MONTHLY}€<span className="text-base font-bold text-slate-500">/mo</span>
            </p>
          ) : (
            <div>
              <p className="text-2xl font-black text-slate-900">
                {PRICE_YEARLY}€<span className="text-base font-bold text-slate-500">/yr</span>
              </p>
              <p className="text-xs font-bold text-emerald-600 mt-1 uppercase tracking-wider">
                Save 2 months
              </p>
            </div>
          )}
        </div>

        {/* Highlight */}
        <p className="text-center font-bold text-slate-700 mb-6">
          7-Day Free Trial. No charge today.
        </p>

        {error && (
          <p className="text-sm text-red-600 font-medium mb-4 text-center">{error}</p>
        )}

        <button
          onClick={handleStartTrial}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-4 font-black transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Start Free Trial"
          )}
        </button>
      </div>
    </div>
  );
}
