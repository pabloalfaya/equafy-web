"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      
      {/* --- BACKGROUND AMBIENTAL --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-400/20 blur-[120px] rounded-full opacity-50 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="relative z-10 pt-32 md:pt-40 pb-20 px-6 md:px-12 lg:px-24">
        <div className="mx-auto max-w-screen-2xl text-center mb-14">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
            Fair pricing for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">fair equity.</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
            Choose the plan that fits your company stage. From side projects to high-growth ventures.
          </p>
        </div>

        {/* --- PRICING CARDS --- */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto items-stretch">
          <div className="flex flex-col bg-white/70 backdrop-blur-xl border border-white/60 rounded-[40px] p-10 shadow-xl hover:shadow-2xl transition-all">
            <div className="mb-8">
              <h3 className="text-xl font-black text-slate-900 mb-2">Monthly Plan</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">19.99</span>
                <span className="text-slate-400 font-bold">/mo</span>
              </div>
            </div>
            <ul className="space-y-4 mb-10">
              {[
                "1 Project",
                "Unlimited Members",
                "All Slicing Pie Models",
                "PDF Report Export",
                "Priority Support",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/login?view=signup"
              className="mt-auto block text-center py-4 rounded-2xl border border-slate-200 font-bold text-sm tracking-tight hover:bg-slate-50 transition-all"
            >
              Get Started
            </Link>
          </div>

          <div className="relative flex flex-col bg-slate-900 rounded-[40px] p-10 shadow-2xl ring-2 ring-emerald-500/50">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg border border-emerald-400 whitespace-nowrap">
              Best Value — Save ~17%
            </div>
            <div className="mb-8">
              <h3 className="text-xl font-black text-white mb-2 tracking-tight">Yearly Plan</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">199.99</span>
                <span className="text-slate-400 font-bold">/yr</span>
              </div>
            </div>
            <ul className="space-y-4 mb-10">
              {[
                "1 Project",
                "Unlimited Members",
                "All Slicing Pie Models",
                "PDF Report Export",
                "Priority Support",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm font-bold text-slate-200 tracking-tight">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/login?view=signup"
              className="mt-auto block text-center py-4 rounded-2xl bg-emerald-500 text-white font-bold text-sm tracking-tight hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}