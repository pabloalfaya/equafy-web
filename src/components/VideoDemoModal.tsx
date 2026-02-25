"use client";

import { useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import { BRAND } from "@/lib/brand";

const DEMO_VIDEO_IDS = {
  en: "zZ3kANWXMOU",
  es: "gkxrYzL1Fss",
} as const;

type Language = "en" | "es" | null;

type VideoDemoModalProps = {
  open: boolean;
  onClose: () => void;
};

export function VideoDemoModal({ open, onClose }: VideoDemoModalProps) {
  const [language, setLanguage] = useState<Language>(null);

  if (!open) return null;

  const handleClose = () => {
    setLanguage(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Demo video"
    >
      <div
        className={
          language === null
            ? "relative w-full max-w-md flex flex-col rounded-2xl overflow-hidden bg-white shadow-lg"
            : "relative w-full max-w-4xl flex flex-col rounded-xl overflow-hidden bg-slate-900 shadow-2xl"
        }
        onClick={(e) => e.stopPropagation()}
      >
        {language === null ? (
          <div className="flex flex-col items-center justify-center px-6 py-8">
            <h2 className="text-xl font-semibold text-[#1E293B] text-center mb-6">
              Select Language / Selecciona Idioma
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className="flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-transparent text-gray-700 px-6 py-3 font-medium hover:border-gray-400 transition-all"
              >
                <span className="text-2xl" aria-hidden>
                  🇬🇧
                </span>
                <span>Watch in English</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage("es")}
                className="flex items-center justify-center gap-3 rounded-lg bg-[#1565C0] text-white px-6 py-3 font-medium shadow-md hover:bg-[#1E88E5] transition-all"
              >
                <span className="text-2xl" aria-hidden>
                  🇪🇸
                </span>
                <span>Ver en Español</span>
              </button>
            </div>
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setLanguage(null)}
              className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 text-xs font-medium px-3 py-2 transition-colors"
              aria-label="Change language"
            >
              <ArrowLeft className="w-4 h-4" />
              Change Language
            </button>
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="aspect-video w-full">
              <iframe
                key={language}
                src={`https://www.youtube.com/embed/${DEMO_VIDEO_IDS[language!]}?autoplay=1&rel=0`}
                title={`${BRAND.name} Demo`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default VideoDemoModal;

