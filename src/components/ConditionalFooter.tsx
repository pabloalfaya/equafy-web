"use client";

import { usePathname } from "next/navigation";
import { PublicFooter } from "@/components/PublicFooter";

export function ConditionalFooter() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  if (isDashboard) return null;
  return <PublicFooter />;
}
