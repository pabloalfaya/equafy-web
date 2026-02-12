"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, ShieldCheck, Clock } from "lucide-react";

export default function ProjectLegalPage() {
  const params = useParams();
  const projectId = params?.id as string;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-400/20 blur-[120px] rounded-full opacity-50 mix-blend-multiply" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-400/10 blur-[120px] rounded-full opacity-40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <main className="relative z-10 pt-8 pb-20 px-6">
        <div className="mx-auto max-w-4xl">
          {/* Back to Dashboard */}
          <Link
            href={projectId ? `/dashboard/${projectId}` : "/dashboard"}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          {/* Header */}
          <header className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Legal Documents
            </h1>
            <p className="mt-2 text-lg text-slate-500 font-medium">
              Secure repository for your company agreements.
            </p>
          </header>

          {/* Info Banner */}
          <div className="mb-10 rounded-2xl border border-amber-200 bg-amber-50/80 backdrop-blur-sm px-5 py-4 shadow-sm">
            <p className="text-sm font-medium text-amber-900">
              This module is under construction. Soon you will be able to generate and sign legal contracts here.
            </p>
          </div>

          {/* Document Cards Grid */}
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm opacity-75">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-3 rounded-xl bg-slate-100 text-slate-400">
                  <FileText className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-700 text-lg">Partnership Agreement</h3>
                  <span className="inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full bg-slate-200 text-slate-500 uppercase tracking-wider">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm opacity-75">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-3 rounded-xl bg-slate-100 text-slate-400">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-700 text-lg">IP Assignment</h3>
                  <span className="inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full bg-slate-200 text-slate-500 uppercase tracking-wider">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm opacity-75">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-3 rounded-xl bg-slate-100 text-slate-400">
                  <Clock className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-700 text-lg">Vesting Schedule</h3>
                  <span className="inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full bg-slate-200 text-slate-500 uppercase tracking-wider">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
