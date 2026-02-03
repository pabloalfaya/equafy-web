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
              Iniciar Sesión
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Empezar ahora
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main>
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <h1 className="mx-auto mb-6 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
              Gestiona el <span className="text-emerald-600">Equity</span> de tu
              startup sin complicaciones
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600">
              Olvídate de las hojas de cálculo desordenadas. Registra aportaciones
              de dinero, trabajo y activos, y visualiza el reparto de acciones en
              tiempo real.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-emerald-700 hover:shadow-emerald-600/20"
              >
                Crear mi proyecto gratis
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
                  Visualización Clara
                </h3>
                <p className="text-slate-600">
                  Gráficos dinámicos que se actualizan automáticamente con cada nueva aportación.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">
                  Slicing Pie
                </h3>
                <p className="text-slate-600">
                  Calcula el valor ajustado por riesgo del trabajo y el dinero para un reparto justo.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">
                  Registro Seguro
                </h3>
                <p className="text-slate-600">
                  Mantén un histórico inmutable de quién aportó qué y cuándo lo hizo.
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
            © 2024 Equily. Hecho para fundadores.
          </p>
        </div>
      </footer>
    </div>
  );
}