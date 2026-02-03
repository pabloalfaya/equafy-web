import Link from "next/link";
import { TrendingUp, ShieldCheck, PieChart, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* --- NAVBAR --- */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Equily
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
            >
              Log in
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main>
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <h1 className="mx-auto mb-6 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
              Manage your Startup&apos;s <span className="text-emerald-600">Equity</span> without the headache
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600">
              Forget messy spreadsheets. Track cash, labor, and asset contributions, 
              and visualize your equity split in real-time.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-emerald-700 hover:shadow-emerald-600/20"
              >
                Create my project for free
              </Link>
            </div>
          </div>
        </section>

        {/* --- FEATURES --- */}
        <section className="bg-slate-50 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-12 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <PieChart className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">
                  Clear Visualization
                </h3>
                <p className="text-slate-600">
                  Dynamic charts that update automatically with every new contribution.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">
                  Fair Split Logic
                </h3>
                <p className="text-slate-600">
                  Calculate risk-adjusted value for labor and cash to ensure a fair equity distribution.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">
                  Secure Record
                </h3>
                <p className="text-slate-600">
                  Keep an immutable history of who contributed what and when.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-100 bg-white py-12">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm text-slate-500">
            © 2026 Equily. Built for founders.
          </p>
        </div>
      </footer>
    </div>
  );
}