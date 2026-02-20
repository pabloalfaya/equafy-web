"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Scale, Globe } from "lucide-react";

const COUNTRY_OPTIONS = [
  { value: "spain", label: "Spain" },
  { value: "united_states", label: "United States" },
  { value: "united_kingdom", label: "United Kingdom" },
  { value: "ireland", label: "Ireland" },
  { value: "india", label: "India" },
  { value: "mexico", label: "Mexico" },
  { value: "other", label: "Other Countries" },
] as const;

type CountryKey = (typeof COUNTRY_OPTIONS)[number]["value"];

const PREFIX = "Within your profile, in the legal section of the dashboard you will find ";

const COUNTRY_CONTENT: Record<CountryKey, string> = {
  spain:
    `${PREFIX}information regarding SL (Sociedad Limitada) equity frameworks and Spanish partnership agreements (Pacto de Socios).`,
  united_states:
    `${PREFIX}resources for LLC and C-Corp structures, including Vesting Schedules and stock option plans under US law.`,
  united_kingdom:
    `${PREFIX}guidance on LTD structures and UK-specific equity distribution models.`,
  ireland:
    `${PREFIX}legal considerations for Irish startups and tech-based equity agreements.`,
  india:
    `${PREFIX}overview of Indian startup regulations and equity compliance for founders.`,
  mexico:
    `${PREFIX}information for S.A. de C.V. structures and Mexican commercial law regarding equity.`,
  other:
    `${PREFIX}general international framework for equity distribution. Contact us for specific regional inquiries.`,
};

export default function LegalPage() {
  const [selectedCountry, setSelectedCountry] = useState<CountryKey>("spain");

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-400/20 blur-[120px] rounded-full opacity-50 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <main className="relative z-10 pt-44 pb-20 px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
              Legal <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Center</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              Transparency and trust matter. Here you will find our legal documents and policies that govern the use of Equily.
            </p>
          </div>

          {/* Country selector */}
          <section className="mb-10">
            <label htmlFor="country-select" className="block text-sm font-bold text-slate-700 mb-3">
              Select your country for specific legal resources
            </label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              <select
                id="country-select"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value as CountryKey)}
                className="w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm text-slate-900 font-semibold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all appearance-none cursor-pointer"
                aria-label="Select your country for specific legal resources"
              >
                {COUNTRY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>

            {/* Dynamic country content card */}
            <div
              key={selectedCountry}
              className="mt-6 bg-white/80 backdrop-blur-xl border border-white/60 rounded-[24px] p-6 md:p-8 shadow-lg transition-opacity duration-200"
            >
              <p className="text-slate-700 font-medium leading-relaxed">
                {COUNTRY_CONTENT[selectedCountry]}
              </p>
            </div>

            {/* Legal disclaimer */}
            <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-100/60 px-5 py-4 md:px-6 md:py-5">
              <p className="text-sm md:text-base font-medium leading-relaxed text-slate-700">
                <span className="font-bold text-slate-800">Disclaimer:</span> While Equily provides resources and templates to facilitate your equity management, these do not constitute professional legal advice. We strongly recommend consulting with a qualified legal expert in your jurisdiction to review and adapt any document to your specific needs.
              </p>
            </div>
          </section>

          {/* Core Legal Documents (moved to bottom) */}
          <section className="pt-8 border-t border-slate-200/80">
            <h2 className="text-2xl font-black text-slate-900 mb-8">Core Legal Documents</h2>
            <div className="space-y-8">
              <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-slate-100 rounded-xl">
                    <Scale className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Terms of Service</h3>
                </div>
                <p className="text-slate-500 font-medium leading-relaxed mb-4">
                  The terms and conditions that govern your use of Equily, including subscriptions, disclaimers, and applicable law.
                </p>
                <Link href="/terms" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700">
                  Read Terms of Service <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-slate-100 rounded-xl">
                    <Scale className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Privacy Policy</h3>
                </div>
                <p className="text-slate-500 font-medium leading-relaxed mb-4">
                  How we collect, use, and protect your data, including your rights under GDPR and CCPA.
                </p>
                <Link href="/privacy" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700">
                  Read Privacy Policy <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
