"use client";

import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="bg-white border-t border-gray-100/80 relative z-10">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 mb-12">
          <Link href="/" className="shrink-0">
            <img src="/logo.png" alt="Equily" className="h-8 w-auto opacity-90 hover:opacity-100 transition-opacity" />
          </Link>
          <nav className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-16">
            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-sm tracking-tight">Product</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-500">
                <li><Link href="/features" className="hover:text-emerald-600 transition-colors">Features</Link></li>
                <li><Link href="/guide" className="hover:text-emerald-600 transition-colors">Guide</Link></li>
                <li><Link href="/pricing" className="hover:text-emerald-600 transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-sm tracking-tight">Company</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-500">
                <li><Link href="/what-is-equily" className="hover:text-emerald-600 transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-emerald-600 transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-sm tracking-tight">Legal</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-500">
                <li><Link href="/legal" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal" className="hover:text-emerald-600 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="pt-8 border-t border-slate-100 text-slate-400 text-sm font-medium tracking-tight">
          © 2026 Equily. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
