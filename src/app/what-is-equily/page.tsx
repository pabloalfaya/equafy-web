import Link from "next/link";
import { PlayCircle, CheckCircle2, PieChart, Users, TrendingUp } from "lucide-react";

export default function WhatIsEquily() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative overflow-hidden">
      
      {/* --- FONDO CON TEXTURA --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(#059669 0.8px, transparent 0.8px)', backgroundSize: '32px 32px' }}></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="border-b border-slate-200/60 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <div className="flex items-center gap-10">
            <Link href="/">
              <img src="/logo.png" alt="Equily Logo" className="h-20 w-auto object-contain cursor-pointer" />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 shadow-lg">Start Free</Link>
          </div>
        </div>
      </nav>

      {/* --- SECCIÓN PRINCIPAL (Inspirada en Figma) --- */}
      <main className="relative z-10 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Texto Descriptivo */}
            <div>
              <h1 className="text-5xl font-black tracking-tight mb-8 border-b-4 border-emerald-500 inline-block">
                What Is Equily?
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed font-medium mb-6">
                Fair equity, powered by data. Equily empowers founders with a dynamic algorithm 
                that distributes company ownership based on **actual contributions**, not just promises.
              </p>
              <p className="text-lg text-slate-500 leading-relaxed mb-8">
                Whether it's cash, time, intellectual property (IP), or equipment, our system quantifies 
                every input using adjustable parameters. The result is a **Dynamic Cap Table** that updates in real-time.
              </p>
              
              <div className="space-y-4">
                {["Track contributions in real-time", "Mathematical fairness algorithm", "Investor-ready reports"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 font-bold text-slate-700">
                    <CheckCircle2 className="text-emerald-500 h-6 w-6" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Ilustración de la Tarta (Estilo Figma) */}
            <div className="relative flex items-center justify-center">
              <div className="relative h-80 w-80">
                {/* Círculo de fondo con los colores de la marca */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500 via-blue-500 to-orange-400 opacity-20 blur-2xl"></div>
                
                {/* Gráfico de Tarta Estilizado */}
                <svg viewBox="0 0 36 36" className="h-full w-full relative z-10 drop-shadow-2xl">
                  <circle cx="18" cy="18" r="16" fill="transparent" stroke="#10b981" strokeWidth="6" strokeDasharray="40 100" />
                  <circle cx="18" cy="18" r="16" fill="transparent" stroke="#3b82f6" strokeWidth="6" strokeDasharray="35 100" strokeDashoffset="-40" />
                  <circle cx="18" cy="18" r="16" fill="transparent" stroke="#f59e0b" strokeWidth="6" strokeDasharray="25 100" strokeDashoffset="-75" />
                </svg>

                {/* Avatares flotantes (Como en tu Figma) */}
                <img src="https://i.pravatar.cc/150?u=1" className="absolute -top-4 left-1/2 -translate-x-1/2 h-16 w-16 rounded-full border-4 border-white shadow-xl z-20" alt="Founder" />
                <img src="https://i.pravatar.cc/150?u=2" className="absolute bottom-4 -left-4 h-16 w-16 rounded-full border-4 border-white shadow-xl z-20" alt="Dev" />
                <img src="https://i.pravatar.cc/150?u=3" className="absolute bottom-4 -right-4 h-16 w-16 rounded-full border-4 border-white shadow-xl z-20" alt="Investor" />
              </div>
            </div>
          </div>
        </div>

        {/* --- SECCIÓN "HOW IT WORKS" (Tarjetas) --- */}
        <section className="mt-32">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <h2 className="text-4xl font-black mb-16 border-b-4 border-emerald-500 inline-block">How It Works?</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Track Contributions", desc: "Automate the tracking of time, expertise, and capital.", icon: TrendingUp },
                { title: "Algorithm Runs", desc: "Our proprietary algorithm processes contributions fairly.", icon: PieChart },
                { title: "Legal Docs", desc: "Instantly generate legally binding agreements.", icon: FileText }
              ].map((card, i) => (
                <div key={i} className="bg-slate-900 rounded-[32px] p-8 text-white border border-slate-800 hover:border-emerald-500 transition-colors shadow-xl">
                  <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 mx-auto">
                    <card.icon className="text-emerald-500 h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{card.title}</h3>
                  <p className="text-slate-400 font-medium">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER SIMPLIFICADO --- */}
      <footer className="py-12 text-center text-slate-400 font-bold text-sm border-t border-slate-200 bg-white mt-20 relative z-10">
        <Link href="/"><img src="/logo.png" className="h-10 mx-auto mb-6 opacity-50 grayscale hover:grayscale-0 transition-all" alt="Equily" /></Link>
        <p>© 2026 Equily. Modern tools for modern founders.</p>
      </footer>
    </div>
  );
}

// Para evitar errores, importamos FileText manualmente si no está arriba
import { FileText } from "lucide-react";