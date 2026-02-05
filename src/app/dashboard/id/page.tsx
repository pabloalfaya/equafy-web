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

// Definimos un tipo flexible para evitar errores de TypeScript
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

  const [project, setProject] = useState<Project | null>(null);
  const [contributions, setContributions] = useState<ExtendedContribution[]>([]);
  const [members, setMembers] = useState<Member[]>([]); 
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);

  // --- CARGAR DATOS ---
  const fetchData = async () => {
    if (!projectId) return;
    const supabase = createClient();
    setLoading(true);

    // 1. Proyecto
    const { data: projectData, error: projectError } = await supabase
      .from("projects").select("*").eq("id", projectId).single();

    if (projectError || !projectData) {
      router.push("/dashboard"); // Si falla, volvemos al selector
      return;
    }
    setProject(projectData);

    // 2. Contribuciones
    const { data: contributionsData } = await supabase
      .from("contributions").select("*").eq("project_id", projectId).order("created_at", { ascending: true });
    setContributions(contributionsData as ExtendedContribution[] ?? []);

    // 3. Miembros
    const { data: membersData } = await supabase
      .from("project_members").select("id, name, role").eq("project_id", projectId);
    setMembers(membersData ?? []);
    
    setLoading(false);
  };

  const refreshMembers = async () => {
    const supabase = createClient();
    const { data } = await supabase.from("project_members").select("id, name, role").eq("project_id", projectId);
    setMembers(data ?? []);
  };

  const handleContributionAdded = (newContribution: Contribution) => {
    setContributions((prev) => [...prev, newContribution as ExtendedContribution]);
  };

  const handleContributionDeleted = (contribution: Contribution) => {
    setContributions((prev) => prev.filter((c) => c.id !== contribution.id));
  };

  const generatePDF = () => {
    if (!project) return;
    const doc = new jsPDF();
    const projectName = project.name || "Project Report";

    const headerBg = [15, 23, 42];      
    const table1Header = [16, 185, 129]; 
    const table2Header = [59, 130, 246]; 

    doc.setFillColor(headerBg[0], headerBg[1], headerBg[2]); 
    doc.rect(0, 0, 210, 30, 'F'); 
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("EQUILY", 14, 18);
    
    doc.setTextColor(15, 23, 42); 
    doc.setFontSize(26);
    doc.text(projectName, 14, 50);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 56);

    const memberRows = members.map(m => {
        const memberContributions = contributions.filter(c => c.contributor_name === m.name);
        const memberTotal = memberContributions.reduce((sum, c) => sum + (c.risk_adjusted_value || 0), 0);
        return [m.name, m.role || "Member", memberTotal.toFixed(2)];
    });

    autoTable(doc, {
      startY: 80,
      head: [['Member', 'Role', 'Risk Value']],
      body: memberRows,
      theme: 'grid',
      headStyles: { fillColor: [table1Header[0], table1Header[1], table1Header[2]], textColor: 255 }
    });

    doc.save(`${projectName}_Report.pdf`);
  };

  useEffect(() => { fetchData(); }, [projectId]);

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

  if (loading) return <div className="p-10 text-center text-slate-500">Loading Workspace...</div>;
  if (!project) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-x-hidden">
       {/* Background */}
       <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-400/5 blur-[100px] rounded-full mix-blend-multiply"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-400/5 blur-[100px] rounded-full mix-blend-multiply"></div>
      </div>

      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/50 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <div className="flex items-center gap-4">
             <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-500" />
             </Link>
             <Link href="/"><img src="/logo.png" alt="Equily" className="h-20 w-auto object-contain" /></Link>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
             <LayoutDashboard className="h-4 w-4 text-emerald-500" />
             <span className="text-sm font-bold text-slate-700">{project.name}</span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-4xl font-black text-slate-900">{project.name}</h1>
                <p className="mt-2 text-slate-500 font-medium">Risk-adjusted equity tracking.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={generatePDF} className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-3 font-bold text-slate-700 shadow-sm hover:bg-slate-50">
                  <Download className="h-5 w-5" /> Export PDF
                </button>
                <button onClick={() => setMemberModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-3 font-bold text-slate-700 shadow-sm hover:bg-slate-50">
                  <Users className="h-5 w-5" /> Team
                </button>
                <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white shadow-lg hover:bg-slate-800">
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
        </div>
      </main>

      <AddContributionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        projectId={projectId}
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