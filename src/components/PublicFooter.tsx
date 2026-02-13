"use client";

import Link from "next/link";
import { Twitter, Linkedin, Mail } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-white border-t border-slate-200 relative z-10">
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2">
            <Link href="/" className="inline-block mb-6">
              <img
                src="/logo.png"
                alt="Equily Logo"
                className="h-16 w-auto grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100"
              />
            </Link>
            <p className="text-slate-500 font-medium max-w-xs leading-relaxed text-sm">
              Modern tools for modern founders. Calculate, track, and manage equity with data-driven precision.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-6 text-sm">Product</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-500">
              <li><Link href="/dashboard" className="hover:text-emerald-600 transition-colors">Calculator</Link></li>
              <li><Link href="/pricing" className="hover:text-emerald-600 transition-colors">Pricing</Link></li>
              <li><Link href="/models" className="hover:text-emerald-600 transition-colors">Equity Models</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-6 text-sm">Resources</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-500">
              <li><Link href="/guide" className="hover:text-emerald-600 transition-colors">Documentation</Link></li>
              <li><Link href="/guide" className="hover:text-emerald-600 transition-colors">Guides</Link></li>
              <li><Link href="/contact" className="hover:text-emerald-600 transition-colors">API Status</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-6 text-sm">Legal</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-500">
              <li><Link href="/legal" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal" className="hover:text-emerald-600 transition-colors">Terms</Link></li>
              <li><Link href="/legal" className="hover:text-emerald-600 transition-colors">Security</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 font-bold text-xs uppercase tracking-wider">
          <p>© 2026 EQUILY. BUILT FOR MODERN CO-FOUNDERS.</p>
          <div className="flex gap-6">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors" aria-label="Twitter">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors" aria-label="LinkedIn">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="mailto:info@getequily.com" className="hover:text-slate-900 transition-colors" aria-label="Email">
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
