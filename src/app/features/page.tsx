"use client";

import Link from "next/link";
import { BRAND } from "@/lib/brand";
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
    id: "project-management",
    title: "Project Management",
    features: [
      { title: "Create Projects", icon: FolderPlus, description: "Create new equity projects with a guided wizard." },
      { title: "List Projects", icon: List, description: "Access all your projects from the main dashboard." },
      { title: "Delete Projects", icon: Trash2, description: "Remove projects you no longer need." },
      { title: "Role-Based Access", icon: ShieldCheck, description: "Owner, Co-owner, Worker and more: granular permission control." },
    ],
  },
  {
    id: "select-equity-models",
    title: "Select Equity Models",
    features: [
      { title: "Just Split Model", icon: Zap, description: "Recommended: Cash x4, Work x2, Assets x2, IP x2." },
      { title: "Flat Model", icon: Scale, description: "All multipliers x1. Ideal for service agencies." },
      { title: "Custom Model", icon: Sliders, description: "Fully editable multipliers per category." },
    ],
  },
  {
    id: "contributions",
    title: "Contributions",
    features: [
      { title: "Add Contributions", icon: PlusCircle, description: "Log Cash, Work, Tangible, Intangible and Others with a guided wizard." },
      { title: "Edit Contributions", icon: Edit3, description: "Fix values or descriptions of past contributions." },
      { title: "Delete Contributions", icon: Trash2, description: "Remove incorrect or duplicate entries to keep a clean history." },
      { title: "Contribution Log", icon: FileText, description: "Chronological history of all contributions, with filter by member." },
      { title: "Simulation Mode", icon: FlaskConical, description: "Simulate contributions without saving and see the impact on the cap table before committing." },
      { title: "WORK: By Hours or Fixed Value", icon: Sliders, description: "For work contributions, choose to calculate from hours worked (using the member's Hourly Rate × Work multiplier) or enter a fixed amount. Live points preview before saving." },
    ],
  },
  {
    id: "dynamic-equity-distribution",
    title: "Dynamic Equity Distribution",
    features: [
      { title: "Dynamic Splitting", icon: Zap, description: "Slicing Pie model: equity recalculates automatically based on contributions." },
      { title: "Real-Time Cap Table", icon: LayoutGrid, description: "Cap table updated instantly." },
      { title: "Equity Distribution", icon: PieChart, description: "Pie chart showing ownership distribution." },
      { title: "Team Breakdown", icon: BarChart3, description: "Detailed breakdown per member with points and percentages." },
      { title: "Automatic Calculation", icon: Calculator, description: "Percentages calculated automatically from contributions and multipliers." },
    ],
  },
  {
    id: "equity-evolution",
    title: "Equity Evolution",
    features: [
      { title: "Equity Evolution Panel", icon: TrendingUp, description: "Track how equity and contributions evolve over time with interactive charts." },
      { title: "Time Scales", icon: BarChart3, description: "View data by Daily, Weekly, Monthly or Annual periods." },
      { title: "By Member (%)", icon: Users, description: "Line chart showing each member's equity percentage over time." },
      { title: "Total Value", icon: PieChart, description: "Area chart of total points accumulated per period." },
      { title: "By Type", icon: Sliders, description: "Evolution by contribution type: Cash, Work, Tangible, Intangible, Others." },
      { title: "Total Contributions", icon: List, description: "Line chart showing the number of contributions per period." },
      { title: "Period Comparison", icon: Calculator, description: "Compare points and contributions vs previous day, week, month or year." },
      { title: "See Evolution", icon: Zap, description: "Quick toggle from Contribution Log to Evolution panel in one click." },
    ],
  },
  {
    id: "equity-configuration",
    title: "Equity Configuration",
    features: [
      { title: "Custom Multipliers", icon: Settings, description: "Adjust Cash, Work, Tangible, Intangible and Others to match your stage." },
      { title: "Fixed Equity", icon: Anchor, description: "Fixed percentages that do not change with new contributions." },
      { title: "Limited Equity (Hard Caps)", icon: Lock, description: "Maximum % cap per member to protect the cap table." },
      { title: "Smart Multipliers", icon: TrendingUp, description: "Suggestions based on project valuation (logarithmic model)." },
      { title: "Preset Models", icon: BookOpen, description: "Choose Just Split, Flat or Custom as a starting point." },
    ],
  },
  {
    id: "team-management",
    title: "Team Management",
    features: [
      { title: "Add Members", icon: Users, description: "Add members to the project team." },
      { title: "Edit Members", icon: Edit3, description: "Update name, email and role for each member." },
      { title: "Hourly Rate (FMV)", icon: Calculator, description: "Optional per-member hourly rate (fair market value) for valuing work contributions by hours in the contribution wizard." },
      { title: "Remove Members", icon: Trash2, description: "Remove members from the project." },
      { title: "Roles", icon: ShieldCheck, description: "Owner, Co-owner, Worker, Venture Capital and more." },
    ],
  },
  {
    id: "valuation-finalization",
    title: "Valuation & Finalization",
    features: [
      { title: "Current Valuation", icon: CreditCard, description: "Project valuation updated automatically." },
      { title: "Automatic Recalculation", icon: Calculator, description: "Recalculates when adding, editing or deleting contributions." },
      { title: "Freeze Project", icon: Snowflake, description: "Freeze the project: lock contributions and fix equity state." },
      { title: "Executive Summary", icon: ClipboardCheck, description: "Summary of the project's final state." },
      { title: "Unfreeze Project", icon: Zap, description: "Unlock the project to edit again when needed." },
    ],
  },
  {
    id: "transparency-audit-security",
    title: "Transparency, Audit & Security",
    features: [
      { title: "Audit Log", icon: FileSearch, description: "Full history: who did what and when." },
      { title: "Action Logging", icon: FileText, description: "All modifications are recorded for complete transparency." },
      { title: "Authentication", icon: Shield, description: "Secure login with Supabase Auth." },
      { title: "Role-Based Access Control", icon: Lock, description: "Routes and actions protected by user permissions." },
    ],
  },
  {
    id: "export",
    title: "Export",
    features: [
      { title: "Export PDF", icon: Download, description: "Generate PDFs of the cap table and contribution log, signed-ready." },
    ],
  },
  {
    id: "legal",
    title: "Legal",
    features: [
      { title: "Legal Hub", icon: Globe, description: "Jurisdiction guide: US, Spain, UK, Ireland, India, Mexico and more." },
      { title: "Document Templates", icon: FileText, description: "Partnership Agreement and other ready-to-use templates." },
      { title: "Document Vault", icon: Download, description: "Upload and store signed PDFs in a secure space." },
      { title: "Project Freeze Certificate", icon: ClipboardCheck, description: "Project freeze certificate for legal use." },
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
              All {BRAND.name} Features
            </h1>
            <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed tracking-tight">
              Complete control over your equity: contributions, models, team, legal and more.
            </p>
          </header>

          <div className="space-y-16">
            {FEATURE_SECTIONS.map((section) => (
              <section key={section.title} id={section.id} className="scroll-mt-24">
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

          <div className="mt-16 md:mt-20 text-center">
            <p className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">
              Ready to split fairly?
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
