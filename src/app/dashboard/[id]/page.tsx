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

type ExtendedProject = Project & { equity_model?: string };
type ExtendedContribution = Contribution & { date?: string; concept?: string; multiplier?: number; [key: string]: any };
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
  const [editingContribution, setEditingContribution] = useState<ExtendedContribution | null>(null);

  const fetchData = async () => {
    if (!projectId) return;
    const supabase = createClient();
    setLoading(true);

    const { data: projectData, error: projectError } = await supabase
      .from("projects").select("*").eq("id", projectId).single();

    if (projectError || !projectData) {
      router.push("/dashboard"); 
      return;
    }
    setProject(projectData as ExtendedProject);

    const { data: contributionsData } = await supabase
      .from("contributions").select("*").eq("project_id", projectId).order("created_at", { ascending: true });
    
    setContributions(contributionsData as ExtendedContribution[] ?? []);

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

  const handleContributionSuccess = (updatedOrNew: Contribution) => {
    setContributions((prev) => {
      const exists = prev.find((c) => c.id === updatedOrNew.id);
      if (exists) {
        return prev.map((c) => (c.id === updatedOrNew.id ? (updatedOrNew as ExtendedContribution) : c));
      }
      return [...prev, updatedOrNew as ExtendedContribution];
    });
    setEditingContribution(null);
  };

  const handleContributionDeleted = (contribution: Contribution) => {
    setContributions((prev) => prev.filter((c) => c.id !== contribution.id));
  };

  const handleEditContribution = (contribution: ExtendedContribution) => {
    setEditingContribution(contribution);
    setModalOpen(true);
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
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/50 bg-white/60 backdrop-blur-xl">
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
                <p className="mt-2 text-slate-500 font-medium italic">Calculated using the {project.equity_model?.replace('_', ' ')} model.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setMemberModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-3 font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all shadow-sm"><Users className="h-5 w-5" /> Team</button>
                <button onClick={() => { setEditingContribution(null); setModalOpen(true); }} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white shadow-lg hover:bg-slate-800 transition-all"><Plus className="h-5 w-5" /> Add Contribution</button>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-xl flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 rounded-lg"><TrendingUp className="h-5 w-5 text-blue-600" /></div>
                        <h3 className="font-bold text-slate-900 text-xl">Contribution Log</h3>
                    </div>
                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        <ContributionsTable 
                          contributions={contributions} 
                          onDelete={handleContributionDeleted}
                          onEdit={handleEditContribution} 
                        />
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