"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Twitter, Linkedin, Send, ArrowRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const supabase = createClient();

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

      {/* --- SECCIÓN DE CONTACTO --- */}
      <main className="relative z-10 pt-32 md:pt-44 pb-20 px-6">
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
                  <button type="submit" disabled={loading} className="w-full bg-emerald-500 text-white font-bold text-lg py-5 rounded-2xl shadow-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 tracking-tight">
                    <Send className={`h-5 w-5 ${loading ? "animate-pulse" : ""}`} />
                    {loading ? "Sending…" : "Send Message"}
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
    </div>
  );
}