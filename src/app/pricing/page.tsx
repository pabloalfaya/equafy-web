"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight, Zap, ShieldCheck, Globe, Users, MessageSquare } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      
      {/* --- BACKGROUND AMBIENTAL UNIFICADO --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-400/20 blur-[120px] rounded-full opacity-50 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* --- NAVBAR PREMIUM --- */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/50 bg-white/60 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <Link href="/" className="relative group">
              <img src="/logo.png" alt="Equily Logo" className="relative h-28 w-auto object-contain" />
            </Link>
            <div className="hidden lg:flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200/50 backdrop-blur-md">
              {["What is Equily?", "How does Equily work?", "Pricing"].map((name) => (
                <Link key={name} href={`/${name.toLowerCase().replace(/ /g, '-')}`} 
                  className={`px-5 py-2 text-sm font-bold rounded-full transition-all ${name === 'Pricing' ? 'text-emerald-600 bg-white' : 'text-slate-600 hover:text-slate-900'}`}>
                  {name}
                </Link>
              ))}
              <Link href="/contact" className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-emerald-600 transition-all">Contact</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900">Log in</Link>
            <Link href="/login" className="relative group bg-slate-900 rounded-full px-6 py-2.5 flex items-center gap-2">
               <span className="text-sm font-bold text-white">Start Free</span>
               <ArrowRight className="w-4 h-4 text-emerald-400" />
            </Link>
          </div>
        </div>
      </nav>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="relative z-10 pt-44 pb-20 px-6">
        <div className="mx-auto max-w-5xl text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
            Fair pricing for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">fair equity.</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
            Choose the plan that fits your company stage. From side projects to high-growth ventures. [cite: 2026-02-03]
          </p>
        </div>

        {/* --- PRICING CARDS --- */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
          
          {/* BOOTSTRAP PLAN */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[40px] p-10 shadow-xl hover:shadow-2xl transition-all group">
            <div className="mb-8">
              <h3 className="text-xl font-black text-slate-900 mb-2">Bootstrap</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">XX</span>
                <span className="text-slate-400 font-bold">/mo</span>
              </div>
              <p className="text-sm text-slate-500 mt-4 font-medium italic">Perfect for new projects.</p>
            </div>
            <ul className="space-y-4 mb-10">
              {["1 Project", "Up to 3 Members", "Standard Multipliers", "Basic Export"].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/login" className="block text-center py-4 rounded-2xl border border-slate-200 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all">
              Get Started
            </Link>
          </div>

          {/* GROWTH PLAN (RECOMMENDED) */}
          <div className="relative bg-slate-900 rounded-[40px] p-10 shadow-2xl transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
              Most Popular
            </div>
            <div className="mb-8">
              <h3 className="text-xl font-black text-white mb-2">Growth</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">XX</span>
                <span className="text-slate-400 font-bold">/mo</span>
              </div>
              <p className="text-sm text-emerald-400/80 mt-4 font-bold uppercase tracking-widest">Everything in Bootstrap, plus:</p>
            </div>
            <ul className="space-y-4 mb-10">
              {[
                "Unlimited Projects", 
                "Up to 10 Members", 
                "Logarithmic Risk Toggle", 
                "Custom Multipliers",
                "Advanced Analytics"
              ].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm font-bold text-slate-200">
                  <Zap className="w-5 h-5 text-emerald-400" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/login" className="block text-center py-4 rounded-2xl bg-emerald-500 text-white font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
              Start Scaling
            </Link>
          </div>

          {/* ENTERPRISE PLAN */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[40px] p-10 shadow-xl">
            <div className="mb-8">
              <h3 className="text-xl font-black text-slate-900 mb-2">Enterprise</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">Custom</span>
              </div>
              <p className="text-sm text-slate-500 mt-4 font-medium italic">For complex legal structures.</p>
            </div>
            <ul className="space-y-4 mb-10">
              {[
                "Unlimited Members", 
                "Legal Template Export", 
                "Priority Support", 
                "Dedicated Advisor"
              ].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <ShieldCheck className="w-5 h-5 text-blue-500" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/contact" className="block text-center py-4 rounded-2xl bg-slate-900 text-white font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all">
              Contact Sales
            </Link>
          </div>
        </div>

        {/* --- FAQ MINI SECTION --- [cite: 2026-02-03] */}
        <div className="mt-40 max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">Common Questions</h2>
          <div className="space-y-6">
            <div className="bg-white/50 border border-slate-100 p-6 rounded-3xl">
              <h4 className="font-black text-sm uppercase tracking-widest text-slate-400 mb-2">Can I change models later?</h4>
              <p className="text-slate-600 font-medium leading-relaxed">Yes, you can switch between Just Split, Custom, or Flat models at any time. Your data will be recalculated instantly.</p>
            </div>
            <div className="bg-white/50 border border-slate-100 p-6 rounded-3xl">
              <h4 className="font-black text-sm uppercase tracking-widest text-slate-400 mb-2">What are "Monetary Units"?</h4>
              <p className="text-slate-600 font-medium leading-relaxed">To be currency-agnostic, Equily uses units that represent your local currency (Euro, Dollar, etc.) without discrimination.</p>
            </div>
          </div>
        </div>
      </main>

      {/* --- FOOTER UNIFICADO --- */}
      <footer className="bg-white border-t border-slate-200 py-10 text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest relative z-10">
        © 2026 Equily. Built for modern co-founders. [cite: 2026-02-04]
      </footer>
    </div>
  );
}