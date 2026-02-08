import { Suspense } from "react";
import { DashboardContent } from "@/components/DashboardContent";
import { Loader2 } from "lucide-react";

export default function ProjectSelectorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
            <p className="text-slate-400 text-sm font-bold animate-pulse">Loading Projects...</p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
