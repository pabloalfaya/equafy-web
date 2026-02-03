import Link from "next/link";
import { Mail, Twitter, Linkedin, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative overflow-hidden">
      
      {/* --- FONDO CON TEXTURA --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(#059669 0.8px, transparent 0.8px)', backgroundSize: '32px 32px' }}></div>
      </div>

      {/* --- NAVBAR UNIFICADO --- */}
      <nav className="border-b border-slate-200/60 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <div className="flex items-center gap-10">
            <Link href="/">
              <img src="/logo.png" alt="Equily Logo" className="h-32 w-auto object-contain cursor-pointer transition-transform hover:scale-105" />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/what-is-equily" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition">What is Equily?</Link>
              <Link href="/how-it-works" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition">How Work Equily?</Link>
              <Link href="/pricing" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition">Pricing</Link>
              <Link href="/contact" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition">Contact</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-bold text-slate-600 hover:text-slate-900">Log in</Link>
            <Link href="/dashboard" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition">Sign Up</Link>
            <Link href="/dashboard" className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 shadow-lg shadow-slate-200">Start Free</Link>
          </div>
        </div>
      </nav>

      {/* --- SECCIÓN DE CONTACTO --- */}
      <main className="relative z-10 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 mb-6">
              Get in <span className="text-emerald-600">touch</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Have questions about dynamic equity? Our team is here to help.
            </p>
          </div>

          <div className="relative group max-w-2xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-[40px] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative bg-white/80 backdrop-blur-2xl border border-white rounded-[40px] p-10 md:p-16 shadow-2xl overflow-hidden">
              
              <form className="space-y-8">
                <div className="space-y-2">
                  <label className="text-sm font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                  <input type="text" placeholder="John Doe" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold focus:outline-none focus:border-emerald-500 transition-colors" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <input type="email" placeholder="info@getequily.com" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold focus:outline-none focus:border-emerald-500 transition-colors" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black uppercase tracking-widest text-slate-400 ml-1">Message</label>
                  <textarea rows={4} placeholder="Tell us about your project..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold focus:outline-none focus:border-emerald-500 transition-colors resize-none"></textarea>
                </div>

                <button type="button" className="w-full bg-emerald-600 text-white font-black text-xl py-6 rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                  <Send className="h-6 w-6" />
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* TARJETA DE CORREO DIRECTO */}
          <div className="max-w-sm mx-auto mt-12">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center hover:shadow-lg transition-shadow">
              <Mail className="h-8 w-8 mx-auto mb-4 text-emerald-500" />
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-2">Email Us</h3>
              <p className="font-bold text-slate-600 text-lg">info@getequily.com</p>
            </div>
          </div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-white pt-24 pb-12 border-t border-slate-200 relative z-10">
        <div className="mx-auto max-w-7xl px-6 text-center">
            <Link href="/"><img src="/logo.png" alt="Equily" className="h-20 mx-auto mb-8 opacity-40 grayscale hover:grayscale-0 transition-all" /></Link>
            <p className="text-slate-400 font-black text-sm mb-8 uppercase tracking-widest">© 2026 Equily. Built for founders.</p>
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