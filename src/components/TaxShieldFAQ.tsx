"use client";

import { ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/brand";

export function TaxShieldFAQ() {
  return (
    <section className="w-full mt-14 mb-14">
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-shrink-0 p-2 rounded-xl bg-blue-100">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-lg md:text-xl font-semibold text-slate-900">
            Why is the 83(b) Election your most important fiscal shield?
          </h2>
        </div>

        {/* 3-column grid: stacks on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: The Hidden Tax Trap */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">
              The Hidden Tax Trap
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              When you earn your equity dynamically over time, the IRS views each new percentage you earn as ordinary income. If your company receives external investment and its valuation grows to millions of dollars, the dynamic percentages you earn the following month will be taxed at that new, high valuation. You could owe thousands of dollars in taxes for equity you cannot even sell yet.
            </p>
          </div>

          {/* Column 2: How the 83(b) Shield Works */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">
              How the 83(b) Shield Works
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              The Section 83(b) Election is a letter you send to the IRS within{" "}
              <strong className="font-semibold text-slate-800">30 days</strong>{" "}
              of signing the Dynamic Equity Addendum. It tells the government: &quot;Tax me today on the maximum percentage I might earn in the future, based on today&apos;s company value.&quot;
            </p>
          </div>

          {/* Column 3: The Equafy Advantage */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">
              The {BRAND.name} Advantage
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Because you are adopting {BRAND.name} at the very beginning of your journey, your company&apos;s official valuation is likely{" "}
              <strong className="font-semibold text-slate-800">close to $0</strong>
              . By filing the 83(b) now, you pay taxes on a $0 value. As your company grows and becomes worth millions, you are completely shielded from ordinary income taxes on that growth. You will only pay capital gains tax years later when you actually sell your equity for real cash.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
