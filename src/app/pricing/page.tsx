"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function PricingPage() {
  const navItems = [
    { name: "What is Equily?", href: "/what-is-equily" },
    { name: "How does Equily work?", href: "/how-it-works" },
    { name: "Pricing", href: "/pricing" },
    { name: "Legal", href: "/legal" }
  ];

  // --- LÓGICA DEL NAVBAR ESCONDIDIZO ---
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Si estamos arriba del todo (menos de 50px), mostrar siempre
      if (currentScrollY < 50) {
        setIsNavVisible(true);
      } 
      // Si bajamos (current > last) -> ESCONDER
      else if (currentScrollY > lastScrollY.current) {
        setIsNavVisible(false);
      } 
      // Si subimos (current < last) -> MOSTRAR
      else {
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
            <Link href="/login?view=signup" className="hidden md:block text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">
              Sign Up
            </Link>
            <Link href="/login?view=signup" className="relative group">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-200"></div>
               <div className="relative flex items-center bg-slate-900 rounded-full px-6 py-2.5 leading-none">
                 {/* CAMBIO: Texto actualizado a Free Trial */}
                 <span className="text-sm font-bold text-white group-hover:text-emerald-50 transition duration-200">Free Trial</span>
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
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto items-stretch">
          <div className="flex flex-col bg-white/70 backdrop-blur-xl border border-white/60 rounded-[40px] p-10 shadow-xl hover:shadow-2xl transition-all">
            <div className="mb-8">
              <h3 className="text-xl font-black text-slate-900 mb-2">Monthly Plan</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">19.99</span>
                <span className="text-slate-400 font-bold">/mo</span>
              </div>
            </div>
            <ul className="space-y-4 mb-10">
              {[
                "1 Project",
                "Unlimited Members",
                "All Slicing Pie Models",
                "PDF Report Export",
                "Priority Support",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/login?view=signup"
              className="mt-auto block text-center py-4 rounded-2xl border border-slate-200 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              Start Now
            </Link>
          </div>

          <div className="relative flex flex-col bg-slate-900 rounded-[40px] p-10 shadow-2xl ring-2 ring-emerald-500/50">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg border border-emerald-400 whitespace-nowrap">
              Best Value - Save ~17%
            </div>
            <div className="mb-8">
              <h3 className="text-xl font-black text-white mb-2">Yearly Plan</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">199.99</span>
                <span className="text-slate-400 font-bold">/yr</span>
              </div>
            </div>
            <ul className="space-y-4 mb-10">
              {[
                "1 Project",
                "Unlimited Members",
                "All Slicing Pie Models",
                "PDF Report Export",
                "Priority Support",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm font-bold text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/login?view=signup"
              className="mt-auto block text-center py-4 rounded-2xl bg-emerald-500 text-white font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
            >
              Start Now
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