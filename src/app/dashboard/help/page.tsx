"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function HelpCenterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setLoading(false);
    };
    void check();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <p className="text-slate-400 font-bold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <main className="max-w-2xl mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-10">
        <header className="mb-8 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Resources
            </p>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">
              Help Center & Tutorials
            </h1>
          </div>
        </header>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-10 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-slate-100 mb-6">
            <BookOpen className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">
            Coming soon
          </h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Guides and tutorials are still in the works. In the meantime, you can{" "}
            <button
              type="button"
              onClick={() => router.push("/dashboard/support")}
              className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              contact support
            </button>{" "}
            if you need help.
          </p>
        </section>
      </main>
    </div>
  );
}
