"use client";

import { useState, useEffect } from "react";
import { X, Percent, Save, Settings2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

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

const MEMBER_BORDER_COLORS = [
  "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
  "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
  "focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20",
  "focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20",
  "focus:border-red-500 focus:ring-2 focus:ring-red-500/20",
  "focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20",
  "focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20",
  "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
];

const DEFAULT_MULTIPLIERS = {
  mult_cash: 4,
  mult_work: 2,
  mult_tangible: 1,
  mult_intangible: 1,
  mult_others: 1,
};

interface Member {
  id: string;
  name: string;
  email?: string | null;
  role?: string;
  fixed_equity?: number | null;
}

interface EquitySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  project?: any;
  members: Member[];
  onSuccess?: () => void;
}

function formatWithComma(num: number): string {
  return num.toFixed(2).replace(".", ",");
}

function parseWithComma(str: string): number {
  const normalized = str.replace(",", ".");
  return parseFloat(normalized) || 0;
}

type TabType = "fixed" | "multipliers";

export function EquitySettingsModal({
  isOpen,
  onClose,
  projectId,
  project,
  members,
  onSuccess,
}: EquitySettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("fixed");
  const [values, setValues] = useState<Record<string, number>>({});
  const [multipliers, setMultipliers] = useState({
    mult_cash: 4,
    mult_work: 2,
    mult_tangible: 1,
    mult_intangible: 1,
    mult_others: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const localMembers = members;

  useEffect(() => {
    if (isOpen && members.length > 0) {
      const initial: Record<string, number> = {};
      members.forEach((m) => {
        initial[m.id] = m.fixed_equity ?? 0;
      });
      setValues(initial);
      setError(null);
    }
  }, [isOpen, members]);

  useEffect(() => {
    if (isOpen && project) {
      setMultipliers({
        mult_cash: Number(project.mult_cash) || DEFAULT_MULTIPLIERS.mult_cash,
        mult_work: Number(project.mult_work) || DEFAULT_MULTIPLIERS.mult_work,
        mult_tangible: Number(project.mult_tangible) || DEFAULT_MULTIPLIERS.mult_tangible,
        mult_intangible: Number(project.mult_intangible) || DEFAULT_MULTIPLIERS.mult_intangible,
        mult_others: Number(project.mult_others) || DEFAULT_MULTIPLIERS.mult_others,
      });
    }
  }, [isOpen, project]);

  const totalFixed = Object.values(values).reduce((sum, v) => sum + (Number.isNaN(v) ? 0 : v), 0);
  const totalDynamic = Math.max(0, 100 - totalFixed);
  const isValid = totalFixed <= 100;

  const handleMemberChange = (memberId: string, val: string) => {
    const num = parseWithComma(val);
    const rounded = parseFloat(num.toFixed(2));
    setValues((prev) => ({ ...prev, [memberId]: rounded }));
  };

  const handleSaveFixed = async () => {
    if (!isValid) {
      setError("The sum of fixed equity cannot exceed 100%.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const supabase = createClient();

    try {
      const updates = members.map((m) =>
        supabase
          .from("project_members")
          .update({ fixed_equity: values[m.id] ?? 0 })
          .eq("id", m.id)
      );

      const results = await Promise.all(updates);
      const hasError = results.some((r) => r.error);

      if (hasError) {
        const err = results.find((r) => r.error)?.error;
        setError(err?.message ?? "Error saving changes.");
      } else {
        setSuccessMessage("Fixed equity saved successfully!");
        onSuccess?.();
        setTimeout(() => setSuccessMessage(null), 2500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving changes.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMultipliers = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const supabase = createClient();

    try {
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          mult_cash: multipliers.mult_cash,
          mult_work: multipliers.mult_work,
          mult_tangible: multipliers.mult_tangible,
          mult_intangible: multipliers.mult_intangible,
          mult_others: multipliers.mult_others,
        })
        .eq("id", projectId);

      if (updateError) {
        setError(updateError.message ?? "Error saving multipliers.");
      } else {
        setSuccessMessage("Multipliers saved successfully!");
        onSuccess?.();
        setTimeout(() => setSuccessMessage(null), 2500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving multipliers.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 animate-in zoom-in duration-200 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">
              Equity Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("fixed")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
              activeTab === "fixed"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Fixed Equity
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("multipliers")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
              activeTab === "multipliers"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Multipliers
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "fixed" && (
          <>
            {/* Segmented Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase">
                <span>Fixed</span>
                <span>Dynamic (Slicing Pie)</span>
              </div>
              <div className="h-4 rounded-full overflow-hidden bg-slate-100 flex">
                {localMembers
                  .filter((m) => (values[m.id] ?? 0) > 0)
                  .map((m) => {
                    const memberIndex = localMembers.findIndex((mx) => mx.id === m.id);
                    const width = values[m.id] ?? 0;
                    return (
                      <div
                        key={m.id}
                        className={`h-full transition-all duration-300 ${MEMBER_COLORS[memberIndex % MEMBER_COLORS.length]}`}
                        style={{ width: `${width}%` }}
                      />
                    );
                  })}
                <div
                  className="h-full bg-slate-300 transition-all duration-300"
                  style={{ width: `${totalDynamic}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-sm font-bold">
                <span className="text-emerald-600">{formatWithComma(totalFixed)}%</span>
                <span className="text-slate-500">{formatWithComma(totalDynamic)}%</span>
              </div>
              {!isValid && (
                <p className="mt-2 text-xs font-bold text-red-600">
                  Sum of fixed equity cannot exceed 100%
                </p>
              )}
            </div>

            {/* Member list */}
            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {localMembers.length === 0 ? (
                <p className="text-center text-slate-400 text-sm italic py-4">
                  No members yet.
                </p>
              ) : (
                localMembers.map((m, index) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all"
                  >
                    <div className="flex items-center gap-3 overflow-hidden mr-3">
                      <div
                        className={`h-3 w-3 rounded-full shrink-0 ${MEMBER_COLORS[index % MEMBER_COLORS.length]}`}
                      />
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-bold text-slate-800 text-sm truncate">
                          {m.name}
                        </span>
                        {m.role && (
                          <span className="text-[11px] font-medium text-slate-500 mt-0.5 uppercase">
                            {m.role}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={formatWithComma(Number.isNaN(values[m.id]) ? 0 : (values[m.id] ?? 0))}
                        onChange={(e) => handleMemberChange(m.id, e.target.value)}
                        className={`w-20 px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-800 text-sm text-right outline-none focus:ring-2 transition-all ${MEMBER_BORDER_COLORS[index % MEMBER_BORDER_COLORS.length]}`}
                      />
                      <span className="text-slate-400 font-bold text-sm">%</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveFixed}
                disabled={loading || !isValid}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </>
        )}

        {activeTab === "multipliers" && (
          <>
            <div className="space-y-4 mb-6">
              {(
                [
                  { key: "mult_cash", label: "Cash" },
                  { key: "mult_work", label: "Work" },
                  { key: "mult_tangible", label: "Tangible" },
                  { key: "mult_intangible", label: "Intangible" },
                  { key: "mult_others", label: "Others" },
                ] as const
              ).map(({ key, label }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase">
                    {label}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={multipliers[key]}
                    onChange={(e) =>
                      setMultipliers((prev) => ({
                        ...prev,
                        [key]: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMultipliers}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Save Multipliers"}
              </button>
            </div>
          </>
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        {successMessage && (
          <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            {successMessage}
          </p>
        )}
      </div>
    </div>
  );
}
