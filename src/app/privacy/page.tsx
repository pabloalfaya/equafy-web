"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { BRAND } from "@/lib/brand";

const LEGAL_NAME = "Pablo Alfaya Fernandez";
const ADDRESS = "Calle La Santa Maria 86, Spain";

export default function PrivacyPage() {
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

          <p className="text-sm text-slate-500 font-medium mb-8">Last updated: February 2026</p>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-600 font-medium mb-12">
            This Privacy Policy explains how we collect, use, and protect your personal data when you use {BRAND.name}. It applies to users in the European Union, the United States (including California), and other regions where {BRAND.name} is available.
          </p>

          <article className="space-y-10 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Data Controller</h2>
              <p>
                The data controller responsible for your personal data is <strong>{LEGAL_NAME}</strong>, operating as {BRAND.name}, with address at {ADDRESS}. For any privacy-related requests or questions, you may contact us at{" "}
                <a href={`mailto:${BRAND.email}`} className="text-emerald-600 font-semibold hover:underline">{BRAND.email}</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Data We Collect and Why</h2>
              <p className="mb-4">
                We collect and process data necessary to provide and improve the {BRAND.name} service. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account data:</strong> email address, name, and job title (if provided) to manage your account and authenticate you.</li>
                <li><strong>Project and equity data:</strong> project names, member names, contribution types, amounts, and multipliers. This data is used to perform equity calculations and to display each party&apos;s share of the company (cap table and related outputs).</li>
                <li><strong>Payment data:</strong> billing is handled by our payment provider; we do not store full card numbers. We may store billing-related identifiers and subscription status.</li>
                <li><strong>Usage data:</strong> we may collect information about how you use the platform (e.g., features used, actions taken) to improve the service and fix issues.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Legal Basis and Purpose</h2>
              <p>
                We process your data to perform our contract with you (account and subscription management, equity calculations), to comply with legal obligations, and where we have a legitimate interest in improving and securing the service. Where required by law, we will obtain your consent before processing for additional purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Third-Party Processors</h2>
              <p>
                We use trusted third-party service providers to operate {BRAND.name}. These include:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Stripe</strong> — for payment processing and subscription management. Stripe&apos;s privacy policy applies to payment data they process.</li>
                <li><strong>Supabase</strong> — for authentication, database storage, and backend services. Your account and project data are stored and processed through Supabase in accordance with their data processing terms.</li>
                <li><strong>Vercel</strong> — for cloud hosting and frontend delivery. Vercel processes infrastructure data, including IP addresses, to ensure the security, performance, and reliability of the platform.</li>
              </ul>
              <p className="mt-4">
                We ensure that these providers offer adequate safeguards (e.g., standard contractual clauses or equivalent) where data is transferred outside the European Economic Area or your jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. GDPR Rights (European Union / EEA)</h2>
              <p className="mb-4">
                If you are in the European Union or the European Economic Area, you have the following rights under the General Data Protection Regulation (GDPR):
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Right of access:</strong> you may request a copy of the personal data we hold about you.</li>
                <li><strong>Right to rectification:</strong> you may ask us to correct inaccurate or incomplete data.</li>
                <li><strong>Right to erasure:</strong> you may request deletion of your personal data, subject to legal retention requirements.</li>
              </ul>
              <p className="mt-4 font-medium">
                <strong>Important Exception Regarding Equity Data:</strong> Please note that while you can delete your account and personal profile information, we cannot delete your historical contribution data, risk multipliers, or presence in the immutable Audit Log of a shared project. Retaining this specific data is strictly necessary under our &quot;legitimate interest&quot; to preserve the mathematical integrity of the cap table and the legal rights of your co-founders or partners within that project.
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Right to restrict processing:</strong> you may ask us to limit how we use your data in certain circumstances.</li>
                <li><strong>Right to data portability:</strong> you may request your data in a structured, machine-readable format.</li>
                <li><strong>Right to object:</strong> you may object to processing based on legitimate interests or for direct marketing.</li>
                <li><strong>Right to withdraw consent:</strong> where we rely on consent, you may withdraw it at any time.</li>
                <li><strong>Right to lodge a complaint:</strong> you may lodge a complaint with a supervisory authority in your country.</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, contact us at {BRAND.email}. We will respond within the timeframes required by applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. CCPA / California Privacy Rights (United States)</h2>
              <p className="mb-4">
                If you are a California resident, the California Consumer Privacy Act (CCPA) and related laws may provide you with additional rights:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Right to know:</strong> you may request disclosure of the categories and specific pieces of personal information we have collected about you, the sources of that information, the business purpose for collection, and the categories of third parties with whom we share it.</li>
                <li><strong>Right to delete:</strong> you may request deletion of your personal information, subject to certain exceptions.</li>
                <li><strong>Right to opt out of sale or sharing:</strong> we do not sell your personal information. We may share data with service providers as described in this policy.</li>
                <li><strong>Right to non-discrimination:</strong> we will not discriminate against you for exercising your privacy rights.</li>
              </ul>
              <p className="mt-4">
                To submit a CCPA request, contact us at {BRAND.email} and specify that you are a California resident. We may need to verify your identity before processing your request.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Data Retention and Security</h2>
              <p>
                We retain your data for as long as your account is active and as needed to provide the service, comply with legal obligations, resolve disputes, and enforce our agreements. We implement appropriate technical and organizational measures to protect your data against unauthorized access, loss, or alteration.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Cookies and Local Storage</h2>
              <p>
                We use essential cookies and local storage mechanisms (such as those provided by Supabase) strictly to keep you logged in securely and ensure the platform functions correctly. We do not use intrusive tracking or advertising cookies. By using {BRAND.name}, you consent to the use of these strictly necessary operational cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Changes and Contact</h2>
              <p>
                We may update this Privacy Policy from time to time. We will indicate the &quot;Last updated&quot; date at the top and, where required, notify you of material changes. Continued use of {BRAND.name} after changes constitutes acceptance of the updated policy. If you believe your privacy rights have been violated, you also have the right to file a complaint directly with the Spanish Data Protection Agency (AEPD). For any questions or to exercise your rights, contact us at{" "}
                <a href={`mailto:${BRAND.email}`} className="text-emerald-600 font-semibold hover:underline">{BRAND.email}</a> or at {ADDRESS}.
              </p>
            </section>
          </article>
        </div>
      </main>
    </div>
  );
}
