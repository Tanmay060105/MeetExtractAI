"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Scale } from "lucide-react";

export default function EvaluationPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Evaluation Center</h1>
          <p className="text-slate-500 mt-1">Ground truth assessment and pipeline benchmarking.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Scale className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Evaluation Suite Pending</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm">
              The extraction evaluation tooling is part of a future release phase.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
