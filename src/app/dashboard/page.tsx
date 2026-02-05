"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, TrendingUp, LayoutDashboard, PieChart, Users, FolderPlus, Download } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { EquityPieChart } from "@/components/EquityPieChart";
import { ContributionsTable } from "@/components/ContributionsTable";
import { AddContributionModal } from "@/components/AddContributionModal";
import { AddMemberModal } from "@/components/AddMemberModal";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import type { Project, Contribution } from "@/types/database";

// Importaciones para el PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Member = { id: string; name: string; role?: string };

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [members, setMembers] = useState<Member[]>([]); 
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchData = async () => {
    const supabase = createClient();
    setFetchError(null);

    const { data: projectsData, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (projectsError) {
      setFetchError(projectsError.message);
      setLoading(false);
      return;
    }

    setProjects(projectsData ?? []);
    const project = projectsData?.[0] ?? null;
    setSelectedProject(project);

    if (project) {
      const { data: contributionsData } = await supabase
        .from("contributions")
        .select("*")
        .eq("project_id", project.id)
        .order("created_at", { ascending: true });
      
      setContributions(contributionsData ?? []);

      const { data: membersData } = await supabase
        .from("project_members")
        .select("id, name, role")
        .eq("project_id", project.id)
        .order("created_at", { ascending: true });

      setMembers(membersData ?? []);
    }

    setLoading(false);
  };

  const refreshMembers = async () => {
    if (!selectedProject) return;
    const supabase = createClient();
    const { data } = await supabase.from("project_members").select("id, name, role").eq("project_id", selectedProject.id);
    setMembers(data ?? []);
  };

  const handleContributionAdded = (newContribution: Contribution) => {
    setContributions((prev) => [...prev, newContribution]);
  };

  const handleContributionDeleted = (contribution: Contribution) => {
    setContributions((prev) => prev.filter((c) => c.id !== contribution.id));
  };

  // --- FUNCIÓN PARA GENERAR EL PDF ---
  const generatePDF = () => {
    const doc = new jsPDF();
    const projectName = selectedProject?.name || "Project Report";

    // 1. CABECERA
    doc.setFillColor(16, 185, 129); // Emerald 500
    doc.rect(0, 0, 210, 20, 'F'); 
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("EQUILY REPORT", 14, 13);

    doc.setTextColor(15, 23, 42); // Slate 900
    doc.setFontSize(22);
    doc.text(projectName, 14, 35);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 42);

    // 2. CÁLCULO DE EQUITY
    const totalRiskValue = contributions.reduce((sum, c) => sum + (c.risk_adjusted_value || 0), 0);
    
    const memberRows = members.map(m => {
        const memberContributions = contributions.filter(c => c.contributor_name === m.name);
        const memberTotal = memberContributions.reduce((sum, c) => sum + (c.risk_adjusted_value || 0), 0);
        const percentage = totalRiskValue > 0 ? ((memberTotal / totalRiskValue) * 100).toFixed(2) : "0.00";
        
        return [
            m.name,
            m.role || "Member",
            memberTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            `${percentage}%`
        ];
    });

    // 3. TABLA DE EQUITY
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Equity Distribution", 14, 55);

    autoTable(doc, {
      startY: 60,
      head: [['Member', 'Role', 'Risk Value', 'Equity %']],
      body: memberRows,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    // 4. TABLA DE APORTACIONES
    const finalY = (doc as any).lastAutoTable.finalY || 60;
    
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Contribution Log", 14, finalY + 15);

    const contributionRows = contributions.map(c => [
      // CORRECCIÓN 1: Aseguramos que created_at no sea undefined
      new Date(c.created_at || new Date().toISOString()).toLocaleDateString(),
      c.contributor_name,
      c.type,
      // CORRECCIÓN 2: Forzamos el tipo 'any' para leer 'description' aunque TS no lo vea
      (c as any).description || "-",
      c.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      (c.risk_adjusted_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    ]);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Date', 'Contributor', 'Type', 'Description', 'Value', 'Risk Adj. Value']],
      body: contributionRows,
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 2 },
    });

    // 5. PIE DE PÁGINA
    const pageCount = (doc as any).internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount} - Generated by Equily`, 105, 290, { align: 'center' });
    }

    doc.save(`${projectName.replace(/\s+/g, '_')}_Report.pdf`);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    const supabase = createClient();
    supabase.from("contributions").select("*").eq("project_id", selectedProject.id).then(({ data }) => setContributions(data ?? []));
    supabase.from("project_members").select("id, name, role").eq("project_id", selectedProject.id).then(({ data }) => setMembers(data ?? []));
  }, [selectedProject?.id]);

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-slate-500 font-bold animate-pulse">Loading Equily...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-x-hidden">
       <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-400/5 blur-[100px] rounded-full mix-blend-multiply"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-400/5 blur-[100px] rounded-full mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/50 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <Link href="/"><img src="/logo.png" alt="Equily" className="h-28 w-auto object-contain" /></Link>
          <div className="flex items-center gap-4">
            {projects.length > 0 && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100/50 border border-slate-200 rounded-lg">
                  <LayoutDashboard className="h-4 w-4 text-slate-400" />
                  <select value={selectedProject?.id ?? ""} onChange={(e) => setSelectedProject(projects.find(p => p.id === e.target.value) || null)} className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer">
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="mx-auto max-w-7xl">
          {!selectedProject ? (
            <div className="mt-20 flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-[32px] shadow-2xl text-center px-6 max-w-4xl mx-auto transition-all">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                  <FolderPlus className="w-10 h-10 text-slate-300" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">No projects found</h2>
                <p className="text-slate-500 font-medium max-w-sm mb-8">
                  You don't have any projects yet. Create one to start managing equity fairly.
                </p>
                <CreateProjectModal />
            </div>
          ) : (
            <>
              <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 mb-4">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Live Tracking</span>
                  </div>
                  <h1 className="text-4xl font-black text-slate-900">{selectedProject.name}</h1>
                  <p className="mt-2 text-slate-500 font-medium">Risk-adjusted equity tracking.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={generatePDF}
                    className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-3 font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all hover:-translate-y-0.5"
                  >
                    <Download className="h-5 w-5" /> Export PDF
                  </button>

                  <button onClick={() => setMemberModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-3 font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all hover:-translate-y-0.5">
                    <Users className="h-5 w-5" /> Team
                  </button>
                  <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white shadow-lg hover:bg-slate-800 transition-all hover:-translate-y-0.5">
                    <Plus className="h-5 w-5" /> Add Contribution
                  </button>
                </div>
              </div>

              <div className="mb-8 bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-xl flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 rounded-lg"><TrendingUp className="h-5 w-5 text-blue-600" /></div>
                        <h3 className="font-bold text-slate-900 text-xl">Contribution Log</h3>
                  </div>
                  <div className="overflow-x-auto max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    <ContributionsTable contributions={contributions} onDelete={handleContributionDeleted} />
                  </div>
              </div>

              <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-xl flex flex-col">
                  <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-emerald-50 rounded-lg"><PieChart className="h-5 w-5 text-emerald-600" /></div>
                        <h3 className="font-bold text-slate-900 text-xl">Equity Distribution</h3>
                  </div>
                  <div className="w-full h-auto min-h-[500px]"><EquityPieChart contributions={groupedContributionsForChart} /></div>
              </div>
            </>
          )}
        </div>
      </main>

      <AddContributionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        projectId={selectedProject?.id ?? null}
        onSuccess={handleContributionAdded}
        members={members}
        onAddMemberClick={() => { setModalOpen(false); setMemberModalOpen(true); }}
      />

      <AddMemberModal 
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        projectId={selectedProject?.id ?? null}
        onSuccess={refreshMembers}
      />
    </div>
  );
}