"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, TrendingUp, LayoutDashboard, PieChart, Users, Layers } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { EquityPieChart } from "@/components/EquityPieChart";
import { ContributionsTable } from "@/components/ContributionsTable";
import { AddContributionModal } from "@/components/AddContributionModal";
import { AddMemberModal } from "@/components/AddMemberModal";
import type { Project, Contribution } from "@/types/database";

type Member = { id: string; name: string };

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [members, setMembers] = useState<Member[]>([]); 
  const [loading, setLoading] = useState(true);
  
  // Modales
  const [modalOpen, setModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchData = async () => {
    const supabase = createClient();
    setFetchError(null);

    // 1. Cargar Proyectos
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
      // 2. Cargar Aportaciones
      const { data: contributionsData } = await supabase
        .from("contributions")
        .select("*")
        .eq("project_id", project.id)
        .order("created_at", { ascending: true });
      
      setContributions(contributionsData ?? []);

      // 3. Cargar Miembros del Equipo
      const { data: membersData } = await supabase
        .from("project_members")
        .select("id, name")
        .eq("project_id", project.id)
        .order("created_at", { ascending: true });

      setMembers(membersData ?? []);
    }

    setLoading(false);
  };

  const refreshMembers = async () => {
    if (!selectedProject) return;
    const supabase = createClient();
    const { data } = await supabase.from("project_members").select("id, name").eq("project_id", selectedProject.id);
    setMembers(data ?? []);
  };

  const handleContributionAdded = (newContribution: Contribution) => {
    setContributions((prev) => [...prev, newContribution]);
  };

  const handleContributionDeleted = (contribution: Contribution) => {
    setContributions((prev) => prev.filter((c) => c.id !== contribution.id));
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    const supabase = createClient();
    supabase.from("contributions").select("*").eq("project_id", selectedProject.id).then(({ data }) => setContributions(data ?? []));
    supabase.from("project_members").select("id, name").eq("project_id", selectedProject.id).then(({ data }) => setMembers(data ?? []));
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
       {/* --- BACKGROUND AMBIENTAL --- */}
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
             <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">JD</div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="mx-auto max-w-7xl">
          {!selectedProject ? (
            <div className="text-center p-20 bg-white rounded-[32px] shadow-xl">
               <Layers className="h-12 w-12 text-slate-300 mx-auto mb-4" />
               <h2 className="text-2xl font-bold">No projects found</h2>
               <p className="text-slate-500">Create a project in Supabase to start.</p>
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
                  <button onClick={() => setMemberModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-3 font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all hover:-translate-y-0.5">
                    <Users className="h-5 w-5" /> Team
                  </button>
                  <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white shadow-lg hover:bg-slate-800 transition-all hover:-translate-y-0.5">
                    <Plus className="h-5 w-5" /> Add Contribution
                  </button>
                </div>
              </div>

              {/* AQUÍ ESTÁ EL CAMBIO: max-h-[500px] overflow-y-auto */}
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
                  <div className="w-full h-[500px]"><EquityPieChart contributions={groupedContributionsForChart} /></div>
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