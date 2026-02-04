"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight, Zap, ShieldCheck, Globe, Users, MessageSquare } from "lucide-react";

export default function PricingPage() {
  // Definimos los enlaces de forma explícita para evitar errores de ruta
  const navItems = [
    { name: "What is Equily?", href: "/what-is-equily" },
    { name: "How does Equily work?", href: "/how-it-works" },
    { name: "Pricing", href: "/pricing" }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      
      {/* --- BACKGROUND AMBIENTAL --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-400/20 blur-[120px] rounded-full opacity-50 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* --- NAVBAR REPARADO --- */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/50 bg-white/60 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <Link href="/" className="relative group">
              <img src="/logo.png" alt="Equily Logo" className="relative h-28 w-auto object-contain" />
            </Link>
            <div className="hidden lg:flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200/50 backdrop-blur-md">
              {navItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className={`px-5 py-2 text-sm font-bold rounded-full transition-all ${item.href === '/pricing' ? 'text-emerald-600 bg-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {item.name}
                </Link>
              ))}
              <Link href="/contact" className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-emerald-600 transition-all">Contact</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:block text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
              Log in
            </Link>
            {/* BOTÓN REPARADO: SIGN UP */}
            <Link href="/login" className="hidden md:block text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">
              Sign Up
            </Link>
            <Link href="/login" className="relative group">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-200"></div>
               <div className="relative flex items-center bg-slate-900 rounded-full px-6 py-2.5 leading-none">
                 <span className="text-sm font-bold text-white group-hover:text-emerald-50 transition duration-200">Start Free</span>
                 <ArrowRight className="w-4 h-4 text-emerald-400 ml-2 group-hover:translate-x-1 transition-transform" />
               </div>
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
            Choose the plan that fits your company stage. From side projects to high-growth ventures.
          </p>
        </div>

        {/* --- PRICING CARDS --- */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
          
          {/* Plan Bootstrap */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[40px] p-10 shadow-xl hover:shadow-2xl transition-all">
            <div className="mb-8">
              <h3 className="text-xl font-black text-slate-900 mb-2">Bootstrap</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">XX</span>
                <span className="text-slate-400 font-bold">/mo</span>
              </div>
            </div>
            <ul className="space-y-4 mb-10">
              {["1 Project", "Up to 3 Members", "Standard Multipliers"].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/login" className="block text-center py-4 rounded-2xl border border-slate-200 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all">
              Get Started
            </Link>
          </div>

          {/* Plan Growth */}
          <div className="relative bg-slate-900 rounded-[40px] p-10 shadow-2xl transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg border border-emerald-400">
              Most Popular
            </div>
            <div className="mb-8">
              <h3 className="text-xl font-black text-white mb-2">Growth</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">XX</span>
                <span className="text-slate-400 font-bold">/mo</span>
              </div>
            </div>
            <ul className="space-y-4 mb-10">
              {["Unlimited Projects", "Up to 10 Members", "Logarithmic Risk Toggle", "Custom Multipliers"].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm font-bold text-slate-200">
                  <Zap className="w-5 h-5 text-emerald-400" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/login" className="block text-center py-4 rounded-2xl bg-emerald-500 text-white font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
              Start Scaling
            </Link>
          </div>

          {/* Plan Enterprise */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[40px] p-10 shadow-xl">
            <div className="mb-8">
              <h3 className="text-xl font-black text-slate-900 mb-2">Enterprise</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">Custom</span>
              </div>
            </div>
            <ul className="space-y-4 mb-10">
              {["Unlimited Members", "Legal Template Export", "Priority Support"].map(f => (
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
      </main>

      <footer className="bg-white border-t border-slate-200 py-10 text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest relative z-10">
        © 2026 Equily. Built for modern co-founders.
      </footer>
    </div>
  );
}