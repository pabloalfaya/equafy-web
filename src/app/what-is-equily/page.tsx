import Link from "next/link";
import { CheckCircle2, TrendingUp, PieChart, FileText, Twitter, Linkedin, Mail } from "lucide-react";

export default function WhatIsEquilyPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative overflow-hidden">
      
      {/* --- FONDO CON TEXTURA --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(#059669 0.8px, transparent 0.8px)', backgroundSize: '32px 32px' }}></div>
      </div>

      {/* --- NAVBAR UNIFICADO Y LOGO GRANDE --- */}
      <nav className="border-b border-slate-200/60 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <div className="flex items-center gap-10">
            <Link href="/">
              {/* Logo ampliado a h-32 para consistencia con Landing */}
              <img src="/logo.png" alt="Equily Logo" className="h-32 w-auto object-contain cursor-pointer transition-transform hover:scale-105" />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/what-is-equily" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition">
                What is Equily?
              </Link>
              <Link href="/how-it-works" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition">
                How Work Equily?
              </Link>
              <Link href="/pricing" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition">
                Pricing
              </Link>
              <Link href="/contact" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition">
                Contact
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-bold text-slate-600 hover:text-slate-900">Log in</Link>
            <Link href="/dashboard" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition">
              Sign Up
            </Link>
            <Link href="/dashboard" className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 shadow-lg shadow-slate-200">Start Free</Link>
          </div>
        </div>
      </nav>

      {/* --- SECCIÓN PRINCIPAL --- */}
      <main className="relative z-10 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            
            {/* Lado Izquierdo: Texto descriptivo */}
            <div>
              <h1 className="text-5xl font-black tracking-tight mb-8 border-b-8 border-emerald-500 inline-block leading-tight">
                What Is Equily?
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed font-medium mb-8">
                Fair equity, powered by data. Equily empowers founders with a dynamic algorithm 
                that distributes company ownership based on **actual contributions**, not just promises.
              </p>
              
              <div className="space-y-5">
                {[
                  "Track contributions in real-time",
                  "Mathematical fairness algorithm",
                  "Investor-ready reports"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 font-black text-slate-700 text-lg">
                    <CheckCircle2 className="text-emerald-500 h-7 w-7" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Lado Derecho: IMAGEN LIMPIA */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-[500px] flex items-center justify-center">
                <img 
                  src="/what-is-equily-hero.png" 
                  alt="Equily Dynamic Equity Illustration" 
                  className="w-full h-auto object-contain" 
                />
              </div>
              <div className="absolute inset-0 -z-10 bg-emerald-500/5 blur-[120px] rounded-full"></div>
            </div>
          </div>
        </div>

        {/* --- SECCIÓN "HOW IT WORKS" --- */}
        <section className="mt-40 bg-slate-900 py-32 border-y border-slate-800 relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]"></div>
          <div className="mx-auto max-w-6xl px-6 text-center relative z-10">
            <h2 className="text-4xl font-black text-white mb-20 uppercase tracking-[0.2em] border-b-4 border-emerald-500 inline-block pb-2">How it works</h2>
            
            <div className="grid md:grid-cols-3 gap-12 text-left">
              {[
                { title: "Track Contributions", desc: "Automate the tracking of time, expertise, and capital.", icon: TrendingUp },
                { title: "Algorithm Runs", desc: "Our proprietary algorithm processes contributions fairly.", icon: PieChart },
                { title: "Legal Docs", desc: "Instantly generate legally binding agreements.", icon: FileText }
              ].map((card, i) => (
                <div key={i} className="bg-slate-950/50 backdrop-blur-sm rounded-[40px] p-10 border border-slate-800 hover:border-emerald-500 transition-all shadow-2xl">
                  <div className="h-16 w-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8">
                    <card.icon className="text-emerald-500 h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 leading-tight">{card.title}</h3>
                  <p className="text-slate-400 font-medium text-lg leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER UNIFICADO --- */}
      <footer className="bg-white pt-24 pb-12 border-t border-slate-200 relative z-10">
        <div className="mx-auto max-w-7xl px-6 text-center">
            <Link href="/">
              <img src="/logo.png" alt="Equily" className="h-20 mx-auto mb-8 opacity-40 grayscale hover:grayscale-0 transition-all" />
            </Link>
            <p className="text-slate-400 font-black text-sm mb-8 uppercase tracking-widest">© 2026 Equily. Modern tools for founders.</p>
            <div className="flex justify-center gap-10">
              <Twitter className="h-6 w-6 text-slate-300 hover:text-slate-900 cursor-pointer transition-colors" />
              <Linkedin className="h-6 w-6 text-slate-300 hover:text-slate-900 cursor-pointer transition-colors" />
              <Mail className="h-6 w-6 text-slate-300 hover:text-slate-900 cursor-pointer transition-colors" />
            </div>
        </div>
      </footer>
    </div>
  );
}