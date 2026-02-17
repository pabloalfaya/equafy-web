"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  LogOut,
  CreditCard,
  User,
  Shield,
  Trash2,
  Save,
  ArrowLeft,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ProfilePage() {
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/login");
        return;
      }
      setEmail(user.email ?? "");
      setFullName((user.user_metadata?.full_name as string) ?? "");
      setJobTitle((user.user_metadata?.job_title as string) ?? "");
      setLoading(false);
    };
    fetchUser();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName, job_title: jobTitle },
    });
    setUpdating(false);
    if (error) {
      alert("Could not update profile: " + error.message);
      return;
    }
    alert("Profile updated successfully.");
  };

  const handlePasswordReset = async () => {
    if (!email) {
      alert("No email on file. Cannot send reset link.");
      return;
    }
    const ok = window.confirm(
      "Send a password reset link to " + email + "?"
    );
    if (!ok) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) {
      alert("Failed to send reset email: " + error.message);
      return;
    }
    alert("Check your inbox for the reset link.");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  const handleDeleteAccount = () => {
    const ok = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!ok) return;
    alert(
      "Account deletion is handled by our support team. Please contact support@getequily.com to request account deletion."
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-slate-400 text-sm font-bold animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <nav className="border-b border-slate-200 bg-white px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <Link href="/dashboard">
          <img
            src="/logo.png"
            alt="Equily"
            className="h-20 w-auto opacity-80 hover:opacity-100 transition-opacity object-contain"
          />
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-400 hidden sm:block">
            {email}
          </span>
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
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
              <User className="w-8 h-8 text-slate-600" /> My Profile
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Manage your account and preferences.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Projects
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* 1. PERSONAL INFORMATION */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 mb-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-slate-600" /> Personal Information
          </h2>
          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                placeholder="e.g. Co-founder, CTO"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full border border-slate-100 rounded-xl px-4 py-3 font-medium text-slate-400 bg-slate-50 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">
                Email cannot be changed here.
              </p>
            </div>
            <button
              type="submit"
              disabled={updating}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
            >
              {updating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> Save Changes
                </>
              )}
            </button>
          </form>
        </section>

        {/* 2. SECURITY */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 mb-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-slate-600" /> Security
          </h2>
          <p className="text-slate-600 font-medium text-sm leading-relaxed mb-4">
            Forgot your password? We&apos;ll send you a link to reset it. Check
            your email (including spam) after clicking below.
          </p>
          <button
            type="button"
            onClick={handlePasswordReset}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 px-6 py-3 rounded-xl font-bold transition-all"
          >
            Send Reset Email
          </button>
        </section>

        {/* 3. PAYMENTS */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 mb-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-slate-600" /> Payments
          </h2>
          <p className="text-slate-600 font-medium text-sm leading-relaxed mb-4">
            Manage your project payments and invoices here. Select a project from your dashboard to view specific billing details.
          </p>
          {/* Reserved for future: list of invoices / project billing status */}
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center" aria-hidden="true">
            <p className="text-slate-400 text-sm font-medium">
              Billing details and invoices will appear here.
            </p>
          </div>
        </section>

        {/* 4. DANGER ZONE */}
        <section className="bg-red-50 border border-red-200 rounded-2xl p-8">
          <h2 className="text-lg font-bold text-red-800 flex items-center gap-2 mb-2">
            <Trash2 className="w-5 h-5" /> Danger Zone
          </h2>
          <p className="text-red-700/80 text-sm font-medium mb-4">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
          >
            <Trash2 className="w-4 h-4" /> Delete Account
          </button>
        </section>
      </main>
    </div>
  );
}
