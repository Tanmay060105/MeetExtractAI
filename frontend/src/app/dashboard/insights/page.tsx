"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { fetchApi, InsightsDistribution } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, LineChart, BarChart3, PieChart, Users, Calendar } from "lucide-react";
import { Alert } from "@/components/ui/alert";

export default function InsightsPage() {
  const [data, setData] = useState<InsightsDistribution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const insightsData = await fetchApi<InsightsDistribution>("/analytics/insights");
        setData(insightsData);
      } catch (err: any) {
        setError(err.message || "Failed to load insights data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInsights();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spinner className="h-10 w-10 text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        {error}
      </Alert>
    );
  }

  if (!data) return null;

  // Calculate totals for percentages
  const totalStatus = data.by_status.reduce((acc, curr) => acc + curr.count, 0);
  const totalConfidence = data.by_confidence.high + data.by_confidence.medium + data.by_confidence.low;
  const totalDeadline = data.by_deadline.overdue + data.by_deadline.due_soon + data.by_deadline.upcoming + data.by_deadline.no_deadline;

  if (totalStatus === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Insights</h1>
          <p className="text-slate-500 mt-1">Analytics and reporting across all your meetings.</p>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <LineChart className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No Action Items</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-sm">
                Upload a meeting to generate insights.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Insights</h1>
          <p className="text-slate-500 mt-1">Analytics and reporting across all your meetings.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-500" />
              <CardTitle className="text-lg">Action Status Overview</CardTitle>
            </div>
            <CardDescription>Distribution of action items by their current status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.by_status.map((statusItem) => (
              <div key={statusItem.status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{statusItem.status.replace("_", " ")}</span>
                  <span className="text-slate-500">{statusItem.count} ({Math.round((statusItem.count / totalStatus) * 100) || 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${(statusItem.count / totalStatus) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Confidence Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-slate-500" />
              <CardTitle className="text-lg">Confidence Distribution</CardTitle>
            </div>
            <CardDescription>AI extraction confidence levels across action items.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {totalConfidence === 0 ? (
              <div className="text-sm text-slate-500 text-center py-8">No confidence data available.</div>
            ) : (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">High (90-100%)</span>
                    <span className="text-slate-500">{data.by_confidence.high} ({Math.round((data.by_confidence.high / totalConfidence) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${(data.by_confidence.high / totalConfidence) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">Medium (70-89%)</span>
                    <span className="text-slate-500">{data.by_confidence.medium} ({Math.round((data.by_confidence.medium / totalConfidence) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${(data.by_confidence.medium / totalConfidence) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">Low (0-69%)</span>
                    <span className="text-slate-500">{data.by_confidence.low} ({Math.round((data.by_confidence.low / totalConfidence) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${(data.by_confidence.low / totalConfidence) * 100}%` }}></div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Owner Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-500" />
              <CardTitle className="text-lg">Owner Distribution</CardTitle>
            </div>
            <CardDescription>Action items assigned by owner.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {data.by_owner.length === 0 ? (
                <div className="text-sm text-slate-500 text-center py-8">No owner data available.</div>
              ) : (
                data.by_owner.map((ownerItem) => (
                  <div key={ownerItem.owner}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`font-medium ${ownerItem.owner === "Unassigned" ? "text-slate-400 italic" : "text-slate-700"}`}>
                        {ownerItem.owner}
                      </span>
                      <span className="text-slate-500">{ownerItem.count}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div 
                        className={`${ownerItem.owner === "Unassigned" ? "bg-slate-300" : "bg-blue-500"} h-2.5 rounded-full`} 
                        style={{ width: `${(ownerItem.count / totalStatus) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Deadline Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-500" />
              <CardTitle className="text-lg">Deadline Analytics</CardTitle>
            </div>
            <CardDescription>Status of deadlines across all unfinished items.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {totalDeadline === 0 ? (
              <div className="text-sm text-slate-500 text-center py-8">No deadline data available.</div>
            ) : (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">Overdue</span>
                    <span className="text-slate-500">{data.by_deadline.overdue} ({Math.round((data.by_deadline.overdue / totalDeadline) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${(data.by_deadline.overdue / totalDeadline) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">Due Soon (Next 7 days)</span>
                    <span className="text-slate-500">{data.by_deadline.due_soon} ({Math.round((data.by_deadline.due_soon / totalDeadline) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${(data.by_deadline.due_soon / totalDeadline) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">Upcoming (7+ days or Completed)</span>
                    <span className="text-slate-500">{data.by_deadline.upcoming} ({Math.round((data.by_deadline.upcoming / totalDeadline) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${(data.by_deadline.upcoming / totalDeadline) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">No Deadline</span>
                    <span className="text-slate-500">{data.by_deadline.no_deadline} ({Math.round((data.by_deadline.no_deadline / totalDeadline) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-slate-300 h-2.5 rounded-full" style={{ width: `${(data.by_deadline.no_deadline / totalDeadline) * 100}%` }}></div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
