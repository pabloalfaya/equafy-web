"use client";

import { 
  ShieldCheck, Sliders, Scale, CheckCircle2, AlertTriangle, 
  Zap, ArrowRight, TrendingUp, Briefcase 
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

      <main className="relative z-10 pt-32 pb-20 px-6 md:px-12 lg:px-24 max-w-4xl mx-auto space-y-24">
        
        {/* --- 1. JUST SPLIT MODEL --- */}
        <section id="standard" className="scroll-mt-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-xl shadow-emerald-200 w-14 h-14 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-1 block">Core Model</span>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter">Just Split Model</h1>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-3 space-y-6">
              <p className="text-base text-slate-600 font-medium leading-relaxed">
                Protects those who take on greater risk and effort using our dynamic weighting algorithm.
              </p>
              
              <div className="space-y-3">
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50">
                  <h4 className="font-black text-emerald-600 uppercase text-[10px] tracking-widest mb-2 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5" /> Cash (Out-of-pocket): x4 Multiplier
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    Liquid money is the scarcest resource. The x4 multiplier rewards the direct financial risk and opportunity cost of capital used to sustain the company's survival.
                  </p>
                </div>

                <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50">
                  <h4 className="font-black text-blue-600 uppercase text-[10px] tracking-widest mb-2 flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5" /> Work, Tangibles & Intangibles: x2 Multiplier
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    Recognizes the "potential" risk of time, equipment (tangibles), or knowledge (intangibles). Partners aren't charging market salaries, so we give double value to these essential contributions.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-32 bg-slate-900 rounded-3xl p-4 text-white shadow-xl overflow-hidden">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Algorithm Features</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-xs">Logarithmic Risk</span>
                    </div>
                    {/* TOGGLE VISUAL ENCENDIDO */}
                    <div className="w-10 h-5 bg-emerald-500 rounded-full relative shadow-inner">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-md"></div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                    Balances liquid capital risk vs potential risk mathematically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- 2. CUSTOM MODEL --- */}
        <section id="custom" className="scroll-mt-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-slate-800 rounded-2xl text-white shadow-xl shadow-slate-200 w-14 h-14 flex items-center justify-center shrink-0">
              <Sliders className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter">Custom Model</h1>
          </div>
          
          <div className="bg-white/70 backdrop-blur-md border border-slate-200 rounded-3xl p-8 shadow-xl flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-grow space-y-4">
              <p className="text-base text-slate-600 font-medium leading-relaxed">
                Total freedom for teams with their own rules. Start with our template and define your own multipliers for each category.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "User-defined multipliers", "Manual logic integration", 
                  "Specialized asset weight", "Flexible dynamic updates"
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {f}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full md:w-64 shrink-0">
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400">Logarithmic Risk</span>
                    {/* TOGGLE VISUAL APAGADO */}
                    <div className="w-10 h-5 bg-slate-200 rounded-full relative">
                      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold italic leading-relaxed">Toggle the algorithmic logic even in custom setups.</p>
               </div>
            </div>
          </div>
        </section>

        {/* --- 3. FLAT MODEL --- */}
        <section id="flat" className="scroll-mt-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-purple-500 rounded-2xl text-white shadow-xl shadow-purple-200 w-14 h-14 flex items-center justify-center shrink-0">
              <Scale className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter">Flat Model</h1>
          </div>
          
          <div className="bg-white/70 backdrop-blur-md border border-slate-200 rounded-3xl p-8 shadow-xl">
            <p className="text-base text-slate-600 font-medium leading-relaxed mb-6">
              Linear "Unit for Unit" structure. Absolute equality where one unit of value equals exactly one unit of ownership.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h4 className="font-black text-purple-600 uppercase text-[10px] tracking-widest mb-2">Philosophy</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  No distinction based on the source of value. If one partner contributes 100 units in cash and another 100 in work, they receive identical company shares.
                </p>
              </div>
              <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-red-600 uppercase text-[10px] tracking-widest mb-1">Investment Warning</h4>
                  <p className="text-xs text-red-700/70 font-bold leading-relaxed">
                    Discourages cash investment as it treats liquid capital equal to time. Partners with capital might seek higher-return opportunities elsewhere.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}