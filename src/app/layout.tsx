import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConditionalNavbar } from "@/components/ConditionalNavbar";
import { ConditionalFooter } from "@/components/ConditionalFooter";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://equily.app";

export const metadata: Metadata = {
  title: {
    default: "Equily - Gestión Dinámica de Equity para Startups",
    template: "%s | Equily",
  },
  description:
    "Gestión dinámica de equity para startups basada en aportaciones (cash, work, tangibles e intangibles). Modelos Just Split, Flat y Custom. Reparte el equity de forma justa con Slicing Pie.",
  keywords: ["equity", "startup", "slicing pie", "gestión equity", "aportaciones", "Just Split", "Flat model"],
  authors: [{ name: "Equily" }],
  creator: "Equily",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: baseUrl,
    siteName: "Equily",
    title: "Equily - Gestión Dinámica de Equity para Startups",
    description:
      "Gestión dinámica de equity basada en aportaciones. Modelos Just Split, Flat y Custom.",
  },
  metadataBase: new URL(baseUrl),
  icons: {
    icon: "/favicon.ico",
  },
  verification: {
    google: "zFCVOKbGDiNQfYNpKE8Xe8mhPQ4NHRJPreGlC_aGlwk",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ConditionalNavbar />
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-24 w-full">
          {children}
        </div>
        <ConditionalFooter />
      </body>
    </html>
  );
}