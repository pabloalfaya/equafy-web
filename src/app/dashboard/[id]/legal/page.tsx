"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, FileText, Shield, Snowflake, Upload, Info, Trash2 } from "lucide-react";
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
  const [vaultFiles, setVaultFiles] = useState<
    { id: string; name: string; storagePath: string; uploadedBy?: string | null; date: string }[]
  >([]);
  const [canManageVault, setCanManageVault] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const supabase = createClient();
    void (async () => {
      try {
        const [
          { data: userResult },
          { data: projectData },
          { data: docsData },
          { data: membersData },
        ] = await Promise.all([
          supabase.auth.getUser(),
          supabase
            .from("projects")
            .select("id, name, owner_id")
            .eq("id", projectId)
            .single(),
          supabase
            .from("project_documents")
            .select("id, name, storage_path, uploaded_at")
            .eq("project_id", projectId)
            .order("uploaded_at", { ascending: false }),
          supabase
            .from("project_members")
            .select("id, access_level, email, user_id")
            .eq("project_id", projectId),
        ]);

        if (!cancelled) {
          setProjectName(projectData?.name ?? null);

          const userId = userResult?.user?.id ?? null;
          const userEmail = userResult?.user?.email ?? null;
          const isOwner = !!userId && projectData?.owner_id === userId;

          const members =
            (membersData as { id: string; access_level?: string | null; email?: string | null; user_id?: string | null }[]) ??
            [];

          const normalizedEmail = userEmail?.toLowerCase() ?? null;
          const currentMember = members.find(
            (m) =>
              (m.user_id && userId && m.user_id === userId) ||
              (normalizedEmail && m.email && m.email.toLowerCase() === normalizedEmail)
          );

          const canEditVault = isOwner || currentMember?.access_level === "editor";
          setCanManageVault(canEditVault);

          const mappedDocs =
            (docsData as { id: string; name: string; storage_path: string; uploaded_at: string }[])?.map(
              (doc) => ({
                id: doc.id,
                name: doc.name,
                storagePath: doc.storage_path,
                uploadedBy: null,
                date: new Date(doc.uploaded_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
              })
            ) ?? [];
          setVaultFiles(mappedDocs);
        }
      } catch {
        if (!cancelled) {
          setProjectName(null);
          setVaultFiles([]);
          setCanManageVault(false);
        }
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

  const handleDownloadTemplate = (slug: string) => {
    // Download a static template from /public/legal-templates
    // Example path: /legal-templates/dynamic-collaboration.docx
    if (typeof window === "undefined") return;
    const link = document.createElement("a");
    link.href = `/legal-templates/${slug}.docx`;
    link.download = `${slug}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    // Placeholder - would link to project freeze/export flow
    window.location.href = projectId ? `/dashboard/${projectId}` : "/dashboard";
  };

  const uploadAndSaveDocument = useCallback(
    async (file: File) => {
      if (!projectId) return;
      const supabase = createClient();
      const path = `${projectId}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase
        .storage
        .from("legal-vault")
        .upload(path, file, { contentType: file.type || "application/pdf" });

      if (uploadError) {
        console.error("Error uploading legal document:", uploadError);
        alert("There was an error uploading the document. Please try again.");
        return;
      }

      const { data, error: insertError } = await supabase
        .from("project_documents")
        .insert({
          project_id: projectId,
          name: file.name,
          storage_path: path,
          mime_type: file.type || "application/pdf",
          size_bytes: file.size,
        })
        .select("id, name, storage_path, uploaded_at")
        .single();

      if (insertError || !data) {
        console.error("Error saving document metadata:", insertError);
        alert("The file was uploaded but the record could not be saved.");
        return;
      }

      const displayDate = new Date(data.uploaded_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      setVaultFiles((prev) => [
        {
          id: data.id,
          name: data.name,
          storagePath: data.storage_path,
          uploadedBy: "You",
          date: displayDate,
        },
        ...prev,
      ]);
    },
    [projectId]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((f) => f.type === "application/pdf");
      files.forEach((file) => {
        void uploadAndSaveDocument(file);
      });
    },
    [uploadAndSaveDocument]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const pdfFiles = Array.from(files).filter((f) => f.type === "application/pdf");
        pdfFiles.forEach((file) => {
          void uploadAndSaveDocument(file);
        });
      }
      e.target.value = "";
    },
    [uploadAndSaveDocument]
  );

  const handleDeleteDocument = useCallback(
    async (id: string) => {
      const doc = vaultFiles.find((f) => f.id === id);
      if (!doc) return;
      if (!window.confirm("Delete this document from the legal vault?")) return;

      const supabase = createClient();

      if (doc.storagePath) {
        const { error: removeError } = await supabase
          .storage
          .from("legal-vault")
          .remove([doc.storagePath]);
        if (removeError) {
          console.error("Error deleting file from storage:", removeError);
          alert("Could not delete the file from storage.");
          return;
        }
      }

      const { error: dbError } = await supabase.from("project_documents").delete().eq("id", id);
      if (dbError) {
        console.error("Error deleting document record:", dbError);
        alert("The document record could not be deleted.");
        return;
      }

      setVaultFiles((prev) => prev.filter((f) => f.id !== id));
    },
    [vaultFiles]
  );

  const handleDownloadDocument = useCallback(
    async (id: string) => {
      const doc = vaultFiles.find((f) => f.id === id);
      if (!doc || !doc.storagePath) return;

      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from("legal-vault")
        .createSignedUrl(doc.storagePath, 60 * 5); // 5 minutes

      if (error || !data?.signedUrl) {
        console.error("Error generating signed URL for legal document:", error);
        alert("We could not generate a download link for this document. Please try again.");
        return;
      }

      // Open in a new tab so the user can view or download the PDF
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    },
    [vaultFiles]
  );

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

          {/* 3. Templates Grid (US-specific pack) */}
          <section className="mb-12">
            <h2 className="text-xl font-black text-slate-900 mb-6">Document Templates</h2>

            {selectedCountry === "United States" && (
              <div className="mt-10 space-y-4">
                <h3 className="text-lg font-black text-slate-900">
                  US Dynamic Equity Legal Pack
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  These documents are tailored for US-based companies using Equafy. Download the Word templates, adapt them with your counsel, and store the signed versions in the vault below.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 1. Board Resolution Adopting Equafy */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-3 rounded-xl bg-emerald-50 w-fit mb-4">
                      <FileText className="h-7 w-7 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">
                      Board Resolution Adopting Equafy
                    </h3>
                    <p className="text-sm text-slate-500 mb-2">
                      Official Board action authorizing the use of Equafy as the company&apos;s single source of truth for equity management.
                    </p>
                    <p className="text-xs text-slate-400 mb-4">
                      Gives legal mandate to transition from static shares to a dynamic model and protects administrators&apos; decisions.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDownloadTemplate("us-board-resolution-adopting-equafy")}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
                    >
                      Download Word Template
                    </button>
                  </div>

                  {/* 2. Dynamic Equity Addendum */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-3 rounded-xl bg-blue-50 w-fit mb-4">
                      <FileText className="h-7 w-7 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">
                      Dynamic Equity Addendum
                    </h3>
                    <p className="text-sm text-slate-500 mb-2">
                      Master agreement that subordinates prior static equity arrangements to Equafy&apos;s real-time mathematical calculations.
                    </p>
                    <p className="text-xs text-slate-400 mb-4">
                      Binds participants to the dynamic model, sets initial company valuation, and gives legal effect to Freeze records.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDownloadTemplate("us-dynamic-equity-addendum")}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
                    >
                      Download Word Template
                    </button>
                  </div>

                  {/* 3. Stock Assignment in Blank */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-3 rounded-xl bg-slate-50 w-fit mb-4">
                      <FileText className="h-7 w-7 text-slate-700" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">
                      Stock Assignment in Blank
                    </h3>
                    <p className="text-sm text-slate-500 mb-2">
                      Pre-signed transfer document used as a security mechanism to adjust equity without further signatures.
                    </p>
                    <p className="text-xs text-slate-400 mb-4">
                      Allows automatic reassignment or repurchase of shares based on software calculations, preventing future roadblocks.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDownloadTemplate("us-stock-assignment-in-blank")}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
                    >
                      Download Word Template
                    </button>
                  </div>

                  {/* 4. Section 83(b) Election */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-3 rounded-xl bg-amber-50 w-fit mb-4">
                      <FileText className="h-7 w-7 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">
                      Section 83(b) Election
                    </h3>
                    <p className="text-sm text-slate-500 mb-2">
                      Critical tax filing for participants receiving equity subject to vesting or later adjustments.
                    </p>
                    <p className="text-xs text-slate-400 mb-4">
                      Helps protect founders from being taxed on future growth as ordinary income, potentially saving thousands in taxes.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDownloadTemplate("us-section-83b-election")}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
                    >
                      Download Word Template
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* 4. Secure Vault */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-6">Signed Documents Vault</h2>

            {/* Drag & Drop Area */}
            {canManageVault ? (
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
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-10 text-center">
                <Upload className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-600">
                  Only members with edit permissions can upload or remove signed documents.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  You still have full read-only access to all files stored in this vault.
                </p>
              </div>
            )}

            {/* Vault Files List */}
            <div className="mt-6 space-y-3">
              {vaultFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between py-3 px-4 rounded-xl bg-white border border-slate-100 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => void handleDownloadDocument(file.id)}
                    className="flex items-center gap-3 min-w-0 text-left hover:text-emerald-700 transition-colors"
                  >
                    <FileText className="h-5 w-5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800 truncate underline-offset-2 hover:underline">
                      {file.name}
                    </span>
                  </button>
                  <div className="flex items-center gap-4 text-sm text-slate-500 shrink-0">
                    <span>{file.uploadedBy ?? "—"}</span>
                    <span>{file.date}</span>
                    {canManageVault && (
                      <button
                        type="button"
                        onClick={() => void handleDeleteDocument(file.id)}
                        className="p-1.5 rounded-full hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors"
                        aria-label="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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
