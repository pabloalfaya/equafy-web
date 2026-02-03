import Link from "next/link";
import { Mail, Twitter, Linkedin, Send, ArrowRight } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      
      {/* --- BACKGROUND AMBIENTAL --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-emerald-400/10 blur-[120px] rounded-full opacity-50 mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-1/4 w-[800px] h-[800px] bg-blue-400/10 blur-[120px] rounded-full opacity-40 mix-blend-multiply"></div>
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

      {/* --- SECCIÓN DE CONTACTO --- */}
      <main className="relative z-10 pt-40 pb-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Touch</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Have questions about dynamic equity? Our team is here to help you set up the fairest cap table possible.
            </p>
          </div>

          <div className="relative group max-w-2xl mx-auto">
            {/* Efecto de resplandor sutil detrás del formulario */}
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-[48px] blur-2xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>
            
            <div className="relative bg-white/70 backdrop-blur-xl border border-white/60 rounded-[40px] p-10 md:p-14 shadow-2xl shadow-slate-200/50">
              
              <form className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Full Name</label>
                    <input type="text" placeholder="John Doe" className="w-full bg-white/50 border border-slate-200 rounded-2xl px-6 py-4 font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-300" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Email Address</label>
                    <input type="email" placeholder="john@startup.com" className="w-full bg-white/50 border border-slate-200 rounded-2xl px-6 py-4 font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-300" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Message</label>
                  <textarea rows={4} placeholder="Tell us about your project..." className="w-full bg-white/50 border border-slate-200 rounded-2xl px-6 py-4 font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none placeholder:text-slate-300"></textarea>
                </div>

                <button type="button" className="w-full bg-slate-900 text-white font-bold text-lg py-5 rounded-2xl shadow-lg shadow-slate-300 hover:bg-slate-800 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 group/btn">
                  <Send className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* TARJETA DE CORREO DIRECTO */}
          <div className="max-w-sm mx-auto mt-16 text-center">
            <p className="text-slate-400 font-medium mb-4">Prefer email?</p>
            <a href="mailto:info@getequily.com" className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold hover:border-emerald-500 hover:text-emerald-600 transition-all group">
              <Mail className="h-5 w-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              info@getequily.com
            </a>
          </div>
        </div>
      </main>

      {/* --- FOOTER UNIFICADO --- */}
      <footer className="bg-white border-t border-slate-200 relative z-10 mt-20">
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