"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, PieChart, FileText, ArrowRight, PlayCircle } from "lucide-react";
import { VideoDemoModal } from "@/components/VideoDemoModal";

export default function WhatIsEquilyPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      
      {/* --- BACKGROUND AMBIENTAL --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-400/10 blur-[120px] rounded-full opacity-50 mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-400/10 blur-[120px] rounded-full opacity-40 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* --- SECCIÓN PRINCIPAL (HERO 2 COLUMNAS) --- */}
      <main className="relative z-10 pt-32 md:pt-40 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Lado Izquierdo: Texto */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 mb-6">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Dynamic Equity Split</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                What is <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Equily?</span>
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed font-medium mb-6">
                Equily merges capital (Equity) with justice (Fairly). Through a dynamic algorithm, we calculate each partner's share of the company based on everyone's real contributions: from investment and working hours to knowledge and resources. We transform collective effort into a transparent and balanced distribution of ownership.
              </p>

              <p className="text-lg text-slate-500 leading-relaxed font-medium mb-10">
                The engine behind this calculation operates through a system of customizable multipliers. This allows a specific weight to be assigned to each contribution, multiplying its value according to the chosen adjustments, ensuring that every contribution is valued exactly as the team needs.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                 <Link href="/login?view=signup" className="h-14 px-8 rounded-2xl bg-emerald-500 text-white font-bold text-lg flex items-center justify-center shadow-lg hover:bg-emerald-600 hover:-translate-y-0.5 transition-all duration-300 tracking-tight">
                   Get Started
                 </Link>
                 <button
                   type="button"
                   onClick={() => setIsVideoOpen(true)}
                   className="h-14 px-8 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 group"
                 >
                   <PlayCircle className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                   Watch Demo
                 </button>
              </div>
            </div>

            {/* Lado Derecho: IMAGEN LIMPIA */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-blue-500/5 rounded-full blur-3xl -z-10"></div>
              <img 
                src="/what-is-equily-hero.png" 
                alt="Equily Dynamic Equity Illustration" 
                className="w-full h-auto object-contain drop-shadow-xl hover:scale-[1.02] transition-transform duration-500" 
              />
            </div>
          </div>
        </div>
      </main>

      {/* --- SECCIÓN "CORE FEATURES" (Dark Mode) --- */}
      <section className="py-20 md:py-24 relative z-10 bg-[#0B0F19] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#0B0F19] to-[#0B0F19]"></div>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
        
        <div className="mx-auto max-w-7xl px-6 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">How it works under the hood</h2>
            <p className="text-slate-400 text-lg">A simple process for complex fairness.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Track Contributions", desc: "Automate the tracking of time, expertise, and capital.", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-500/20" },
              { title: "Algorithm Runs", desc: "Our proprietary algorithm processes contributions fairly.", icon: PieChart, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-500/20" },
              { title: "Legal Docs", desc: "Instantly generate legally binding agreements.", icon: FileText, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-500/20" }
            ].map((card, i) => (
              <div key={i} className={`bg-white/[0.03] backdrop-blur-sm rounded-[32px] p-8 border ${card.border} hover:bg-white/[0.05] transition-all group`}>
                <div className={`h-14 w-14 ${card.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <card.icon className={`${card.color} h-7 w-7`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <VideoDemoModal open={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
    </div>
  );
}