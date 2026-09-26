"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchApi, EvaluationRun, EvaluationResult } from "@/lib/api";

export default function RunDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [run, setRun] = useState<EvaluationRun | null>(null);
  const [results, setResults] = useState<EvaluationResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRun() {
      try {
        const [rData, resData] = await Promise.all([
          fetchApi<EvaluationRun>(`/evaluations/runs/${id}`),
          fetchApi<EvaluationResult[]>(`/evaluations/runs/${id}/results`)
        ]);
        setRun(rData);
        setResults(resData);
      } catch (e) {
        console.error("Failed to load run", e);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadRun();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-5" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!run) {
    return <div className="p-8 text-center text-rose-500">Run not found</div>;
  }

  // Calculate aggregates
  let sumP = 0, sumR = 0, sumF1 = 0, sumRevP = 0, sumRevR = 0;
  let sumOwnerAcc = 0, ownerAccCount = 0;
  let sumDeadAcc = 0, deadAccCount = 0;
  let totalFailures = 0;
  const taxonomyCounts: Record<string, number> = {};

  results.forEach(res => {
    if (res.metrics) {
      sumP += res.metrics.precision || 0;
      sumR += res.metrics.recall || 0;
      sumF1 += res.metrics.f1 || 0;
      sumRevP += res.metrics.review_precision || 0;
      sumRevR += res.metrics.review_recall || 0;
      
      if (res.metrics.owner_accuracy !== null && res.metrics.owner_accuracy !== undefined) {
        sumOwnerAcc += res.metrics.owner_accuracy;
        ownerAccCount++;
      }
      
      if (res.metrics.deadline_accuracy !== null && res.metrics.deadline_accuracy !== undefined) {
        sumDeadAcc += res.metrics.deadline_accuracy;
        deadAccCount++;
      }
      
      const failures = res.metrics.failures || [];
      totalFailures += failures.length;
      failures.forEach((f: any) => {
        taxonomyCounts[f.category] = (taxonomyCounts[f.category] || 0) + 1;
      });
    }
  });

  const count = results.length || 1;
  const avgP = sumP / count;
  const avgR = sumR / count;
  const avgF1 = sumF1 / count;
  const avgRevP = sumRevP / count;
  const avgRevR = sumRevR / count;
  const avgOwnerAcc = ownerAccCount > 0 ? sumOwnerAcc / ownerAccCount : null;
  const avgDeadAcc = deadAccCount > 0 ? sumDeadAcc / deadAccCount : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Run {run.id.substring(0, 8)}</h1>
          <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
            <span>{run.model_version}</span>
            <span>•</span>
            <span>{run.prompt_version}</span>
            <span>•</span>
            <span>{new Date(run.started_at).toLocaleString()}</span>
            <span>•</span>
            <span className={`px-2 py-0.5 rounded-full font-medium text-xs ${
              run.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
              run.status === 'FAILED' ? 'bg-rose-100 text-rose-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {run.status}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Action F1" value={avgF1} />
        <MetricCard title="Action Precision" value={avgP} />
        <MetricCard title="Action Recall" value={avgR} />
        <MetricCard title="Review Precision" value={avgRevP} />
        <MetricCard title="Review Recall" value={avgRevR} />
        <MetricCard title="Owner Accuracy" value={avgOwnerAcc} isPercent />
        <MetricCard title="Deadline Accuracy" value={avgDeadAcc} isPercent />
        <MetricCard title="Total Failures" value={totalFailures} isRaw />
      </div>

      {/* Failure Distribution (CSS-based) */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-semibold">Failure Taxonomy</CardTitle>
          <CardDescription>Distribution of extraction errors</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {Object.keys(taxonomyCounts).length === 0 ? (
            <div className="text-center text-slate-500 text-sm py-4">No failures detected</div>
          ) : (
            <div className="space-y-3">
              {Object.entries(taxonomyCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([category, catCount]) => (
                <div key={category} className="flex items-center gap-4">
                  <div className="w-48 text-sm font-medium text-slate-700 truncate" title={category}>
                    {category.replace(/_/g, ' ')}
                  </div>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-rose-400 rounded-full" 
                      style={{ width: `${Math.max((catCount / totalFailures) * 100, 1)}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-sm text-slate-500">{catCount}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Samples List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Evaluation Samples</h3>
        {results.map((res, idx) => (
          <Card key={res.id} className="overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Sample {idx + 1}</CardTitle>
                <div className="text-xs font-medium text-slate-500">
                  F1: {((res.metrics?.f1 || 0) * 100).toFixed(1)}%
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 bg-slate-50 border-b border-slate-100">
                <p className="text-sm text-slate-700 font-mono text-xs whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {/* For MVP we don't have the transcript string in the result, 
                      but we can just show the failure overview */}
                  Ground Truth Actions: {res.ground_truth?.action_items?.length || 0} | Predicted Actions: {res.prediction?.action_items?.length || 0}
                </p>
              </div>
              
              {/* Failures Table */}
              {res.metrics?.failures && res.metrics.failures.length > 0 && (
                <div className="p-4">
                  <h4 className="text-xs font-semibold text-rose-700 uppercase tracking-wider mb-3">Detected Failures</h4>
                  <div className="space-y-3">
                    {res.metrics.failures.map((f: any, i: number) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 p-3 bg-rose-50/50 rounded-md border border-rose-100">
                        <div className="flex items-center gap-1.5 w-48 shrink-0">
                          <AlertCircle className="h-4 w-4 text-rose-500" />
                          <span className="text-sm font-medium text-rose-900">{f.category.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex-1 text-sm text-slate-700">
                          {f.task && <div className="mb-1"><span className="font-semibold">Task:</span> {f.task}</div>}
                          {f.expected !== undefined && <div><span className="font-semibold text-emerald-700">Expected:</span> {String(f.expected)}</div>}
                          {f.predicted !== undefined && <div><span className="font-semibold text-rose-700">Predicted:</span> {String(f.predicted)}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exact Match View (Side by Side) - Simplified for MVP */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                <div className="p-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Ground Truth</h4>
                  <pre className="text-xs bg-slate-50 p-2 rounded overflow-x-auto text-slate-800">
                    {JSON.stringify(res.ground_truth?.action_items || [], null, 2)}
                  </pre>
                </div>
                <div className="p-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Prediction</h4>
                  <pre className="text-xs bg-slate-50 p-2 rounded overflow-x-auto text-slate-800">
                    {JSON.stringify(res.prediction?.action_items || [], null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ title, value, isPercent = false, isRaw = false }: { title: string, value: number | null, isPercent?: boolean, isRaw?: boolean }) {
  if (value === null) return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-300">N/A</h3>
      </CardContent>
    </Card>
  );
  
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">
          {isRaw ? value : isPercent ? `${(value * 100).toFixed(1)}%` : `${(value * 100).toFixed(1)}%`}
        </h3>
      </CardContent>
    </Card>
  );
}
