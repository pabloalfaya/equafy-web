"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";

/**
 * Renders the public Navbar only on non-dashboard and non-profile routes.
 * Dashboard and profile use their own internal nav (logo + email + Log out).
 */
export function ConditionalNavbar() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  const isProfile = pathname?.startsWith("/profile");
  if (isDashboard || isProfile) return null;
  return <Navbar />;
}
