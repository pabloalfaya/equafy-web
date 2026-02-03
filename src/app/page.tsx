import Link from "next/link";
import { ShieldCheck, PieChart, Users, TrendingUp, ArrowRight, PlayCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* --- NAVBAR --- */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2">
          <div className="flex items-center gap-8">
            <img src="/logo.png" alt="Equily Logo" className="h-24 w-auto object-contain" />
            <div className="hidden md:flex items-center gap-6">
              <Link href="/what-is-equily" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition">What is Equily?</Link>
              <Link href="/how-it-works" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition">How it works</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900">Log in</Link>
            <Link href="/dashboard" className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800">Start Free</Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION (Inspirado en Imagen 1) --- */}
      <header className="relative pt-16 pb-24 overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600 mb-8 border border-emerald-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            New: Smart Dynamic Split v2.0
          </div>
          <h1 className="mx-auto mb-6 max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
            Equity that <span className="text-emerald-600">evolves</span> <br />with your company.
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-600 leading-relaxed">
            Stop guessing. Use a mathematical framework to split equity based on real contributions, cash, and market risk.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row items-center">
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-xl transition hover:bg-emerald-700 hover:scale-105">
              Start Splitting Free
            </Link>
            <button className="inline-flex items-center gap-2 text-slate-600 font-semibold hover:text-slate-900">
              <PlayCircle className="h-6 w-6" /> Watch Demo
            </button>
          </div>
        </div>
      </header>

      {/* --- DYNAMIC CAP TABLE PREVIEW (Inspirado en Imagen 2) --- */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-900 p-8 shadow-2xl text-white">
            <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
              <div>
                <h2 className="text-2xl font-bold">Cap Table Live Status</h2>
                <p className="text-slate-400 text-sm">Real-time risk-adjusted ownership</p>
              </div>
              <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-mono border border-emerald-500/20">
                ● Algorithm Active
              </div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Table Body */}
              <div className="space-y-6">
                {[
                  { name: "Alex (CEO)", type: "Time & IP", value: "€150k", risk: "x4", ownership: "45.0%" },
                  { name: "Ben (CTO)", type: "Time", value: "€100k", risk: "x4", ownership: "30.0%" },
                  { name: "VC Fund A", type: "Cash", value: "€250k", risk: "x2", ownership: "18.75%" },
                ].map((member, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700"></div>
                      <div>
                        <p className="font-bold text-sm">{member.name}</p>
                        <p className="text-xs text-slate-500">{member.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-bold">{member.ownership}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{member.risk} Multiplier</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart Visual */}
              <div className="relative flex items-center justify-center py-8 bg-slate-800/50 rounded-2xl border border-slate-800">
                <div className="text-center">
                  <PieChart className="h-32 w-32 text-emerald-500 mx-auto opacity-80" />
                  <p className="mt-4 text-xl font-bold">€1,375,000</p>
                  <p className="text-xs text-slate-500">Total Risk-Adjusted Value</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER CTA (Inspirado en Imagen 3) --- */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative rounded-[40px] bg-gradient-to-br from-emerald-50 to-blue-50 p-12 lg:p-24 overflow-hidden border border-emerald-100 text-center">
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6">
                Start Slicing The Pie <br />
                <span className="text-emerald-600">fairly today</span>
              </h2>
              <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto">
                Join thousands of smart founders who choose to stop guessing and start splitting equity with data-driven precision.
              </p>
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-10 py-5 text-xl font-bold text-white transition hover:bg-slate-800 hover:scale-105 shadow-2xl">
                Create My Project Now
              </Link>
            </div>
            {/* Abstract Background Element */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-emerald-200/20 blur-3xl rounded-full"></div>
          </div>
        </div>
      </section>

      {/* --- SIMPLE FOOTER --- */}
      <footer className="border-t border-slate-100 py-12 text-center text-slate-400 text-sm">
        <div className="flex justify-center gap-8 mb-4 text-slate-600">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <p>© 2026 Equily. Modern tools for modern founders.</p>
      </footer>
    </div>
  );
}