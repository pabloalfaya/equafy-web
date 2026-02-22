"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation"; 
import Link from "next/link";
import { Plus, TrendingUp, LayoutDashboard, PieChart, Users, Download, ArrowLeft, Settings, History, FileText, Snowflake, CreditCard, LockOpen, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { recalculateAndPersistProjectValuation } from "@/utils/projectRecalculator";
import { logAudit } from "@/utils/auditLog";
import { EquityPieChart } from "@/components/EquityPieChart";
import { ContributionsTable } from "@/components/ContributionsTable";
import { AddContributionModal } from "@/components/AddContributionModal";
import { AddMemberModal } from "@/components/AddMemberModal";
import { EquitySettingsModal } from "@/components/EquitySettingsModal";
import { EquityModelModal } from "@/components/EquityModelModal";
import { AuditLogModal } from "@/components/AuditLogModal";
import { FinalizedSummaryModal, type SummaryRow } from "@/components/FinalizedSummaryModal";
import type { Project, Contribution, ContributionType } from "@/types/database";

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BRAND } from "@/lib/brand";

// Tipos extendidos
type ExtendedProject = Project & { 
    equity_model?: string; 
    model_type?: string; 
    model_onboarding_dismissed?: boolean;
};
type ExtendedContribution = Contribution & { date?: string; concept?: string; multiplier?: number; [key: string]: any };

// Tipos de miembros
type Member = { id: string; name: string; role: string; email?: string; fixed_equity?: number | null; equity_cap?: number | null; access_level?: "editor" | "viewer"; user_id?: string | null };

/** Carga miembros del proyecto. Si la columna equity_cap no existe en la BD, reintenta sin ella para no vaciar la lista. */
async function fetchProjectMembers(
  supabase: ReturnType<typeof createClient>,
  projectId: string
): Promise<Member[]> {
  const baseCols = "id, name, role, email, fixed_equity, access_level, user_id";
  const { data: withCap, error: errWithCap } = await supabase
    .from("project_members")
    .select(`${baseCols}, equity_cap`)
    .eq("project_id", projectId);
  if (!errWithCap && withCap != null) {
    return (withCap as unknown as Member[]) ?? [];
  }
  const { data: withoutCap } = await supabase
    .from("project_members")
    .select(baseCols)
    .eq("project_id", projectId);
  const rows = (withoutCap ?? []) as (Omit<Member, "equity_cap"> & { equity_cap?: number | null })[];
  return rows.map((r) => ({ ...r, equity_cap: r.equity_cap ?? null }));
}

/** Returns normalized equity rows and total points (same logic as EquityPieChart / PDF). */
function getEquitySummaryForFinalize(
  members: Member[],
  contributions: ExtendedContribution[],
  _project: ExtendedProject | null
): { rows: SummaryRow[]; totalPoints: number } {
  const totalFixedEquity = members.reduce((sum, m) => sum + (Number(m.fixed_equity) || 0), 0);
  const dynamicPool = Math.max(0, 100 - totalFixedEquity);
  const totalRiskPoints = contributions.reduce((sum, c) => sum + (Number(c.risk_adjusted_value) || 0), 0);

  const memberRows = members.map((member) => {
    const memberFixedEquity = Number(member.fixed_equity) || 0;
    const memberPoints = contributions
      .filter((c) => c.contributor_name === member.name)
      .reduce((sum, c) => sum + (Number(c.risk_adjusted_value) || 0), 0);
    let dynamicShare = totalRiskPoints > 0
      ? (memberPoints / totalRiskPoints) * dynamicPool
      : members.length > 0 ? dynamicPool / members.length : 0;
    const theoreticalEquity = memberFixedEquity + dynamicShare;
    return { name: member.name, points: memberPoints, fixed: memberFixedEquity, equity: theoreticalEquity };
  });

  let rawEquitySum = memberRows.reduce((sum, r) => sum + r.equity, 0);
  let theoreticalPct = rawEquitySum > 0 ? memberRows.map((r) => (r.equity / rawEquitySum) * 100) : memberRows.map(() => 0);
  const caps = members.map((m) => (m.equity_cap != null && m.equity_cap !== undefined ? Number(m.equity_cap) : null));
  let finalPct = theoreticalPct.slice();
  let excess = 0;
  for (let i = 0; i < finalPct.length; i++) {
    const cap = caps[i];
    if (cap != null && finalPct[i] > cap) {
      excess += finalPct[i] - cap;
      finalPct[i] = cap;
    }
  }
  let uncappedTheoreticalSum = 0;
  for (let i = 0; i < finalPct.length; i++) {
    const cap = caps[i];
    if (cap == null || theoreticalPct[i] <= cap) uncappedTheoreticalSum += theoreticalPct[i];
  }
  if (excess > 0 && uncappedTheoreticalSum > 0) {
    for (let i = 0; i < finalPct.length; i++) {
      const cap = caps[i];
      if (cap == null || theoreticalPct[i] <= cap) finalPct[i] += excess * (theoreticalPct[i] / uncappedTheoreticalSum);
    }
  }
  const totalAfter = finalPct.reduce((s, v) => s + v, 0);
  if (totalAfter > 0) finalPct = finalPct.map((v) => (v / totalAfter) * 100);

  const totalPoints = memberRows.reduce((sum, r) => sum + r.points, 0);
  const formatCap = (cap: number | null | undefined) => {
    if (cap != null && cap !== undefined && Number(cap) > 0) return `${Number(cap).toFixed(2)}%`;
    return "—";
  };
  const rows: SummaryRow[] = memberRows.map((r, i) => ({
    name: r.name,
    role: members[i]?.role || "Member",
    points: r.points,
    fixed: r.fixed,
    capFormatted: formatCap(members[i]?.equity_cap),
    equityPct: finalPct[i],
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
  const [simulationMode, setSimulationMode] = useState(false);
  const [simulatedContributions, setSimulatedContributions] = useState<ExtendedContribution[]>([]);
  const contributionLogRef = useRef<HTMLDivElement>(null);
  const [summaryPayload, setSummaryPayload] = useState<{
    projectName: string;
    modelName: string;
    finalizedAt: string;
    totalPoints: number;
    rows: SummaryRow[];
  } | null>(null);

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
      await logAudit({
        supabase,
        projectId,
        actionType: "DELETE_CONTRIBUTION",
        description: `Deleted contribution: ${memberName} - ${Number(amt).toLocaleString()}€ (${contributionType})`,
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

    // 2. CÁLCULO DE DATOS PARA LA TABLA RESUMEN (igual que EquityPieChart: teórico → cap → redistribución)
    const totalFixedEquity = members.reduce((sum, m) => sum + (Number(m.fixed_equity) || 0), 0);
    const dynamicPool = Math.max(0, 100 - totalFixedEquity);
    const totalRiskPoints = contributions.reduce((sum, c) => sum + (Number(c.risk_adjusted_value) || 0), 0);

    const memberRows = members.map((member) => {
      const memberFixedEquity = Number(member.fixed_equity) || 0;
      const memberPoints = contributions
        .filter((c) => c.contributor_name === member.name)
        .reduce((sum, c) => sum + (Number(c.risk_adjusted_value) || 0), 0);

      let dynamicShare: number;
      if (totalRiskPoints > 0) {
        dynamicShare = (memberPoints / totalRiskPoints) * dynamicPool;
      } else {
        dynamicShare = members.length > 0 ? dynamicPool / members.length : 0;
      }

      const theoreticalEquity = memberFixedEquity + dynamicShare;
      return {
        name: member.name,
        role: member.role || "Member",
        points: memberPoints,
        fixed: memberFixedEquity,
        equity: theoreticalEquity,
      };
    });

    // Normalizar teórico a 100%
    let rawEquitySum = memberRows.reduce((sum, r) => sum + r.equity, 0);
    let theoreticalPct = rawEquitySum > 0 ? memberRows.map((r) => (r.equity / rawEquitySum) * 100) : memberRows.map(() => 0);

    // Aplicar equity cap y redistribuir excedente (igual que EquityPieChart)
    const caps = members.map((m) => (m.equity_cap != null && m.equity_cap !== undefined ? Number(m.equity_cap) : null));
    let finalPct = theoreticalPct.slice();
    let excess = 0;
    for (let i = 0; i < finalPct.length; i++) {
      const cap = caps[i];
      if (cap != null && finalPct[i] > cap) {
        excess += finalPct[i] - cap;
        finalPct[i] = cap;
      }
    }
    let uncappedTheoreticalSum = 0;
    for (let i = 0; i < finalPct.length; i++) {
      const cap = caps[i];
      if (cap == null || theoreticalPct[i] <= cap) uncappedTheoreticalSum += theoreticalPct[i];
    }
    if (excess > 0 && uncappedTheoreticalSum > 0) {
      for (let i = 0; i < finalPct.length; i++) {
        const cap = caps[i];
        if (cap == null || theoreticalPct[i] <= cap) finalPct[i] += excess * (theoreticalPct[i] / uncappedTheoreticalSum);
      }
    }
    const totalAfter = finalPct.reduce((s, v) => s + v, 0);
    if (totalAfter > 0) finalPct = finalPct.map((v) => (v / totalAfter) * 100);

    const normalizedRows = memberRows.map((r, i) => ({ ...r, equity: finalPct[i] }));

    const formatCap = (cap: number | null | undefined) => {
      if (cap != null && cap !== undefined && Number(cap) > 0) return `${Number(cap).toFixed(2)}%`;
      return "—";
    };

    const summaryData = normalizedRows.map((r, i) => [
      r.name,
      r.role,
      r.points.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      `${r.fixed.toFixed(2)}%`,
      formatCap(members[i]?.equity_cap),
      `${r.equity.toFixed(2)}%`,
    ]);

    const totalPointsSum = normalizedRows.reduce((sum, r) => sum + r.points, 0);
    const totalEquitySum = normalizedRows.reduce((sum, r) => sum + r.equity, 0);

    const footData = [
      [
        "TOTAL",
        "",
        totalPointsSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
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
        head: [["Member", "Role", "Risk Value (Points)", "Fixed Equity", "Cap / Limit", "Equity %"]],
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
        (c as ExtendedContribution).amount.toLocaleString(),
        (c as ExtendedContribution).risk_adjusted_value.toLocaleString()
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
      <main className="relative z-10 pt-16 pb-20 px-6 md:px-12 lg:px-24">
        <div className="mx-auto max-w-screen-2xl">
            <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-start gap-4">
                <Link
                  href="/dashboard"
                  className="mt-1 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  aria-label="Back to projects"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-500" />
                </Link>
                <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{project.name}</h1>
                <p className="mt-2 text-slate-500 font-medium italic capitalize">
                    Calculated using the {getModelName()} model.
                </p>
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
              <div className="flex gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                <button
                  onClick={generatePDF}
                  className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 md:px-5 py-2.5 md:py-3 font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all whitespace-nowrap text-sm md:text-base"
                >
                  <Download className="h-5 w-5" /> Export PDF
                </button>
                {canEditAndNotFinalized && (
                  <>
                    <button
                      onClick={() => setFixedEquityOpen(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 md:px-5 py-2.5 md:py-3 font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all whitespace-nowrap text-sm md:text-base"
                    >
                      <Settings className="h-5 w-5" /> Equity Settings
                    </button>
                    <button
                      onClick={() => setMemberModalOpen(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 md:px-5 py-2.5 md:py-3 font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all whitespace-nowrap text-sm md:text-base"
                    >
                      <Users className="h-5 w-5" /> Team
                    </button>
                    <button
                      onClick={() => { setEditingContribution(null); setModalOpen(true); }}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 md:px-6 py-2.5 md:py-3 font-bold text-white shadow-lg hover:bg-slate-800 transition-all whitespace-nowrap text-sm md:text-base"
                    >
                      <Plus className="h-5 w-5" /> Add Contribution
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

            <div className="grid lg:grid-cols-3 gap-8">
                <div ref={contributionLogRef} className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-xl flex flex-col">
                    <div className="flex items-center gap-3 mb-6 flex-wrap">
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
                    <div className="overflow-auto max-h-[600px] pr-2 pb-1 custom-scrollbar">
                        <ContributionsTable
                          contributions={filterByMember ? displayContributions.filter((c) => c.contributor_name === filterByMember) : displayContributions}
                          onDelete={handleContributionDeleted}
                          onEdit={handleEditContribution}
                          onRemoveSimulated={handleRemoveSimulatedContribution}
                          canEdit={canEditAndNotFinalized}
                          simulationMode={simulationMode}
                        />
                    </div>
                </div>
                
                <div className="lg:col-span-1 flex flex-col gap-4">
                <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-xl flex flex-col h-fit sticky top-32">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-emerald-50 rounded-lg"><PieChart className="h-5 w-5 text-emerald-600" /></div>
                        <h3 className="font-bold text-slate-900 text-xl">Equity Distribution</h3>
                    </div>
                    <div className="w-full aspect-square"><EquityPieChart contributions={displayContributions} members={members} /></div>
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
              <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Team Breakdown</h3>
              <p className="text-slate-500 font-medium mb-8">Dynamic split based on contributions.</p>
              {(() => {
                const { rows } = getEquitySummaryForFinalize(members, displayContributions, project);
                const barColors = ["bg-emerald-500", "bg-blue-500", "bg-violet-500", "bg-amber-500", "bg-red-500", "bg-cyan-500", "bg-pink-500", "bg-indigo-500"];
                const ringColors = ["ring-emerald-500", "ring-blue-500", "ring-violet-500", "ring-amber-500", "ring-red-500", "ring-cyan-500", "ring-pink-500", "ring-indigo-500"];
                const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                if (rows.length === 0) {
                  return <p className="text-slate-500">No hay miembros en el proyecto. Añade miembros desde el botón Team.</p>;
                }
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {rows.map((r, i) => (
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
                        <p className="text-xl font-bold text-slate-900 tabular-nums mb-5">{r.equityPct.toFixed(1)}%</p>
                        <div className="border-t border-slate-100 pt-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Points</span>
                            <span className="font-bold text-slate-700 tabular-nums">{r.points.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
        onClose={() => setFixedEquityOpen(false)}
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
          onDownloadCertificate={() => {}}
        />
      )}
    </div>
  );
}