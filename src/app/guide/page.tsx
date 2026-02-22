"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PieChart,
  Download,
  Coins,
  Wrench,
  ChevronRight,
  Settings,
  Users,
  TrendingUp,
  FileCheck,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { BRAND } from "@/lib/brand";

const SECTIONS = [
  {
    id: "setup-rules",
    title: "Setup Rules",
    subtitle: "Define risk weights for contributions",
    text: "Everything starts with the rules. Use the Multipliers panel to define risk weight for Cash, Work, and Assets.",
    visual: "multipliers",
    icon: Settings,
  },
  {
    id: "team-limits",
    title: "Team & Limits",
    subtitle: "Add your team and protect the cap table",
    text: "Add your team and protect your cap table. Use the Limited Equity feature to set 'Hard Caps' and ensure long-term control.",
    visual: "badge",
    icon: Users,
  },
  {
    id: "log-contributions",
    title: "Log Contributions",
    subtitle: "Record time, money, and IP",
    text: "The heart of the system. Record time, money, or IP. The dynamic chart updates in real-time so everyone sees their true ownership.",
    visual: "donut",
    icon: TrendingUp,
  },
  {
    id: "transparency-reports",
    title: "Transparency & Reports",
    subtitle: "Audit trail and PDF exports",
    text: "Trust is built on transparency. Check the Audit Log for every modification and export official PDF reports for your legal records.",
    visual: "pdf-button",
    icon: FileCheck,
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
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-400/20 blur-[120px] rounded-full opacity-50 mix-blend-multiply" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-400/10 blur-[120px] rounded-full opacity-40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <main className="relative z-10 pt-32 md:pt-40 pb-20 md:pb-28 px-6">
        <div className="mx-auto max-w-2xl">
          <header className="text-center mb-12 md:mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
              Mastering {BRAND.name}
            </h1>
            <p className="text-xl text-slate-600 font-medium tracking-tight">
              A step-by-step guide to fair equity management.
            </p>
          </header>

          <div className="relative space-y-0">
            {/* Vertical connector */}
            <div
              className="absolute left-6 top-8 bottom-8 w-px bg-slate-200/80 hidden md:block"
              aria-hidden
            />

            {SECTIONS.map((step, index) => {
              const Icon = step.icon;
              return (
                <section
                  key={step.id}
                  className="relative flex gap-6 pb-12 last:pb-0"
                >
                  {/* Step number + icon */}
                  <div className="relative z-10 flex shrink-0 w-12 h-12 rounded-full bg-white border-2 border-emerald-500/30 shadow-sm flex items-center justify-center">
                    <span className="text-lg font-black text-emerald-600">
                      {index + 1}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="rounded-2xl border border-slate-200/80 bg-white/95 shadow-sm hover:shadow-md transition-shadow p-6 md:p-8">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-emerald-50">
                          <Icon className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {step.subtitle}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
                        {step.title}
                      </h2>
                      <p className="text-slate-600 font-medium leading-relaxed mb-6 tracking-tight">
                        {step.text}
                      </p>

                      {step.visual === "multipliers" && (
                        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                            Multipliers
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-100 shadow-sm">
                              <Coins className="w-4 h-4 text-amber-500" />
                              <span className="text-sm font-bold text-slate-700">
                                Cash x4
                              </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-100 shadow-sm">
                              <Wrench className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-bold text-slate-700">
                                Work x2
                              </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-100 shadow-sm">
                              <PieChart className="w-4 h-4 text-emerald-500" />
                              <span className="text-sm font-bold text-slate-700">
                                Assets x1
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {step.visual === "badge" && (
                        <div className="inline-flex items-center gap-2 rounded-full border-2 border-emerald-500/30 bg-emerald-50 px-4 py-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Hard Cap:
                          </span>
                          <span className="text-sm font-black text-emerald-600">
                            10% Active
                          </span>
                        </div>
                      )}

                      {step.visual === "donut" && (
                        <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
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
                                stroke="#10b981"
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
                          <div className="text-sm font-medium text-slate-500 tracking-tight">
                            Dynamic ownership · Live
                          </div>
                        </div>
                      )}

                      {step.visual === "pdf-button" && (
                        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500">
                          <Download className="w-4 h-4" />
                          Download PDF Report
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            {authChecked && (
              <Link
                href={user ? "/dashboard" : "/login?view=signup"}
                className="inline-flex items-center gap-2 h-14 px-8 rounded-2xl font-bold text-lg text-white shadow-lg transition-all duration-300 hover:opacity-95 hover:-translate-y-0.5 bg-emerald-500 hover:bg-emerald-600"
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
