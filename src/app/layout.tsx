import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConditionalNavbar } from "@/components/ConditionalNavbar";
import { ConditionalFooter } from "@/components/ConditionalFooter";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.getequily.com";

export const metadata: Metadata = {
  title: {
    default: "Equily - Dynamic Equity Management for Startups & Growing Companies",
    template: "%s | Equily",
  },
  description:
    "Equity management for startups, scale-ups and early-stage companies. Dynamic split based on contributions (cash, work, IP). Just Split, Flat and Custom models. Fair equity with Slicing Pie methodology.",
  keywords: [
    "Equily",
    "Equily startup equity",
    "equity management",
    "startup equity",
    "cap table",
    "slicing pie",
    "founder equity",
    "dynamic equity split",
    "Just Split",
    "contributions",
  ],
  authors: [{ name: "Equily" }],
  creator: "Equily",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Equily",
    title: "Equily - Dynamic Equity Management for Startups & Growing Companies",
    description:
      "Equity management for startups, scale-ups and early-stage companies. Fair dynamic split based on contributions.",
    images: [
      {
        url: "/logo-web.png",
        width: 1200,
        height: 630,
        alt: "Equily - Dynamic Equity Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Equily - Dynamic Equity Management for Startups & Growing Companies",
    description: "Fair equity split for startups and growing companies. Based on contributions.",
  },
  metadataBase: new URL(baseUrl),
  icons: {
    icon: "/equily-mark.png",
  },
  verification: {
    google: "zFCVOKbGDiNQfYNpKE8Xe8mhPQ4NHRJPreGlC_aGlwk",
  },
  alternates: {
    canonical: baseUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Equily",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Equity management for startups, scale-ups and early-stage companies. Dynamic split based on contributions (cash, work, IP). Just Split, Flat and Custom models.",
    url: baseUrl,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  };

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ConditionalNavbar />
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-24 w-full">
          {children}
        </div>
        <ConditionalFooter />
      </body>
    </html>
  );
}