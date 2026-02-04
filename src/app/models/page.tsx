import Link from "next/link";
import { ArrowLeft, ShieldCheck, Scale, Sliders } from "lucide-react";

export default function ModelsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto space-y-32">
        
        {/* SECTION: JUST SPLIT (STANDARD) */}
        <section id="standard" className="scroll-mt-32">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-200">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black tracking-tight">Just Split Model</h1>
          </div>
          <div className="prose prose-slate max-w-none bg-white border border-slate-200 rounded-[32px] p-8 shadow-xl">
            <p className="text-xl text-slate-600 font-medium leading-relaxed mb-6">
              The industry standard for high-growth companies. It rewards risk-takers by applying multipliers to different types of contributions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className="font-black text-emerald-600 uppercase text-xs mb-2">Cash Contributions (x4)</h4>
                <p className="text-sm font-medium text-slate-500">Every euro invested is worth 4 points to compensate for the extreme risk of early-stage capital.</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className="font-black text-blue-600 uppercase text-xs mb-2">Work & IP (x2)</h4>
                <p className="text-sm font-medium text-slate-500">Time and intellectual property are valued with a 2x multiplier, acknowledging the sweat equity provided.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: FLAT MODEL */}
        <section id="flat" className="scroll-mt-32">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-500 rounded-2xl text-white shadow-lg shadow-purple-200">
              <Scale className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black tracking-tight">Flat Model</h1>
          </div>
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-xl">
            <p className="text-xl text-slate-600 font-medium leading-relaxed mb-6">
              A simple 1:1 ratio. Ideal for service-based businesses, agencies, or low-risk projects where every contribution is treated equally.
            </p>
            <div className="bg-purple-50 border border-purple-100 p-6 rounded-2xl">
              <p className="text-sm font-bold text-purple-700">
                Caution: This model can discourage cash investment since liquid capital is treated exactly the same as hours worked.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION: CUSTOM MODEL */}
        <section id="custom" className="scroll-mt-32">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-slate-800 rounded-2xl text-white shadow-lg">
              <Sliders className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black tracking-tight">Custom Model</h1>
          </div>
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-xl">
            <p className="text-xl text-slate-600 font-medium leading-relaxed mb-6">
              Total mathematical freedom. Define your own multipliers for Cash, Work, Tangible, and Intangible assets.
            </p>
            <ul className="space-y-4 text-slate-500 font-medium">
              <li className="flex gap-3 items-center">
                <div className="w-2 h-2 rounded-full bg-slate-300" /> Fully editable multipliers per project
              </li>
              <li className="flex gap-3 items-center">
                <div className="w-2 h-2 rounded-full bg-slate-300" /> Perfect for unique legal setups or complex IP transfers
              </li>
            </ul>
          </div>
        </section>

      </main>
    </div>
  );
}