"use client";

import { useState } from "react";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { VideoDemoModal } from "@/components/VideoDemoModal";
import { BRAND } from "@/lib/brand";

export default function WhatIsEquafyPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      
      {/* --- BACKGROUND AMBIENTAL --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-400/10 blur-[120px] rounded-full opacity-50 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* --- SECCIÓN PRINCIPAL (HERO 2 COLUMNAS) --- */}
      <main className="relative z-10 pt-32 md:pt-40 pb-20 w-full">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 lg:px-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Lado Izquierdo: Texto */}
            <div className="relative z-10">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                What is <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">{BRAND.name}?</span>
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed font-medium mb-6 mt-2">
                {BRAND.name} helps you manage equity fairly. Through a dynamic algorithm, we calculate each partner's share of the company based on everyone's real contributions: from investment and working hours to knowledge and resources. We transform collective effort into a transparent and balanced distribution of ownership.
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
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-full blur-3xl -z-10"></div>
              <img 
                src="/what-is-equafy-hero.png" 
                alt={`${BRAND.name} Dynamic Equity Illustration`} 
                className="w-full h-auto object-contain drop-shadow-xl hover:scale-[1.02] transition-transform duration-500" 
              />
            </div>
          </div>
        </div>
      </main>

      <VideoDemoModal open={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
    </div>
  );
}
