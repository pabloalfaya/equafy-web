"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Folder, ArrowRight, Loader2, LogOut, User, CreditCard } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import type { Project } from "@/types/database";

export function DashboardContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
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

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects([newProject, ...projects]);
    setIsModalOpen(false);
    router.push(`/dashboard/${newProject.id}`);
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
      alert(err instanceof Error ? err.message : "Could not open payment");
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
      <nav className="border-b border-slate-200 bg-white px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <Link href="/">
            <img src="/logo.png" alt="Equily" className="h-20 w-auto opacity-80 hover:opacity-100 transition-opacity object-contain" />
        </Link>
        <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-400 hidden sm:block">{userEmail}</span>
            <button onClick={handleLogout} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors" title="Log out">
                <LogOut className="w-5 h-5" />
            </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">My Projects</h1>
                <p className="text-slate-500 font-medium">Select a project to manage equity or create a new one.</p>
            </div>
            <div className="flex flex-col gap-3 items-end">
                <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 px-6 py-3 rounded-xl font-bold transition-all"
                >
                    <User className="w-5 h-5" /> My Profile
                </Link>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" /> New Project
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => {
                  const isActive = project.subscription_status === "active";
                  if (isActive) {
                    return (
                      <Link key={project.id} href={`/dashboard/${project.id}`} className="group relative bg-white border border-slate-200 hover:border-emerald-500/50 p-6 rounded-[24px] shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col h-48">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                            <Folder className="w-5 h-5 text-slate-400 group-hover:text-emerald-50 transition-colors" />
                          </div>
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
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                          <Folder className="w-5 h-5 text-amber-500" />
                        </div>
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                          Pago pendiente
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1 truncate">
                        {project.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-bold">Created {new Date(project.created_at || new Date()).toLocaleDateString()}</p>
                      <div className="mt-auto">
                        <button
                          type="button"
                          onClick={() => handleFinishPayment(project)}
                          className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white py-2.5 px-4 rounded-xl font-bold text-sm transition-colors"
                        >
                          <CreditCard className="w-4 h-4" /> Finalizar pago
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
    </div>
  );
}
