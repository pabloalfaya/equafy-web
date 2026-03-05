import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What is Dynamic Equity? The Fair Way to Split Startup Equity | Equafy",
  description:
    "Learn what dynamic equity is and how it helps startups split equity fairly. No more dead equity—reward real contributions with Equafy.",
};

export default function WhatIsDynamicEquityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
