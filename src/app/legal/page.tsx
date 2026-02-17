"use client";

import Link from "next/link";
import { ArrowRight, Scale } from "lucide-react";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      
      {/* --- BACKGROUND AMBIENTAL --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-400/20 blur-[120px] rounded-full opacity-50 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

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
              <p className="text-slate-500 font-medium leading-relaxed mb-4">
                The terms and conditions that govern your use of Equily, including subscriptions, disclaimers, and applicable law.
              </p>
              <Link href="/terms" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700">
                Read Terms of Service <ArrowRight className="w-4 h-4" />
              </Link>
            </section>

            {/* Privacy Policy */}
            <section className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-100 rounded-xl">
                  <Scale className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Privacy Policy</h2>
              </div>
              <p className="text-slate-500 font-medium leading-relaxed mb-4">
                How we collect, use, and protect your data, including your rights under GDPR and CCPA.
              </p>
              <Link href="/privacy" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700">
                Read Privacy Policy <ArrowRight className="w-4 h-4" />
              </Link>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
