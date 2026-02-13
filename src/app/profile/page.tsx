"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, CreditCard, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: u }, error } = await supabase.auth.getUser();
      if (error || !u) {
        router.push("/login");
        return;
      }
      setUser(u);
      setLoading(false);
    };
    fetchUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  const handleUpgradeClick = () => {
    alert("Payments coming soon!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-slate-400 text-sm font-bold animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <nav className="border-b border-slate-200 bg-white px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <Link href="/dashboard">
          <img src="/logo.png" alt="Equily" className="h-20 w-auto opacity-80 hover:opacity-100 transition-opacity object-contain" />
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-400 hidden sm:block">{user?.email ?? ""}</span>
          <button
            onClick={handleSignOut}
            className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-black text-slate-900">My Profile</h1>
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
            >
              ← Back to Projects
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 mb-6">
          <dl className="space-y-6">
            <div>
              <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</dt>
              <dd className="text-slate-900 font-semibold">{user?.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">User ID</dt>
              <dd className="text-slate-600 font-mono text-sm break-all">{user?.id ?? "—"}</dd>
            </div>
          </dl>
        </div>

        {/* Subscription card - Free tier */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Subscription</h2>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Current Plan</h3>
          <span className="inline-block bg-emerald-50 text-emerald-700 text-sm font-bold px-3 py-1 rounded-full mb-4">
            Free Plan
          </span>
          <p className="text-slate-600 font-medium text-sm leading-relaxed mb-6">
            You are currently on the free tier. Upgrade to unlock unlimited projects and export features.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleUpgradeClick}
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
            >
              <Sparkles className="w-5 h-5" /> Upgrade to Pro
            </button>
            {/* Manage Billing - enable when Stripe is integrated */}
            <button
              disabled
              className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-400 cursor-not-allowed px-6 py-3 rounded-xl font-bold"
            >
              <CreditCard className="w-5 h-5" /> Manage Billing
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
