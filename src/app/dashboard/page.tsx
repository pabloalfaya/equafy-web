"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, TrendingUp, LayoutDashboard, LogOut, ChevronDown, PieChart, Layers } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { EquityPieChart } from "@/components/EquityPieChart";
import { ContributionsTable } from "@/components/ContributionsTable";
import { AddContributionModal } from "@/components/AddContributionModal";
import type { Project, Contribution } from "@/types/database";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
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
      setProjects([]);
      setSelectedProject(null);
      setContributions([]);
      setLoading(false);
      return;
    }

    setProjects(projectsData ?? []);

    const project = projectsData?.[0] ?? null;
    setSelectedProject(project);

    if (project) {
      const { data: contributionsData, error: contributionsError } =
        await supabase
          .from("contributions")
          .select("*")
          .eq("project_id", project.id)
          .order("created_at", { ascending: true });

      if (contributionsError) {
        setFetchError(contributionsError.message);
      }
      setContributions(contributionsData ?? []);
    } else {
      setContributions([]);
    }

    setLoading(false);
  };

  const handleContributionAdded = (newContribution: Contribution) => {
    setContributions((prev) => [...prev, newContribution]);
  };

  const handleContributionDeleted = (contribution: Contribution) => {
    setContributions((prev) =>
      prev.filter((c) => {
        if (c.id && contribution.id) return c.id !== contribution.id;
        return !(
          c.contributor_name === contribution.contributor_name &&
          c.type === contribution.type &&
          c.amount === contribution.amount
        );
      })
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedProject) return;

    const supabase = createClient();
    supabase
      .from("contributions")
      .select("*")
      .eq("project_id", selectedProject.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => setContributions(data ?? []));
  }, [selectedProject?.id]);

  const groupedContributionsForChart = contributions.reduce((acc, curr) => {
    const existingIndex = acc.findIndex(
      (c) => c.contributor_name === curr.contributor_name
    );

    if (existingIndex >= 0) {
      const existing = acc[existingIndex];
      const updatedContribution = {
        ...existing,
        amount: existing.amount + curr.amount,
        risk_adjusted_value:
          (existing.risk_adjusted_value || 0) + (curr.risk_adjusted_value || 0),
      };
      const newAcc = [...acc];
      newAcc[existingIndex] = updatedContribution;
      return newAcc;
    } else {
      return [...acc, { ...curr }];
    }
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      
      {/* --- BACKGROUND AMBIENTAL --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-400/5 blur-[100px] rounded-full mix-blend-multiply"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-400/5 blur-[100px] rounded-full mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* --- NAVBAR DASHBOARD --- */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/50 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <div className="flex items-center gap-8">
            <Link href="/" className="relative group">
               <img src="/logo.png" alt="Equily Logo" className="h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
            </Link>
            
            {/* Project Selector (Styled) */}
            {projects.length > 0 && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100/50 border border-slate-200 rounded-lg">
                <LayoutDashboard className="h-4 w-4 text-slate-400" />
                <select
                  value={selectedProject?.id ?? ""}
                  onChange={(e) => {
                    const p = projects.find((x) => x.id === e.target.value);
                    setSelectedProject(p ?? null);
                  }}
                  className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-3 w-3 text-slate-400 pointer-events-none" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
             <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                JD
             </div>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="mx-auto max-w-7xl">
          
          {!selectedProject ? (
            <div className="flex flex-col items-center justify-center rounded-[32px] border border-slate-200 bg-white/60 backdrop-blur-sm p-20 text-center shadow-xl">
              <div className="bg-slate-50 p-6 rounded-full mb-6">
                <Layers className="h-12 w-12 text-slate-300" />
              </div>
              {fetchError ? (
                <>
                  <p className="mb-2 font-bold text-red-500">Error loading projects</p>
                  <p className="mb-4 text-sm text-slate-500">{fetchError}</p>
                </>
              ) : (
                <>
                   <h2 className="text-2xl font-black text-slate-900 mb-2">No projects found</h2>
                   <p className="text-slate-500 font-medium mb-8">Create your first project in Supabase to start tracking equity.</p>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Header de Proyecto */}
              <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 mb-4">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Live Tracking</span>
                  </div>
                  <h1 className="text-4xl font-black tracking-tight text-slate-900">
                    {selectedProject.name}
                  </h1>
                  <p className="mt-2 text-slate-500 font-medium">
                    Managing equity distribution based on risk-adjusted contributions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white shadow-lg shadow-slate-200 transition hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Plus className="h-5 w-5" />
                  Add Contribution
                </button>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                
                {/* COLUMNA IZQUIERDA: GRÁFICO (1/3 ancho en desktop) */}
                <div className="lg:col-span-1">
                   <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-xl shadow-slate-200/50 h-full">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <PieChart className="h-5 w-5 text-emerald-600" />
                            </div>
                            <h3 className="font-bold text-slate-900">Distribution</h3>
                        </div>
                        {contributions.length > 0 && (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                            {contributions.length} entries
                          </span>
                        )}
                      </div>
                      
                      {/* Contenedor del gráfico */}
                      <div className="flex items-center justify-center min-h-[300px]">
                         <EquityPieChart contributions={groupedContributionsForChart} />
                      </div>
                   </div>
                </div>

                {/* COLUMNA DERECHA: TABLA (2/3 ancho en desktop) */}
                <div className="lg:col-span-2">
                   <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-xl shadow-slate-200/50 h-full overflow-hidden">
                      <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-slate-900">Contribution Log</h3>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <ContributionsTable
                            contributions={contributions}
                            onDelete={handleContributionDeleted}
                        />
                      </div>
                   </div>
                </div>

              </div>
            </>
          )}
        </div>
      </main>

      {/* Modal mantiene su lógica interna, solo se invoca */}
      <AddContributionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        projectId={selectedProject?.id ?? null}
        onSuccess={handleContributionAdded}
      />
    </div>
  );
}