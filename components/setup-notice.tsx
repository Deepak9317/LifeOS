import { AlertTriangle } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { SetupIssue } from "@/types";

export function SetupNotice({ issue }: { issue: SetupIssue }) {
  return (
    <Card className="border-amber-200 bg-amber-50/90 shadow-[0_20px_60px_-40px_rgba(180,83,9,0.35)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700">
          <AlertTriangle className="size-5" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold text-slate-950">{issue.title}</h2>
          <p className="text-sm text-slate-700">{issue.description}</p>
          <p className="text-sm font-medium text-slate-900">{issue.action}</p>
        </div>
      </div>
    </Card>
  );
}
