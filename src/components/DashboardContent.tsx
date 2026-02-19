"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Folder, ArrowRight, Loader2, LogOut, User, CreditCard, Settings, Receipt, Pencil } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import { EditProjectModal } from "@/components/EditProjectModal";
import type { Project } from "@/types/database";

export function DashboardContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });
  const [portalLoadingId, setPortalLoadingId] = useState<string | null>(null);
  const [menuOpenProjectId, setMenuOpenProjectId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!menuOpenProjectId) return;
    const closeMenu = () => setMenuOpenProjectId(null);
    const onDocClick = () => {
      closeMenu();
      document.removeEventListener("click", onDocClick);
    };
    const t = setTimeout(() => document.addEventListener("click", onDocClick), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener("click", onDocClick);
    };
  }, [menuOpenProjectId]);

  const fetchProjects = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      router.push("/login");
      return;
    }
    setUserEmail(user.email || "");

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, [router]);

  useEffect(() => {
    if (!toast.show) return;
    const t = setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    return () => clearTimeout(t);
  }, [toast.show]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects([newProject, ...projects]);
    setIsModalOpen(false);
    router.push(`/dashboard/${newProject.id}`);
  };

  const openEditModal = (project: Project) => {
    setProjectToEdit(project);
    setNewName(project.name);
    setIsEditModalOpen(true);
    setMenuOpenProjectId(null);
  };

  const toggleProjectMenu = (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpenProjectId((id) => (id === projectId ? null : projectId));
  };

  const handleUpdateProject = async () => {
    if (!projectToEdit) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("projects")
        .update({ name: newName.trim() })
        .eq("id", projectToEdit.id);
      if (error) throw error;
      setIsEditModalOpen(false);
      setProjectToEdit(null);
      setToast({ show: true, message: "Project updated successfully", type: "success" });
      await fetchProjects();
    } catch (err) {
      setToast({
        show: true,
        message: err instanceof Error ? err.message : "Failed to update project",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleManageSubscription = async (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const stripeSubId = (project as Project & { stripe_subscription_id?: string | null }).stripe_subscription_id;
    if (!stripeSubId) return;
    setPortalLoadingId(project.id);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to open billing portal");
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("No portal URL received");
    } catch (err) {
      setToast({
        show: true,
        message: err instanceof Error ? err.message : "Could not open billing portal",
        type: "error",
      });
    } finally {
      setPortalLoadingId(null);
    }
  };

  const handleFinishPayment = async (project: Project) => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-slate-400 text-sm font-bold animate-pulse">Loading Projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <main className="max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-24 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 sm:mb-12">
            <div>
                <h1 className="text-3xl font-black text-slate-900 mb-1">My Projects</h1>
                <p className="text-slate-500 font-medium">Select a project to manage equity or create a new one.</p>
                {userEmail && (
                  <p className="text-xs font-bold text-slate-400 mt-1">
                    Signed in as {userEmail}
                  </p>
                )}
            </div>
            <div className="flex flex-wrap gap-3 items-center justify-end">
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" /> New Project
                </button>
                <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 px-6 py-3 rounded-xl font-bold transition-all"
                >
                    <User className="w-5 h-5" /> My Profile
                </Link>
                <button 
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 px-6 py-3 rounded-xl font-bold text-sm transition-all"
                >
                    <LogOut className="w-5 h-5" /> Sign Out
                </button>
            </div>
        </div>

        {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white border border-dashed border-slate-300 rounded-[32px] text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Folder className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No projects yet</h3>
                <p className="text-slate-400 max-w-xs mx-auto mb-8">Start by creating your first project to track equity dynamically.</p>
                <button onClick={() => setIsModalOpen(true)} className="text-emerald-600 font-bold hover:underline">
                    Create your first project
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                {projects.map((project) => {
                  const isActive = project.subscription_status === "active" || project.subscription_status === "trialing";
                  if (isActive) {
                    return (
                      <Link key={project.id} href={`/dashboard/${project.id}`} className="group relative bg-white border border-slate-200 hover:border-emerald-500/50 p-6 rounded-[24px] shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col h-48">
                        <div className="flex justify-between items-start mb-4 relative" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => toggleProjectMenu(project.id, e)}
                            className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-600 hover:ring-2 hover:ring-emerald-200 transition-colors"
                            title="Project options"
                          >
                            <Settings className="w-5 h-5" />
                          </button>
                          {menuOpenProjectId === project.id && (
                            <div className="absolute left-0 top-12 z-20 min-w-[200px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openEditModal(project);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Pencil className="w-4 h-4" /> Change project name
                              </button>
                              {(project as Project & { stripe_subscription_id?: string | null }).stripe_subscription_id && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setMenuOpenProjectId(null);
                                    handleManageSubscription(project, e);
                                  }}
                                  disabled={portalLoadingId === project.id}
                                  className="w-full px-4 py-2.5 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  {portalLoadingId === project.id ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting…</>
                                  ) : (
                                    <><Receipt className="w-4 h-4" /> Manage payments</>
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                            Active
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors truncate">
                          {project.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-bold">Created {new Date(project.created_at || new Date()).toLocaleDateString()}</p>
                        <div className="mt-auto flex items-center justify-end">
                          <span className="text-sm font-bold text-slate-300 group-hover:text-emerald-500 flex items-center gap-1 transition-colors">
                            Open Dashboard <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </Link>
                    );
                  }
                  return (
                    <div key={project.id} className="relative bg-white border border-amber-200 p-6 rounded-[24px] shadow-sm flex flex-col h-48 opacity-95">
                      <div className="flex justify-between items-start mb-4 relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => toggleProjectMenu(project.id, e)}
                          className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 hover:ring-2 hover:ring-amber-200 transition-colors"
                          title="Project options"
                        >
                          <Settings className="w-5 h-5" />
                        </button>
                        {menuOpenProjectId === project.id && (
                          <div className="absolute left-0 top-12 z-20 min-w-[200px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openEditModal(project);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Pencil className="w-4 h-4" /> Change project name
                            </button>
                          </div>
                        )}
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                          PAYMENT PENDING
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1 truncate">
                        {project.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-bold">Created {new Date(project.created_at || new Date()).toLocaleDateString()}</p>
                      <div className="mt-auto pt-8">
                        <button
                          type="button"
                          onClick={() => handleFinishPayment(project)}
                          className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white py-2.5 px-4 rounded-xl font-bold text-sm transition-colors"
                        >
                          <CreditCard className="w-4 h-4" /> Complete payment
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
        )}
      </main>

      <CreateProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setProjectToEdit(null);
        }}
        projectName={newName}
        onProjectNameChange={setNewName}
        onSave={handleUpdateProject}
        saving={saving}
      />

      {toast.show && (
        <div
          role="alert"
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] px-4 py-3 rounded-xl font-bold text-sm shadow-lg transition-opacity ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
