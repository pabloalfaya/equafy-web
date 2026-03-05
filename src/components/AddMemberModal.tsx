"use client";

import { useState, useMemo, useEffect } from "react";
import { X, Trash2, UserPlus, Mail, Shield, User, Pencil, Ban, Users, Infinity } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { logAudit } from "@/utils/auditLog";
import { computeMemberEquitySummary } from "@/utils/equityCalculation";

export type TeamSettingsTab = "members" | "add" | "edit";
type TabType = TeamSettingsTab;

interface Member {
  id: string;
  name: string;
  email?: string | null;
  role?: string;
  access_level?: "editor" | "viewer";
  fixed_equity?: number | null;
  equity_cap?: number | null;
  hourly_rate?: number | null;
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  members: Member[];
  contributions?: Array<{ contributor_name?: string | null; risk_adjusted_value?: number | null }>;
  onUpdate: () => void;
  canEdit?: boolean;
  mode?: "modal" | "page";
  externalActiveTab?: TeamSettingsTab;
}

const MEMBER_COLORS = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-red-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-indigo-500",
];

export function AddMemberModal({
  isOpen,
  onClose,
  projectId,
  members,
  contributions = [],
  onUpdate,
  canEdit = true,
  mode = "modal",
  externalActiveTab,
}: AddMemberModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("add");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [accessLevel, setAccessLevel] = useState<"editor" | "viewer">("editor");
  const [hourlyRate, setHourlyRate] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const supabase = createClient();

  const memberSummary = useMemo(
    () => computeMemberEquitySummary(members, contributions),
    [members, contributions]
  );

  const summaryByMemberId = useMemo(() => {
    const map: Record<string, { totalPoints: number; equityPct: number }> = {};
    memberSummary.forEach((s) => {
      map[s.memberId] = { totalPoints: s.totalPoints, equityPct: s.equityPct };
    });
    return map;
  }, [memberSummary]);

  // Permitir que una página externa controle la pestaña activa
  useEffect(() => {
    if (mode === "page" && externalActiveTab) {
      setActiveTab(externalActiveTab);
    }
  }, [mode, externalActiveTab]);

  if (!isOpen && mode === "modal") return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !canEdit) return;
    setLoading(true);
    try {
      const hourlyRateVal = hourlyRate.trim() === "" ? null : parseFloat(hourlyRate) || null;
      const payload = {
        name: name.trim(),
        email: email.trim() === "" ? null : email.trim(),
        role: role.trim() || "Member",
        access_level: accessLevel,
        hourly_rate: hourlyRateVal,
      };
      const payloadWithoutHourlyRate = {
        name: payload.name,
        email: payload.email,
        role: payload.role,
        access_level: payload.access_level,
      };
      const oldName = editingId ? members.find((m) => m.id === editingId)?.name : null;
      let error;
      let hourlyRateSkipped = false;
      if (editingId) {
        const { error: updateError } = await supabase
          .from("project_members")
          .update(payload)
          .eq("id", editingId);
        error = updateError;
        if (error && /hourly_rate|schema cache|column/i.test(error.message)) {
          const { error: retryError } = await supabase
            .from("project_members")
            .update(payloadWithoutHourlyRate)
            .eq("id", editingId);
          if (!retryError) {
            error = null;
            if (hourlyRateVal != null) hourlyRateSkipped = true;
          } else {
            error = retryError;
          }
        }
        if (!error && oldName && oldName.trim() !== payload.name) {
          const { error: contribError } = await supabase
            .from("contributions")
            .update({ contributor_name: payload.name })
            .eq("project_id", projectId)
            .eq("contributor_name", oldName.trim());
          if (contribError) {
            console.error("Error updating contributions after member rename:", contribError);
          }
        }
      } else {
        const { error: insertError } = await supabase
            .from("project_members")
            .insert({ ...payload, project_id: projectId, status: "active" });
        error = insertError;
        if (error && /hourly_rate|schema cache|column/i.test(error.message)) {
          const { error: retryError } = await supabase
            .from("project_members")
            .insert({ ...payloadWithoutHourlyRate, project_id: projectId, status: "active" });
          if (!retryError) {
            error = null;
            if (hourlyRateVal != null) hourlyRateSkipped = true;
          } else {
            error = retryError;
          }
        }
      }
      if (error) {
        console.error("Error saving member:", error);
        alert(`Error: ${error.message}`);
        return;
      }
      try {
        const actionType = editingId ? "EDIT_MEMBER" : "ADD_MEMBER";
        const desc = editingId ? `Updated member: ${payload.name}` : `Added member: ${payload.name}`;
        await logAudit({ supabase, projectId, actionType, description: desc });
      } catch (auditErr) {
        console.error("Error saving audit log (member still saved):", auditErr);
      }
      resetForm();
      onUpdate();
      if (hourlyRateSkipped) {
        alert("Member saved. The Hourly Rate could not be saved because the database does not have the hourly_rate column yet. Run the migration in Supabase (SQL Editor): see supabase/migrations/20250219200000_add_hourly_rate_to_project_members.sql");
      }
    } catch (error) {
      console.error("Error saving member:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setRole("");
    setAccessLevel("editor");
    setHourlyRate("");
    setEditingId(null);
  };

  const startEdit = (member: Member) => {
    setName(member.name);
    setEmail(member.email || "");
    setRole(member.role || "");
    setAccessLevel((member.access_level as "editor" | "viewer") || "editor");
    setHourlyRate(member.hourly_rate != null ? String(member.hourly_rate) : "");
    setEditingId(member.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this member? This might affect existing contributions.")) return;
    const member = members.find((m) => m.id === id);
    const { error } = await supabase.from("project_members").delete().eq("id", id);
    if (!error) {
      try {
        await logAudit({
          supabase,
          projectId,
          actionType: "REMOVE_MEMBER",
          description: `Removed member: ${member?.name ?? id}`,
        });
      } catch (auditErr) {
        console.error("Error saving audit log:", auditErr);
      }
      if (editingId === id) resetForm();
      onUpdate();
    }
  };

  const panel = (
      <div className="w-full max-w-2xl h-[min(620px,90vh)] min-h-[560px] bg-white rounded-[32px] shadow-2xl p-8 font-sans flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">
              Manage Team
            </h3>
          </div>
          <button
            onClick={() => { resetForm(); onClose(); }}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs: 1. Add Member 2. Members 3. Edit Team */}
        <div className="flex gap-2 mb-6 p-1 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("add")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
              activeTab === "add" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Add Member
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("members")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
              activeTab === "members" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Members
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
              activeTab === "edit" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Edit Team
          </button>
        </div>

        {/* Tab: Members — summary table */}
        {activeTab === "members" && (
          <div className="flex-1 min-h-[360px] overflow-auto">
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-bold text-slate-600 uppercase tracking-wider">Member</th>
                      <th className="text-right py-3 px-4 font-bold text-slate-600 uppercase tracking-wider">Fixed</th>
                      <th className="text-right py-3 px-4 font-bold text-slate-600 uppercase tracking-wider">Limit (Cap)</th>
                      <th className="text-right py-3 px-4 font-bold text-slate-600 uppercase tracking-wider">Value</th>
                      <th className="text-right py-3 px-4 font-bold text-emerald-700 uppercase tracking-wider">Total Equity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {members.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                          No members yet.
                        </td>
                      </tr>
                    ) : (
                      members.map((m, index) => {
                        const summary = summaryByMemberId[m.id];
                        const fixedPct = Number(m.fixed_equity) || 0;
                        const cap = m.equity_cap != null && m.equity_cap !== undefined ? Number(m.equity_cap) : null;
                        const totalPoints = summary?.totalPoints ?? 0;
                        const equityPct = summary?.equityPct ?? 0;
                        return (
                          <tr
                            key={m.id}
                            className="bg-white hover:bg-slate-50/80 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold ${MEMBER_COLORS[index % MEMBER_COLORS.length]}`}
                                >
                                  {(m.name || "?").charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-800 truncate">{m.name}</div>
                                  <div className="text-xs text-slate-500 truncate">{m.role || "—"}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right text-slate-600">
                              {fixedPct > 0 ? `${fixedPct.toFixed(2)}%` : "—"}
                            </td>
                            <td className="py-3 px-4 text-right text-slate-600">
                              {cap != null ? (
                                `${Number(cap).toFixed(2)}%`
                              ) : (
                                <span className="inline-flex items-center gap-1 text-slate-400" title="No cap">
                                  <Infinity className="w-4 h-4" /> No Cap
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-slate-700">
                              {totalPoints.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pts
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="font-black text-emerald-600">
                                {equityPct.toFixed(2)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Add Member — form */}
        {activeTab === "add" && (
          <form onSubmit={handleSubmit} className="space-y-4 flex-1 min-h-[360px] overflow-auto">
            <div>
              <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block uppercase">Name *</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-300" />
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!canEdit}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block uppercase">Email (Optional)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-300" />
                <input
                  type="email"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!canEdit}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1 ml-1">If added, they will see this project in their dashboard.</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block uppercase">Job Title</label>
              <div className="relative">
                <Shield className="absolute left-4 top-3.5 w-4 h-4 text-slate-300" />
                <input
                  type="text"
                  placeholder="e.g. Co-Founder & CTO"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={!canEdit}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block uppercase">Hourly Rate (FMV) — Optional</label>
              <input
                type="number"
                min={0}
                step={0.01}
                placeholder="e.g. 50"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                disabled={!canEdit}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1 ml-1">Used for WORK contributions when calculating by hours.</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block uppercase">Permissions</label>
              <select
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value as "editor" | "viewer")}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
              >
                <option value="editor">Can Edit</option>
                <option value="viewer">View Only</option>
              </select>
            </div>
            <div className="flex gap-2">
              {editingId && canEdit && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-xl transition-all"
                  title="Cancel Edit"
                >
                  <Ban className="w-5 h-5" />
                </button>
              )}
              {canEdit && (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingId ? "Update Member" : "Add Member"}
                </button>
              )}
            </div>
          </form>
        )}

        {/* Tab: Edit Team — list with edit/delete */}
        {activeTab === "edit" && (
          <div className="flex-1 min-h-[360px] flex flex-col overflow-hidden">
            <label className="text-xs font-bold text-slate-400 ml-1 block uppercase mb-2 shrink-0">
              Current Team ({members.length})
            </label>
            <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {members.length === 0 ? (
                <p className="text-center text-slate-400 text-sm italic py-4">No members yet.</p>
              ) : (
                members.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-center justify-between p-3 border rounded-xl transition-all ${
                      editingId === m.id ? "bg-emerald-50 border-emerald-200 ring-1 ring-emerald-200" : "bg-slate-50 border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex flex-col overflow-hidden mr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 text-sm truncate">{m.name}</span>
                        {m.role === "owner" ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">Owner</span>
                        ) : (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              m.access_level === "viewer" ? "bg-slate-200 text-slate-600" : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {m.access_level === "viewer" ? "Viewer" : "Editor"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                        {m.role && m.role !== "owner" && <span className="uppercase font-bold text-emerald-600">{m.role}</span>}
                        {m.role && m.role !== "owner" && m.email && <span>|</span>}
                        {m.email && <span>{m.email}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {canEdit && (
                        <>
                          <button
                            type="button"
                            onClick={() => { startEdit(m); setActiveTab("add"); }}
                            className="p-2 text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                            title="Edit member"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {m.role !== "owner" && (
                            <button
                              type="button"
                              onClick={() => handleDelete(m.id)}
                              className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Remove member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
  );

  if (mode === "page") {
    return (
      <div className="w-full py-4">
        {panel}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl h-[min(620px,90vh)] min-h-[560px] bg-white rounded-[32px] shadow-2xl p-8 animate-in zoom-in duration-200 font-sans flex flex-col overflow-hidden">
        {panel}
      </div>
    </div>
  );
}
