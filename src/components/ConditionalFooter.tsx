"use client";

import { usePathname } from "next/navigation";
import { PublicFooter } from "@/components/PublicFooter";

export function ConditionalFooter() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  const isProfile = pathname?.startsWith("/profile");
  if (isDashboard || isProfile) return null;
  return <PublicFooter />;
}
