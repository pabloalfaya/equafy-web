"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

export default function LegalNoticePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-400/20 blur-[120px] rounded-full opacity-50 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <main className="relative z-10 pt-32 md:pt-40 pb-20 px-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <Link
              href="/legal"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Legal Center
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 print:hidden"
              aria-label="Print this page"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>

          <article className="prose prose-slate max-w-3xl mx-auto py-12 text-slate-700 leading-relaxed">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-12">
              Legal Notice
            </h1>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. General Information</h2>
              <p className="mb-4">
                In compliance with Spanish Law 34/2002 of 11 July on Information Society Services and Electronic Commerce (LSSI-CE), users are informed that the owner of this website and commercial platform is:
              </p>
              <ul className="list-none pl-0 space-y-2">
                <li><strong>Owner:</strong> Pablo Alfaya Fernandez (trading under the business name EQUILY)</li>
                <li><strong>Tax ID (NIF):</strong> 29514449K</li>
                <li><strong>Address:</strong> Calle La Santa Maria 86, Spain</li>
                <li><strong>Contact email:</strong> <a href="mailto:info@getequily.com" className="text-emerald-600 font-semibold hover:underline">info@getequily.com</a></li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Purpose</h2>
              <p>
                This Legal Notice governs access to, navigation of, and use of the platform. Use of the website implies express and unreserved acceptance of all current legal notices and terms of use.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Intellectual and Industrial Property</h2>
              <p>
                The owner holds or has the corresponding licenses for the intellectual and industrial property exploitation rights of the EQUILY platform, including the source code, design, algorithms, logos, and texts. Reproduction, distribution, or modification without authorisation is expressly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Limitation of Liability</h2>
              <p>
                The owner does not guarantee the absence of errors when accessing the website. EQUILY is a technological tool for managing company ownership, but its use does not replace professional legal advice when drafting contracts for startups.
              </p>
            </section>
          </article>
        </div>
      </main>
    </div>
  );
}
