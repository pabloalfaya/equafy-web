"use client";

import { useMemo, useState } from "react";
import { X, ArrowRight, ArrowLeft, Users, Percent, DollarSign } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { logAudit } from "@/utils/auditLog";
import { recalculateAndPersistProjectValuation } from "@/utils/projectRecalculator";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";
import type { Project } from "@/types/database";

type Step = "fork" | "value" | "distribution";
type Choice = "scratch" | "legacy" | null;
type AllocationMode = "percent" | "amount";

interface MemberInput {
  id: string;
  name: string;
  role: string;
  email: string;
  mode: AllocationMode;
  percent: number;
  amount: number;
}

interface LegacyOnboardingWizardProps {
  open: boolean;
  projectId: string;
  project: Project | null;
  onCompleted: () => void;
}

export function LegacyOnboardingWizard({
  open,
  projectId,
  project,
  onCompleted,
}: LegacyOnboardingWizardProps) {
  const [step, setStep] = useState<Step>("fork");
  const [choice, setChoice] = useState<Choice>(null);
  const [totalEstimatedValue, setTotalEstimatedValue] = useState<string>("");
  const [members, setMembers] = useState<MemberInput[]>([
    {
      id: "m-1",
      name: "",
      role: "",
      email: "",
      mode: "percent",
      percent: 0,
      amount: 0,
    },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currency = project?.currency ?? "EUR";
  const currencySymbol = getCurrencySymbol(currency);

  const totalValueNumber = useMemo(
    () => (parseFloat(totalEstimatedValue.replace(/,/g, ".")) || 0),
    [totalEstimatedValue]
  );

  const computedMembers = useMemo(
    () =>
      members.map((m) => {
        const basePercent =
          m.mode === "percent"
            ? Number.isFinite(m.percent)
              ? m.percent
              : 0
            : totalValueNumber > 0
            ? ((Number.isFinite(m.amount) ? m.amount : 0) / totalValueNumber) * 100
            : 0;
        const baseAmount =
          m.mode === "amount"
            ? Number.isFinite(m.amount)
              ? m.amount
              : 0
            : (totalValueNumber * basePercent) / 100;
        return {
          ...m,
          computedPercent: basePercent,
          computedAmount: baseAmount,
        };
      }),
    [members, totalValueNumber]
  );

  const { remainingPercent, remainingAmount } = useMemo(() => {
    const assignedPercent = computedMembers.reduce(
      (sum, m) => sum + (Number.isFinite(m.computedPercent) ? m.computedPercent : 0),
      0
    );
    const remainingPct = 100 - assignedPercent;
    const remainingVal = (totalValueNumber * remainingPct) / 100;
    return {
      remainingPercent: remainingPct,
      remainingAmount: remainingVal,
    };
  }, [computedMembers, totalValueNumber]);

  const isRemainingZero =
    Math.abs(remainingPercent) < 0.01 && totalValueNumber > 0 && computedMembers.length > 0;

  if (!open || !project) return null;

  const supabase = createClient();

  const handleSelectChoice = (nextChoice: Choice) => {
    setChoice(nextChoice);
    setError(null);
  };

  const goNextFromFork = async () => {
    if (!choice) {
      setError("Please choose one option to continue.");
      return;
    }
    setError(null);

    if (choice === "scratch") {
      try {
        setSubmitting(true);
        const { error: updateError } = await supabase
          .from("projects")
          .update({ is_setup_completed: true })
          .eq("id", projectId);
        if (updateError) {
          setError(updateError.message ?? "Could not save onboarding status.");
          setSubmitting(false);
          return;
        }
        try {
          await logAudit({
            supabase,
            projectId,
            actionType: "ONBOARDING_SCRATCH",
            description:
              "Onboarding completed: project starts from scratch (no legacy equity distribution).",
          });
        } catch (auditErr) {
          console.error("Error saving audit log for onboarding scratch:", auditErr);
        }
        setSubmitting(false);
        onCompleted();
      } catch (err) {
        console.error("Error completing scratch onboarding:", err);
        setError("Unexpected error while completing onboarding. Please try again.");
        setSubmitting(false);
      }
      return;
    }

    setStep("value");
  };

  const goNextFromValue = () => {
    if (totalValueNumber <= 0) {
      setError("Please enter a positive estimated total value.");
      return;
    }
    setError(null);
    setStep("distribution");
  };

  const handleMemberChange = (id: string, field: keyof MemberInput, value: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        if (field === "percent") {
          const num = parseFloat(value.replace(/,/g, ".")) || 0;
          return { ...m, percent: num };
        }
        if (field === "amount") {
          const num = parseFloat(value.replace(/,/g, ".")) || 0;
          return { ...m, amount: num };
        }
        return { ...m, [field]: value };
      })
    );
  };

  const handleModeToggle = (id: string, mode: AllocationMode) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id || m.mode === mode) return m;
        const computed = computedMembers.find((cm) => cm.id === id);
        if (!computed) return m;
        if (mode === "amount") {
          return { ...m, mode, amount: computed.computedAmount };
        }
        return { ...m, mode, percent: computed.computedPercent };
      })
    );
  };

  const handleAddMember = () => {
    const nextId = `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setMembers((prev) => [
      ...prev,
      { id: nextId, name: "", role: "", email: "", mode: "percent", percent: 0, amount: 0 },
    ]);
  };

  const handleRemoveMember = (id: string) => {
    if (members.length === 1) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleCompleteOnboarding = async () => {
    setError(null);

    if (!isRemainingZero) {
      setError("The remaining value must be exactly 0% to complete onboarding.");
      return;
    }

    const cleaned = computedMembers
      .map((m) => ({
        ...m,
        name: m.name.trim(),
        role: m.role.trim() || "Member",
        email: m.email.trim(),
      }))
      .filter((m) => m.name && m.computedAmount > 0);

    if (cleaned.length === 0) {
      setError("Please add at least one member with a positive allocation.");
      return;
    }

    try {
      setSubmitting(true);

      const memberPayload = cleaned.map((m) => ({
        project_id: projectId,
        name: m.name,
        email: m.email || null,
        role: m.role || "Member",
        access_level: "editor",
        status: "active",
      }));

      const { error: membersError } = await supabase.from("project_members").insert(memberPayload);
      if (membersError) {
        console.error("Error inserting legacy members:", membersError);
        setError(membersError.message ?? "Could not create team members.");
        setSubmitting(false);
        return;
      }

      const contributionsPayload = cleaned.map((m) => ({
        project_id: projectId,
        contributor_name: m.name,
        concept: "Initial Baseline (legacy equity split)",
        type: "legacy_contribution",
        amount: m.computedAmount,
        multiplier: 1,
        risk_adjusted_value: m.computedAmount,
      }));

      const { error: contribError } = await supabase.from("contributions").insert(contributionsPayload);
      if (contribError) {
        console.error("Error inserting legacy contributions:", contribError);
        setError(contribError.message ?? "Could not create legacy contributions.");
        setSubmitting(false);
        return;
      }

      const { error: valuationError } = await recalculateAndPersistProjectValuation(
        supabase,
        projectId,
        project ?? undefined
      );
      if (valuationError) {
        console.error("Error recalculating valuation after legacy onboarding:", valuationError);
      }

      const { error: setupError } = await supabase
        .from("projects")
        .update({ is_setup_completed: true })
        .eq("id", projectId);
      if (setupError) {
        console.error("Error updating is_setup_completed:", setupError);
      }

      try {
        await logAudit({
          supabase,
          projectId,
          actionType: "ONBOARDING_LEGACY",
          description: `Onboarding completed with legacy baseline: ${formatCurrency(
            totalValueNumber,
            currency
          )} distributed among ${cleaned.length} members.`,
        });
      } catch (auditErr) {
        console.error("Error saving audit log for legacy onboarding:", auditErr);
      }

      setSubmitting(false);
      onCompleted();
    } catch (err) {
      console.error("Unexpected error during legacy onboarding:", err);
      setError("Unexpected error while completing onboarding. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm px-4 py-6">
      <div className="w-full max-w-3xl max-h-[90vh] bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden font-sans">
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                Project Onboarding
              </p>
              <h2 className="text-lg font-black text-slate-900">
                {step === "fork" && "How do you want to start?"}
                {step === "value" && "What is the estimated total value of your project today?"}
                {step === "distribution" && "Distribute the initial value among your team"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              // Do not allow closing without completing; user must choose an option.
              if (submitting) return;
              setError("Please complete or cancel onboarding from your account if needed.");
            }}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close onboarding"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
                step === "fork"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <span className="w-4 h-4 inline-flex items-center justify-center rounded-full bg-white text-[10px] font-bold">
                1
              </span>
              The Fork
            </span>
            <span className="text-slate-300">→</span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
                step === "value"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <span className="w-4 h-4 inline-flex items-center justify-center rounded-full bg-white text-[10px] font-bold">
                2
              </span>
              Total Value
            </span>
            <span className="text-slate-300">→</span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
                step === "distribution"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <span className="w-4 h-4 inline-flex items-center justify-center rounded-full bg-white text-[10px] font-bold">
                3
              </span>
              Distribution
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4">
          {step === "fork" && (
            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => handleSelectChoice("scratch")}
                className={`flex flex-col items-start justify-between rounded-2xl border-2 px-5 py-4 text-left transition-all ${
                  choice === "scratch"
                    ? "border-emerald-500 bg-emerald-50/60 shadow-sm"
                    : "border-slate-200 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/40"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-black">
                    A
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      No, we are starting from scratch
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      You will configure your currency and equity model next, then start logging
                      new contributions from zero.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectChoice("legacy")}
                className={`flex flex-col items-start justify-between rounded-2xl border-2 px-5 py-4 text-left transition-all ${
                  choice === "legacy"
                    ? "border-violet-500 bg-violet-50/60 shadow-sm"
                    : "border-slate-200 bg-slate-50 hover:border-violet-400 hover:bg-violet-50/40"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-black">
                    B
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      Yes, we have a previous distribution
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      You already have an equity split or contribution history. We will create an
                      initial baseline so future work adjusts on top.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {step === "value" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                Please enter the total estimated value of all contributions made to date. This number
                must include everything: cash investments, sweat equity (past work hours),
                intellectual property, and material assets.
              </p>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  Total estimated value today
                </label>
                <div className="relative max-w-sm">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={totalEstimatedValue}
                    onChange={(e) => setTotalEstimatedValue(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 font-black text-lg text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder={`0.00 (${currencySymbol})`}
                  />
                </div>
              </div>
              {totalValueNumber > 0 && (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-700">
                  <span className="font-semibold text-slate-900 mr-1">Reminder:</span>
                  You will distribute{" "}
                  <span className="font-bold text-emerald-700">
                    {formatCurrency(totalValueNumber, currency)}
                  </span>{" "}
                  among your team in the next step.
                </div>
              )}
            </div>
          )}

          {step === "distribution" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                Add each person who has contributed so far and assign them a share of the total
                value. You can work in either percentages or absolute value for each member — the
                system keeps both in sync.
              </p>

              <div className="rounded-2xl bg-slate-900 text-white px-4 py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-emerald-300" />
                  <span className="font-semibold">Remaining to assign:</span>
                </div>
                <div className="text-right">
                  <p className="font-black text-emerald-300">
                    {remainingPercent.toFixed(2)}%
                  </p>
                  <p className="text-xs text-emerald-200">
                    {formatCurrency(remainingAmount, currency)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {computedMembers.map((m, index) => (
                  <div
                    key={m.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">
                          {(m.name || `M${index + 1}`).charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <input
                            type="text"
                            placeholder="Name"
                            value={m.name}
                            onChange={(e) =>
                              handleMemberChange(m.id, "name", e.target.value)
                            }
                            className="w-full bg-white rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                          />
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Role (optional)"
                              value={m.role}
                              onChange={(e) =>
                                handleMemberChange(m.id, "role", e.target.value)
                              }
                              className="flex-1 bg-white rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                            />
                            <input
                              type="email"
                              placeholder="Email (optional)"
                              value={m.email}
                              onChange={(e) =>
                                handleMemberChange(m.id, "email", e.target.value)
                              }
                              className="flex-1 bg-white rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                            />
                          </div>
                        </div>
                      </div>
                      {members.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(m.id)}
                          className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleModeToggle(m.id, "percent")}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${
                            m.mode === "percent"
                              ? "bg-emerald-600 text-white"
                              : "bg-white text-slate-600 border border-slate-200"
                          }`}
                        >
                          <Percent className="w-3 h-3" />
                          %
                        </button>
                        <button
                          type="button"
                          onClick={() => handleModeToggle(m.id, "amount")}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${
                            m.mode === "amount"
                              ? "bg-emerald-600 text-white"
                              : "bg-white text-slate-600 border border-slate-200"
                          }`}
                        >
                          <DollarSign className="w-3 h-3" />
                          {currencySymbol}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {m.mode === "percent" ? (
                          <>
                            <input
                              type="number"
                              min={0}
                              step={0.01}
                              value={m.percent}
                              onChange={(e) =>
                                handleMemberChange(m.id, "percent", e.target.value)
                              }
                              className="w-24 bg-white rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold text-right text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                            />
                            <span className="text-xs font-semibold text-slate-500">
                              % · {formatCurrency(m.computedAmount, currency)}
                            </span>
                          </>
                        ) : (
                          <>
                            <input
                              type="number"
                              min={0}
                              step={0.01}
                              value={m.amount}
                              onChange={(e) =>
                                handleMemberChange(m.id, "amount", e.target.value)
                              }
                              className="w-32 bg-white rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold text-right text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                            />
                            <span className="text-xs font-semibold text-slate-500">
                              {m.computedPercent.toFixed(2)}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddMember}
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                + Add another member
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {error && <span className="text-red-600 font-semibold">{error}</span>}
            {!error && step === "distribution" && (
              <span>
                The onboarding will create{" "}
                <span className="font-semibold">Initial Baseline</span> entries in your Contribution
                Log.
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {step !== "fork" && (
              <button
                type="button"
                onClick={() =>
                  setStep((prev) => (prev === "distribution" ? "value" : "fork"))
                }
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                Back
              </button>
            )}
            {step === "fork" && (
              <button
                type="button"
                onClick={() => void goNextFromFork()}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                Continue
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
            {step === "value" && (
              <button
                type="button"
                onClick={goNextFromValue}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
            {step === "distribution" && (
              <button
                type="button"
                onClick={() => void handleCompleteOnboarding()}
                disabled={submitting || !isRemainingZero}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white bg-slate-900 hover:bg-emerald-600 shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Completing..." : "Complete Onboarding"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

