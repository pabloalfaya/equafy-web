"use client";

import Link from "next/link";
import { Plug } from "lucide-react";
import { BRAND } from "@/lib/brand";

export default function APIsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-400/20 blur-[120px] rounded-full opacity-50 mix-blend-multiply" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-400/10 blur-[120px] rounded-full opacity-40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <main className="relative z-10 pt-32 md:pt-40 pb-20 md:pb-28 px-6 md:px-12 lg:px-24">
        <div className="mx-auto max-w-screen-2xl">
          <header className="text-center mb-12 md:mb-16">
            <div className="inline-flex p-3 rounded-full mb-6 bg-violet-50">
              <Plug className="w-10 h-10 text-violet-600 shrink-0" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6">
              APIs & Integrations
            </h1>
            <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed tracking-tight">
              Work tools you can sync with {BRAND.name}. Connect your existing apps and keep your equity data in one place.
            </p>
          </header>

          <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/80 shadow-sm py-16 px-6 md:px-12 text-center">
            <p className="text-slate-600 font-medium max-w-xl mx-auto leading-relaxed mb-8">
              Coming soon: API and integration documentation to connect {BRAND.name} with your daily workflow and tools.
            </p>
            <Link
              href="/features"
              className="inline-flex items-center justify-center h-12 px-6 rounded-xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all duration-200"
            >
              View Features
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
