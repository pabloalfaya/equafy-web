"use client";

import { X, Loader2 } from "lucide-react";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  onProjectNameChange: (value: string) => void;
  onSave: () => void;
  saving: boolean;
}

export function EditProjectModal({
  isOpen,
  onClose,
  projectName,
  onProjectNameChange,
  onSave,
  saving,
}: EditProjectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 text-slate-900">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-black text-slate-900 mb-6 pr-8">Edit Project Details</h2>

        <div className="space-y-4">
          <label htmlFor="edit-project-name" className="block text-sm font-bold text-slate-700">
            Project Name
          </label>
          <input
            id="edit-project-name"
            type="text"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            placeholder="Project name"
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
            disabled={saving}
          />
        </div>

        {/* Reserved for future: payment / subscription management */}
        <div className="mt-6 pt-6 border-t border-slate-100" aria-hidden="true">
          {/* Future: payment status, upgrade / manage subscription, etc. */}
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !projectName.trim()}
            className="px-5 py-2.5 rounded-xl font-bold bg-slate-900 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
