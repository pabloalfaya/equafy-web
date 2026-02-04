import Link from "next/link";
import { 
  ShieldCheck, Sliders, Scale, CheckCircle2, AlertTriangle, 
  Zap, ArrowRight, TrendingUp, PlayCircle 
} from "lucide-react";

export default function ModelsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      
      {/* --- BACKGROUND AMBIENTAL (IGUAL QUE HOME) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-400/20 blur-[120px] rounded-full opacity-50 mix-blend-multiply"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-400/10 blur-[120px] rounded-full opacity-40 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* --- NAVBAR COMPLETO (IGUAL QUE HOME) --- */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/50 bg-white/60 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <Link href="/" className="relative group">
              <img src="/logo.png" alt="Equily Logo" className="relative h-28 w-auto object-contain" />
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
            <Link href="/login" className="hidden md:block text-sm font-bold text-slate-600 hover:text-slate-900">Log in</Link>
            <Link href="/login" className="relative group">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full blur opacity-60"></div>
               <div className="relative flex items-center bg-slate-900 rounded-full px-6 py-2.5 leading-none">
                 <span className="text-sm font-bold text-white">Start Free</span>
                 <ArrowRight className="w-4 h-4 text-emerald-400 ml-2" />
               </div>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-48 pb-32 px-6 max-w-5xl mx-auto space-y-40">
        
        {/* --- 1. JUST SPLIT MODEL --- */}
        <section id="standard" className="scroll-mt-48">
          <div className="flex items-center gap-6 mb-12">
            <div className="p-5 bg-emerald-500 rounded-[32px] text-white shadow-2xl shadow-emerald-200">
              <ShieldCheck className="w-12 h-12" />
            </div>
            <div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-2 block">The Core Model</span>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter">Just Split Model</h1>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-12 items-start">
            <div className="lg:col-span-3 space-y-8">
              <p className="text-2xl text-slate-600 font-medium leading-relaxed">
                Designed to protect those who take on greater risk and effort using our risk-weighted algorithm.
              </p>
              
              <div className="space-y-4">
                <div className="bg-white/80 backdrop-blur-md p-8 rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/50">
                  <h4 className="font-black text-emerald-600 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Cash (Out-of-pocket): x4
                  </h4>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    Liquid money is the scarcest resource and carries the risk of immediate total loss. The x4 multiplier rewards the partner who loses the opportunity cost of that capital to sustain the company's survival.
                  </p>
                </div>

                <div className="bg-white/80 backdrop-blur-md p-8 rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/50">
                  <h4 className="font-black text-blue-600 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Work & IP: x2
                  </h4>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    Recognizes that partners are "risking" their time and potential by not charging a market salary. We give double the value of a simple commercial exchange.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-48 bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full"></div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">Dynamic Algorithm</h4>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-5 bg-white/5 rounded-[24px] border border-white/10">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      <span className="font-bold text-sm">Logarithmic Risk</span>
                    </div>
                    {/* TOGGLE VISUAL */}
                    <div className="w-12 h-6 bg-emerald-500 rounded-full relative shadow-inner">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md"></div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    This model balances liquid capital risk vs potential risk mathematically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- 2. CUSTOM MODEL --- */}
        <section id="custom" className="scroll-mt-48">
          <div className="flex items-center gap-6 mb-12">
            <div className="p-5 bg-slate-800 rounded-[32px] text-white shadow-2xl shadow-slate-200">
              <Sliders className="w-12 h-12" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter">Custom Model</h1>
          </div>
          
          <div className="bg-white/70 backdrop-blur-md border border-slate-200 rounded-[56px] p-12 shadow-2xl flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-grow space-y-6">
              <p className="text-2xl text-slate-600 font-medium leading-relaxed">
                Total freedom for teams with their own rules. Use our engine but define your own multipliers.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  "Fully defined multipliers", "Technical specialized weight", 
                  "Manual logic adjustment", "Flexible IP Valuation"
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-bold text-slate-500">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {f}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full md:w-80 shrink-0">
               <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-400">Algorithmic Risk</span>
                    <div className="w-12 h-6 bg-slate-200 rounded-full relative">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold italic">Toggle dynamic balance even in custom setups.</p>
               </div>
            </div>
          </div>
        </section>

        {/* --- 3. FLAT MODEL --- */}
        <section id="flat" className="scroll-mt-48">
          <div className="flex items-center gap-6 mb-12">
            <div className="p-5 bg-purple-500 rounded-[32px] text-white shadow-2xl shadow-purple-200">
              <Scale className="w-12 h-12" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter">Flat Model</h1>
          </div>
          
          <div className="bg-white/70 backdrop-blur-md border border-slate-200 rounded-[56px] p-12 shadow-2xl">
            <p className="text-2xl text-slate-600 font-medium leading-relaxed mb-10">
              The "Unit for Unit" structure. Absolute equality without risk weighting.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100">
                <h4 className="font-black text-purple-600 uppercase text-[10px] tracking-widest mb-4">How it works</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Every contribution is multiplied by 1. If a partner contributes 100 units of cash and another 100 units of work, both receive the exact same company share.
                </p>
              </div>
              <div className="bg-red-50 p-8 rounded-[40px] border border-red-100 flex gap-4 items-start">
                <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                <div>
                  <h4 className="font-black text-red-600 uppercase text-[10px] tracking-widest mb-2">Philosophical Risk</h4>
                  <p className="text-sm text-red-700/70 font-bold leading-relaxed">
                    This model discourages cash investment as it treats liquid capital equal to time. Partners with capital might seek higher-return opportunities elsewhere.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* --- FOOTER (CONCORDANCIA TOTAL CON HOME) --- */}
      <footer className="bg-white border-t border-slate-200 relative z-10">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
            <p>© 2026 Equily. Built for modern co-founders.</p>
            <div className="flex gap-8">
              <Link href="#" className="hover:text-slate-900 transition-colors">Documentation</Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">Security</Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Icono auxiliar (Briefcase)
function Briefcase(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}