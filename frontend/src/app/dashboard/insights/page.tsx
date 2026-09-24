"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LineChart } from "lucide-react";

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Insights</h1>
          <p className="text-slate-500 mt-1">Analytics and reporting across all your meetings.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <LineChart className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Coming Soon</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm">
              Cross-meeting analytics, team performance, and AI extraction insights will be available here soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
