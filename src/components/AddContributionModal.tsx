"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { ContributionType, Contribution } from "@/types/database";
import { DEFAULT_MULTIPLIERS } from "@/types/database";

const CONTRIBUTION_LABELS: Record<ContributionType, string> = {
  cash: "Efectivo",
  labor: "Trabajo",
  ip: "Propiedad Intelectual",
  assets: "Activos",
};

interface AddContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
  onSuccess: (newContribution: Contribution) => void;
}

export function AddContributionModal({
  isOpen,
  onClose,
  projectId,
  onSuccess,
}: AddContributionModalProps) {
  const [contributorName, setContributorName] = useState("");
  const [concept, setConcept] = useState(""); // <--- NUEVO ESTADO PARA EL CONCEPTO
  const [type, setType] = useState<ContributionType>("cash");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedProjectId, setResolvedProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const resolveProjectId = async () => {
      if (projectId) {
        setResolvedProjectId(projectId);
        return;
      }
      const supabase = createClient();
      const { data } = await supabase
        .from("projects")
        .select("id")
        .ilike("name", "Equily")
        .limit(1)
        .maybeSingle();
      setResolvedProjectId(data?.id ?? null);
    };

    resolveProjectId();
  }, [isOpen, projectId]);

  const multiplier = DEFAULT_MULTIPLIERS[type];
  const riskAdjustedValue = amount
    ? (parseFloat(amount) * multiplier).toFixed(2)
    : "0.00";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pid = resolvedProjectId ?? projectId;
    if (!pid) {
      setError("No se encontró el proyecto Equily");
      return;
    }

    setLoading(true);
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Introduce un importe válido");
      setLoading(false);
      return;
    }

    const riskAdjusted = numAmount * multiplier;

    const insertPayload = {
      project_id: pid,
      contributor_name: contributorName.trim(),
      concept: concept.trim(), // <--- GUARDAMOS EL CONCEPTO EN LA BASE DE DATOS
      type,
      amount: numAmount,
      risk_multiplier: multiplier,
      risk_adjusted_value: riskAdjusted,
    };

    try {
      const supabase = createClient();
      const { data, error: insertError } = await supabase
        .from("contributions")
        .insert(insertPayload)
        .select()
        .single();

      if (insertError) throw insertError;

      setContributorName("");
      setConcept(""); // <--- LIMPIAMOS EL CAMPO
      setType("cash");
      setAmount("");
      
      // Devolvemos el objeto completo que nos da Supabase
      if (data) {
        onSuccess(data as Contribution);
      }
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200/50">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">
            Añadir Aportación
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* CAMPO DE NOMBRE */}
          <div>
            <label
              htmlFor="contributor"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Socio
            </label>
            <input
              id="contributor"
              type="text"
              value={contributorName}
              onChange={(e) => setContributorName(e.target.value)}
              placeholder="Ej: Pablo"
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-800 placeholder-slate-400 transition focus:border-emerald-fintech focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-fintech/20"
              required
            />
          </div>

          {/* --- NUEVO CAMPO DE CONCEPTO --- */}
          <div>
            <label
              htmlFor="concept"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Concepto (Descripción)
            </label>
            <input
              id="concept"
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Ej: Desarrollo Web, Capital Inicial..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-800 placeholder-slate-400 transition focus:border-emerald-fintech focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-fintech/20"
              required
            />
          </div>

          <div>
            <label
              htmlFor="type"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Tipo de aportación
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as ContributionType)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-800 transition focus:border-emerald-fintech focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-fintech/20"
            >
              {(Object.keys(CONTRIBUTION_LABELS) as ContributionType[]).map(
                (t) => (
                  <option key={t} value={t}>
                    {CONTRIBUTION_LABELS[t]} (x{DEFAULT_MULTIPLIERS[t]})
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="amount"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Importe base
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-800 placeholder-slate-400 transition focus:border-emerald-fintech focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-fintech/20"
              required
            />
          </div>

          <div className="rounded-xl bg-slate-100/80 p-4">
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-700">
                Valor ajustado por riesgo:
              </span>{" "}
              {riskAdjustedValue} <span className="text-slate-500">(x{multiplier})</span>
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !resolvedProjectId}
              className="flex-1 rounded-lg bg-emerald-fintech px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-emerald-fintech-dark disabled:opacity-50"
            >
              {loading ? "Guardando…" : "Añadir"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}