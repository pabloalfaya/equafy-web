"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function SupportContactPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const supportEmail = "contact@getequafy.com";
  const mailtoHref = `mailto:${supportEmail}?subject=${encodeURIComponent(
    "Support request from Equafy dashboard"
  )}`;

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
              Support
            </p>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">
              Contact Support
            </h1>
          </div>
        </header>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50">
              <Mail className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Email our team</h2>
              <p className="text-sm text-slate-500">
                Send us a message and we&apos;ll get back to you as soon as possible.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p>
              You can contact us directly at{" "}
              <a
                href={mailtoHref}
                className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                {supportEmail}
              </a>
              .
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Please include a short description of your issue, the project name, and any relevant
              screenshots or error messages.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href={mailtoHref}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white shadow-lg hover:bg-emerald-600 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Open email app
            </a>
            <p className="text-xs text-slate-400">
              Prefer another channel? You can also reach us at{" "}
              <span className="font-semibold text-slate-500">{supportEmail}</span> from your usual
              email client.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">
            <p>
              Looking for documentation first? Visit our{" "}
              <Link href="/dashboard/help" className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline">
                Help Center & Tutorials
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
