"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  PieChart,
  PlayCircle,
  ArrowRight,
  Sliders,
  Scale,
  AlertTriangle,
  CheckCircle2,
  TrendingUp
} from "lucide-react";
import { VideoDemoModal } from "../components/VideoDemoModal";

export default function LandingPage() {
  const [standardRisk, setStandardRisk] = useState(true);
  const [customRisk, setCustomRisk] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      
      {/* --- BACKGROUND AMBIENTAL --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-400/20 blur-[120px] rounded-full opacity-50 mix-blend-multiply"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-400/10 blur-[120px] rounded-full opacity-40 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-32 md:pt-40 pb-10 z-10 w-full overflow-hidden">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 lg:px-24 text-center relative">
          <h1 className="relative z-20 text-6xl md:text-8xl font-bold tracking-tight text-slate-900 mb-5 leading-[1.1] md:leading-[1.1] py-2">
            Equit<span className="ml-[0.05em]">y</span> that <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">evolves with you.</span>
          </h1>
          <p className="relative z-20 mx-auto mb-6 max-w-2xl text-xl text-slate-500 leading-relaxed font-medium">
            Stop guessing. Use the only fair model for equity distribution among co-founders, based on real contributions, cash, and market risk.
            <span className="block mt-2 text-slate-400 text-base">Trustless. Dynamic. Fair.</span>
          </p>
          <div className="relative z-20 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login?view=signup" className="h-14 px-8 rounded-2xl bg-emerald-500 text-white font-bold text-lg flex items-center justify-center shadow-lg hover:bg-emerald-600 hover:-translate-y-0.5 transition-all duration-300 tracking-tight">
              Get Started
            </Link>
            <button
              onClick={() => setIsVideoOpen(true)}
              className="h-14 px-8 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 group"
            >
              <PlayCircle className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
              Watch Demo
            </button>
          </div>

          {/* Infinite Marquee de funcionalidades */}
          <div className="relative z-20 mt-20 -mx-3 md:-mx-6 lg:-mx-12 w-[calc(100%+1.5rem)] md:w-[calc(100%+3rem)] lg:w-[calc(100%+6rem)] overflow-hidden">
            <div className="animate-marquee flex gap-6 w-max" role="marquee">
              {[...Array(3)].map((_, dup) => (
                <div key={dup} className="flex gap-6 shrink-0">
                  {[
                    "Add Contributions",
                    "Dynamic Splitting",
                    "Smart Multipliers",
                    "Fixed Equity",
                    "Limit Equity",
                    "Freeze Project",
                    "Real-Time Cap Table",
                    "Binding Contracts",
                    "Role-Based Access",
                    "Audit Log",
                  ].map((label) => (
                    <span
                      key={`${dup}-${label}`}
                      className="shrink-0 text-slate-900 font-bold text-base"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* --- DASHBOARD PREVIEW SECTION --- */}
      <section className="pt-24 md:pt-32 pb-16 relative z-10 w-full px-6 md:px-12 lg:px-24">
        <div className="mx-auto max-w-screen-2xl relative">
          <div className="relative z-20 rounded-[32px] border border-slate-200/60 bg-white/80 backdrop-blur-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] overflow-hidden ring-1 ring-slate-900/5">
            <div className="h-12 border-b border-slate-100 flex items-center px-6 gap-2 bg-slate-50/50">
              <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400/80"></div>
              <div className="ml-auto text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-50 animate-pulse"></div>
                Live Calculation
              </div>
            </div>

            <div className="p-8 md:p-12">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-6">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Cap Table Status</h2>
                    <p className="text-slate-500 font-medium">Real-time dynamic split based on contributions.</p>
                  </div>
                  <div className="space-y-4">
                    {[
                      { name: "Alex (CEO)", type: "Time & IP", risk: "x4", ownership: "45.0%", img: "https://i.pravatar.cc/150?u=alex", color: "text-emerald-600", bg: "bg-emerald-50" },
                      { name: "Ben (CTO)", type: "Time", risk: "x4", ownership: "30.0%", img: "https://i.pravatar.cc/150?u=ben", color: "text-blue-600", bg: "bg-blue-50" },
                      { name: "VC Fund A", type: "Cash", risk: "x2", ownership: "18.75%", img: "https://i.pravatar.cc/150?u=vc", color: "text-orange-600", bg: "bg-orange-50" },
                      { name: "Sarah (Dev)", type: "Time", risk: "x1", ownership: "6.25%", img: "https://i.pravatar.cc/150?u=sarah", color: "text-purple-600", bg: "bg-purple-50" },
                    ].map((member, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors group cursor-default">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img src={member.img} className="h-12 w-12 rounded-xl object-cover ring-2 ring-white shadow-sm" alt={member.name} />
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${member.bg} flex items-center justify-center border-2 border-white`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${member.color.replace('text', 'bg')}`}></div>
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-base">{member.name}</p>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{member.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${member.color} tabular-nums`}>{member.ownership}</p>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{member.risk} Multiplier</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative flex items-center justify-center py-8">
                  <div className="relative h-72 w-72">
                    <svg viewBox="0 0 36 36" className="h-full w-full transform -rotate-90 drop-shadow-2xl">
                      <circle cx="18" cy="18" r="16" fill="transparent" stroke="#e2e8f0" strokeWidth="3.8" />
                      <circle cx="18" cy="18" r="16" fill="transparent" stroke="#10b981" strokeWidth="3.8" strokeDasharray="45 100" className="animate-[spin_1s_ease-out_reverse]" style={{ transformOrigin: 'center' }} />
                      <circle cx="18" cy="18" r="16" fill="transparent" stroke="#3b82f6" strokeWidth="3.8" strokeDasharray="30 100" strokeDashoffset="-45" className="animate-[spin_1.2s_ease-out_reverse]" style={{ transformOrigin: 'center' }} />
                      <circle cx="18" cy="18" r="16" fill="transparent" stroke="#f97316" strokeWidth="3.8" strokeDasharray="18.75 100" strokeDashoffset="-75" className="animate-[spin_1.4s_ease-out_reverse]" style={{ transformOrigin: 'center' }} />
                      <circle cx="18" cy="18" r="16" fill="transparent" stroke="#a855f7" strokeWidth="3.8" strokeDasharray="6.25 100" strokeDashoffset="-93.75" className="animate-[spin_1.6s_ease-out_reverse]" style={{ transformOrigin: 'center' }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Valuation</p>
                      <p className="text-4xl font-bold text-slate-900 tracking-tight">€1.37M</p>
                      <div className="flex items-center gap-1 mt-2 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <TrendingUp className="w-3 h-3" />
                        +12% vs last month
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FRAMEWORK SELECTION --- */}
      <div className="mx-4 sm:mx-6 lg:mx-8 mt-24 md:mt-32 mb-12 rounded-[32px] overflow-hidden">
      <section className="relative z-10 w-full bg-[#0B0F19] text-white pt-16 pb-24">
          <div className="absolute inset-0 rounded-[32px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#0B0F19] to-[#0B0F19] pointer-events-none"></div>
          <div className="relative w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 py-2">
                Choose your Equity Framework
              </h2>
              <p className="text-slate-400 text-lg font-medium leading-relaxed">
                Every company is different. Select the mathematical logic that fits your stage, from bootstrap to Series A.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
              
              {/* --- CUSTOM MODEL --- */}
              <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 hover:bg-white/[0.05] transition-all duration-300 group h-full flex flex-col">
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 group-hover:bg-slate-700 transition-colors">
                    <Sliders className="w-6 h-6 text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Custom Model</h3>
                  <p className="text-slate-400 text-sm font-medium">Total control for complex setups.</p>
                </div>
                <div className="space-y-4 mb-8 flex-grow">
                  <div className="flex items-center gap-3 text-slate-300 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-slate-500" /> Fully Editable Multipliers
                  </div>
                  <div className="flex items-center gap-3 text-slate-300 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-slate-500" /> Manual Configuration
                  </div>
                  
                  <div className={`mt-6 rounded-xl p-4 border flex items-center justify-between transition-colors ${customRisk ? 'border-emerald-500/30 bg-white/5' : 'border-white/5 bg-transparent'}`}>
                    <div className="flex items-center gap-2">
                      <PieChart className={`w-4 h-4 transition-colors ${customRisk ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span className={`text-sm font-bold transition-colors ${customRisk ? 'text-white' : 'text-slate-400'}`}>
                        Logarithmic Risk <span className="text-[10px] opacity-70 font-normal ml-1">(Optional)</span>
                      </span>
                    </div>
                    <button 
                      onClick={() => setCustomRisk(!customRisk)}
                      className={`w-8 h-4 rounded-full relative transition-colors ${customRisk ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${customRisk ? 'right-0.5' : 'left-0.5'}`}></div>
                    </button>
                  </div>
                </div>
                <Link href="/models#custom" className="w-full">
                  <button className="w-full py-4 rounded-2xl border border-white/10 text-white font-bold hover:bg-white hover:text-slate-900 transition-all uppercase text-[11px] tracking-widest">
                    Learn more about Custom Model
                  </button>
                </Link>
              </div>

              {/* --- JUST SPLIT MODEL --- */}
              <div className="relative bg-emerald-900/10 border border-emerald-500/50 rounded-[32px] p-8 transition-all duration-300 shadow-[0_0_80px_-20px_rgba(16,185,129,0.2)] h-full flex flex-col transform lg:-translate-y-4 z-20">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg border border-emerald-400">
                  Recommended
                </div>
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Just Split Model</h3>
                  <p className="text-emerald-400 text-sm font-bold">The Industry Standard</p>
                </div>
                <div className="space-y-6 mb-8 flex-grow">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                      <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Capital (Cash)</span>
                          <span className="text-xl font-bold text-white">x4</span>
                      </div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                      <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Work & IP</span>
                          <span className="text-xl font-bold text-white">x2</span>
                      </div>
                      <p className="text-xs text-blue-200/60 mt-2 font-medium">Tangible and intangible contributions</p>
                  </div>
                  
                  <div className={`rounded-xl p-4 border flex items-center justify-between transition-colors ${standardRisk ? 'border-emerald-500/30 bg-white/5' : 'border-white/5 bg-transparent'}`}>
                    <div className="flex items-center gap-2">
                      <PieChart className={`w-4 h-4 transition-colors ${standardRisk ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span className={`text-sm font-bold transition-colors ${standardRisk ? 'text-white' : 'text-slate-400'}`}>
                        Logarithmic Risk <span className="text-[10px] opacity-70 font-normal ml-1">(Optional)</span>
                      </span>
                    </div>
                    <button 
                      onClick={() => setStandardRisk(!standardRisk)}
                      className={`w-8 h-4 rounded-full relative transition-colors ${standardRisk ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${standardRisk ? 'right-0.5' : 'left-0.5'}`}></div>
                    </button>
                  </div>
                </div>
                <Link href="/models#standard" className="w-full">
                  <button className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 hover:scale-[1.02] shadow-lg shadow-emerald-900/20 text-center transition-all uppercase text-[11px] tracking-widest">
                    Learn more about Just Split Model
                  </button>
                </Link>
              </div>

              {/* --- FLAT MODEL --- */}
              <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 hover:bg-white/[0.05] transition-all duration-300 group h-full flex flex-col">
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 group-hover:bg-purple-900/30 transition-colors">
                    <Scale className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Flat Model</h3>
                  <p className="text-purple-400 text-sm font-medium">Simple fixed split.</p>
                </div>
                <div className="space-y-4 mb-8 flex-grow">
                    <div className="flex items-center gap-3 text-slate-300 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-slate-500" /> Equal Multipliers (x1)
                  </div>
                  <div className="flex items-center gap-3 text-slate-300 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-slate-500" /> Good for Service Agencies
                  </div>
                  
                  <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                      <div className="flex gap-2 text-red-400 mb-1">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase">Caution</span>
                      </div>
                      <p className="text-xs text-red-200/70 leading-relaxed">
                          Discourages cash investment as it treats liquid capital equal to time.
                      </p>
                  </div>
                </div>
                <Link href="/models#flat" className="w-full">
                  <button className="w-full py-4 rounded-2xl border border-white/10 text-white font-bold hover:bg-white hover:text-slate-900 transition-all uppercase text-[11px] tracking-widest">
                    Learn more about Flat Model
                  </button>
                </Link>
              </div>

            </div>
            </div>
          </div>
      </section>
      </div>

      <VideoDemoModal open={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
    </div>
  );
}