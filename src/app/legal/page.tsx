"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Scale } from "lucide-react";

export default function LegalPage() {
  const navItems = [
    { name: "What is Equily?", href: "/what-is-equily" },
    { name: "How does Equily work?", href: "/how-it-works" },
    { name: "Pricing", href: "/pricing" },
    { name: "Legal", href: "/legal" }
  ];

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
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav 
        className={`fixed top-0 inset-x-0 z-50 border-b border-white/50 bg-white/60 backdrop-blur-xl transition-transform duration-300 ease-in-out ${
          isNavVisible ? "translate-y-0" : "-translate-y-full"
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
                  className={`px-5 py-2 text-sm font-bold rounded-full transition-all ${
                    item.href === "/legal" ? "text-emerald-600 bg-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Link href="/contact" className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-emerald-600 transition-all">
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
                <span className="text-sm font-bold text-white group-hover:text-emerald-50 transition duration-200">Free Trial</span>
                <ArrowRight className="w-4 h-4 text-emerald-400 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="relative z-10 pt-44 pb-20 px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-16">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
              Legal <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Center</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              Transparency and trust matter. Here you will find our legal documents and policies that govern the use of Equily.
            </p>
          </div>

          <div className="space-y-12">
            {/* Terms of Service */}
            <section className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-100 rounded-xl">
                  <Scale className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Terms of Service</h2>
              </div>
              <p className="text-slate-500 font-medium leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Coming soon...
              </p>
            </section>

            {/* Privacy Policy */}
            <section className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-100 rounded-xl">
                  <Scale className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Privacy Policy</h2>
              </div>
              <p className="text-slate-500 font-medium leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident. Coming soon...
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-10 text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest relative z-10">
        © 2026 Equily. Built for modern co-founders.
      </footer>
    </div>
  );
}
