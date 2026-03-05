"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Settings as SettingsIcon, Users, ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { Project } from "@/types/database";
import { EquitySettingsModal } from "@/components/EquitySettingsModal";
import { AddMemberModal } from "@/components/AddMemberModal";

type Member = {
  id: string;
  name: string;
  email?: string | null;
  role?: string | null;
  access_level?: "editor" | "viewer";
  fixed_equity?: number | null;
  equity_cap?: number | null;
  hourly_rate?: number | null;
  user_id?: string | null;
};

export default function ProjectSettingsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState<"equity" | "team">("equity");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      if (!projectId) return;
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);
      setCurrentUserEmail(user?.email ?? null);

      const { data: projectData } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();
      setProject(projectData as Project | null);

      const { data: membersData } = await supabase
        .from("project_members")
        .select("id, name, email, role, access_level, fixed_equity, equity_cap, hourly_rate, user_id")
        .eq("project_id", projectId);
      setMembers((membersData as Member[]) ?? []);

      setLoading(false);
    };

    void load();
  }, [projectId]);

  const currentMember = members.find(
    (m) =>
      m.user_id === currentUserId ||
      (currentUserEmail && m.email?.toLowerCase() === currentUserEmail.toLowerCase())
  );
  const isOwner = project?.owner_id === currentUserId || currentMember?.role === "owner";
  const canEdit = isOwner || currentMember?.access_level === "editor";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-slate-400 font-bold">Loading settings...</p>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <main className="max-w-6xl mx-auto px-4 md:px-10 lg:px-16 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(`/dashboard/${projectId}`)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Project settings
              </p>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900">
                {project.name}
              </h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[220px,1fr] gap-6 md:gap-10">
          <aside className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 h-fit">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">
              Settings
            </p>
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => setActivePanel("equity")}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-left transition-colors ${
                  activePanel === "equity"
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <SettingsIcon className="w-4 h-4" />
                <span>Equity settings</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePanel("team")}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-left transition-colors ${
                  activePanel === "team"
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Team settings</span>
              </button>
            </nav>
          </aside>

          <section className="space-y-4">
            {activePanel === "equity" && (
              <div className="bg-transparent">
                <EquitySettingsModal
                  isOpen={true}
                  onClose={() => router.push(`/dashboard/${projectId}`)}
                  projectId={projectId}
                  project={project}
                  members={members}
                  onSuccess={() => {
                    // Reload project & members so dashboard stays in sync
                    router.refresh();
                  }}
                  onOpenDefaultModels={() => {}}
                  canEdit={canEdit}
                  mode="page"
                />
              </div>
            )}

            {activePanel === "team" && (
              <div className="bg-transparent">
                <AddMemberModal
                  isOpen={true}
                  onClose={() => router.push(`/dashboard/${projectId}`)}
                  projectId={projectId}
                  members={members}
                  contributions={[]}
                  onUpdate={() => {
                    router.refresh();
                  }}
                  canEdit={canEdit}
                  mode="page"
                />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

