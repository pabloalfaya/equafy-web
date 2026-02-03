import Link from "next/link";
import { CheckCircle2, TrendingUp, PieChart, FileText, Twitter, Linkedin, Mail, ArrowRight, PlayCircle } from "lucide-react";

export default function WhatIsEquilyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      
      {/* --- BACKGROUND AMBIENTAL (Igual que Home) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-400/10 blur-[120px] rounded-full opacity-50 mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-400/10 blur-[120px] rounded-full opacity-40 mix-blend-multiply"></div>
        {/* Rejilla técnica sutil */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* --- NAVBAR PREMIUM UNIFICADO --- */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/50 bg-white/60 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <Link href="/" className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <img src="/logo.png" alt="Equily Logo" className="relative h-28 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
            </Link>
            <div className="hidden lg:flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200/50 backdrop-blur-md">
              {[
                { name: "What is Equily?", href: "/what-is-equily" },
                { name: "How does Equily work?", href: "/how-it-works" },
                { name: "Pricing", href: "/pricing" }
              ].map((item) => (
                <Link key={item.name} href={item.href} className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-white rounded-full transition-all duration-200">
                  {item.name}
                </Link>
              ))}
              <Link href="/contact" className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-emerald-600 hover:bg-white rounded-full transition-all duration-200">
                Contact
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hidden md:block text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
              Log in
            </Link>
            <Link href="/dashboard" className="hidden md:block text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">
              Sign Up
            </Link>
            <Link href="/dashboard" className="relative group">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-200"></div>
               <div className="relative flex items-center bg-slate-900 rounded-full px-6 py-2.5 leading-none">
                 <span className="text-sm font-bold text-white group-hover:text-emerald-50 transition duration-200">Start Free</span>
                 <ArrowRight className="w-4 h-4 text-emerald-400 ml-2 group-hover:translate-x-1 transition-transform" />
               </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- SECCIÓN PRINCIPAL (HERO) --- */}
      <main className="relative z-10 pt-40 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Lado Izquierdo: Texto */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 mb-6">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Dynamic Equity Split</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                What is <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Equily?</span>
              </h1>
              
              <p className="text-xl text-slate-500 leading-relaxed font-medium mb-8 max-w-lg">
                Fair equity, powered by data. Equily empowers founders with a dynamic algorithm 
                that distributes company ownership based on <strong className="text-slate-700">actual contributions</strong>, not just promises.
              </p>
              
              <div className="space-y-4 mb-10">
                {[
                  "Track contributions in real-time",
                  "Mathematical fairness algorithm",
                  "Investor-ready reports"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="text-emerald-600 h-4 w-4" />
                    </div>
                    <span className="text-slate-700 font-bold text-lg">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                 <Link href="/dashboard" className="px-8 py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-xl shadow-slate-200">
                    Get Started
                 </Link>
                 <button className="px-8 py-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-emerald-500" />
                    See it in action
                 </button>
              </div>
            </div>

            {/* Lado Derecho: IMAGEN PREMIUM */}
            <div className="relative">
               {/* Decoración de fondo imagen */}
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-blue-500/10 rounded-[40px] blur-3xl -z-10"></div>
              
              <div className="relative rounded-[32px] overflow-hidden border border-slate-200/60 bg-white/50 backdrop-blur-sm shadow-2xl shadow-slate-200/50 p-4 transform hover:scale-[1.02] transition-transform duration-500">
                <img 
                  src="/what-is-equily-hero.png" 
                  alt="Equily Dynamic Equity Illustration" 
                  className="w-full h-auto object-contain rounded-2xl" 
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- SECCIÓN "CORE FEATURES" (Dark Mode) --- */}
      <section className="py-32 relative z-10 bg-[#0B0F19] text-white overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#0B0F19] to-[#0B0F19]"></div>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
        
        <div className="mx-auto max-w-7xl px-6 relative">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">How it works under the hood</h2>
            <p className="text-slate-400 text-lg">A simple process for complex fairness.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Track Contributions", desc: "Automate the tracking of time, expertise, and capital.", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-500/20" },
              { title: "Algorithm Runs", desc: "Our proprietary algorithm processes contributions fairly.", icon: PieChart, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-500/20" },
              { title: "Legal Docs", desc: "Instantly generate legally binding agreements.", icon: FileText, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-500/20" }
            ].map((card, i) => (
              <div key={i} className={`bg-white/[0.03] backdrop-blur-sm rounded-[32px] p-8 border ${card.border} hover:bg-white/[0.05] transition-all group`}>
                <div className={`h-14 w-14 ${card.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <card.icon className={`${card.color} h-7 w-7`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER UNIFICADO --- */}
      <footer className="bg-white border-t border-slate-200 relative z-10">
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2">
              <Link href="/" className="inline-block">
                <img src="/logo.png" alt="Equily Logo" className="h-16 w-auto mb-6 grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100" />
              </Link>
              <p className="text-slate-500 font-medium max-w-xs leading-relaxed text-sm">
                Modern tools for modern founders. Calculate, track, and manage equity with data-driven precision.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6 text-sm">Product</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                <li><Link href="#" className="hover:text-emerald-600 transition-colors">Calculator</Link></li>
                <li><Link href="#" className="hover:text-emerald-600 transition-colors">Equity Models</Link></li>
                <li><Link href="#" className="hover:text-emerald-600 transition-colors">Cap Table</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6 text-sm">Resources</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                <li><Link href="#" className="hover:text-emerald-600 transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-emerald-600 transition-colors">Guides</Link></li>
                <li><Link href="#" className="hover:text-emerald-600 transition-colors">API Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6 text-sm">Legal</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                <li><Link href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-emerald-600 transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-emerald-600 transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 font-bold text-xs uppercase tracking-wider">
            <p>© 2026 Equily. Built in Seville.</p>
            <div className="flex gap-6">
              <Twitter className="h-5 w-5 hover:text-slate-900 cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 hover:text-slate-900 cursor-pointer transition-colors" />
              <Mail className="h-5 w-5 hover:text-slate-900 cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}