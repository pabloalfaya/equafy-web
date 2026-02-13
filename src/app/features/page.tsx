"use client";

import Link from "next/link";
import {
  PlusCircle,
  Edit3,
  Trash2,
  Settings,
  Anchor,
  Lock,
  FileSearch,
  ShieldCheck,
  Download,
} from "lucide-react";

const FEATURES = [
  {
    title: "Add Contributions",
    icon: PlusCircle,
    description:
      "Log cash, time, IP, or supplies for any member instantly with our guided wizard.",
  },
  {
    title: "Edit Entries",
    icon: Edit3,
    description:
      "Made a mistake? Edit any past contribution value or description to keep records 100% accurate.",
  },
  {
    title: "Delete Participations",
    icon: Trash2,
    description:
      "Remove incorrect or duplicated entries easily to maintain a clean history.",
  },
  {
    title: "Custom Multipliers",
    icon: Settings,
    description:
      "Adjust risk multipliers (x2, x4) for Cash vs. Work to match your project's stage.",
  },
  {
    title: "Fixed Equity",
    icon: Anchor,
    description:
      "Assign immovable percentages to founders that remain static regardless of new contributions.",
  },
  {
    title: "Hard Caps",
    icon: Lock,
    description:
      'Set "Hard Caps" to limit the maximum % a member can ever unlock, protecting the cap table.',
  },
  {
    title: "Audit Log",
    icon: FileSearch,
    description:
      "Full transparency. View a security history of every modification: who made it, what changed, and when.",
  },
  {
    title: "Role Management",
    icon: ShieldCheck,
    description:
      "Assign specific roles (Owner, Co-owner, Worker) to control who can edit or just view data.",
  },
  {
    title: "PDF Export",
    icon: Download,
    description:
      "Generate professional, signed-ready reports of your Cap Table and contribution history.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-400/20 blur-[120px] rounded-full opacity-50 mix-blend-multiply" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-400/10 blur-[120px] rounded-full opacity-40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <main className="relative z-10 pt-32 md:pt-44 pb-20 md:pb-32 px-6">
        <div className="mx-auto max-w-6xl">
          <header className="text-center mb-16 md:mb-20">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6">
              Complete Control Over Your Equity
            </h1>
            <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed tracking-tight">
              Powerful tools to manage contributions, define rules, and maintain total transparency.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl bg-white border border-slate-200/80 p-8 shadow-sm hover:shadow-lg hover:border-slate-300/80 transition-all duration-300"
                >
                  <div className="inline-flex p-3 rounded-full mb-5 bg-emerald-50">
                    <Icon className="w-6 h-6 text-emerald-600 shrink-0" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 font-medium text-sm leading-relaxed tracking-tight">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-20 md:mt-24 text-center rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/80 shadow-sm py-12 px-6">
            <p className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">
              Ready to split fairly?
            </p>
            <Link
              href="/login?view=signup"
              className="inline-flex items-center justify-center h-14 px-8 rounded-2xl font-bold text-lg text-white shadow-lg transition-all duration-300 hover:opacity-95 hover:-translate-y-0.5 bg-emerald-500 hover:bg-emerald-600"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
