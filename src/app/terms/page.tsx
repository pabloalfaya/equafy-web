"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

const LEGAL_NAME = "Pablo Alfaya Fernandez";
const ADDRESS = "Calle La Santa Maria 86, Spain";
const EMAIL = "info@getequily.com";

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-lg text-slate-600 font-medium mb-12">
            These Terms of Service (&quot;Terms&quot;) govern your use of Equily, operated by {LEGAL_NAME} (&quot;we&quot;, &quot;us&quot;, &quot;Equily&quot;). By accessing or using Equily, you agree to these Terms.
          </p>

          <article className="space-y-10 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance and Scope</h2>
              <p>
                By creating an account or using the Equily platform, you confirm that you have read, understood, and agree to be bound by these Terms. If you are using Equily on behalf of an organization, you represent that you have authority to bind that organization. These Terms apply to all users in the European Union, the United States, and other jurisdictions where the service is available.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Description of Service</h2>
              <p>
                Equily provides a dynamic equity split calculator and related tools to help teams track contributions and visualize ownership. The service includes project management, contribution logging, cap table calculations, and export features. We reserve the right to modify, suspend, or discontinue any part of the service with reasonable notice where feasible.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Subscriptions and Payment</h2>
              <p className="mb-4">
                Equily offers subscription plans, including monthly and annual options. A <strong>7-day free trial</strong> is included when you start a subscription. No payment is required during the trial period. After the trial, you will be charged according to the plan you selected.
              </p>
              <p>
                Payments are processed securely through <strong>Stripe</strong>. By subscribing, you agree to Stripe&apos;s terms and to provide accurate billing information. You may cancel your subscription at any time; access continues until the end of the current billing period. Refunds are handled in accordance with our refund policy and applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Disclaimer of Warranties</h2>
              <p className="uppercase text-slate-800 font-semibold tracking-wide mb-4">
                The Equily service and all content, calculations, and tools are provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranties of any kind, either express or implied. Equity calculations and cap table outputs are for informational and illustrative purposes only. They do not constitute legal, tax, financial, or professional advice. You should consult qualified professionals for decisions regarding equity, corporate structure, or compliance. We do not guarantee the accuracy, completeness, or suitability of any calculation for your specific situation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by applicable law, {LEGAL_NAME}, operating as Equily, shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, or goodwill, arising out of or in connection with your use of the service. In no event shall our total liability to you for all claims arising from or related to these Terms or your use of Equily exceed the amount you have paid to us in the twelve (12) months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold harmless {LEGAL_NAME} (operating as Equily), its affiliates, and its respective directors, employees, and agents, from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including but not limited to attorney&apos;s fees) arising from: (i) your use of and access to the Equily service; (ii) your violation of any term of these Terms; or (iii) any dispute, conflict, or litigation between you and any other user, co-founder, partner, or third party regarding the allocation, calculation, or distribution of equity or ownership interests managed through the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Governing Law</h2>
              <p>
                These Terms and any dispute arising out of or in connection with them shall be governed by and construed in accordance with the laws of <strong>Spain</strong>, without regard to its conflict of law provisions. The courts of Spain shall have exclusive jurisdiction for any legal proceedings relating to these Terms, subject to mandatory consumer protection laws in your country of residence.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Contact</h2>
              <p>
                For questions about these Terms, please contact us at{" "}
                <a href={`mailto:${EMAIL}`} className="text-emerald-600 font-semibold hover:underline">{EMAIL}</a>. Our address is {ADDRESS}.
              </p>
            </section>
          </article>
        </div>
      </main>
    </div>
  );
}
