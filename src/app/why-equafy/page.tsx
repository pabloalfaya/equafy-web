"use client";

import Link from "next/link";
import { Cog, Shield, Scale, Rocket, ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/brand";

const SECTIONS = [
  {
    id: "calculation-engine",
    icon: Cog,
    title: "Dynamic Calculation Engine",
    subtitle: "Your Cap Table on Autopilot",
    accent: "emerald",
    items: [
      {
        title: "Flexible, Smart Models",
        content:
          "Use our Just Split Model (recommended for startups with risk-based multipliers), the traditional Flat Model, or create a Custom model tailored to your needs. Our system suggests Smart Multipliers based on your project's current valuation.",
      },
      {
        title: "Universal Contribution Registry",
        content:
          "Ultra-intuitive interface to log work hours, capital injections, or tangible and intangible assets. Cash, sweat, or servers—we track it all.",
      },
      {
        title: "Surgical Equity Control",
        content:
          "Investor partner who shouldn't dilute? Use Fixed Equity. Want to cap a collaborator's stake? Enable Hard Caps (Limited Equity). You're in control.",
      },
      {
        title: "Simulation Mode (The \"What If\")",
        content:
          "What happens if a new partner or Business Angel joins? Simulate scenarios in real time without touching your official data—make strategic decisions with confidence.",
      },
    ],
  },
  {
    id: "security-transparency",
    icon: Shield,
    title: "Institutional Security & Radical Transparency",
    subtitle: "Trust is good. An immutable record is better.",
    accent: "blue",
    items: [
      {
        title: "Project Freeze Certificate (Our flagship feature)",
        content:
          `When your team is ready to incorporate legally, one click freezes the calculations. ${BRAND.name} issues an Official Certificate (Executive Summary) with the exact ownership snapshot to take straight to the notary. Need last-minute changes? You can Unfreeze and update.`,
      },
      {
        title: "Immutable Audit Log",
        content:
          "Radical transparency. A detailed history where every partner knows exactly who modified a percentage, who deleted a contribution, and when.",
      },
      {
        title: "Granular Permission Control",
        content:
          "Strict role-based access (Owner, Co-owner, Worker, Venture Capital) ensuring only those who should touch the numbers can do so.",
      },
    ],
  },
  {
    id: "legal-hub",
    icon: Scale,
    title: "International Legal Hub",
    subtitle: "The bridge to your legal security",
    accent: "violet",
    items: [
      {
        title: "Global Coverage, Zero Friction",
        content:
          "Jurisdictional guides and document templates adapted for operating in the United States, Spain, United Kingdom, Ireland, India, and Mexico.",
      },
      {
        title: "Dynamic Documents",
        content:
          "Export your Cap Table to PDF instantly and access key templates such as the Partnership Agreement.",
      },
      {
        title: "Secure Document Vault",
        content:
          `An encrypted space inside your dashboard to upload and store all signed contracts and PDFs. If it's in ${BRAND.name}, it's official.`,
      },
    ],
  },
  {
    id: "built-to-scale",
    icon: Rocket,
    title: "Built to Scale With You",
    subtitle: "From garage to incorporation",
    accent: "amber",
    items: [
      {
        title: "Multi-Structure Management",
        content:
          "Create and manage multiple projects from a single account. Ideal for Serial Entrepreneurs or Venture Builders.",
      },
      {
        title: "Real-Time Updates",
        content:
          "Project valuation and the interactive Team Breakdown chart recalculate automatically with every new contribution.",
      },
      {
        title: "Complete Ecosystem",
        content:
          "Video demos, step-by-step guides (How it works), and an API ready for the future.",
      },
    ],
  },
];

export default function WhyEquafyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-400/15 blur-[120px] rounded-full opacity-60 mix-blend-multiply" />
        <div className="absolute bottom-0 right-0 w-[700px] h-[500px] bg-blue-400/10 blur-[100px] rounded-full opacity-50 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:28px_28px]" />
      </div>

      <main className="relative z-10 pt-32 md:pt-40 pb-24 md:pb-32">
        <div className="mx-auto max-w-screen-xl px-6 md:px-12 lg:px-24">
          {/* Hero */}
          <header className="text-center mb-20 md:mb-24">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
              Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">{BRAND.name}?</span>
            </h1>
            <p className="text-xl md:text-2xl font-bold text-slate-700 mb-6 max-w-3xl mx-auto leading-relaxed">
              The end of equity arguments. The start of total transparency.
            </p>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Building a startup or company is hard—splitting the pie shouldn't be. We've created the only all-in-one platform that covers the full lifecycle of your venture: from the first line of code in a garage to the signing at the notary.
            </p>
            <p className="text-lg font-semibold text-slate-700 mt-6 max-w-xl mx-auto">
              Goodbye to broken Excel spreadsheets and verbal agreements. Welcome to the single source of truth.
            </p>
            <div className="mt-10">
              <Link
                href="/login?view=signup"
                className="inline-flex items-center gap-2 h-14 px-8 rounded-2xl bg-emerald-500 text-white font-bold text-lg shadow-lg hover:bg-emerald-600 hover:-translate-y-0.5 transition-all duration-300"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </header>

          {/* Sections */}
          <div className="space-y-20 md:space-y-28">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const accentColors: Record<string, string> = {
                emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
                blue: "bg-blue-50 text-blue-600 border-blue-200",
                violet: "bg-violet-50 text-violet-600 border-violet-200",
                amber: "bg-amber-50 text-amber-600 border-amber-200",
              };
              const accent = accentColors[section.accent] ?? accentColors.emerald;

              return (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-28"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-6 mb-10">
                    <div
                      className={`inline-flex p-4 rounded-2xl border ${accent} shrink-0`}
                    >
                      <Icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                        {section.title}
                      </h2>
                      <p className="text-lg text-slate-600 font-medium">
                        {section.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {section.items.map((item) => (
                      <div
                        key={item.title}
                        className="rounded-2xl bg-white border border-slate-200/80 p-6 md:p-7 shadow-sm hover:shadow-lg hover:border-slate-300/80 transition-all duration-300"
                      >
                        <h3 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">
                          {item.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                          {item.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-24 md:mt-28 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Ready to split the pie fairly?
            </h2>
            <p className="text-slate-600 mb-8 max-w-xl mx-auto">
              Join founders who trust {BRAND.name} for transparent, dynamic equity management.
            </p>
            <Link
              href="/login?view=signup"
              className="inline-flex items-center gap-2 h-14 px-8 rounded-2xl bg-emerald-500 text-white font-bold text-lg hover:bg-emerald-400 transition-all duration-300"
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
