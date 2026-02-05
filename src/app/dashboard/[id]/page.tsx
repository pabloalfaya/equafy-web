"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; 
import Link from "next/link";
import { Plus, TrendingUp, LayoutDashboard, PieChart, Users, Download, ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { EquityPieChart } from "@/components/EquityPieChart";
import { ContributionsTable } from "@/components/ContributionsTable";
import { AddContributionModal } from "@/components/AddContributionModal";
import { AddMemberModal } from "@/components/AddMemberModal";
import type { Project, Contribution } from "@/types/database";

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- TIPOS EXTENDIDOS ---
type ExtendedProject = Project & {
  equity_model?: string;
};

type ExtendedContribution = Contribution & {
  date?: string;
  concept?: string;     
  multiplier?: number;  
  risk_multiplier?: number; 
  [key: string]: any;
};

type Member = { id: string; name: string; role?: string };

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

  const fetchData = async () => {
    if (!projectId) return;
    const supabase = createClient();
    setLoading(true);

    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projectError || !projectData) {
      router.push("/dashboard"); 
      return;
    }
    setProject(projectData as ExtendedProject);

    const { data: contributionsData } = await supabase
      .from("contributions")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    
    setContributions(contributionsData as ExtendedContribution[] ?? []);

    const { data: membersData } = await supabase
      .from("project_members")
      .select("id, name, role")
      .eq("project_id", projectId);
      
    setMembers(membersData ?? []);
    setLoading(false);
  };

  const refreshMembers = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("project_members")
      .select("id, name, role")
      .eq("project_id", projectId);
    setMembers(data ?? []);
  };

  const handleContributionAdded = (newContribution: Contribution) => {
    setContributions((prev) => [...prev, newContribution as ExtendedContribution]);
  };

  const handleContributionDeleted = (contribution: Contribution) => {
    setContributions((prev) => prev.filter((c) => c.id !== contribution.id));
  };

  // --- FUNCIÓN GENERAR PDF (CON TIPADO CORREGIDO) ---
  const generatePDF = () => {
    if (!project) return;
    const doc = new jsPDF();
    const projectName = project.name || "Project Report";
    
    // Forzamos el tipo de color a una tupla de 3 números para TypeScript
    const colorDark: [number, number, number] = [15, 23, 42];      
    const colorEmerald: [number, number, number] = [16, 185, 129]; 
    const colorBlue: [number, number, number] = [59, 130, 246];    
    const colorGray: [number, number, number] = [100, 116, 139];

    // 1. Cabecera Estilo Dashboard
    doc.setFillColor(colorDark[0], colorDark[1], colorDark[2]);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("EQUILY", 14, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Dynamic Equity Split Report", 14, 28);

    // 2. Título y Meta
    doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text(projectName.toLowerCase(), 14, 60);
    doc.setFontSize(10);
    doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 68);

    // 3. Tabla de Reparto de la Empresa
    doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
    doc.setFontSize(14);
    doc.text("Equity Distribution", 14, 85);

    const totalProjectValue = contributions.reduce((sum, c) => sum + (Number(c.risk_adjusted_value) || 0), 0);

    const memberRows = members.map(m => {
        const memberTotal = contributions
          .filter(c => c.contributor_name === m.name)
          .reduce((sum, c) => sum + (Number(c.risk_adjusted_value) || 0), 0);
        
        const percentage = totalProjectValue > 0 
          ? ((memberTotal / totalProjectValue) * 100).toFixed(2) 
          : "0.00";

        // Aseguramos que los valores sean siempre string para evitar el error RowInput
        return [
          m.name ?? "Unknown", 
          m.role ?? "Co-founder", 
          memberTotal.toLocaleString(undefined, { minimumFractionDigits: 2 }), 
          `${percentage}%`
        ];
    });

    autoTable(doc, {
      startY: 90,
      head: [['Member', 'Role', 'Risk Value', 'Equity %']],
      body: memberRows,
      theme: 'striped',
      headStyles: { fillColor: colorEmerald, textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 }
    });

    // 4. Tabla Log de Contribuciones
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFontSize(14);
    doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
    doc.text("Contribution Log", 14, finalY + 20);

    const contributionRows = contributions.map(c => [
      c.date ? new Date(c.date).toLocaleDateString() : 'N/A',
      c.contributor_name ?? "Anonymous",
      c.type ?? "Other",
      c.concept ?? "No description",
      Number(c.amount).toLocaleString(undefined, { minimumFractionDigits: 2 }),
      Number(c.risk_adjusted_value).toLocaleString(undefined, { minimumFractionDigits: 2 })
    ]);

    autoTable(doc, {
      startY: finalY + 25,
      head: [['Date', 'Contributor', 'Category', 'Description', 'Value', 'Risk Adj. Value']],
      body: contributionRows,
      theme: 'striped',
      headStyles: { fillColor: colorBlue, textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 }
    });

    doc.save(`${projectName}_Report_Full.pdf`);
  };

  useEffect(() => { 
    fetchData(); 
  }, [projectId]);

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

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-12 w-12 bg-emerald-200 rounded-full"></div>
        <p className="text-slate-400 font-bold">Loading Workspace...</p>
      </div>
    </div>
  );

  if (!project) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-x-hidden">
       <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-400/5 blur-[100px] rounded-full mix-blend-multiply"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-400/5 blur-[100px] rounded-full mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/50 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <div className="flex items-center gap-4">
             <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Back to Projects">
                <ArrowLeft className="w-5 h-5 text-slate-500" />
             </Link>
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
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 mb-4">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Live Tracking</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{project.name}</h1>
                <p className="mt-2 text-slate-500 font-medium italic">Calculated using the {project.equity_model?.replace('_', ' ')} model.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={generatePDF} className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-3 font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all hover:-translate-y-0.5">
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

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-xl flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 rounded-lg"><TrendingUp className="h-5 w-5 text-blue-600" /></div>
                        <h3 className="font-bold text-slate-900 text-xl">Contribution Log</h3>
                    </div>
                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        <ContributionsTable contributions={contributions} onDelete={handleContributionDeleted} />
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-xl flex flex-col h-fit sticky top-32">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-emerald-50 rounded-lg"><PieChart className="h-5 w-5 text-emerald-600" /></div>
                        <h3 className="font-bold text-slate-900 text-xl">Equity Distribution</h3>
                    </div>
                    <div className="w-full aspect-square">
                        <EquityPieChart contributions={groupedContributionsForChart} />
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">
                            Based on risk-adjusted contributions
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </main>

      <AddContributionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        projectId={projectId}
        projectConfig={project} 
        onSuccess={handleContributionAdded}
        members={members}
        onAddMemberClick={() => { setModalOpen(false); setMemberModalOpen(true); }}
      />

      <AddMemberModal 
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        projectId={projectId}
        onSuccess={refreshMembers}
      />
    </div>
  );
}