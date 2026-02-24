"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  LogOut,
  CreditCard,
  Receipt,
  User,
  Shield,
  Trash2,
  Save,
  ArrowLeft,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { BRAND } from "@/lib/brand";

type BillingProject = {
  id: string;
  name: string | null;
  status?: string | null;
  stripe_subscription_id?: string | null;
};

export default function ProfilePage() {
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [billingProjects, setBillingProjects] = useState<BillingProject[]>([]);
  const [billingLoading, setBillingLoading] = useState(false);
  const [portalLoadingId, setPortalLoadingId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const loadBillingProjects = async (userId: string) => {
    setBillingLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, status, stripe_subscription_id")
      .eq("owner_id", userId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setBillingProjects(data as BillingProject[]);
    }
    setBillingLoading(false);
  };

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
      await loadBillingProjects(user.id);
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

  const handlePasswordReset = () => {
    const params = new URLSearchParams({ forgot: "1" });
    if (email) params.set("email", email);
    router.push(`/login?${params.toString()}`);
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
      `Account deletion is handled by our support team. Please contact ${BRAND.supportEmail} to request account deletion.`
    );
  };

  const handleManageSubscription = async (project: BillingProject) => {
    const stripeSubId = project.stripe_subscription_id;
    if (!stripeSubId) return;
    setPortalLoadingId(project.id);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to open billing portal");
      if (data?.url) {
        const url = String(data.url);
        const win = window.open(url, "_blank", "noopener,noreferrer");
        if (!win) {
          window.location.href = url;
        }
        return;
      }
      throw new Error("No portal URL received");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not open billing portal");
    } finally {
      setPortalLoadingId(null);
    }
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

        {/* 2. PAYMENTS & INVOICING */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 mb-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-slate-600" /> Payments & Invoicing
          </h2>
          <p className="text-slate-600 font-medium text-sm leading-relaxed mb-4">
            Payments and invoices are managed per project. Click the gear icon on each project card in your dashboard to manage billing and subscriptions.
          </p>

          <div className="mt-4 space-y-3">
            {billingLoading ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading your projects…</span>
              </div>
            ) : billingProjects.length === 0 ? (
              <p className="text-slate-400 text-sm font-medium">
                You don&apos;t have any projects yet. Create a project to manage payments and invoices.
              </p>
            ) : (
              <div className="space-y-2">
                {billingProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="min-w-0 mr-3">
                      <p className="font-bold text-slate-900 truncate">{project.name || "Untitled project"}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        {project.status === "active" ? "Active" : project.status === "frozen" ? "Frozen" : "Draft"}
                      </p>
                    </div>
                    {project.stripe_subscription_id ? (
                      <button
                        type="button"
                        onClick={() => handleManageSubscription(project)}
                        disabled={portalLoadingId === project.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {portalLoadingId === project.id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" /> Opening…
                          </>
                        ) : (
                          <>
                            <Receipt className="w-3 h-3" /> Manage payments & invoices
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        No active subscription
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 3. SECURITY */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 mb-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-slate-600" /> Security
          </h2>
          <p className="text-slate-600 font-medium text-sm leading-relaxed mb-4">
            To change your password, go to the login page and use &quot;Forgot
            password?&quot; to receive the reset link.
          </p>
          <button
            type="button"
            onClick={handlePasswordReset}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 px-6 py-3 rounded-xl font-bold transition-all"
          >
            Go to reset password
          </button>
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
