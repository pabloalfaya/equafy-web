import Link from "next/link";
// CORRECCIÓN: Volvemos a lucide-react para que la página funcione
import { ShieldCheck, PieChart, Users, PlayCircle, Globe, Mail, Lock, Twitter, Linkedin, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative overflow-hidden">
      
      {/* --- FONDO CON TEXTURA TECNOLÓGICA --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(#059669 0.8px, transparent 0.8px)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-emerald-100/40 to-transparent"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="border-b border-slate-200/60 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <div className="flex items-center gap-10">
            <Link href="/">
              {/* Logo en tamaño grande y nítido */}
              <img src="/logo.png" alt="Equily Logo" className="h-32 w-auto object-contain cursor-pointer transition-transform hover:scale-105" />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/what-is-equily" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition">
                What is Equily?
              </Link>
              <Link href="/how-it-works" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition">
                How Work Equily?
              </Link>
              {/* Enlaces solicitados en el Navbar */}
              <Link href="/pricing" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition">
                Pricing
              </Link>
              <Link href="/contact" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition">
                Contact
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-bold text-slate-600 hover:text-slate-900">Log in</Link>
            <Link href="/dashboard" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition">
              Sign Up
            </Link>
            <Link href="/dashboard" className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 shadow-lg shadow-slate-200">Start Free</Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-20 pb-16 z-10">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-emerald-600 mb-8 border border-slate-200 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            New: Smart Dynamic Split v2.0
          </div>
          <h1 className="mx-auto mb-8 max-w-5xl text-6xl font-black tracking-tight text-slate-900 sm:text-8xl leading-[1.1]">
            Equity that <span className="text-emerald-600 italic">evolves</span> <br />with your company.
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-xl text-slate-500 leading-relaxed font-medium">
            Stop guessing. Use a mathematical framework to split equity based on real contributions, cash, and market risk.
          </p>
          <div className="flex flex-col justify-center gap-6 sm:flex-row items-center">
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-10 py-5 text-xl font-black text-white shadow-2xl shadow-emerald-200 transition hover:bg-emerald-700 hover:scale-105 active:scale-95">
              Start Splitting Free
            </Link>
            <button className="inline-flex items-center gap-3 text-slate-600 font-bold text-lg hover:text-slate-900 transition">
              <PlayCircle className="h-7 w-7 text-emerald-600" /> Watch Demo
            </button>
          </div>
        </div>
      </header>

      {/* --- CAP TABLE LIVE STATUS --- */}
      <section className="py-20 relative z-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-[40px] border border-slate-800 bg-slate-950 p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] -z-10"></div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 border-b border-slate-800 pb-8 gap-6">
              <div>
                <h2 className="text-3xl font-black tracking-tight">Cap Table Live Status</h2>
                <p className="text-slate-400 font-medium mt-1">Real-time risk-adjusted ownership</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-5 py-2.5 rounded-full text-xs font-black border border-emerald-500/20 uppercase tracking-widest">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Algorithm Active
              </div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                {[
                  { name: "Alex (CEO)", type: "Time & IP", risk: "x4", ownership: "45.0%", img: "https://i.pravatar.cc/150?u=alex", color: "text-emerald-500" },
                  { name: "Ben (CTO)", type: "Time", risk: "x4", ownership: "30.0%", img: "https://i.pravatar.cc/150?u=ben", color: "text-blue-500" },
                  { name: "VC Fund A", type: "Cash", risk: "x2", ownership: "18.75%", img: "https://i.pravatar.cc/150?u=vc", color: "text-orange-500" },
                  { name: "Sarah (Dev)", type: "Time", risk: "x1", ownership: "6.25%", img: "https://i.pravatar.cc/150?u=sarah", color: "text-purple-500" },
                ].map((member, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-5">
                      <img src={member.img} className="h-14 w-14 rounded-2xl object-cover border-2 border-slate-800 group-hover:border-emerald-500 transition-colors" alt={member.name} />
                      <div>
                        <p className="font-black text-lg leading-none">{member.name}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{member.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-black ${member.color}`}>{member.ownership}</p>
                      <div className="inline-block bg-slate-800 px-2 py-0.5 rounded text-[10px] text-white/50 font-black uppercase tracking-widest">{member.risk} Multiplier</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative flex items-center justify-center p-12 bg-white/[0.02] rounded-[40px] border border-white/5 backdrop-blur-md">
                <div className="relative h-64 w-64">
                  <svg viewBox="0 0 36 36" className="h-full w-full transform -rotate-90">
                    <circle cx="18" cy="18" r="16" fill="transparent" stroke="#10b981" strokeWidth="3.8" strokeDasharray="45 100" />
                    <circle cx="18" cy="18" r="16" fill="transparent" stroke="#3b82f6" strokeWidth="3.8" strokeDasharray="30 100" strokeDashoffset="-45" />
                    <circle cx="18" cy="18" r="16" fill="transparent" stroke="#f97316" strokeWidth="3.8" strokeDasharray="18.75 100" strokeDashoffset="-75" />
                    <circle cx="18" cy="18" r="16" fill="transparent" stroke="#a855f7" strokeWidth="3.8" strokeDasharray="6.25 100" strokeDashoffset="-93.75" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Ownership</p>
                    <p className="text-3xl font-black text-white">€1.37M</p>
                    <p className="text-[10px] text-emerald-500 font-bold">Total Value</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 relative z-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative rounded-[60px] bg-slate-900 p-16 lg:p-24 overflow-hidden border border-slate-800 text-center shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-blue-600/20"></div>
            <div className="relative z-10">
              <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 tracking-tight">
                Start Slicing The Pie <br />
                <span className="text-emerald-400">fairly today</span>
              </h2>
              <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                Join thousands of smart founders who choose to stop guessing and start splitting equity with precision.
              </p>
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-2xl bg-white px-12 py-6 text-xl font-black text-slate-900 shadow-2xl transition hover:scale-105 active:scale-95">
                Create My Project Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white pt-24 pb-12 border-t border-slate-200 relative z-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-20">
            <div className="col-span-2">
              <img src="/logo.png" alt="Equily Logo" className="h-20 w-auto mb-6 transition-transform hover:scale-105" />
              <p className="text-slate-500 font-bold max-w-xs leading-relaxed">
                Modern tools for modern founders. Calculate, track, and manage equity with data-driven precision.
              </p>
            </div>
            <div>
              <h4 className="font-black text-slate-900 mb-6 uppercase text-xs tracking-widest">Product</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li><Link href="#" className="hover:text-emerald-600 transition">Calculator</Link></li>
                <li><Link href="#" className="hover:text-emerald-600 transition">Equity Models</Link></li>
                <li><Link href="#" className="hover:text-emerald-600 transition">Cap Table</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-slate-900 mb-6 uppercase text-xs tracking-widest">Resources</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li><Link href="#" className="hover:text-emerald-600 transition">Documentation</Link></li>
                <li><Link href="#" className="hover:text-emerald-600 transition">Guides</Link></li>
                <li><Link href="#" className="hover:text-emerald-600 transition">API Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-slate-900 mb-6 uppercase text-xs tracking-widest">Legal</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li><Link href="#" className="hover:text-emerald-600 transition">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-emerald-600 transition">Terms</Link></li>
                <li><Link href="#" className="hover:text-emerald-600 transition">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 font-bold text-sm">
            <p>© 2026 Equily. Built for founders.</p>
            <div className="flex gap-6">
              <Twitter className="h-5 w-5 hover:text-slate-900 cursor-pointer" />
              <Linkedin className="h-5 w-5 hover:text-slate-900 cursor-pointer" />
              <Mail className="h-5 w-5 hover:text-slate-900 cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}