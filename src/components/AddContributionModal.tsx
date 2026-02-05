"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// Definimos los tipos disponibles con sus etiquetas en MAYÚSCULAS para coincidir con tu diseño
const CONTRIBUTION_TYPES = [
  { value: "CASH", label: "CASH" },
  { value: "WORK", label: "WORK" },
  { value: "TANGIBLE", label: "TANGIBLE" },
  { value: "INTANGIBLE", label: "INTANGIBLE" },
  { value: "OTHERS", label: "OTROS" },
];

export function AddContributionModal({ isOpen, onClose, projectId, projectConfig, onSuccess, members, editData = null }: any) {
  const [contributorId, setContributorId] = useState("");
  const [concept, setConcept] = useState("");
  const [type, setType] = useState("CASH");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [multiplier, setMultiplier] = useState(1);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  
  // Cálculo en tiempo real del valor ajustado
  const riskAdjustedValue = (parseFloat(amount || "0") * multiplier).toFixed(2);

  // Función para obtener el multiplicador
  const getMultiplierForType = (t: string) => {
    // Si no ha cargado la config, devolvemos 1 por defecto
    if (!projectConfig) return 1;
    
    // Detectamos el modelo (soportando nombres nuevos y antiguos por si acaso)
    const model = projectConfig.model_type || projectConfig.equity_model || 'CUSTOM';

    // 1. Modelo Flat
    if (model === 'FLAT') return 1;

    // 2. Modelo Just Split
    if (model === 'JUST_SPLIT') { 
      if (t === 'CASH') return 4; 
      return 2; 
    }

    // 3. Modelo Custom (busca mult_cash, mult_work, etc.)
    const key = `mult_${t.toLowerCase()}`;
    // Si el valor es 0 o null, usamos 1 como seguridad
    return projectConfig[key] || 1;
  };

  // Efecto: Cargar datos si estamos editando
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        const member = members.find((m: any) => m.name === editData.contributor_name);
        setContributorId(member?.id || ""); 
        setConcept(editData.concept || ""); 
        setType(editData.type || "CASH");
        setAmount(editData.amount?.toString() || ""); 
        setDate(editData.date || new Date().toISOString().split('T')[0]); 
        setMultiplier(editData.multiplier || 1);
      } else {
        setConcept(""); 
        setAmount(""); 
        setType("CASH"); 
        setDate(new Date().toISOString().split('T')[0]);
        if (members.length > 0 && !contributorId) {
            setContributorId(members[0].id);
        }
      }
    }
  }, [isOpen, editData, members]);

  // Efecto: Actualizar el multiplicador cuando cambia el tipo
  useEffect(() => { 
    if (isOpen) {
        // Obtenemos el nuevo multiplicador
        const newMult = getMultiplierForType(type);
        // Solo lo actualizamos si no estamos en modo edición (para no sobrescribir datos históricos)
        // O si el usuario cambia el tipo manualmente durante la edición
        if (!editData || (editData && type !== editData.type)) {
            setMultiplier(newMult);
        } else if (editData && type === editData.type) {
            // Si es el mismo tipo original, mantenemos el original
            setMultiplier(editData.multiplier);
        }
    }
  }, [type, projectConfig, isOpen, editData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const selectedMember = members.find((m: any) => m.id === contributorId);
    
    const payload = { 
        project_id: projectId, 
        contributor_name: selectedMember?.name || "Unknown", 
        concept, 
        type, 
        amount: parseFloat(amount), 
        multiplier, 
        risk_adjusted_value: parseFloat(riskAdjustedValue), 
        date 
    };

    const query = editData 
        ? supabase.from("contributions").update(payload).eq("id", editData.id) 
        : supabase.from("contributions").insert([payload]);

    const { data, error } = await query.select().single();

    if (!error) { 
        if(onSuccess) onSuccess(data);
        onClose(); 
    } else {
        console.error("Error saving contribution:", error);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl p-8 animate-in zoom-in duration-200 font-sans">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">
            {editData ? "Editar Aportación" : "Añadir Aportación"}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Selector de Miembro */}
          <div>
            <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block uppercase">Socio</label>
            <select 
                value={contributorId} 
                onChange={(e) => setContributorId(e.target.value)} 
                className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 font-bold outline-none text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            >
                {members.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          {/* Input Concepto */}
          <div>
            <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block uppercase">Concepto</label>
            <input 
                type="text" 
                placeholder="Ej: Desarrollo Frontend..." 
                value={concept} 
                onChange={(e) => setConcept(e.target.value)} 
                className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 font-bold outline-none text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" 
            />
          </div>

          {/* Grid: Tipo y Cantidad */}
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block uppercase">Tipo</label>
                {/* AQUÍ ESTÁ LA CLAVE: 
                   Usamos .map() para generar las opciones dinámicamente con el multiplicador.
                   Si ves esto en el código, DEBERÍAN salir los números.
                */}
                <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)} 
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 font-black text-xs uppercase outline-none text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                >
                    {CONTRIBUTION_TYPES.map((t) => {
                        const multVal = getMultiplierForType(t.value);
                        return (
                            <option key={t.value} value={t.value}>
                                {t.label} (x{multVal})
                            </option>
                        );
                    })}
                </select>
            </div>
            
            <div>
                <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block uppercase">Valor (€)</label>
                <input 
                    type="number" 
                    placeholder="0.00" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 font-black outline-none text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" 
                />
            </div>
          </div>

          {/* Fecha */}
          <div>
             <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 bg-slate-50 text-xs font-bold text-slate-500 outline-none focus:border-emerald-500 transition-all"
             />
          </div>

          {/* Tarjeta de Resultado */}
          <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-lg shadow-emerald-900/20">
             <div className="flex justify-between text-[10px] font-black uppercase opacity-60 mb-2">
                <span>Riesgo Calculado</span>
                <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-400">x{multiplier} Multiplier</span>
             </div>
             <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-emerald-400">{Number(riskAdjustedValue).toLocaleString()}</span>
                <span className="text-sm font-bold text-emerald-400/60">puntos</span>
             </div>
          </div>

          {/* Botón */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full rounded-2xl bg-emerald-600 py-4 text-sm font-black text-white hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Guardando..." : editData ? "Guardar Cambios" : "Confirmar Aportación"}
          </button>

        </form>
      </div>
    </div>
  );
}