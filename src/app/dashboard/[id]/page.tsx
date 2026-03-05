"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation"; 
import Link from "next/link";
import { Plus, TrendingUp, LayoutDashboard, PieChart, Users, Download, ArrowLeft, Settings, History, FileText, Snowflake, CreditCard, LockOpen, X, Menu } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { recalculateAndPersistProjectValuation } from "@/utils/projectRecalculator";
import { logAudit } from "@/utils/auditLog";
import { EquityPieChart } from "@/components/EquityPieChart";
import { EquityEvolutionPanel } from "@/components/EquityEvolutionPanel";
import { ContributionsTable } from "@/components/ContributionsTable";
import { AddContributionModal } from "@/components/AddContributionModal";
import { AddMemberModal } from "@/components/AddMemberModal";
import { EquitySettingsModal } from "@/components/EquitySettingsModal";
import { EquityModelModal } from "@/components/EquityModelModal";
import { AuditLogModal } from "@/components/AuditLogModal";
import { FinalizedSummaryModal, type SummaryRow } from "@/components/FinalizedSummaryModal";
import { LegacyOnboardingWizard } from "@/components/LegacyOnboardingWizard";
import type { Project, Contribution, ContributionType } from "@/types/database";

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BRAND } from "@/lib/brand";
import { formatCurrency } from "@/lib/currency";
import { computeMemberEquitySummary } from "@/utils/equityCalculation";

// Tipos extendidos
type ExtendedProject = Project & { 
    equity_model?: string; 
    model_type?: string; 
    model_onboarding_dismissed?: boolean;
    currency?: string;
    settings_onboarding_done?: boolean;
    is_setup_completed?: boolean;
};
type ExtendedContribution = Contribution & { date?: string; concept?: string; multiplier?: number; [key: string]: any };

// Tipos de miembros
type Member = { id: string; name: string; role: string; email?: string; fixed_equity?: number | null; equity_cap?: number | null; access_level?: "editor" | "viewer"; user_id?: string | null; hourly_rate?: number | null };

/** Carga miembros del proyecto. Si columnas opcionales (equity_cap, hourly_rate) no existen, reintenta sin ellas. */
async function fetchProjectMembers(
  supabase: ReturnType<typeof createClient>,
  projectId: string
): Promise<Member[]> {
  const baseCols = "id, name, role, email, fixed_equity, access_level, user_id";
  const { data: full, error: errFull } = await supabase
    .from("project_members")
    .select(`${baseCols}, equity_cap, hourly_rate`)
    .eq("project_id", projectId);
  if (!errFull && full != null) {
    return (full as unknown as Member[]) ?? [];
  }
  const { data: withCap, error: errCap } = await supabase
    .from("project_members")
    .select(`${baseCols}, equity_cap`)
    .eq("project_id", projectId);
  if (!errCap && withCap != null) {
    return (withCap as Record<string, unknown>[]).map((r) => ({ ...r, equity_cap: (r as Member).equity_cap ?? null, hourly_rate: null })) as Member[];
  }
  const { data: minimal } = await supabase
    .from("project_members")
    .select(baseCols)
    .eq("project_id", projectId);
  const rows = (minimal ?? []) as Record<string, unknown>[];
  return rows.map((r) => ({ ...r, equity_cap: null, hourly_rate: null })) as Member[];
}

/** Returns equity rows and total points using fixed + cap + free (shadow points) logic. */
function getEquitySummaryForFinalize(
  members: Member[],
  contributions: ExtendedContribution[],
  _project: ExtendedProject | null
): { rows: SummaryRow[]; totalPoints: number } {
  const summary = computeMemberEquitySummary(members, contributions);
  const totalPoints = summary.reduce((s, r) => s + r.totalPoints, 0);
  const formatCap = (cap: number | null | undefined) => {
    if (cap != null && cap !== undefined && Number(cap) > 0) return `${Number(cap).toFixed(2)}%`;
    return "—";
  };
  const rows: SummaryRow[] = members.map((m, i) => ({
    name: m.name,
    role: m.role || "Member",
    points: summary[i]?.totalPoints ?? 0,
    fixed: Number(m.fixed_equity) || 0,
    capFormatted: formatCap(m.equity_cap),
    equityPct: summary[i]?.equityPct ?? 0,
  }));
  return { rows, totalPoints };
}

export default function ProjectDashboardPage() {
  const params = useParams(); 
  const projectId = params.id as string;
  const router = useRouter();

  const [project, setProject] = useState<ExtendedProject | null>(null);
  const [contributions, setContributions] = useState<ExtendedContribution[]>([]);
  const [members, setMembers] = useState<Member[]>([]); 
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [fixedEquityOpen, setFixedEquityOpen] = useState(false);
  const [auditLogModalOpen, setAuditLogModalOpen] = useState(false);
  const [editingContribution, setEditingContribution] = useState<ExtendedContribution | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [equityModelModalOpen, setEquityModelModalOpen] = useState(false);
  const [isFreezing, setIsFreezing] = useState(false);
  const [finalizeToast, setFinalizeToast] = useState<string | null>(null);
  const [filterByMember, setFilterByMember] = useState<string | null>(null);
  const [showEvolution, setShowEvolution] = useState(false);
  const [simulationMode, setSimulationMode] = useState(false);
  const [simulatedContributions, setSimulatedContributions] = useState<ExtendedContribution[]>([]);
  const contributionLogRef = useRef<HTMLDivElement>(null);
  const [summaryPayload, setSummaryPayload] = useState<{
    projectName: string;
    modelName: string;
    finalizedAt: string;
    totalPoints: number;
    rows: SummaryRow[];
    currency?: string;
  } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [showLegacyOnboarding, setShowLegacyOnboarding] = useState(false);

  const fetchData = async () => {
    if (!projectId) return;
    const supabase = createClient();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id ?? null);
    setCurrentUserEmail(user?.email ?? null);
    
    // Cargar Proyecto
    const { data: projectData, error: projectError } = await supabase.from("projects").select("*").eq("id", projectId).single();
    if (projectError || !projectData) { router.push("/dashboard"); return; }
    setProject(projectData as ExtendedProject);

    // Onboarding:
    // - If is_setup_completed is false → show legacy vs scratch wizard.
    // - Otherwise, if settings_onboarding_done is false → open Equity Settings modal once.
    const needsLegacySetup = projectData.is_setup_completed === false;
    if (needsLegacySetup) {
      setShowLegacyOnboarding(true);
    } else {
      const needsSettingsOnboarding = projectData.settings_onboarding_done === false;
      if (needsSettingsOnboarding) setFixedEquityOpen(true);
    }

    // Cargar Aportaciones
    const { data: contributionsData } = await supabase.from("contributions").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
    setContributions(contributionsData as ExtendedContribution[] ?? []);

    // Cargar Miembros (incluye user_id para RBAC; equity_cap opcional por si la columna aún no existe)
    const membersList = await fetchProjectMembers(supabase, projectId);
    setMembers(membersList);

    setLoading(false);
  };

  const refreshMembers = async () => {
    const supabase = createClient();
    const membersList = await fetchProjectMembers(supabase, projectId);
    setMembers(membersList);
  };

  const handleContributionSuccess = (updatedOrNew: Contribution) => {
    setContributions((prev) => {
      const exists = prev.find((c) => c.id === updatedOrNew.id);
      if (exists) return prev.map((c) => (c.id === updatedOrNew.id ? (updatedOrNew as ExtendedContribution) : c));
      return [...prev, updatedOrNew as ExtendedContribution];
    });
    setEditingContribution(null);
    // Refrescar proyecto para obtener current_valuation y multiplicadores actualizados
    fetchData();
  };

  const handleContributionDeleted = async (id: string) => {
    const supabase = createClient();
    const contribution = contributions.find((c) => c.id === id);

    const { error } = await supabase.from("contributions").delete().eq("id", id);

    if (error) {
      console.error("Error deleting contribution:", error);
      return;
    }

    try {
      const memberName = contribution?.contributor_name ?? "Unknown";
      const amt = contribution?.amount ?? 0;
      const contributionType = contribution?.type ?? "?";
      const currency = project?.currency ?? "EUR";
      await logAudit({
        supabase,
        projectId,
        actionType: "DELETE_CONTRIBUTION",
        description: `Deleted contribution: ${memberName} - ${formatCurrency(Number(amt), currency)} (${contributionType})`,
      });
    } catch (err) {
      console.error("Error saving audit log:", err);
    }

    await recalculateAndPersistProjectValuation(supabase, projectId, project ?? undefined);

    setContributions((prev) => prev.filter((c) => c.id !== id));
  };

  const handleEditContribution = (contribution: ExtendedContribution) => {
    if ((contribution as { isSimulated?: boolean }).isSimulated) return;
    setEditingContribution(contribution);
    setModalOpen(true);
  };

  const displayContributions = simulationMode
    ? [...contributions, ...simulatedContributions].sort((a, b) => {
        const getSortKey = (c: ExtendedContribution) =>
          (c as { addedAt?: string }).addedAt ?? (c as ExtendedContribution).created_at ?? (c as ExtendedContribution).date ?? "";
        const da = getSortKey(a);
        const db = getSortKey(b);
        return da > db ? -1 : da < db ? 1 : 0;
      })
    : contributions;

  const handleAddSimulatedContribution = (data: {
    contributor_name: string;
    concept: string;
    type: string;
    amount: number;
    multiplier: number;
    risk_adjusted_value: number;
    date: string;
  }) => {
    const sim: ExtendedContribution = {
      id: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      project_id: projectId,
      contributor_name: data.contributor_name,
      concept: data.concept,
      type: (data.type?.toLowerCase() || "others") as ContributionType,
      amount: data.amount,
      multiplier: data.multiplier,
      risk_adjusted_value: data.risk_adjusted_value,
      date: data.date,
      isSimulated: true,
      addedAt: new Date().toISOString(),
    };
    setSimulatedContributions((prev) => [...prev, sim]);
    setSimulationMode(true);
  };

  const handleRemoveSimulatedContribution = (id: string) => {
    setSimulatedContributions((prev) => prev.filter((c) => c.id !== id));
  };

  const handleExitSimulationMode = () => {
    setSimulationMode(false);
    setSimulatedContributions([]);
  };

  const handleFinalizeProject = async () => {
    const confirmed = window.confirm("Are you sure? This will freeze all contributions and lock the current equity state.");
    if (!confirmed) return;

    setIsFreezing(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("projects")
      .update({ status: "finalized" })
      .eq("id", projectId);

    if (error) {
      console.error("Error freezing project:", error);
      alert("Error: Could not save the finalized state.");
      setIsFreezing(false);
      return;
    }

    // Success: update local state so UI blocks immediately (isFinalized = true)
    setProject((prev) => (prev ? { ...prev, status: "finalized" } : null));
    console.log("Project frozen successfully. Status updated to 'finalized'.");
    setFinalizeToast("Project frozen successfully.");
    setTimeout(() => setFinalizeToast(null), 3000);

    if (project) {
      const { rows, totalPoints } = getEquitySummaryForFinalize(members, contributions, project);
      const modelName = (project.model_type || project.equity_model || "custom").replace(/_/g, " ").toLowerCase();
      setSummaryPayload({
        projectName: project.name,
        modelName,
        finalizedAt: new Date().toISOString(),
        totalPoints,
        rows,
        currency: project.currency ?? "EUR",
      });
    }
    setShowSummary(true);
    router.refresh();
    setIsFreezing(false);
  };

  const handleUnlockProject = async () => {
    const ok = window.confirm("Unlock this project to allow editing again?");
    if (!ok) return;
    const supabase = createClient();
    const { error } = await supabase.from("projects").update({ status: "active" }).eq("id", projectId);
    if (error) {
      console.error("Error unlocking project:", error);
      return;
    }
    setShowSummary(false);
    setSummaryPayload(null);
    await fetchData();
  };

  // --- LÓGICA DE GENERACIÓN DE PDF PROFESIONAL ---
  const generatePDF = () => {
    if (!project) return;
    const currency = project.currency ?? "EUR";
    const doc = new jsPDF();
    const projectName = project.name || "Project Report";
    const dateStr = new Date().toLocaleDateString();

    // 1. ENCABEZADO
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129); // Emerald Green
    doc.text(BRAND.nameUppercase, 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Dynamic Equity Split Report", 14, 26);

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Project: ${projectName}`, 14, 35);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${dateStr}`, 14, 40);

    // 2. Datos para la tabla resumen (fixed + cap + free / shadow points)
    const { rows: summaryRows, totalPoints: totalPointsSum } = getEquitySummaryForFinalize(members, contributions, project);

    const summaryData = summaryRows.map((r) => [
      r.name,
      r.role,
      formatCurrency(r.points, currency),
      `${r.fixed.toFixed(2)}%`,
      r.capFormatted,
      `${r.equityPct.toFixed(2)}%`,
    ]);

    const totalFixedEquity = summaryRows.reduce((sum, r) => sum + r.fixed, 0);
    const totalEquitySum = summaryRows.reduce((sum, r) => sum + r.equityPct, 0);

    const footData = [
      [
        "TOTAL",
        "",
        formatCurrency(totalPointsSum, currency),
        `${totalFixedEquity.toFixed(2)}%`,
        "—",
        `${totalEquitySum.toFixed(2)}%`,
      ],
    ];

    // 3. TABLA 1: RESUMEN DE EQUITY (Arriba)
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Equity Distribution Summary", 14, 52);

    autoTable(doc, {
        startY: 55,
        head: [["Member", "Role", "Risk Value", "Fixed Equity", "Cap / Limit", "Equity %"]],
        body: summaryData,
        foot: footData,
        theme: "grid",
        headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255], fontStyle: "bold" },
        footStyles: { fillColor: [229, 229, 229], textColor: [33, 33, 33], fontStyle: "bold" },
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
            0: { fontStyle: "bold", halign: "left" },
            1: { halign: "left" },
            2: { halign: "right" },
            3: { halign: "right" },
            4: { halign: "right" },
            5: { halign: "right", fontStyle: "bold" },
        },
        didParseCell: (data) => {
          if (data.section === "foot") {
            const colIdx = data.column.index;
            if (colIdx >= 2) data.cell.styles.halign = "right";
            else data.cell.styles.halign = "left";
          }
        },
    });

    // 4. TABLA 2: DETALLE DE APORTACIONES (Abajo)
    const finalY = (doc as any).lastAutoTable.finalY + 15; // Espacio después de la primera tabla

    doc.setFontSize(12);
    doc.text("Detailed Contribution Log", 14, finalY - 3);

    const sortedForPdf = [...contributions].sort((a, b) => {
      const da = (a as ExtendedContribution).created_at ?? (a as ExtendedContribution).date ?? "";
      const db = (b as ExtendedContribution).created_at ?? (b as ExtendedContribution).date ?? "";
      return da > db ? -1 : da < db ? 1 : 0;
    });
    const detailsData = sortedForPdf.map(c => [
        (c as ExtendedContribution).date || "-",
        (c as ExtendedContribution).contributor_name,
        (c as ExtendedContribution).type,
        (c as ExtendedContribution).concept || "-",
        formatCurrency(Number((c as ExtendedContribution).amount), currency),
        formatCurrency(Number((c as ExtendedContribution).risk_adjusted_value), currency),
    ]);

    autoTable(doc, {
        startY: finalY,
        head: [['Date', 'Contributor', 'Type', 'Description', 'Value', 'Risk Adj.']],
        body: detailsData,
        theme: 'striped',
        headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255], fontStyle: 'bold' }, // Slate color para diferenciar
        styles: { fontSize: 9 },
        columnStyles: {
            4: { halign: 'right' },
            5: { halign: 'right', fontStyle: 'bold' }
        }
    });

    // Pie de página
    const pageCount = (doc as any).internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount} - Generated by ${BRAND.name}`, 105, 290, { align: 'center' });
    }

    doc.save(`${projectName}_Full_Report.pdf`);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      setLastScrollY((prevY) => {
        if (currentY > prevY && currentY > 50) {
          setIsVisible(false);
        } else if (currentY < prevY) {
          setIsVisible(true);
        }
        return currentY;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => { fetchData(); }, [projectId]);

  const currentMember = members.find(
    (m) =>
      m.user_id === currentUserId ||
      (currentUserEmail && m.email?.toLowerCase() === currentUserEmail.toLowerCase())
  );
  const isOwner = project?.owner_id === currentUserId || currentMember?.role === "owner";
  const canEdit = isOwner || currentMember?.access_level === "editor";
  const isFinalized = (project as ExtendedProject & { status?: string })?.status === "finalized";
  const canEditAndNotFinalized = canEdit && !isFinalized;

  const groupedContributionsForChart = displayContributions.reduce((acc, curr) => {
    const existingIndex = acc.findIndex((c) => c.contributor_name === curr.contributor_name);
    if (existingIndex >= 0) {
      const existing = acc[existingIndex];
      const updated = { ...existing, amount: existing.amount + curr.amount, risk_adjusted_value: (existing.risk_adjusted_value || 0) + (curr.risk_adjusted_value || 0) };
      const newAcc = [...acc];
      newAcc[existingIndex] = updated;
      return newAcc;
    }
    return [...acc, { ...curr }];
  }, [] as Contribution[]);

  const getModelName = () => {
    const raw = project?.model_type || project?.equity_model || "Custom";
    return raw.replace(/_/g, ' ').toLowerCase(); 
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-12 w-12 bg-emerald-200 rounded-full"></div>
            <p className="text-slate-400 font-bold">Loading...</p>
        </div>
    </div>
  );
  
  if (!project) return null;

  const subscriptionStatus = (project as ExtendedProject & { subscription_status?: string }).subscription_status;
  const canAccessProject = subscriptionStatus === "active" || subscriptionStatus === "trialing";
  if (!canAccessProject) {
    const handleFinishPayment = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      try {
        const res = await fetch("/api/stripe/checkout/resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: project.id,
            userId: user.id,
            email: user.email ?? "",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to start checkout");
        if (data?.url) window.location.href = data.url;
        else throw new Error("No checkout URL received");
      } catch (err) {
        console.error("Complete payment failed:", err instanceof Error ? err.message : "Could not open payment");
      }
    };
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <nav className="fixed top-0 inset-x-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
          <div className="mx-auto max-w-screen-2xl flex items-center justify-start px-6 md:px-12 lg:px-24 py-2">
            <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Back to projects">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
          </div>
        </nav>
        <div className="bg-white border border-amber-200 rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-7 h-7 text-amber-600" />
          </div>
          <h1 className="text-xl font-black text-slate-900 mb-2">Payment pending</h1>
          <p className="text-slate-500 text-sm mb-6">
            Complete payment to access this project dashboard.
          </p>
          <button
            type="button"
            onClick={handleFinishPayment}
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white py-3 px-6 rounded-xl font-bold transition-colors"
          >
            <CreditCard className="w-5 h-5" /> Complete payment
          </button>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold text-slate-400 hover:text-slate-600">
            Back to list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-x-hidden">
      <main className="relative z-10 pt-16 pb-20 px-4 md:px-12 lg:px-24">
        <div className="mx-auto max-w-screen-2xl">
            <div className="mb-10 flex flex-col gap-3">
              {/* First row: back, project name, menu */}
              <div className="flex items-start gap-4 justify-between">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <Link
                    href="/dashboard"
                    className="mt-1 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    aria-label="Back to projects"
                  >
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight break-words">{project.name}</h1>
                    {isFinalized && (
                      <button
                        type="button"
                        onClick={() => {
                          if (project) {
                            const { rows, totalPoints } = getEquitySummaryForFinalize(members, contributions, project);
                            const modelName = (project.model_type || project.equity_model || "custom").replace(/_/g, " ").toLowerCase();
                            setSummaryPayload({
                              projectName: project.name,
                              modelName,
                              finalizedAt: new Date().toISOString(),
                              totalPoints,
                              rows,
                              currency: project.currency ?? "EUR",
                            });
                            setShowSummary(true);
                          }
                        }}
                        className="mt-2 text-sm font-bold text-emerald-600 hover:text-emerald-700"
                      >
                        View executive summary
                      </button>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(true); setMenuClosing(false); }}
                  className="mt-1 p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-colors shrink-0"
                  aria-label="Open project menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>

              {/* Second row: action buttons */}
              <div className="mt-3 flex gap-2 sm:gap-3 overflow-x-auto md:overflow-visible flex-nowrap md:flex-wrap pb-2 md:pb-0 -mx-1 px-1 md:mx-0 md:px-0 [&>*]:flex-shrink-0 shrink-0 items-start justify-end">
                <button
                  onClick={generatePDF}
                  className="inline-flex items-center gap-1.5 md:gap-2 rounded-xl bg-white border border-slate-200 px-3 md:px-5 py-2.5 md:py-3 font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all whitespace-nowrap text-xs md:text-base"
                >
                  <Download className="h-4 w-4 md:h-5 md:w-5 shrink-0" /> <span className="hidden sm:inline">Export </span>PDF
                </button>
                {canEditAndNotFinalized && (
                  <>
                    <button
                      onClick={() => setFixedEquityOpen(true)}
                      className="inline-flex items-center gap-1.5 md:gap-2 rounded-xl bg-white border border-slate-200 px-3 md:px-5 py-2.5 md:py-3 font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all whitespace-nowrap text-xs md:text-base"
                    >
                      <Settings className="h-4 w-4 md:h-5 md:w-5 shrink-0" /> <span className="hidden sm:inline">Equity </span>Settings
                    </button>
                    <button
                      onClick={() => setMemberModalOpen(true)}
                      className="inline-flex items-center gap-1.5 md:gap-2 rounded-xl bg-white border border-slate-200 px-3 md:px-5 py-2.5 md:py-3 font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all whitespace-nowrap text-xs md:text-base"
                    >
                      <Users className="h-4 w-4 md:h-5 md:w-5 shrink-0" /> Team
                    </button>
                    <button
                      onClick={() => { setEditingContribution(null); setModalOpen(true); }}
                      className="inline-flex items-center gap-1.5 md:gap-2 rounded-xl bg-slate-900 px-3 md:px-6 py-2.5 md:py-3 font-bold text-white shadow-lg hover:bg-slate-800 transition-all whitespace-nowrap text-xs md:text-base"
                    >
                      <Plus className="h-4 w-4 md:h-5 md:w-5 shrink-0" /> <span className="hidden sm:inline">Add </span>Contribution
                    </button>
                  </>
                )}
              </div>
            </div>

            {simulationMode && (
              <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 px-6 py-4 flex items-center justify-between gap-4">
                <p className="font-bold text-amber-800 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Simulation mode — Cap table and Team Breakdown reflect simulated contributions.
                  </span>
                </p>
                <button
                  type="button"
                  onClick={handleExitSimulationMode}
                  className="shrink-0 px-4 py-2 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-sm transition-colors"
                >
                  Exit simulation
                </button>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8 mt-4">
                <div
                  ref={contributionLogRef}
                  className="lg:col-span-2 min-h-0 bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] p-4 md:p-8 shadow-xl flex flex-col min-w-0 overflow-hidden max-h-[70vh] lg:max-h-[765px] lg:min-h-[320px]"
                >
                    {showEvolution ? (
                      <>
                        <div className="flex items-center gap-3 mb-6 flex-wrap shrink-0">
                          <div className="p-2 bg-emerald-50 rounded-lg"><PieChart className="h-5 w-5 text-emerald-600" /></div>
                          <h3 className="font-bold text-slate-900 text-xl">Equity Evolution</h3>
                        </div>
                        <div className="flex-1 min-h-0 overflow-hidden">
                          <EquityEvolutionPanel contributions={displayContributions} members={members} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 mb-6 flex-wrap shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg"><TrendingUp className="h-5 w-5 text-blue-600" /></div>
                                <h3 className="font-bold text-slate-900 text-xl">Contribution Log</h3>
                            </div>
                            {filterByMember && (
                                <button
                                    type="button"
                                    onClick={() => setFilterByMember(null)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-bold hover:bg-emerald-200 transition-colors"
                                >
                                    {filterByMember} <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                        <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0 pr-2 pb-1 custom-scrollbar -mx-1 md:mx-0 min-w-0">
                            <ContributionsTable
                              contributions={filterByMember ? displayContributions.filter((c) => c.contributor_name === filterByMember) : displayContributions}
                              currency={project?.currency ?? "EUR"}
                              onDelete={handleContributionDeleted}
                              onEdit={handleEditContribution}
                              onRemoveSimulated={handleRemoveSimulatedContribution}
                              canEdit={canEditAndNotFinalized}
                              simulationMode={simulationMode}
                            />
                        </div>
                      </>
                    )}
                </div>

                <div className="lg:col-span-1 flex flex-col gap-4">
                <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] p-4 md:p-8 shadow-xl flex flex-col h-fit sticky top-32">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-emerald-50 rounded-lg"><PieChart className="h-5 w-5 text-emerald-600" /></div>
                        <h3 className="font-bold text-slate-900 text-xl">Equity Distribution</h3>
                    </div>
                    <div className="w-full aspect-square"><EquityPieChart contributions={displayContributions} members={members} currency={project?.currency ?? "EUR"} showEvolution={showEvolution} onToggleEvolution={() => setShowEvolution((v) => !v)} /></div>
                  </div>

                <div className="grid grid-cols-3 gap-2 mt-2">
                    <button
                      onClick={() => setAuditLogModalOpen(true)}
                      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 font-bold text-slate-600 hover:bg-slate-100 transition-all"
                    >
                      <History className="h-5 w-5 text-slate-500" />
                      <span className="text-xs">Audit Log</span>
                    </button>
                    <Link
                      href={`/dashboard/${projectId}/legal`}
                      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 font-bold text-slate-600 hover:bg-slate-100 transition-all"
                    >
                      <FileText className="h-5 w-5 text-slate-500" />
                      <span className="text-xs">Legal Docs</span>
                    </Link>
                    {canEdit && (
                    isFinalized ? (
                      <button
                        onClick={handleUnlockProject}
                        className="flex flex-col items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-4 font-bold text-amber-700 hover:bg-amber-100 transition-all"
                      >
                        <LockOpen className="h-5 w-5" />
                        <span className="text-xs">Unfreeze Project</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handleFinalizeProject()}
                        disabled={isFreezing}
                        className="flex flex-col items-center justify-center gap-2 rounded-xl border border-red-200 bg-transparent px-3 py-4 font-bold text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <Snowflake className="h-5 w-5 text-red-600" />
                        <span className="text-xs">{isFreezing ? "Freezing…" : "Freeze Project"}</span>
                      </button>
                    )
                  )}
                </div>
            </div>
            </div>
            </div>

            {/* Team Breakdown - datos reales (fuera del max-w para ocupar todo el ancho) */}
            <section className="mt-12 w-full">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Team Breakdown</h3>
                  <p className="text-slate-500 font-medium">Dynamic split based on contributions.</p>
                </div>
                {(() => {
                  const { rows } = getEquitySummaryForFinalize(members, displayContributions, project);
                  const activeCount = rows.length;
                  return (
                    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Members</span>
                      <span className="text-sm font-black text-slate-800 tabular-nums">{activeCount}</span>
                    </div>
                  );
                })()}
              </div>
              {(() => {
                const { rows } = getEquitySummaryForFinalize(members, displayContributions, project);
                const sortedRows = [...rows].sort((a, b) => b.equityPct - a.equityPct);
                const barColors = ["bg-emerald-500", "bg-blue-500", "bg-violet-500", "bg-amber-500", "bg-red-500", "bg-cyan-500", "bg-pink-500", "bg-indigo-500"];
                const ringColors = ["ring-emerald-500", "ring-blue-500", "ring-violet-500", "ring-amber-500", "ring-red-500", "ring-cyan-500", "ring-pink-500", "ring-indigo-500"];
                const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                if (sortedRows.length === 0) {
                  return <p className="text-slate-500">No hay miembros en el proyecto. Añade miembros desde el botón Team.</p>;
                }
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {sortedRows.map((r, i) => (
                      <div key={r.name} className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm hover:shadow-md transition-shadow w-full min-w-0">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`h-14 w-14 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0 ring-2 ring-offset-2 ${ringColors[i % ringColors.length]}`} style={{ backgroundColor: ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#6366f1"][i % 8] }}>
                            {getInitials(r.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => {
                                setFilterByMember((prev) => (prev === r.name ? null : r.name));
                                contributionLogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                              }}
                              className="font-bold text-slate-900 truncate text-left w-full hover:text-emerald-600 hover:underline transition-colors"
                            >
                              {r.name}
                            </button>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{r.role}</p>
                          </div>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                          <div className={`h-full ${barColors[i % barColors.length]} rounded-full transition-all`} style={{ width: `${Math.min(r.equityPct, 100)}%` }} />
                        </div>
                        <p className="text-xl font-bold text-slate-900 tabular-nums mb-5">{r.equityPct.toFixed(2)}%</p>
                        <div className="border-t border-slate-100 pt-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Points</span>
                            <span className="font-bold text-slate-700 tabular-nums">{formatCurrency(r.points, project?.currency ?? "EUR")}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Fixed Equity</span>
                            <span className="font-bold text-slate-700 tabular-nums">{r.fixed > 0 ? `${r.fixed.toFixed(2)}%` : "—"}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Limit / Cap</span>
                            <span className="font-bold text-slate-700 tabular-nums">{r.capFormatted}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </section>
      </main>

      <AddContributionModal 
        isOpen={modalOpen} 
        onClose={() => { setModalOpen(false); setEditingContribution(null); }} 
        projectId={projectId} 
        projectConfig={project} 
        onSuccess={handleContributionSuccess} 
        onAddSimulated={handleAddSimulatedContribution}
        members={members} 
        editData={editingContribution}
        canEdit={canEdit}
      />
      
<AddMemberModal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        projectId={projectId}
        members={members}
        contributions={contributions}
        onUpdate={async () => { await refreshMembers(); await fetchData(); }}
        canEdit={canEdit}
      />

      <EquitySettingsModal
        isOpen={fixedEquityOpen}
        onClose={async () => {
          setFixedEquityOpen(false);
          if (project?.settings_onboarding_done === false) {
            const supabase = createClient();
            await supabase.from("projects").update({ settings_onboarding_done: true }).eq("id", projectId);
            setProject((prev) => (prev ? { ...prev, settings_onboarding_done: true } : null));
          }
        }}
        projectId={projectId}
        project={project}
        members={members}
        onSuccess={() => {
          refreshMembers();
          fetchData();
        }}
        onOpenDefaultModels={() => setEquityModelModalOpen(true)}
        canEdit={canEdit}
      />

      <AuditLogModal
        isOpen={auditLogModalOpen}
        onClose={() => setAuditLogModalOpen(false)}
        projectId={projectId}
        projectName={project?.name}
      />

      <EquityModelModal
        isOpen={equityModelModalOpen}
        onClose={() => setEquityModelModalOpen(false)}
        projectId={projectId}
        currentModel={project?.model_type}
        currentMults={{
          cash: project?.mult_cash ?? 4,
          work: project?.mult_work ?? 2,
          tangible: project?.mult_tangible ?? 2,
          intangible: project?.mult_intangible ?? 2,
          others: project?.mult_others ?? 1,
        }}
        onSuccess={fetchData}
      />

      {showLegacyOnboarding && (
        <LegacyOnboardingWizard
          open={showLegacyOnboarding}
          projectId={projectId}
          project={project}
          onCompleted={() => {
            setShowLegacyOnboarding(false);
            fetchData();
          }}
        />
      )}

      {finalizeToast && (
        <div
          role="alert"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] px-4 py-3 rounded-xl font-bold text-sm bg-emerald-600 text-white shadow-lg"
        >
          {finalizeToast}
        </div>
      )}

      {summaryPayload && (
        <FinalizedSummaryModal
          isOpen={showSummary}
          onClose={() => { setShowSummary(false); setSummaryPayload(null); }}
          projectName={summaryPayload.projectName}
          modelName={summaryPayload.modelName}
          finalizedAt={summaryPayload.finalizedAt}
          totalPoints={summaryPayload.totalPoints}
          rows={summaryPayload.rows}
          currency={summaryPayload.currency ?? "EUR"}
          onDownloadCertificate={() => {}}
        />
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-[140] flex">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => {
              if (menuClosing) return;
              setMenuClosing(true);
              setTimeout(() => {
                setMenuOpen(false);
                setMenuClosing(false);
              }, 200);
            }}
          />
          <div
            className={`relative ml-auto h-full w-72 max-w-full bg-white border-l border-slate-200 shadow-2xl flex flex-col ${
              menuClosing ? "animate-out slide-out-to-right duration-200" : "animate-in slide-in-from-right duration-200"
            }`}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Project Menu</p>
              <button
                type="button"
                onClick={() => {
                  if (menuClosing) return;
                  setMenuClosing(true);
                  setTimeout(() => {
                    setMenuOpen(false);
                    setMenuClosing(false);
                  }, 200);
                }}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                aria-label="Close project menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 px-4 py-6 text-sm text-slate-500 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">
                    Signed in as
                  </p>
                  <p className="text-sm font-semibold text-slate-800 break-words">
                    {currentUserEmail || "Unknown user"}
                  </p>
                </div>

                {/* Integrations */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Integrations
                  </p>
                  <button
                    type="button"
                    className="w-full text-left px-1 py-1 text-[13px] font-semibold text-slate-700 hover:text-emerald-600 transition-colors"
                  >
                    API & Integrations
                  </button>
                </div>

                {/* Support & Help */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Support & Help
                  </p>
                  <button
                    type="button"
                    className="w-full text-left px-1 py-1 text-[13px] font-semibold text-slate-700 hover:text-emerald-600 transition-colors"
                  >
                    📚 Help Center & Tutorials
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-1 py-1 text-[13px] font-semibold text-slate-700 hover:text-emerald-600 transition-colors"
                  >
                    💬 Contact Support
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-1 py-1 text-[13px] font-semibold text-slate-700 hover:text-emerald-600 transition-colors"
                  >
                    🎨 Preferences (Language & Theme)
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-1 py-1 text-[13px] font-semibold text-slate-700 hover:text-emerald-600 transition-colors"
                  >
                    🔔 Notifications (New Partner Contributions)
                  </button>
                </div>
              </div>

              <div className="pb-4 pt-2 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    router.push("/dashboard");
                    setMenuOpen(false);
                    setMenuClosing(false);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors"
                >
                  Change project
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const supabase = createClient();
                    await supabase.auth.signOut();
                    router.push("/login");
                    setMenuOpen(false);
                    setMenuClosing(false);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-xs font-bold text-red-600 hover:bg-red-100 hover:border-red-300 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}