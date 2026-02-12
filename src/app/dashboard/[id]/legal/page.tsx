"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, FileText, ShieldCheck, Clock, LayoutDashboard } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ProjectLegalPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const [projectName, setProjectName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [navVisible, setNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const supabase = createClient();
    void (async () => {
      try {
        const { data } = await supabase.from("projects").select("name").eq("id", projectId).single();
        if (!cancelled) setProjectName(data?.name ?? null);
      } catch {
        if (!cancelled) setProjectName(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [projectId]);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setLastScrollY((prevY) => {
        if (currentY > prevY && currentY > 50) setNavVisible(false);
        else if (currentY < prevY) setNavVisible(true);
        return currentY;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-emerald-200 rounded-full" />
          <p className="text-slate-400 font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      {/* Internal Dashboard Nav (same as project dashboard) */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 border-b border-white/50 bg-white/60 backdrop-blur-xl transition-transform duration-300 ${
          navVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <div className="flex items-center gap-4">
            <Link
              href={projectId ? `/dashboard/${projectId}` : "/dashboard"}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <Link href="/">
              <img src="/logo.png" alt="Equily" className="h-20 w-auto object-contain" />
            </Link>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full border border-slate-200/50">
            <LayoutDashboard className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-bold text-slate-700">
              {projectName ?? "Legal Documents"}
            </span>
          </div>
        </div>
      </nav>

      {/* Content — same padding as dashboard main so it sits below nav */}
      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="mx-auto max-w-4xl">
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
