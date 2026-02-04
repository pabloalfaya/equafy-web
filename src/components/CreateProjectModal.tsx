"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, FolderPlus } from "lucide-react"; // Corregido: lucide-react es el paquete correcto
import { useRouter } from "next/navigation";

export function CreateProjectModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Session not found");

      // Enviamos todos los campos necesarios según la estructura de tu tabla en Supabase
      const { error } = await supabase.from("projects").insert({
        name: name,
        owner_id: user.id,
        status: "active",
        model_type: "JUST_SPLIT",
        mult_cash: 4.0,
        mult_labor: 2.0,
        mult_ip: 2.0,
        mult_assets: 1.0,
        use_log_risk: false,
        current_valuation: 0
      });

      if (error) throw error;

      setIsOpen(false);
      setName("");
      router.refresh(); 
      
    } catch (error: any) {
      console.error("Error:", error);
      // El alert mostrará el mensaje técnico real si Supabase rechaza algo
      alert("Error: " + (error.message || "Could not create project"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="mt-6 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg"
      >
        <FolderPlus className="w-5 h-5 text-emerald-400" />
        Create New Project
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Project Name</h2>
            <p className="text-slate-500 mb-6 font-medium">Give your new project a name.</p>
            
            <input
              autoFocus
              type="text"
              placeholder="Ex: Project Alpha..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 mb-6 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
            />

            <div className="flex gap-3">
              <button 
                onClick={() => setIsOpen(false)} 
                className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                disabled={loading || !name.trim()}
                className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 flex justify-center items-center"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}