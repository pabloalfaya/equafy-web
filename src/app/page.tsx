"use client";

import { useEffect, useState } from "react";
import { Plus, TrendingUp } from "lucide-react";
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-2 border-emerald-fintech border-t-transparent" />
          <p className="text-slate-600">Cargando Equily…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200/80 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-fintech text-white">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              Equily
            </h1>
          </div>
          {projects.length > 1 && (
            <select
              value={selectedProject?.id ?? ""}
              onChange={(e) => {
                const p = projects.find((x) => x.id === e.target.value);
                setSelectedProject(p ?? null);
              }}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition focus:border-emerald-fintech focus:outline-none focus:ring-2 focus:ring-emerald-fintech/20"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {!selectedProject ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
            {fetchError ? (
              <>
                <p className="mb-2 font-medium text-red-600">
                  Error al cargar proyectos
                </p>
                <p className="mb-4 text-sm text-slate-600">{fetchError}</p>
                <p className="text-xs text-slate-500">
                  Si usas RLS en Supabase, añade una política que permita SELECT
                  en la tabla &quot;projects&quot;.
                </p>
              </>
            ) : (
              <p className="text-slate-600">
                No hay proyectos. Crea uno en Supabase para empezar.
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {selectedProject.name}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Distribución de equity por aportaciones
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-fintech px-5 py-3 font-medium text-white shadow-md transition hover:bg-emerald-fintech-dark hover:shadow-lg"
              >
                <Plus className="h-5 w-5" />
                Añadir Aportación
              </button>
            </div>

            <div className="mb-10">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">
                  Distribución del Equity
                </h3>
                {contributions.length > 0 && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-fintech">
                    {contributions.length} aportación
                    {contributions.length !== 1 ? "es" : ""}
                  </span>
                )}
              </div>
              <EquityPieChart contributions={contributions} />
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-slate-800">
                Resumen de Aportaciones
              </h3>
              <ContributionsTable
                contributions={contributions}
                onDelete={handleContributionDeleted}
              />
            </div>
          </>
        )}
      </main>

      <AddContributionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        projectId={selectedProject?.id ?? null}
        onSuccess={handleContributionAdded}
      />
    </div>
  );
}
