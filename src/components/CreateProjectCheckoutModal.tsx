"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, Loader2, Check, Zap } from "lucide-react";

// Price IDs from Stripe Dashboard – usados directamente desde .env
const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID ?? "";
const ANNUAL_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID ?? "";

interface CreateProjectCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLANS = [
  {
    id: "monthly",
    priceId: MONTHLY_PRICE_ID,
    name: "Monthly Plan",
    price: "15",
    period: "/month",
    description: "Monthly billing",
    recommended: false,
  },
  {
    id: "annual",
    priceId: ANNUAL_PRICE_ID,
    name: "Annual Plan",
    price: "150",
    period: "/year",
    description: "Save 2 months",
    recommended: true,
  },
];

export function CreateProjectCheckoutModal({
  isOpen,
  onClose,
}: CreateProjectCheckoutModalProps) {
  const [projectName, setProjectName] = useState("");
  const [priceId, setPriceId] = useState(ANNUAL_PRICE_ID || MONTHLY_PRICE_ID || "");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  if (!isOpen) return null;

  const handleCheckout = async () => {
    const name = projectName.trim();
    if (!name) {
      console.error("Project name is required.");
      return;
    }
    const selectedPriceId = priceId ?? "";
    if (!selectedPriceId) {
      console.error("Please select a plan first.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("You must be logged in to continue.");
        setLoading(false);
        return;
      }

      const body = {
        projectName: name,
        priceId: selectedPriceId,
        userId: user.id,
        email: user.email ?? "",
      };
      const apiUrl = "/api/stripe/checkout";

      console.log("Enviando datos a la API...", { apiUrl, projectName: name, priceId: selectedPriceId, userId: user.id });
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let data: { url?: string; error?: string };
      try {
        data = await res.json();
      } catch (parseErr) {
        console.error("Invalid API response JSON:", parseErr);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const errMsg = data?.error || "Payment could not be started.";
        console.error("[Checkout] API error:", res.status, data);
        setLoading(false);
        return;
      }

      if (data.url && typeof data.url === "string") {
        window.location.assign(data.url);
        return;
      }

      throw new Error("API did not return a Stripe URL: " + JSON.stringify(data));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[Checkout] Error:", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-xl font-bold text-slate-900">New project</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Project name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. My startup"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
              disabled={loading}
            />
          </div>

          <div>
            <p className="block text-sm font-bold text-slate-700 mb-3">
              Select a plan
            </p>
            <div className="grid grid-cols-2 gap-3">
              {PLANS.map((plan) => {
                const selected = priceId === plan.priceId;
                const hasPriceId = !!plan.priceId;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => hasPriceId && setPriceId(plan.priceId)}
                    disabled={!hasPriceId || loading}
                    className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                      selected
                        ? "border-emerald-500 bg-emerald-50/50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    } ${!hasPriceId ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {plan.recommended && (
                      <span className="absolute -top-2 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-slate-500" />
                      <span className="font-bold text-slate-900">{plan.name}</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900">
                      {plan.price}€
                      <span className="text-sm font-bold text-slate-500">
                        {plan.period}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                    {selected && (
                      <div className="absolute top-3 right-3">
                        <Check className="h-5 w-5 text-emerald-500" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-600 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Redirecting...
              </>
            ) : (
              "Confirm and proceed to payment"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
