"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

type AuthStatus = "loading" | "authenticated" | "error";

export default function UpdatePasswordPage() {
  const supabase = createClient();
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const resolvedRef = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !resolvedRef.current) {
        resolvedRef.current = true;
        setAuthStatus("authenticated");
        return;
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (resolvedRef.current) return;
        if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
          resolvedRef.current = true;
          setAuthStatus("authenticated");
        }
      }
    );

    const timeout = setTimeout(async () => {
      if (resolvedRef.current) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        resolvedRef.current = true;
        setAuthStatus("authenticated");
      } else {
        resolvedRef.current = true;
        setAuthStatus("error");
      }
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ text: "Las contraseñas no coinciden.", type: "error" });
      return;
    }
    if (password.length < 6) {
      setMessage({
        text: "La contraseña debe tener al menos 6 caracteres.",
        type: "error",
      });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage({
        text: "Contraseña actualizada. Redirigiendo al login...",
        type: "success",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Error al actualizar la contraseña.";
      setMessage({ text: msg, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-[#F8FAFC] px-4 pt-40 md:pt-48 pb-8 font-sans">
      <div className="w-full max-w-[360px] md:max-w-md space-y-5 md:space-y-6 rounded-2xl md:rounded-3xl bg-white p-6 md:p-8 shadow-xl border border-slate-100">
        <Link
          href="/login"
          className="inline-flex items-center text-xs md:text-sm text-slate-400 hover:text-slate-600 mb-2 md:mb-4 transition-colors"
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5 md:h-4 md:w-4" /> Volver al login
        </Link>

        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">
            Nueva contraseña
          </h2>
          <p className="mt-1.5 md:mt-2 text-sm md:text-base text-slate-500">
            Introduce tu nueva contraseña.
          </p>
        </div>

        {message && (
          <div
            className={`p-3 md:p-4 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center ${
              message.type === "error"
                ? "bg-red-50 text-red-600 border border-red-100"
                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
            }`}
          >
            {message.text}
          </div>
        )}

        {authStatus === "loading" && (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin mb-3" />
            <p className="text-sm font-medium">Verificando enlace...</p>
          </div>
        )}

        {authStatus === "error" && (
          <div className="p-3 md:p-4 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center bg-red-50 text-red-600 border border-red-100">
            Este enlace no es válido para recuperar la contraseña. Solicita uno nuevo.
          </div>
        )}

        {authStatus === "authenticated" && !message?.text?.includes("Redirigiendo") && (
          <form className="mt-5 md:mt-6 space-y-4" onSubmit={handleUpdatePassword}>
            <div>
              <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">
                Nueva contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 py-2.5 md:py-3 pl-9 md:pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 py-2.5 md:py-3 pl-9 md:pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  placeholder="Repite la contraseña"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="group relative flex w-full justify-center rounded-xl bg-slate-900 py-3 md:py-3.5 px-4 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-70 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Guardar nueva contraseña
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
