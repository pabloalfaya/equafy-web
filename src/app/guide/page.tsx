"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PieChart,
  Download,
  Coins,
  Wrench,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const STEPS = [
  {
    title: "Setting the Rules",
    text: "Everything starts with the rules. Use the Multipliers panel to define risk weight for Cash, Work, and Assets.",
    visual: "multipliers",
  },
  {
    title: "Team & Limits",
    text: "Add your team and protect your cap table. Use the Limited Equity feature to set 'Hard Caps' and ensure long-term control.",
    visual: "badge",
  },
  {
    title: "Log Contributions",
    text: "The heart of the system. Record time, money, or IP. The dynamic chart updates in real-time so everyone sees their true ownership.",
    visual: "donut",
  },
  {
    title: "Transparency & Reports",
    text: "Trust is built on transparency. Check the Audit Log for every modification and export official PDF reports for your legal records.",
    visual: "pdf-button",
  },
];

export default function GuidePage() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u ?? null);
      setAuthChecked(true);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      {/* Background — grid */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-400/20 blur-[120px] rounded-full opacity-50 mix-blend-multiply" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-400/10 blur-[120px] rounded-full opacity-40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <main className="relative z-10 pt-40 pb-20 md:pt-52 md:pb-32 px-6">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <header className="text-center mb-16 md:mb-20">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
              Mastering Equily
            </h1>
            <p className="text-xl text-slate-600 font-medium">
              A step-by-step guide to fair equity management.
            </p>
          </header>

          {/* Stepper */}
          <div className="relative">
            {/* Vertical connector line */}
            <div
              className="absolute left-6 top-8 bottom-8 w-px bg-slate-200/80"
              aria-hidden
            />

            {STEPS.map((step, index) => (
              <div key={step.title} className="relative flex gap-6 pb-12 last:pb-0">
                {/* Step number circle */}
                <div className="relative z-10 flex shrink-0 w-12 h-12 rounded-full bg-[#00C853]/15 border-2 border-[#00C853]/30 flex items-center justify-center">
                  <span className="text-lg font-black text-[#00C853]">
                    {index + 1}
                  </span>
                </div>

                <div className="flex-1 min-w-0 pt-1">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    {step.title}
                  </h2>
                  <p className="text-slate-600 font-medium leading-relaxed mb-6">
                    {step.text}
                  </p>

                  {/* Visual element */}
                  {step.visual === "multipliers" && (
                    <div className="rounded-xl border border-slate-200 bg-white/90 shadow-sm p-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                        Multipliers
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                          <Coins className="w-4 h-4 text-amber-500" />
                          <span className="text-sm font-bold text-slate-700">
                            Cash x4
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                          <Wrench className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-bold text-slate-700">
                            Work x2
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                          <PieChart className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm font-bold text-slate-700">
                            Assets x1
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {step.visual === "badge" && (
                    <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#00C853]/30 bg-[#00C853]/10 px-4 py-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Hard Cap:
                      </span>
                      <span className="text-sm font-black text-[#00C853]">
                        10% Active
                      </span>
                    </div>
                  )}

                  {step.visual === "donut" && (
                    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white/90 shadow-sm p-4">
                      <div className="relative h-16 w-16 shrink-0">
                        <svg
                          viewBox="0 0 36 36"
                          className="h-full w-full -rotate-90"
                        >
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="3"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            fill="none"
                            stroke="#00C853"
                            strokeWidth="3"
                            strokeDasharray="45 100"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeDasharray="30 100"
                            strokeDashoffset="-45"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="3"
                            strokeDasharray="25 100"
                            strokeDashoffset="-75"
                          />
                        </svg>
                      </div>
                      <div className="text-sm font-medium text-slate-500">
                        Dynamic ownership · Live
                      </div>
                    </div>
                  )}

                  {step.visual === "pdf-button" && (
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-400 cursor-not-allowed opacity-80"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF Report
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CTA: register if not logged in, dashboard (projects) if logged in */}
          <div className="mt-16 text-center">
            {authChecked && (
              <Link
                href={user ? "/dashboard" : "/login?view=signup"}
                className="inline-flex items-center gap-2 h-14 px-8 rounded-2xl font-bold text-lg text-white shadow-lg transition-all duration-300 hover:opacity-95 hover:-translate-y-0.5 bg-[#00C853]"
              >
                Start Your Project Now
                <ChevronRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
