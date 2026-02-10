"use client"; 

import { useState, useEffect, useRef } from "react"; 
import Link from "next/link";
import { 
  ShieldCheck, PieChart, PlayCircle, Mail, Twitter, Linkedin, ArrowRight,
  Sliders, Scale, AlertTriangle, CheckCircle2, TrendingUp, X, ArrowLeft
} from "lucide-react";

export default function LandingPage() {
  const [standardRisk, setStandardRisk] = useState(true);
  const [customRisk, setCustomRisk] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [language, setLanguage] = useState<"en" | "es" | null>(null);

  const DEMO_VIDEO_IDS = { en: "zZ3kANWXMOU", es: "gkxrYzL1Fss" } as const;
  const LANGUAGE_OPTIONS: { id: "en" | "es"; flag: string; label: string }[] = [
    { id: "en", flag: "🇬🇧", label: "Watch in English" },
    { id: "es", flag: "🇪🇸", label: "Ver en Español" },
  ];

  // --- LÓGICA DEL NAVBAR ESCONDIDIZO ---
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 50) {
        setIsNavVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      
      {/* --- BACKGROUND AMBIENTAL --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-400/20 blur-[120px] rounded-full opacity-50 mix-blend-multiply"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-400/10 blur-[120px] rounded-full opacity-40 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* --- NAVBAR DINÁMICO --- */}
      <nav 
        className={`fixed top-0 inset-x-0 z-50 border-b border-white/50 bg-white/60 backdrop-blur-xl transition-transform duration-300 ease-in-out ${
          isNavVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <Link href="/" className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <img src="/logo.png" alt="Equily Logo" className="relative h-28 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
            </Link>
            <div className="hidden lg:flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200/50 backdrop-blur-md">
              {[
                { name: "What is Equily?", href: "/what-is-equily" },
                { name: "How does Equily work?", href: "/how-it-works" },
                { name: "Pricing", href: "/pricing" },
                { name: "Legal", href: "/legal" }
              ].map((item) => (
                <Link key={item.name} href={item.href} className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-white rounded-full transition-all duration-200">
                  {item.name}
                </Link>
              ))}
              <Link href="/contact" className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-emerald-600 hover:bg-white rounded-full transition-all duration-200">
                Contact
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:block text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
              Log in
            </Link>
            
            <Link href="/login?view=signup" className="hidden md:block text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">
              Sign Up
            </Link>
            
            <Link href="/login?view=signup" className="relative group">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-200"></div>
               <div className="relative flex items-center bg-slate-900 rounded-full px-6 py-2.5 leading-none">
                 {/* CAMBIO 1: Start Free -> Free Trial */}
                 <span className="text-sm font-bold text-white group-hover:text-emerald-50 transition duration-200">Free Trial</span>
                 <ArrowRight className="w-4 h-4 text-emerald-400 ml-2 group-hover:translate-x-1 transition-transform" />
               </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-36 pb-10 z-10">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-slate-900 mb-4 leading-[1.1] md:leading-[1.1] py-2">
            Equity that <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">evolves with you.</span>
          </h1>
          <p className="mx-auto mb-6 max-w-2xl text-xl text-slate-500 leading-relaxed font-medium">
            Stop guessing. Use the only fair model for equity distribution among co-founders, based on real contributions, cash, and market risk.
            <span className="block mt-2 text-slate-400 text-base">Trustless. Dynamic. Fair.</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* CAMBIO 2: Start Splitting Free -> Start Splitting */}
            <Link href="/login?view=signup" className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-bold text-lg flex items-center justify-center shadow-xl shadow-slate-200 hover:bg-slate-800 hover:-translate-y-1 transition-all duration-300">
              Start Splitting
            </Link>
            <button
              onClick={() => setIsVideoOpen(true)}
              className="h-14 px-8 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 group"
            >
              <PlayCircle className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
              Watch Demo
            </button>
          </div>
        </div>
      </header>

      {/* --- DASHBOARD PREVIEW SECTION --- */}
      <section className="pb-24 relative z-10 px-4">
        <div className="mx-auto max-w-6xl relative">
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

      {/* --- TRANSICIÓN --- */}
      <div className="relative z-0">
        <div className="absolute -top-64 left-0 right-0 h-[500px] bg-gradient-to-b from-transparent via-[#0B0F19]/60 to-[#0B0F19] blur-3xl pointer-events-none"></div>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-3/4 h-[400px] bg-emerald-900/20 blur-[100px] rounded-full pointer-events-none mix-blend-soft-light"></div>
      </div>

      {/* --- FRAMEWORK SELECTION --- */}
      <section className="relative z-10 bg-[#0B0F19] text-white pt-20 pb-32">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#0B0F19] to-[#0B0F19] pointer-events-none"></div>
          <div className="mx-auto max-w-7xl relative px-6">
            <div className="text-center mb-20 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 py-2">
                Choose your Equity Framework
              </h2>
              <p className="text-slate-400 text-lg font-medium leading-relaxed">
                Every company is different. Select the mathematical logic that fits your stage, from bootstrap to Series A.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 items-start">
              
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
                  <button className="w-full py-4 rounded-xl border border-white/10 text-white font-bold hover:bg-white hover:text-slate-900 transition-all uppercase text-[11px] tracking-widest">
                      Know more about Custom Model
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
                  <button className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 hover:scale-[1.02] shadow-lg shadow-emerald-900/20 text-center transition-all uppercase text-[11px] tracking-widest">
                    Know more about Just Split Model
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
                  <button className="w-full py-4 rounded-xl border border-white/10 text-white font-bold hover:bg-white hover:text-slate-900 transition-all uppercase text-[11px] tracking-widest">
                      Know more about Flat Model
                  </button>
                </Link>
              </div>

            </div>
          </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 relative z-10">
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2">
              <Link href="/" className="inline-block">
                <img src="/logo.png" alt="Equily Logo" className="h-16 w-auto mb-6 grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100" />
              </Link>
              <p className="text-slate-500 font-medium max-w-xs leading-relaxed text-sm">
                Modern tools for modern founders. Calculate, track, and manage equity with data-driven precision.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6 text-sm">Product</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                <li><Link href="#" className="hover:text-emerald-600 transition-colors">Calculator</Link></li>
                <li><Link href="/pricing" className="hover:text-emerald-600 transition-colors">Pricing</Link></li>
                <li><Link href="/models" className="hover:text-emerald-600 transition-colors">Equity Models</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6 text-sm">Resources</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                <li><Link href="#" className="hover:text-emerald-600 transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-emerald-600 transition-colors">Guides</Link></li>
                <li><Link href="#" className="hover:text-emerald-600 transition-colors">API Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6 text-sm">Legal</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                <li><Link href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-emerald-600 transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-emerald-600 transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 font-bold text-xs uppercase tracking-wider">
            <p>© 2026 Equily. Built for modern co-founders.</p>
            <div className="flex gap-6">
              <Twitter className="h-5 w-5 hover:text-slate-900 cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 hover:text-slate-900 cursor-pointer transition-colors" />
              <Mail className="h-5 w-5 hover:text-slate-900 cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>

      {/* --- VIDEO DEMO MODAL --- */}
      {isVideoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => {
            setIsVideoOpen(false);
            setLanguage(null);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Demo video"
        >
          <div
            className={`relative w-full max-w-4xl flex flex-col rounded-xl overflow-hidden bg-slate-900 shadow-2xl ${language === null ? "min-h-[380px]" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            {language === null ? (
              /* --- Paso 1: Selección de idioma --- */
              <div className="flex flex-col items-center justify-center h-full px-6 py-12">
                <h2 className="text-2xl md:text-3xl font-semibold text-white text-center mb-10">
                  Select Language / Selecciona Idioma
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className="flex items-center justify-center gap-3 rounded-lg border border-white bg-transparent text-white px-6 py-3 font-medium shadow-md hover:bg-white/10 transition-all"
                  >
                    <span className="text-2xl" aria-hidden>🇬🇧</span>
                    <span>Watch in English</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("es")}
                    className="flex items-center justify-center gap-3 rounded-lg bg-[#1565C0] text-white px-6 py-3 font-medium shadow-md hover:bg-[#1E88E5] transition-all"
                  >
                    <span className="text-2xl" aria-hidden>🇪🇸</span>
                    <span>Ver en Español</span>
                  </button>
                </div>
                <button
                  onClick={() => {
                    setIsVideoOpen(false);
                    setLanguage(null);
                  }}
                  className="absolute top-4 right-4 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            ) : (
              /* --- Paso 2: Reproducción del vídeo --- */
              <>
                <button
                  type="button"
                  onClick={() => setLanguage(null)}
                  className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 text-xs font-medium px-3 py-2 transition-colors"
                  aria-label="Change language"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Change Language
                </button>
                <button
                  onClick={() => {
                    setIsVideoOpen(false);
                    setLanguage(null);
                  }}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="aspect-video w-full">
                  <iframe
                    key={language}
                    src={`https://www.youtube.com/embed/${DEMO_VIDEO_IDS[language]}?autoplay=1&rel=0`}
                    title="Equily Demo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded-lg"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}