import Link from "next/link";
import { Zap, Calculator, Scale, FileCheck, Twitter, Linkedin, Mail, ArrowRight } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative overflow-hidden">
      
      {/* --- FONDO CON TEXTURA --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(#059669 0.8px, transparent 0.8px)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-100/30 blur-[120px] rounded-full"></div>
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
            <Link href="/dashboard" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition">Log in</Link>
            <Link href="/dashboard" className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 shadow-lg">Start Free</Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="relative z-10 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight text-slate-900">
            How <span className="text-emerald-600">Equily</span> works?
          </h1>
          <p className="text-xl text-slate-600 font-medium leading-relaxed mb-16">
            Our platform transforms emotional subjectivity into an exact mathematical formula. 
            Risk assumed = Ownership earned.
          </p>
        </div>

        {/* --- PASOS DEL PROCESO --- */}
        <div className="mx-auto max-w-6xl px-6 space-y-24">
          
          {/* Paso 1: Track Contributions */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500 text-white font-black text-xl mb-6 shadow-lg shadow-emerald-200">1</div>
              <h2 className="text-3xl font-black mb-6">Track Contributions</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6 font-medium">
                Capture every vector of value. A startup is built with much more than money. Our system allows you to log, quantify, and audit every contribution.
              </p>
              <ul className="space-y-3 text-slate-500 font-bold">
                <li className="flex items-center gap-2"><ArrowRight className="h-4 w-4 text-emerald-500" /> Capital Injections (The Fuel)</li>
                <li className="flex items-center gap-2"><ArrowRight className="h-4 w-4 text-emerald-500" /> Operational Work Hours (The Engine)</li>
                <li className="flex items-center gap-2"><ArrowRight className="h-4 w-4 text-emerald-500" /> Intellectual Property (The IP)</li>
              </ul>
            </div>
            <div className="order-1 lg:order-2 bg-slate-900 rounded-[40px] p-12 shadow-2xl border border-slate-800 flex items-center justify-center">
                <Zap className="h-32 w-32 text-emerald-500 opacity-80" />
            </div>
          </div>

          {/* Paso 2: Algorithm Runs */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="bg-slate-900 rounded-[40px] p-12 shadow-2xl border border-slate-800 flex items-center justify-center">
                <Calculator className="h-32 w-32 text-blue-500 opacity-80" />
            </div>
            <div>
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-500 text-white font-black text-xl mb-6 shadow-lg shadow-blue-200">2</div>
              <h2 className="text-3xl font-black mb-6">Algorithm Runs</h2>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                Real-Time Risk Mathematics. Our algorithm processes inputs and applies adjustable risk multipliers to determine the fair market value of each contribution.
              </p>
            </div>
          </div>

          {/* Paso 3: Legal Docs */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-purple-500 text-white font-black text-xl mb-6 shadow-lg shadow-purple-200">3</div>
              <h2 className="text-3xl font-black mb-6">Legal Docs</h2>
              <p className="text-lg text-slate-600 leading-relaxed font-medium mb-6">
                From Algorithm to Notary. Equily converts algorithm data into binding legal documentation. The system "freezes" the split and exports the "Final Snapshot".
              </p>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm inline-flex items-center gap-3">
                <FileCheck className="text-emerald-500" />
                <span className="text-sm font-bold text-slate-700">Ready for notarization</span>
              </div>
            </div>
            <div className="order-1 lg:order-2 bg-slate-900 rounded-[40px] p-12 shadow-2xl border border-slate-800 flex items-center justify-center">
                <Scale className="h-32 w-32 text-purple-500 opacity-80" />
            </div>
          </div>

        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-white pt-24 pb-12 border-t border-slate-200 relative z-10 mt-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
            <Link href="/"><img src="/logo.png" alt="Equily" className="h-12 mx-auto mb-8 opacity-40 grayscale hover:grayscale-0 transition-all" /></Link>
            <p className="text-slate-400 font-black text-sm mb-8 uppercase tracking-widest">© 2026 Equily. Modern tools for modern founders.</p>
            <div className="flex justify-center gap-10">
              <Twitter className="h-6 w-6 text-slate-300 hover:text-slate-900 cursor-pointer transition-colors" />
              <Linkedin className="h-6 w-6 text-slate-300 hover:text-slate-900 cursor-pointer transition-colors" />
              <Mail className="h-6 w-6 text-slate-300 hover:text-slate-900 cursor-pointer transition-colors" />
            </div>
        </div>
      </footer>
    </div>
  );
}