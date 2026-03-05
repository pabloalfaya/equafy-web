import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Split Startup Equity Fairly (Without Dead Equity) | Equafy",
  description:
    "Step-by-step guide to splitting startup equity fairly using a dynamic cap table. Avoid dead equity and align ownership with real contributions.",
};

export default function HowToSplitEquityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
