"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Scale, Database, PlayCircle, Plus, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchApi, EvaluationDataset, EvaluationRun } from "@/lib/api";

export default function EvaluationPage() {
  const [datasets, setDatasets] = useState<EvaluationDataset[]>([]);
  const [runs, setRuns] = useState<EvaluationRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dsData, rsData] = await Promise.all([
          fetchApi<EvaluationDataset[]>("/evaluations/datasets"),
          fetchApi<EvaluationRun[]>("/evaluations/runs")
        ]);
        setDatasets(dsData);
        setRuns(rsData);
      } catch (e) {
        console.error("Failed to load evaluation data", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const completedRuns = runs.filter(r => r.status === "COMPLETED");
  // F1 trend data would need the results, but for MVP we might fetch average F1 for runs.
  // Actually, we need to fetch results for each completed run to get the F1, but that's N+1.
  // The plan specified: "Top-level Run F1 Trend. X-axis = chronological evaluation runs, Y-axis = run-level F1".
  // Let's implement a minimal visual representation. We don't have run-level F1 on the run object itself, 
  // so we may need to fetch results if we want the actual F1 trend, or skip the actual data fetching for F1 trend 
  // until we have an endpoint. Let's build a static placeholder trend if we don't have the data, or fetch results for all runs?
  // We can fetch results for all completed runs to build the trend.

  const [f1Scores, setF1Scores] = useState<number[]>([]);

  useEffect(() => {
    async function fetchScores() {
      if (completedRuns.length === 0) return;
      // Note: In a real prod environment we'd have a summary API, but for MVP N+1 is acceptable if N is small.
      try {
        const scores = await Promise.all(
          completedRuns.map(async (r) => {
            const res = await fetchApi<any[]>(`/evaluations/runs/${r.id}/results`);
            let sum = 0;
            let count = 0;
            res.forEach(item => {
              if (item.metrics?.f1 !== undefined) {
                sum += item.metrics.f1;
                count++;
              }
            });
            return count > 0 ? sum / count : 0;
          })
        );
        // Reverse because they come sorted by started_at DESC, we want chronological ASC
        setF1Scores(scores.reverse());
      } catch (e) {
        console.error(e);
      }
    }
    fetchScores();
  }, [completedRuns.length]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Evaluation Center</h1>
          <p className="text-slate-500 mt-1">Ground truth assessment and pipeline benchmarking.</p>
        </div>
      </div>

      {/* F1 Trend Visualization */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Model F1 Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 flex items-end gap-2">
            {f1Scores.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">
                No completed runs available for trend
              </div>
            ) : f1Scores.length === 1 ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900">{(f1Scores[0] * 100).toFixed(1)}%</span>
                <span className="text-sm text-slate-500">Current F1 Score</span>
              </div>
            ) : (
              <div className="w-full h-full flex items-end justify-between px-4 border-l border-b border-slate-200 pt-4 relative">
                {f1Scores.map((score, i) => (
                  <div key={i} className="flex flex-col items-center group relative h-full w-full justify-end">
                    <div 
                      className="w-full max-w-[24px] bg-slate-900 rounded-t hover:bg-slate-700 transition-colors"
                      style={{ height: `${Math.max(score * 100, 5)}%` }}
                    />
                    <div className="absolute -top-8 hidden group-hover:block bg-slate-800 text-white text-xs px-2 py-1 rounded">
                      {(score * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Datasets */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Evaluation Datasets</CardTitle>
              <CardDescription>Manage ground truth sets</CardDescription>
            </div>
            <button className="text-sm font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors">
              <Plus className="h-4 w-4" />
              New
            </button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="divide-y divide-slate-100">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : datasets.length === 0 ? (
              <div className="p-12 text-center">
                <Database className="mx-auto h-8 w-8 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">No datasets found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {datasets.map(ds => (
                  <div key={ds.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{ds.name}</p>
                      <p className="text-xs text-slate-500">v{ds.version} • {new Date(ds.created_at).toLocaleDateString()}</p>
                    </div>
                    <button className="text-xs font-medium bg-slate-900 text-white px-3 py-1.5 rounded hover:bg-slate-800 transition-colors">
                      Run
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Runs */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-semibold">Recent Runs</CardTitle>
            <CardDescription>History of evaluation pipeline executions</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="divide-y divide-slate-100">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20 rounded-full" />
                    </div>
                    <div className="flex gap-4">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : runs.length === 0 ? (
              <div className="p-12 text-center">
                <PlayCircle className="mx-auto h-8 w-8 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">No runs yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {runs.map(run => (
                  <Link href={`/dashboard/evaluation/runs/${run.id}`} key={run.id} className="block p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-slate-900 text-sm">Run {run.id.substring(0,8)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        run.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        run.status === 'FAILED' ? 'bg-rose-100 text-rose-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {run.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{run.model_version}</span>
                      <span>{new Date(run.started_at).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
