"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Lock, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Inicializamos en false, pero el useEffect lo corregirá al instante si hace falta
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  // --- LÓGICA DE DETECCIÓN AUTOMÁTICA ---
  useEffect(() => {
    // Si la URL tiene ?view=signup, forzamos el modo registro
    const view = searchParams.get("view");
    if (view === "signup") {
      setIsSignUp(true);
    } else {
      // Si no, aseguramos que esté en modo Login
      setIsSignUp(false);
    }
  }, [searchParams]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        // --- MODO REGISTRO ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            emailRedirectTo: `${window.location.origin}/auth/callback` 
          },
        });
        if (error) throw error;
        setMessage({ text: "¡Cuenta creada! Revisa tu email para confirmar.", type: 'success' });
      } else {
        // --- MODO LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Redirección completa para que el middleware reciba las cookies de sesión
        // (evita tener que pulsar "Sign In" dos veces)
        window.location.href = "/dashboard";
        return;
      }
    } catch (error: any) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email?.trim()) {
      setMessage({ text: "Enter your email above first, then click Forgot password.", type: 'error' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      setMessage({ text: "Check your inbox for the reset link.", type: 'success' });
    } catch (error: any) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-[#F8FAFC] px-4 pt-40 md:pt-48 pb-8 font-sans">
      <div className="w-full max-w-[360px] md:max-w-md space-y-5 md:space-y-6 rounded-2xl md:rounded-3xl bg-white p-6 md:p-8 shadow-xl border border-slate-100">
        
        <Link href="/" className="inline-flex items-center text-xs md:text-sm text-slate-400 hover:text-slate-600 mb-2 md:mb-4 transition-colors">
          <ArrowLeft className="mr-1 h-3.5 w-3.5 md:h-4 md:w-4" /> Back to Home
        </Link>
        
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="mt-1.5 md:mt-2 text-sm md:text-base text-slate-500">
            {isSignUp ? "Start managing equity properly." : "Enter your details to access."}
          </p>
        </div>

        {message && (
          <div className={`p-3 md:p-4 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
            {message.text}
          </div>
        )}

        <form className="mt-5 md:mt-6 space-y-4" onSubmit={handleAuth}>
          <div>
            <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 py-2.5 md:py-3 pl-9 md:pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                placeholder="founder@startup.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs md:text-sm font-bold text-slate-700">Password</label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-500 hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 py-2.5 md:py-3 pl-9 md:pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-xl bg-slate-900 py-3 md:py-3.5 px-4 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-70 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSignUp ? "Create Free Account" : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-4 md:mt-6 pt-4 md:pt-6 border-t border-slate-50">
          <button
            type="button"
            // Al hacer clic manual, alternamos el estado y limpiamos la URL visualmente (opcional)
            onClick={() => { 
              setIsSignUp(!isSignUp); 
              setMessage(null); 
              // Opcional: limpiar query params sin recargar para que no interfiera si el usuario cambia de opinión
              if (window.history.pushState) {
                const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                window.history.pushState({path:newUrl},'',newUrl);
              }
            }}
            className="text-sm font-bold text-emerald-600 hover:text-emerald-500 hover:underline transition-all"
          >
            {isSignUp ? "Already have an account? Sign In" : "New to Equily? Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]"></div>}>
      <LoginForm />
    </Suspense>
  );
}