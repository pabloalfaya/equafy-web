"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Folder, ArrowRight, Loader2, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import type { Project } from "@/types/database";

export default function ProjectSelectorPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // 1. Verificar Usuario
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push("/login");
        return;
      }
      setUserEmail(user.email || "");

      // 2. Obtener Proyectos
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
      
      {/* Navbar Simple */}
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
            <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-0.5"
            >
                <Plus className="w-5 h-5" /> New Project
            </button>
        </div>

        {projects.length === 0 ? (
            // ESTADO VACÍO
            <div className="flex flex-col items-center justify-center py-24 bg-white border border-dashed border-slate-300 rounded-[32px] text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Folder className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No projects yet</h3>
                <p className="text-slate-400 max-w-xs mx-auto mb-8">Start by creating your first project to track equity dynamically.</p>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="text-emerald-600 font-bold hover:underline"
                >
                    Create your first project
                </button>
            </div>
        ) : (
            // LISTA DE PROYECTOS (GRID)
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <Link key={project.id} href={`/dashboard/${project.id}`} className="group relative bg-white border border-slate-200 hover:border-emerald-500/50 p-6 rounded-[24px] shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col h-48">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                                <Folder className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                            </div>
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                Active
                            </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors truncate">
                            {project.name}
                        </h3>
                        {/* AQUÍ ESTÁ EL CAMBIO IMPORTANTE: || new Date() */}
                        <p className="text-xs text-slate-400 font-bold">Created {new Date(project.created_at || new Date()).toLocaleDateString()}</p>
                        
                        <div className="mt-auto flex items-center justify-end">
                            <span className="text-sm font-bold text-slate-300 group-hover:text-emerald-500 flex items-center gap-1 transition-colors">
                                Open Dashboard <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        )}
      </main>

      {/* MODAL PARA CREAR PROYECTO */}
      <CreateProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}