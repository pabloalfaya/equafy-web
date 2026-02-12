"use client";

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-400/20 blur-[120px] rounded-full opacity-50 mix-blend-multiply" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-400/10 blur-[120px] rounded-full opacity-40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] px-6">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-slate-900 mb-4 text-center">
          User Guide
        </h1>
        <p className="text-xl text-slate-500 font-medium text-center max-w-xl">
          Coming soon... Learn how to master dynamic equity.
        </p>
      </main>
    </div>
  );
}
