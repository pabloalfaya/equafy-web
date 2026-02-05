"use client"; // Necesario para manejar el estado del formulario

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Mail, Twitter, Linkedin, Send, ArrowRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const supabase = createClient();

  const navItems = [
    { name: "What is Equily?", href: "/what-is-equily" },
    { name: "How does Equily work?", href: "/how-it-works" },
    { name: "Pricing", href: "/pricing" }
  ];

  // --- LÓGICA DEL NAVBAR ESCONDIDIZO ---
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 50) {
        setIsNavVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("contact_messages")
      .insert([{
        full_name: formData.name,
        email: formData.email,
        message: formData.message
      }]);

    setLoading(false);
    if (error) {
      alert("Error sending message: " + error.message);
    } else {
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      
      {/* --- BACKGROUND AMBIENTAL --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-emerald-400/10 blur-[120px] rounded-full opacity-50 mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-1/4 w-[800px] h-[800px] bg-blue-400/10 blur-[120px] rounded-full opacity-40 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* --- NAVBAR REPARADO Y DINÁMICO --- */}
      <nav 
        className={`fixed top-0 inset-x-0 z-50 border-b border-white/50 bg-white/60 backdrop-blur-xl transition-transform duration-300 ease-in-out ${
          isNavVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <Link href="/" className="relative group">
              <img src="/logo.png" alt="Equily Logo" className="relative h-28 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
            </Link>
            <div className="hidden lg:flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200/50 backdrop-blur-md">
              {navItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-white rounded-full transition-all"
                >
                  {item.name}
                </Link>
              ))}
              <Link href="/contact" className="px-5 py-2 text-sm font-bold text-emerald-600 bg-white shadow-sm rounded-full transition-all">
                Contact
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:block text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
              Log in
            </Link>
            <Link href="/login?view=signup" className="hidden md:block text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">
              Sign Up
            </Link>
            <Link href="/login?view=signup" className="relative group">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-200"></div>
               <div className="relative flex items-center bg-slate-900 rounded-full px-6 py-2.5 leading-none">
                 {/* CAMBIO: Texto actualizado a Start Now */}
                 <span className="text-sm font-bold text-white group-hover:text-emerald-50 transition duration-200">Start Now</span>
                 <ArrowRight className="w-4 h-4 text-emerald-400 ml-2 group-hover:translate-x-1 transition-transform" />
               </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- SECCIÓN DE CONTACTO --- */}
      <main className="relative z-10 pt-40 pb-20 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6">
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Touch</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Have questions about dynamic equity? Our team is here to help you set up the fairest cap table possible.
            </p>
          </div>

          <div className="relative max-w-2xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-[48px] blur-2xl opacity-50"></div>
            
            <div className="relative bg-white/70 backdrop-blur-xl border border-white/60 rounded-[40px] p-10 md:p-14 shadow-2xl">
              {submitted ? (
                <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-500 font-medium mb-8">We will get back to you at info@getequily.com very soon.</p>
                  <button onClick={() => setSubmitted(false)} className="text-emerald-600 font-bold hover:underline">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-400 ml-1">Full Name</label>
                      <input required type="text" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white/50 border border-slate-200 rounded-2xl px-6 py-4 font-semibold text-slate-800 focus:border-emerald-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-400 ml-1">Email Address</label>
                      <input required type="email" placeholder="john@startup.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-white/50 border border-slate-200 rounded-2xl px-6 py-4 font-semibold text-slate-800 focus:border-emerald-500 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-400 ml-1">Message</label>
                    <textarea required rows={4} placeholder="Tell us about your project..." value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full bg-white/50 border border-slate-200 rounded-2xl px-6 py-4 font-semibold text-slate-800 focus:border-emerald-500 outline-none transition-all resize-none"></textarea>
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-bold text-lg py-5 rounded-2xl shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                    <Send className={`h-5 w-5 ${loading ? 'animate-pulse' : ''}`} />
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="max-w-sm mx-auto mt-16 text-center">
            <p className="text-slate-400 font-medium mb-4">Prefer email?</p>
            <a href="mailto:info@getequily.com" className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold hover:border-emerald-500 hover:text-emerald-600 transition-all">
              <Mail className="h-5 w-5 text-slate-400" /> info@getequily.com
            </a>
          </div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 py-10 text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest">
        © 2026 Equily. Built for modern co-founders.
      </footer>
    </div>
  );
}