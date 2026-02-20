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
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Cap Table Status</h2>
            <p className="text-slate-500 font-medium">Real-time dynamic split based on contributions.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {[
                  { name: "Alex", role: "Founder • TIME & IP", risk: "x2", ownership: "45.0%", pctNum: 45, img: "https://i.pravatar.cc/150?img=12", barColor: "bg-emerald-500", ringColor: "ring-emerald-500" },
                  { name: "Ben", role: "Co-founder • TIME & IP", risk: "x2", ownership: "30.0%", pctNum: 30, img: "https://i.pravatar.cc/150?img=33", barColor: "bg-blue-500", ringColor: "ring-blue-500" },
                  { name: "VC Fund A", role: "CASH", risk: "x4", ownership: "18.75%", pctNum: 18.75, img: "https://i.pravatar.cc/150?img=44", barColor: "bg-orange-500", ringColor: "ring-orange-500" },
                  { name: "Sarah", role: "Dev • TIME", risk: "x1", ownership: "6.25%", pctNum: 6.25, img: "https://i.pravatar.cc/150?img=47", barColor: "bg-purple-500", ringColor: "ring-purple-500" },
                ].map((member, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                      <img src={member.img} className={`h-14 w-14 rounded-full object-cover ring-2 ${member.ringColor} ring-offset-2`} alt={member.name} />
                      <div>
                        <p className="font-bold text-slate-900">{member.name}</p>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{member.role}</p>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                      <div className={`h-full ${member.barColor} rounded-full transition-all`} style={{ width: `${member.pctNum}%` }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-slate-900 tabular-nums">{member.ownership}</span>
                      <span className="text-sm font-bold text-slate-400">{member.risk}</span>
                    </div>
                  </div>
                ))}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">€1.37M</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Valuation</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
              <span className="font-bold">+12%</span>
              <span className="text-slate-500 text-sm font-medium">vs last month</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- FRAMEWORK SELECTION --- */}
      <section className="relative z-10 w-full bg-transparent pt-16 pb-24 mt-24 md:mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-slate-800">
              Choose your Equity Framework
            </h2>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">
              Every company is different. Select the mathematical logic that fits your stage, from bootstrap to Series A.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
            
            {/* --- CUSTOM MODEL --- */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                  <Sliders className="w-6 h-6 text-slate-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Custom Model</h3>
                <p className="text-slate-500 text-sm font-medium">Total control for complex setups.</p>
              </div>
              <div className="space-y-4 mb-8 flex-grow">
                <div className="flex items-center gap-3 text-slate-600 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0" /> Fully Editable Multipliers
                </div>
                <div className="flex items-center gap-3 text-slate-600 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0" /> Manual Configuration
                </div>
                
                <div className={`mt-[7rem] rounded-xl p-4 border flex items-center justify-between transition-colors ${customRisk ? 'border-emerald-500/50 bg-emerald-50/50' : 'border-slate-200 bg-slate-50/50'}`}>
                  <div className="flex items-center gap-2">
                    <PieChart className={`w-4 h-4 transition-colors ${customRisk ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <span className={`text-sm font-bold transition-colors ${customRisk ? 'text-slate-800' : 'text-slate-600'}`}>
                      Logarithmic Risk <span className="text-[10px] opacity-70 font-normal ml-1">(Optional)</span>
                    </span>
                  </div>
                  <button 
                    onClick={() => setCustomRisk(!customRisk)}
                    className={`w-8 h-4 rounded-full relative transition-colors shrink-0 ${customRisk ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${customRisk ? 'right-0.5' : 'left-0.5'}`}></div>
                  </button>
                </div>
              </div>
              <Link href="/models#custom" className="w-full">
                <button className="w-full py-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all uppercase text-[11px] tracking-widest">
                  Learn more about Custom Model
                </button>
              </Link>
            </div>

            {/* --- JUST SPLIT MODEL (Recommended) --- */}
            <div className="relative bg-white border-2 border-emerald-500 rounded-2xl p-8 shadow-md h-full flex flex-col transform lg:-translate-y-2 z-20">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                Recommended
              </div>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Just Split Model</h3>
                <p className="text-emerald-600 text-sm font-bold">The Industry Standard</p>
              </div>
              <div className="space-y-4 mb-8 flex-grow">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Capital (Cash)</span>
                    <span className="text-xl font-bold text-slate-800">x4</span>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Work & IP</span>
                    <span className="text-xl font-bold text-slate-800">x2</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 font-medium">Tangible and intangible contributions</p>
                </div>
                
                <div className={`rounded-xl p-4 border flex items-center justify-between transition-colors ${standardRisk ? 'border-emerald-500/50 bg-emerald-50/50' : 'border-slate-200 bg-slate-50/50'}`}>
                  <div className="flex items-center gap-2">
                    <PieChart className={`w-4 h-4 transition-colors ${standardRisk ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <span className={`text-sm font-bold transition-colors ${standardRisk ? 'text-slate-800' : 'text-slate-600'}`}>
                      Logarithmic Risk <span className="text-[10px] opacity-70 font-normal ml-1">(Optional)</span>
                    </span>
                  </div>
                  <button 
                    onClick={() => setStandardRisk(!standardRisk)}
                    className={`w-8 h-4 rounded-full relative transition-colors shrink-0 ${standardRisk ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${standardRisk ? 'right-0.5' : 'left-0.5'}`}></div>
                  </button>
                </div>
              </div>
              <Link href="/models#standard" className="w-full">
                <button className="w-full py-4 rounded-xl border-2 border-emerald-500 bg-white text-slate-700 font-bold hover:bg-emerald-50 transition-all uppercase text-[11px] tracking-widest">
                  Learn more about Just Split Model
                </button>
              </Link>
            </div>

            {/* --- FLAT MODEL --- */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                  <Scale className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Flat Model</h3>
                <p className="text-purple-600 text-sm font-medium">Simple fixed split.</p>
              </div>
              <div className="space-y-4 mb-8 flex-grow">
                <div className="flex items-center gap-3 text-slate-600 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0" /> Equal Multipliers (x1)
                </div>
                <div className="flex items-center gap-3 text-slate-600 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0" /> Good for Service Agencies
                </div>
                
                <div className="mt-4 p-4 rounded-xl bg-slate-100 border border-slate-200">
                  <div className="flex gap-2 text-amber-600 mb-1">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-bold uppercase">Caution</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Discourages cash investment as it treats liquid capital equal to time.
                  </p>
                </div>
              </div>
              <Link href="/models#flat" className="w-full">
                <button className="w-full py-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all uppercase text-[11px] tracking-widest">
                  Learn more about Flat Model
                </button>
              </Link>
            </div>

          </div>
        </div>
      </section>

      <VideoDemoModal open={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
    </div>
  );
}