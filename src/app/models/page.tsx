import Link from "next/link";
import { 
  ArrowLeft, ShieldCheck, Scale, Sliders, CheckCircle2, 
  AlertTriangle, Zap, ArrowRight, Info 
} from "lucide-react";

export default function ModelsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-emerald-100">
      
      {/* --- NAVBAR RESTAURADO --- */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/50 bg-white/60 backdrop-blur-xl transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <Link href="/" className="relative group">
              <img src="/logo.png" alt="Equily Logo" className="h-20 w-auto object-contain" />
            </Link>
            <div className="hidden lg:flex items-center gap-6">
              <Link href="/how-it-works" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">How it works</Link>
              <Link href="/pricing" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Pricing</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900">Log in</Link>
            <Link href="/login" className="relative group bg-slate-900 rounded-full px-6 py-2.5">
              <span className="text-sm font-bold text-white">Start Free</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-40 pb-32 px-6 max-w-5xl mx-auto space-y-40">
        
        {/* --- 1. JUST SPLIT MODEL --- */}
        <section id="standard" className="scroll-mt-32">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-emerald-500 rounded-3xl text-white shadow-xl shadow-emerald-200">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Recommended</span>
              <h1 className="text-5xl font-black tracking-tighter">Just Split Model</h1>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-12 items-start">
            <div className="lg:col-span-3 space-y-6">
              <p className="text-2xl text-slate-600 font-medium leading-relaxed">
                The platform’s core model. Designed to protect those who take on greater risk using 
                mathematical justice.
              </p>
              
              <div className="prose prose-slate prose-lg">
                <h4 className="font-bold flex items-center gap-2"><Zap className="w-5 h-5 text-emerald-500" /> Multiplier Logic</h4>
                <ul className="space-y-4 list-none p-0">
                  <li className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <strong className="text-emerald-600">Cash (Out-of-pocket): $x4$</strong>
                    <p className="text-sm mt-2 text-slate-500">Liquid money is the scarcest resource. We reward this with a $x4$ multiplier because the partner loses the opportunity cost and risks immediate total loss.</p>
                  </li>
                  <li className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <strong className="text-blue-600">Work, Tangibles & Intangibles: $x2$</strong>
                    <p className="text-sm mt-2 text-slate-500">Recognizes that partners are risking their "potential" and not charging a market salary. It gives double the value of a commercial exchange.</p>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Algorithm Features</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm font-bold">Logarithmic Risk</span>
                    </div>
                    {/* TOGGLE VISUAL */}
                    <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-not-allowed">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                    The Logarithmic Risk algorithm auto-balances the split as the company valuation grows.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- 2. CUSTOM MODEL --- */}
        <section id="custom" className="scroll-mt-32">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-slate-800 rounded-3xl text-white shadow-xl shadow-slate-200">
              <Sliders className="w-10 h-10" />
            </div>
            <h1 className="text-5xl font-black tracking-tighter">Custom Model</h1>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-[40px] p-10 shadow-2xl space-y-8">
            <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-3xl">
              Total freedom for teams that have their own rules but want the power of the Equily engine. 
              Start with our template and adjust every variable.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                <h4 className="font-bold mb-4 text-slate-900 uppercase text-xs tracking-widest">Personalization</h4>
                <ul className="space-y-3">
                  <li className="flex gap-2 text-sm font-medium text-slate-500"><CheckCircle2 className="w-4 h-4 text-slate-400" /> Fully defined multipliers per category</li>
                  <li className="flex gap-2 text-sm font-medium text-slate-500"><CheckCircle2 className="w-4 h-4 text-slate-400" /> Technical specialization weight adjustment</li>
                  <li className="flex gap-2 text-sm font-medium text-slate-500"><CheckCircle2 className="w-4 h-4 text-slate-400" /> Enable/Disable dynamic updating</li>
                </ul>
              </div>
              <div className="flex flex-col justify-center gap-4">
                 <div className="flex items-center justify-between p-6 bg-slate-900 rounded-3xl text-white">
                    <span className="font-bold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-400" /> Logarithmic Risk</span>
                    <div className="w-10 h-5 bg-slate-700 rounded-full relative cursor-not-allowed">
                      <div className="absolute left-1 top-1 w-3 h-3 bg-white/20 rounded-full"></div>
                    </div>
                 </div>
                 <p className="text-xs text-slate-400 font-medium px-2">
                   You can toggle the algorithmic logic even in custom setups.
                 </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- 3. FLAT MODEL --- */}
        <section id="flat" className="scroll-mt-32">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-purple-500 rounded-3xl text-white shadow-xl shadow-purple-200">
              <Scale className="w-10 h-10" />
            </div>
            <h1 className="text-5xl font-black tracking-tighter">Flat Model</h1>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-[40px] p-10 shadow-2xl">
            <p className="text-xl text-slate-600 font-medium leading-relaxed mb-8">
              The "Unit for Unit" philosophy. A simple 1:1 ratio where there is no distinction 
              based on the source of value.
            </p>
            
            <div className="p-8 bg-purple-50 border border-purple-100 rounded-3xl flex flex-col md:flex-row gap-6 items-center">
              <div className="p-4 bg-purple-100 rounded-2xl text-purple-600">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-purple-900 leading-relaxed">
                Caution: This model can discourage cash investment. If liquid capital is treated 
                exactly like hours worked, partners with capital might seek higher-return opportunities elsewhere.
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

// Icono auxiliar no incluido en los imports originales
function TrendingUp(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}