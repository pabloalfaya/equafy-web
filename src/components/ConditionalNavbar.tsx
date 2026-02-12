"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";

/**
 * Renders the public Navbar only on non-dashboard routes.
 * Dashboard routes (/dashboard/*) use their own internal nav (e.g. Back + logo + project name).
 */
export function ConditionalNavbar() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  if (isDashboard) return null;
  return <Navbar />;
}
