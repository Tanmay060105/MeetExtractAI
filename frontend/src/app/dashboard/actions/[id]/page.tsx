"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { fetchApi, ActionItemWithMeeting, ActionStatus } from "@/lib/api";
import { AlertCircle, Calendar, ChevronLeft, Link as LinkIcon, User, CheckCircle2, Clock, XCircle, HelpCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

function getStatusIcon(status: ActionStatus) {
  switch (status) {
    case "COMPLETED": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case "IN_PROGRESS": return <Clock className="w-4 h-4 text-blue-500" />;
    case "BLOCKED": return <XCircle className="w-4 h-4 text-red-500" />;
    case "NEEDS_REVIEW": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    default: return <HelpCircle className="w-4 h-4 text-slate-400" />;
  }
}

function getStatusBadgeClass(status: ActionStatus) {
  switch (status) {
    case "COMPLETED": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "IN_PROGRESS": return "bg-blue-50 text-blue-700 border-blue-200";
    case "BLOCKED": return "bg-red-50 text-red-700 border-red-200";
    case "NEEDS_REVIEW": return "bg-amber-50 text-amber-700 border-amber-200";
    default: return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

export default function ActionItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const actionId = resolvedParams.id;
  const [item, setItem] = useState<ActionItemWithMeeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadItem = async () => {
      try {
        const data = await fetchApi<ActionItemWithMeeting[]>(`/action-items`);
        const found = data.find(i => i.id === actionId);
        if (found) {
          setItem(found);
        } else {
          setError("Action item not found.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load action item");
      } finally {
        setIsLoading(false);
      }
    };
    loadItem();
  }, [actionId]);

  const handleStatusChange = async (newStatus: ActionStatus) => {
    if (!item || newStatus === item.status) return;
    setIsUpdating(true);
    try {
      const updated = await fetchApi<ActionItemWithMeeting>(`/action-items/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setItem(updated);
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spinner className="h-10 w-10 text-indigo-600" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="rounded-md bg-red-50 p-4 border border-red-200">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
        <Button onClick={() => router.push("/dashboard/actions")} variant="secondary" className="mt-4">
          Back to Actions
        </Button>
      </div>
    );
  }

  const reviewTargetId = item.latest_review_id || item.id;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link href="/dashboard/actions" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-4">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Action Items
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Action Detail</h1>
            <p className="text-slate-500 mt-1">Review and manage this task.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Status:</span>
            <select
              value={item.status}
              onChange={(e) => handleStatusChange(e.target.value as ActionStatus)}
              disabled={isUpdating}
              className={`text-sm rounded-md border py-1.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${getStatusBadgeClass(item.status)}`}
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="BLOCKED">Blocked</option>
              <option value="NEEDS_REVIEW" disabled>Needs Review</option>
            </select>
          </div>
        </div>
      </div>

      {item.review_status === "NEEDS_REVIEW" && (
        <div className="rounded-md bg-amber-50 p-4 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-3 shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-amber-800">Review Required</h3>
              <div className="mt-1 text-sm text-amber-700">
                This item was flagged during validation: {item.review_reasons?.join(", ")}
              </div>
            </div>
          </div>
          <Link href={`/dashboard/reviews/${reviewTargetId}`} className="shrink-0">
            <Button variant="secondary" className="bg-white border-amber-300 text-amber-700 hover:bg-amber-50">
              Go to Review
            </Button>
          </Link>
        </div>
      )}

      {item.review_status === "REVIEWED" && item.latest_review_id && (
        <div className="rounded-md bg-indigo-50 p-4 border border-indigo-200 flex justify-between items-center">
          <div className="flex">
            <CheckCircle2 className="h-5 w-5 text-indigo-500 mr-3 shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-indigo-800">Action Item Reviewed</h3>
              <div className="mt-1 text-sm text-indigo-700">
                This item has been reviewed and approved.
              </div>
            </div>
          </div>
          <Link href={`/dashboard/reviews/${reviewTargetId}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
            View Record
          </Link>
        </div>
      )}

      <Card>
        <CardHeader className="border-b bg-slate-50/50 pb-6">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-xl leading-relaxed">{item.task}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-2">Assignment</h4>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-slate-400" />
                <span className={item.owner_name ? "text-slate-900" : "text-slate-400 italic"}>
                  {item.owner_name || "Unassigned"}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-2">Deadline</h4>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                <span className={item.deadline ? "text-slate-900" : "text-slate-400 italic"}>
                  {item.deadline ? new Date(item.deadline).toLocaleString() : "No deadline set"}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-2">Source Meeting</h4>
              <div className="flex items-center">
                <LinkIcon className="h-4 w-4 mr-2 text-slate-400" />
                <Link href={`/dashboard/meetings/${item.meeting_id}`} className="text-indigo-600 hover:underline">
                  {item.meeting_title}
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-2">Validation Status</h4>
              <Badge variant="outline" className="capitalize">
                {item.validation_status.toLowerCase()}
              </Badge>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-2">Review Status</h4>
              <Badge variant="outline" className="capitalize">
                {item.review_status.toLowerCase()}
              </Badge>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-2">AI Confidence</h4>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${(item.confidence || 0) >= 0.8 ? "bg-emerald-500" : (item.confidence || 0) >= 0.5 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${(item.confidence || 0) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-slate-600 font-medium w-10 text-right">
                  {Math.round((item.confidence || 0) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {item.evidence && (
            <div className="col-span-1 md:col-span-2 mt-2 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-medium text-slate-500 mb-3">Extracted Evidence</h4>
              <div className="bg-slate-50 rounded-md p-4 text-sm text-slate-700 italic border border-slate-100 leading-relaxed">
                "{item.evidence}"
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
