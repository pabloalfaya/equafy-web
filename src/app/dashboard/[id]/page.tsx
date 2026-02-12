"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; 
import Link from "next/link";
import { Plus, TrendingUp, LayoutDashboard, PieChart, Users, Download, ArrowLeft, Settings, History, FileText, Flag } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { recalculateAndPersistProjectValuation } from "@/utils/projectRecalculator";
import { logAudit } from "@/utils/auditLog";
import { EquityPieChart } from "@/components/EquityPieChart";
import { ContributionsTable } from "@/components/ContributionsTable";
import { AddContributionModal } from "@/components/AddContributionModal";
import { AddMemberModal } from "@/components/AddMemberModal";
import { EquitySettingsModal } from "@/components/EquitySettingsModal";
import { AuditLogModal } from "@/components/AuditLogModal";
import type { Project, Contribution } from "@/types/database";

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Tipos extendidos
type ExtendedProject = Project & { 
    equity_model?: string; 
    model_type?: string; 
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
    setEditingContribution(contribution);
    setModalOpen(true);
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
    doc.text("EQUILY", 14, 20);

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
        doc.text(`Page ${i} of ${pageCount} - Generated by Equily`, 105, 290, { align: 'center' });
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

  const groupedContributionsForChart = contributions.reduce((acc, curr) => {
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-x-hidden">
      <nav
        className={`fixed top-0 inset-x-0 z-50 border-b border-white/50 bg-white/60 backdrop-blur-xl transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <div className="flex items-center gap-4">
             <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ArrowLeft className="w-5 h-5 text-slate-500" /></Link>
             <Link href="/"><img src="/logo.png" alt="Equily" className="h-20 w-auto object-contain" /></Link>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full border border-slate-200/50">
             <LayoutDashboard className="h-4 w-4 text-emerald-500" />
             <span className="text-sm font-bold text-slate-700">{project.name}</span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{project.name}</h1>
                <p className="mt-2 text-slate-500 font-medium italic capitalize">
                    Calculated using the {getModelName()} model.
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button onClick={generatePDF} className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-3 font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all">
                    <Download className="h-5 w-5" /> Export PDF
                </button>
                {canEdit && (
                  <>
                    <button onClick={() => setFixedEquityOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-3 font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all">
                        <Settings className="h-5 w-5" /> Equity Settings
                    </button>
                    <button onClick={() => setMemberModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-3 font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all">
                        <Users className="h-5 w-5" /> Team
                    </button>
                    <button onClick={() => { setEditingContribution(null); setModalOpen(true); }} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white shadow-lg hover:bg-slate-800 transition-all">
                        <Plus className="h-5 w-5" /> Add Contribution
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-xl flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 rounded-lg"><TrendingUp className="h-5 w-5 text-blue-600" /></div>
                        <h3 className="font-bold text-slate-900 text-xl">Contribution Log</h3>
                    </div>
                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        <ContributionsTable contributions={contributions} onDelete={handleContributionDeleted} onEdit={handleEditContribution} canEdit={canEdit} />
                    </div>
                </div>
                
                <div className="lg:col-span-1 flex flex-col gap-4">
                <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-xl flex flex-col h-fit sticky top-32">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-emerald-50 rounded-lg"><PieChart className="h-5 w-5 text-emerald-600" /></div>
                        <h3 className="font-bold text-slate-900 text-xl">Equity Distribution</h3>
                    </div>
                    <div className="w-full aspect-square"><EquityPieChart contributions={contributions} members={members} /></div>
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
                    <button
                      disabled
                      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/50 px-3 py-4 font-bold text-red-600 opacity-60 cursor-not-allowed"
                    >
                      <Flag className="h-5 w-5" />
                      <span className="text-xs">Finalize Project</span>
                    </button>
                </div>
            </div>
            </div>
        </div>
      </main>

      <AddContributionModal 
        isOpen={modalOpen} 
        onClose={() => { setModalOpen(false); setEditingContribution(null); }} 
        projectId={projectId} 
        projectConfig={project} 
        onSuccess={handleContributionSuccess} 
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
        onUpdate={refreshMembers}
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
        canEdit={canEdit}
      />

      <AuditLogModal
        isOpen={auditLogModalOpen}
        onClose={() => setAuditLogModalOpen(false)}
        projectId={projectId}
        projectName={project?.name}
      />
    </div>
  );
}