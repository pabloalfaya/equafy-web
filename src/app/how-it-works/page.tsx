"use client";

import Link from "next/link";
import { Zap, Calculator, Scale, FileCheck, ArrowRight } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      
      {/* --- BACKGROUND AMBIENTAL --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-blue-400/10 blur-[120px] rounded-full opacity-50 mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-1/4 w-[800px] h-[800px] bg-emerald-400/10 blur-[120px] rounded-full opacity-40 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* --- HERO SECTION --- */}
      <main className="relative z-10 pt-32 md:pt-40 pb-20 w-full">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 lg:px-24 text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight text-slate-900">
            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">Equily</span> works?
          </h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed mb-10 max-w-2xl mx-auto mt-2">
            Our platform transforms emotional subjectivity into an exact mathematical formula. 
            <span className="block mt-2 text-slate-800 font-bold">Risk assumed = Ownership earned.</span>
          </p>
        </div>

        {/* --- PASOS DEL PROCESO --- */}
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 lg:px-24 space-y-20 md:space-y-24">
          
          {/* Paso 1: Track Contributions */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-500 text-white font-bold text-2xl mb-8 shadow-lg shadow-emerald-200">1</div>
              <h2 className="text-4xl font-bold mb-6 text-slate-900 tracking-tight">Track Contributions</h2>
              <p className="text-lg text-slate-500 leading-relaxed mb-8 font-medium">
                Capture every vector of value. A startup is built with much more than money. Our system allows you to log, quantify, and audit every contribution effortlessly.
              </p>
              <ul className="space-y-4">
                {[
                  "Capital Injections (The Fuel)",
                  "Operational Work Hours (The Engine)",
                  "Intellectual Property (The IP)"
                ].map((item, i) => (
                   <li key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                      <div className="bg-emerald-100 rounded-full p-1">
                        <ArrowRight className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="text-slate-700 font-bold">{item}</span>
                   </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2 relative">
               <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full opacity-50"></div>
               <div className="relative bg-white/80 backdrop-blur-xl rounded-[40px] p-12 shadow-2xl border border-white/50 flex items-center justify-center aspect-square">
                  <Zap className="h-40 w-40 text-emerald-500 drop-shadow-2xl" strokeWidth={1.5} />
               </div>
            </div>
          </div>

          {/* Paso 2: Algorithm Runs */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
             <div className="relative">
               <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full opacity-50"></div>
               <div className="relative bg-white/80 backdrop-blur-xl rounded-[40px] p-12 shadow-2xl border border-white/50 flex items-center justify-center aspect-square">
                  <Calculator className="h-40 w-40 text-blue-500 drop-shadow-2xl" strokeWidth={1.5} />
               </div>
            </div>
            <div>
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-500 text-white font-bold text-2xl mb-8 shadow-lg shadow-blue-200">2</div>
              <h2 className="text-4xl font-bold mb-6 text-slate-900 tracking-tight">Algorithm Runs</h2>
              <p className="text-lg text-slate-500 leading-relaxed font-medium">
                Real-Time Risk Mathematics. Our algorithm processes inputs and applies adjustable risk multipliers to determine the <strong className="text-slate-800">fair market value</strong> of each contribution.
              </p>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Input</p>
                    <p className="text-lg font-bold text-slate-800">Raw Data</p>
                 </div>
                 <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Output</p>
                    <p className="text-lg font-bold text-blue-800">Fair Split %</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Paso 3: Legal Docs */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-purple-500 text-white font-bold text-2xl mb-8 shadow-lg shadow-purple-200">3</div>
              <h2 className="text-4xl font-bold mb-6 text-slate-900 tracking-tight">Legal Docs</h2>
              <p className="text-lg text-slate-500 leading-relaxed font-medium mb-8">
                From Algorithm to Notary. Equily converts algorithm data into binding legal documentation. The system "freezes" the split and exports the <strong className="text-slate-800">"Final Snapshot"</strong>.
              </p>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xl inline-flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-default">
                <div className="bg-emerald-100 p-2 rounded-lg">
                    <FileCheck className="text-emerald-600 h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-900">Ready for notarization</p>
                    <p className="text-xs text-slate-400 font-medium">PDF & CSV Export available</p>
                </div>
              </div>
            </div>
             <div className="order-1 lg:order-2 relative">
               <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full opacity-50"></div>
               <div className="relative bg-white/80 backdrop-blur-xl rounded-[40px] p-12 shadow-2xl border border-white/50 flex items-center justify-center aspect-square">
                  <Scale className="h-40 w-40 text-purple-500 drop-shadow-2xl" strokeWidth={1.5} />
               </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}