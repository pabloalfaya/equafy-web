"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, FileText, Shield, Snowflake, Upload, Info } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { BRAND } from "@/lib/brand";

const JURISDICTIONS = [
  "United States",
  "Spain",
  "United Kingdom",
  "Ireland",
  "India",
  "Mexico",
  "Other",
] as const;

type Jurisdiction = (typeof JURISDICTIONS)[number];

const LEGAL_HUB_CONTENT: Record<Jurisdiction, string> = {
  "United States":
    `In the US, ${BRAND.name} works best under an LLC structure or as a Pre-Incorporation Agreement. The generated contracts tie the dynamic percentages to your legal Cap Table.`,
  Spain:
    `En España, ${BRAND.name} opera a través de un Pacto de Socios parasocial que regula los derechos económicos antes de elevar a público.`,
  "United Kingdom":
    `In the UK, ${BRAND.name} supports LTD structures and shareholder agreements. The dynamic split is reflected in your company's articles and equity documentation.`,
  Ireland:
    `In Ireland, ${BRAND.name} integrates with tech startup structures and equity schemes. Generated documents align with Irish company law and tax treatment.`,
  India:
    `In India, ${BRAND.name} supports startup compliance and equity distribution under Indian regulations. Templates align with local requirements for founder agreements.`,
  Mexico:
    `In Mexico, ${BRAND.name} works with S.A. de C.V. structures. The dynamic equity model integrates with Mexican commercial law and partnership agreements.`,
  Other:
    `For other jurisdictions, ${BRAND.name} provides a general international framework. Contact us for tailored guidance on your specific region.`,
};

export default function ProjectLegalPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const [projectName, setProjectName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [navVisible, setNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState<Jurisdiction>("United States");
  const [isDragging, setIsDragging] = useState(false);
  const [vaultFiles, setVaultFiles] = useState<{ name: string; uploadedBy: string; date: string }[]>([
    { name: "partnership_agreement_signed.pdf", uploadedBy: "Pablo Alfaya", date: "Feb 15, 2025" },
  ]);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const supabase = createClient();
    void (async () => {
      try {
        const { data } = await supabase.from("projects").select("name").eq("id", projectId).single();
        if (!cancelled) setProjectName(data?.name ?? null);
      } catch {
        if (!cancelled) setProjectName(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setLastScrollY((prevY) => {
        if (currentY > prevY && currentY > 50) setNavVisible(false);
        else if (currentY < prevY) setNavVisible(true);
        return currentY;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDownloadTemplate = (name: string) => {
    // Placeholder for future implementation
    console.log("Download template:", name);
  };

  const handleExportPDF = () => {
    // Placeholder - would link to project freeze/export flow
    window.location.href = projectId ? `/dashboard/${projectId}` : "/dashboard";
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((f) => f.type === "application/pdf");
      if (files.length > 0) {
        setVaultFiles((prev) => [
          ...prev,
          ...files.map((f) => ({
            name: f.name,
            uploadedBy: "You",
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          })),
        ]);
      }
    },
    []
  );

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const pdfFiles = Array.from(files).filter((f) => f.type === "application/pdf");
      setVaultFiles((prev) => [
        ...prev,
        ...pdfFiles.map((f) => ({
          name: f.name,
          uploadedBy: "You",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        })),
      ]);
    }
    e.target.value = "";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-emerald-200 rounded-full" />
          <p className="text-slate-400 font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      {/* Internal Dashboard Nav */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 border-b border-white/50 bg-white/60 backdrop-blur-xl transition-transform duration-300 ${
          navVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 md:px-12 lg:px-24 py-2">
          <div className="flex items-center gap-4">
            <Link
              href={projectId ? `/dashboard/${projectId}` : "/dashboard"}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <Link href="/">
              <img src={BRAND.logoPath} alt={BRAND.name} width={120} height={48} className="h-20 w-auto object-contain" />
            </Link>
          </div>
          <div className="px-4 py-2 bg-slate-100 rounded-full border border-slate-200/50">
            <span className="text-sm font-bold text-slate-700">{projectName ?? "Legal Documents"}</span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <header className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Legal Documents</h1>
            <p className="mt-2 text-lg text-slate-500 font-medium">Secure repository for your company agreements.</p>
          </header>

          {/* 1. Jurisdiction Selector */}
          <section className="mb-8">
            <label className="block text-sm font-bold text-slate-600 mb-3">Jurisdiction</label>
            <div className="flex flex-wrap gap-2">
              {JURISDICTIONS.map((country) => (
                <button
                  key={country}
                  type="button"
                  onClick={() => setSelectedCountry(country)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    selectedCountry === country
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
          </section>

          {/* 2. Legal Hub (Panel Informativo Dinámico) */}
          <section className="mb-10">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 backdrop-blur-sm px-6 py-5 shadow-sm flex gap-4">
              <div className="shrink-0 p-2.5 rounded-xl bg-blue-100/80">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-slate-700 font-medium leading-relaxed">
                {LEGAL_HUB_CONTENT[selectedCountry]}
              </p>
            </div>
          </section>

          {/* 3. Templates Grid */}
          <section className="mb-12">
            <h2 className="text-xl font-black text-slate-900 mb-6">Document Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Dynamic Collaboration Agreement */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 rounded-xl bg-emerald-50 w-fit mb-4">
                  <FileText className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">Dynamic Collaboration Agreement</h3>
                <p className="text-sm text-slate-500 mb-4">Agreement linking equity percentages to your dynamic split.</p>
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate("dynamic-collaboration")}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Download Template
                </button>
              </div>

              {/* Card 2: IP Assignment */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 rounded-xl bg-blue-50 w-fit mb-4">
                  <Shield className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">IP Assignment</h3>
                <p className="text-sm text-slate-500 mb-4">Transfer of intellectual property rights to the company.</p>
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate("ip-assignment")}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Download Template
                </button>
              </div>

              {/* Card 3: Project Freeze Certificate */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow ring-2 ring-emerald-500/20">
                <div className="p-3 rounded-xl bg-teal-50 w-fit mb-4">
                  <Snowflake className="h-7 w-7 text-teal-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">Project Freeze Certificate</h3>
                <p className="text-sm text-slate-500 mb-4">Official snapshot of your equity distribution.</p>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Export PDF
                </button>
              </div>
            </div>
          </section>

          {/* 4. Secure Vault */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-6">Signed Documents Vault</h2>

            {/* Drag & Drop Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-12 text-center transition-colors ${
                isDragging ? "border-emerald-400 bg-emerald-50/50" : "hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              <input
                type="file"
                accept="application/pdf"
                multiple
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-600 font-medium">
                Drag and drop your signed PDF here or click to browse
              </p>
            </div>

            {/* Vault Files List */}
            <div className="mt-6 space-y-3">
              {vaultFiles.map((file, i) => (
                <div
                  key={`${file.name}-${i}`}
                  className="flex items-center justify-between py-3 px-4 rounded-xl bg-white border border-slate-100 shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-5 w-5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800 truncate">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500 shrink-0">
                    <span>{file.uploadedBy}</span>
                    <span>{file.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Professional advice disclaimer */}
          <div className="mt-12 rounded-2xl border border-slate-200/80 bg-slate-100/60 px-5 py-4 md:px-6 md:py-5">
            <p className="text-sm md:text-base font-medium leading-relaxed text-slate-700">
              <span className="font-bold text-slate-800">Professional Advice:</span> The templates provided are starting
              points. For complex structures or specific legal assurance, talking to a legal professional is always
              recommended.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
