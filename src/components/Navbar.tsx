"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Sparkles, Cog, Zap } from "lucide-react";

export function Navbar() {
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
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

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 border-b border-white/50 bg-white/60 backdrop-blur-xl transition-transform duration-300 ease-in-out ${
        isNavVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <img
              src="/logo.png"
              alt="Equily Logo"
              className="relative h-28 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop primary nav */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200/50 backdrop-blur-md">
            {/* Product dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setIsProductMenuOpen((open: boolean) => !open)
                }
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-white rounded-full transition-all duration-200"
              >
                <span>Product</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                    isProductMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isProductMenuOpen && (
                <div className="absolute left-0 mt-3 w-72 rounded-xl bg-white shadow-lg border border-gray-100 py-2 z-30">
                  <Link
                    href="/features"
                    onClick={() => setIsProductMenuOpen(false)}
                    className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="mt-0.5 rounded-full bg-amber-50 p-2">
                      <Zap className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        Features
                      </div>
                      <p className="text-xs text-slate-500">
                        Discover everything Equily can do.
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="/what-is-equily"
                    onClick={() => setIsProductMenuOpen(false)}
                    className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="mt-0.5 rounded-full bg-emerald-50 p-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        What is Equily?
                      </div>
                      <p className="text-xs text-slate-500">
                        Understand the basics of dynamic equity.
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="/how-it-works"
                    onClick={() => setIsProductMenuOpen(false)}
                    className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="mt-0.5 rounded-full bg-slate-50 p-2">
                      <Cog className="w-4 h-4 text-slate-700" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        How it Works
                      </div>
                      <p className="text-xs text-slate-500">
                        Dive into the methodology.
                      </p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Other top-level links */}
            <Link
              href="/pricing"
              className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-white rounded-full transition-all duration-200"
            >
              Pricing
            </Link>
            <Link
              href="/legal"
              className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-white rounded-full transition-all duration-200"
            >
              Legal
            </Link>
            <Link
              href="/contact"
              className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-emerald-600 hover:bg-white rounded-full transition-all duration-200"
            >
              Contact
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden md:block text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Log in
          </Link>

          <Link
            href="/login?view=signup"
            className="hidden md:block text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors"
          >
            Sign Up
          </Link>

          <Link href="/login?view=signup" className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-200" />
            <div className="relative flex items-center bg-slate-900 rounded-full px-6 py-2.5 leading-none">
              <span className="text-sm font-bold text-white group-hover:text-emerald-50 transition duration-200">
                Free Trial
              </span>
              <ArrowRight className="w-4 h-4 text-emerald-400 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile Product menu (accordion style) */}
      <div className="lg:hidden border-t border-white/60 bg-white/80">
        <div className="mx-auto max-w-7xl px-6 py-2">
          <button
            type="button"
            onClick={() =>
              setIsProductMenuOpen((open: boolean) => !open)
            }
            className="flex items-center justify-between w-full text-sm font-semibold text-slate-700 py-2"
          >
            <span>Product</span>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                isProductMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {isProductMenuOpen && (
            <div className="mt-1 space-y-1 pb-2">
              <Link
                href="/features"
                onClick={() => setIsProductMenuOpen(false)}
                className="block text-sm text-slate-600 py-1 pl-2 border-l border-slate-200 hover:text-slate-900"
              >
                Features
              </Link>
              <Link
                href="/what-is-equily"
                onClick={() => setIsProductMenuOpen(false)}
                className="block text-sm text-slate-600 py-1 pl-2 border-l border-slate-200 hover:text-slate-900"
              >
                What is Equily?
              </Link>
              <Link
                href="/how-it-works"
                onClick={() => setIsProductMenuOpen(false)}
                className="block text-sm text-slate-600 py-1 pl-2 border-l border-slate-200 hover:text-slate-900"
              >
                How it Works
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

