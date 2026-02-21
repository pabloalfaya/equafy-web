"use client";

import Link from "next/link";
import {
  PlusCircle,
  Edit3,
  Trash2,
  Settings,
  Anchor,
  Lock,
  FileSearch,
  ShieldCheck,
  Download,
  FlaskConical,
  FolderPlus,
  List,
  Users,
  LayoutGrid,
  PieChart,
  BarChart3,
  Calculator,
  Zap,
  Scale,
  Sliders,
  TrendingUp,
  Snowflake,
  FileText,
  ClipboardCheck,
  Shield,
  Globe,
  BookOpen,
  CreditCard,
} from "lucide-react";

const FEATURE_SECTIONS = [
  {
    title: "Gestión de proyectos",
    features: [
      { title: "Crear proyectos", icon: FolderPlus, description: "Crea nuevos proyectos de equity con un asistente guiado." },
      { title: "Listar proyectos", icon: List, description: "Accede a todos tus proyectos desde el dashboard principal." },
      { title: "Eliminar proyectos", icon: Trash2, description: "Elimina proyectos que ya no necesites." },
      { title: "Acceso por roles", icon: ShieldCheck, description: "Owner, Co-owner, Worker y más: control granular de permisos." },
    ],
  },
  {
    title: "Contribuciones",
    features: [
      { title: "Añadir contribuciones", icon: PlusCircle, description: "Registra Cash, Work, Tangible, Intangible y Others con un wizard guiado." },
      { title: "Editar contribuciones", icon: Edit3, description: "Corrige valores o descripciones de contribuciones pasadas." },
      { title: "Eliminar contribuciones", icon: Trash2, description: "Elimina entradas incorrectas o duplicadas para mantener un historial limpio." },
      { title: "Log de contribuciones", icon: FileText, description: "Historial cronológico de todas las aportaciones, con filtro por miembro." },
      { title: "Modo simulación", icon: FlaskConical, description: "Simula aportaciones sin guardar y visualiza el impacto en el cap table antes de confirmar." },
    ],
  },
  {
    title: "Distribución dinámica de equity",
    features: [
      { title: "Dynamic splitting", icon: Zap, description: "Modelo Slicing Pie: el equity se recalcula automáticamente según las contribuciones." },
      { title: "Cap Table en tiempo real", icon: LayoutGrid, description: "Tabla de capitalización actualizada al instante." },
      { title: "Equity Distribution", icon: PieChart, description: "Gráfico de tarta con la distribución de ownership." },
      { title: "Team Breakdown", icon: BarChart3, description: "Desglose detallado por miembro con puntos y porcentajes." },
      { title: "Cálculo automático", icon: Calculator, description: "Porcentajes calculados automáticamente según contribuciones y multiplicadores." },
    ],
  },
  {
    title: "Modelos de equity",
    features: [
      { title: "Just Split Model", icon: Zap, description: "Recomendado: Cash x4, Work x2, Assets x2, IP x2." },
      { title: "Flat Model", icon: Scale, description: "Todos los multiplicadores x1. Ideal para agencias de servicios." },
      { title: "Custom Model", icon: Sliders, description: "Multiplicadores completamente editables por categoría." },
    ],
  },
  {
    title: "Configuración de equity",
    features: [
      { title: "Multiplicadores personalizados", icon: Settings, description: "Ajusta Cash, Work, Tangible, Intangible y Others según tu etapa." },
      { title: "Fixed Equity", icon: Anchor, description: "Porcentajes fijos que no cambian con nuevas contribuciones." },
      { title: "Limited Equity (Hard Caps)", icon: Lock, description: "Límite máximo de % por miembro para proteger el cap table." },
      { title: "Smart Multipliers", icon: TrendingUp, description: "Sugerencias basadas en la valoración del proyecto (modelo logarítmico)." },
      { title: "Modelos predefinidos", icon: BookOpen, description: "Selecciona Just Split, Flat o Custom como punto de partida." },
    ],
  },
  {
    title: "Valoración y finalización",
    features: [
      { title: "Valoración actual", icon: CreditCard, description: "Valoración del proyecto actualizada automáticamente." },
      { title: "Recalculo automático", icon: Calculator, description: "Recálculo al añadir, editar o eliminar contribuciones." },
      { title: "Freeze Project", icon: Snowflake, description: "Congela el proyecto: bloquea contribuciones y fija el equity." },
      { title: "Executive Summary", icon: ClipboardCheck, description: "Resumen ejecutivo del estado final del proyecto." },
      { title: "Unfreeze Project", icon: Zap, description: "Desbloquea el proyecto para volver a editar cuando sea necesario." },
    ],
  },
  {
    title: "Exportación",
    features: [
      { title: "Export PDF", icon: Download, description: "Genera PDFs del cap table y del log de contribuciones listos para firmar." },
    ],
  },
  {
    title: "Gestión de equipo",
    features: [
      { title: "Añadir miembros", icon: Users, description: "Incorpora miembros al equipo del proyecto." },
      { title: "Editar miembros", icon: Edit3, description: "Modifica nombre, email y rol de cada miembro." },
      { title: "Eliminar miembros", icon: Trash2, description: "Elimina miembros del proyecto." },
      { title: "Roles", icon: ShieldCheck, description: "Owner, Co-owner, Worker, Venture Capital y más." },
    ],
  },
  {
    title: "Transparencia y auditoría",
    features: [
      { title: "Audit Log", icon: FileSearch, description: "Historial completo: quién hizo qué y cuándo." },
      { title: "Registro de acciones", icon: FileText, description: "Todas las modificaciones quedan registradas para transparencia total." },
    ],
  },
  {
    title: "Seguridad",
    features: [
      { title: "Autenticación", icon: Shield, description: "Inicio de sesión seguro con Supabase Auth." },
      { title: "Control de acceso por roles", icon: Lock, description: "Rutas y acciones protegidas según permisos del usuario." },
    ],
  },
  {
    title: "Legal",
    features: [
      { title: "Legal Hub", icon: Globe, description: "Guía por jurisdicción: US, España, UK, Irlanda, India, México y más." },
      { title: "Plantillas de documentos", icon: FileText, description: "Partnership Agreement y otras plantillas listas para usar." },
      { title: "Vault de documentos", icon: Download, description: "Sube y guarda PDFs firmados en un espacio seguro." },
      { title: "Project Freeze Certificate", icon: ClipboardCheck, description: "Certificado de congelación del proyecto para uso legal." },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-400/20 blur-[120px] rounded-full opacity-50 mix-blend-multiply" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-400/10 blur-[120px] rounded-full opacity-40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <main className="relative z-10 pt-32 md:pt-40 pb-20 md:pb-28 px-6 md:px-12 lg:px-24">
        <div className="mx-auto max-w-screen-2xl">
          <header className="text-center mb-16 md:mb-20">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6">
              Todas las funcionalidades de Equily
            </h1>
            <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed tracking-tight">
              Control total sobre tu equity: contribuciones, modelos, equipo, legal y más.
            </p>
          </header>

          <div className="space-y-16">
            {FEATURE_SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 tracking-tight pb-3 border-b border-slate-200">
                  {section.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {section.features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={feature.title}
                        className="group rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-lg hover:border-slate-300/80 transition-all duration-300"
                      >
                        <div className="inline-flex p-3 rounded-full mb-4 bg-emerald-50">
                          <Icon className="w-5 h-5 text-emerald-600 shrink-0" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-2 tracking-tight">
                          {feature.title}
                        </h3>
                        <p className="text-slate-600 font-medium text-sm leading-relaxed tracking-tight">
                          {feature.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-16 md:mt-20 text-center rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/80 shadow-sm py-12 px-6">
            <p className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">
              ¿Listo para repartir de forma justa?
            </p>
            <Link
              href="/login?view=signup"
              className="inline-flex items-center justify-center h-14 px-8 rounded-2xl font-bold text-lg text-white shadow-lg transition-all duration-300 hover:opacity-95 hover:-translate-y-0.5 bg-emerald-500 hover:bg-emerald-600"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
