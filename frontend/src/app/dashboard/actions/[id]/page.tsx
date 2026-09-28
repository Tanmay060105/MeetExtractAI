"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { fetchApi, ActionItemWithMeeting, ActionStatus } from "@/lib/api";
import { AlertCircle, Calendar, ChevronLeft, Link as LinkIcon, User, CheckCircle2, ChevronRight, Video, Sparkles } from "lucide-react";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { EvidenceBlock } from "@/components/ui/evidence-block";
import { AIContext } from "@/components/ui/ai-context";

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
      <div className="space-y-4">
        <Alert variant="destructive">
          {error || "Item not found"}
        </Alert>
        <Button onClick={() => router.push("/dashboard/actions")} variant="secondary">
          Back to Actions
        </Button>
      </div>
    );
  }

  const reviewTargetId = item.latest_review_id || item.id;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/actions" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-2">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Action Items
      </Link>
      
      <SectionHeader 
        title="Action Detail" 
        description="Review and manage this task."
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Action Status:</span>
            <select
              value={item.status}
              onChange={(e) => handleStatusChange(e.target.value as ActionStatus)}
              disabled={isUpdating}
              className="text-sm font-medium rounded-md border border-slate-200 py-1.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="BLOCKED">Blocked</option>
              <option value="NEEDS_REVIEW" disabled>Needs Review</option>
            </select>
        </div>
      </SectionHeader>

      {item.review_status === "NEEDS_REVIEW" && (
        <Alert variant="warning" className="border-amber-200 bg-amber-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-amber-600 mr-3 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-amber-800">Review Required</h3>
              <div className="mt-1 text-sm text-amber-700">
                This item was flagged during validation: {item.review_reasons?.join(", ")}
              </div>
            </div>
          </div>
          <Link href={`/dashboard/reviews/${reviewTargetId}`} className="shrink-0">
            <Button variant="secondary" className="bg-white border-amber-300 text-amber-700 hover:bg-amber-100 font-semibold shadow-sm">
              Resolve in Review Queue <ChevronRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </Alert>
      )}

      {item.review_status === "REVIEWED" && item.latest_review_id && (
        <Alert variant="success" className="border-emerald-200 bg-emerald-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mr-3 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-emerald-800">Action Item Reviewed</h3>
              <div className="mt-1 text-sm text-emerald-700">
                This item has been reviewed and approved.
              </div>
            </div>
          </div>
          <Link href={`/dashboard/reviews/${reviewTargetId}`} className="shrink-0">
            <Button variant="outline" className="bg-white border-emerald-300 text-emerald-700 hover:bg-emerald-100 font-semibold shadow-sm">
              View Review Record <ChevronRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="border-b bg-slate-50/50 pb-6 rounded-t-xl">
                <CardTitle className="text-xl leading-relaxed text-slate-900">{item.task}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  <div className="p-6 space-y-6">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Assignment</h4>
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 mr-2 text-slate-400" />
                        <span className={item.owner_name ? "text-slate-900 font-medium" : "text-slate-400 italic"}>
                          {item.owner_name || "Unassigned"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Deadline</h4>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                        <span className={item.deadline ? "text-slate-900 font-medium" : "text-slate-400 italic"}>
                          {item.deadline ? new Date(item.deadline).toLocaleString() : "No deadline set"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Source Meeting</h4>
                      <div className="flex items-center text-sm">
                        <Video className="h-4 w-4 mr-2 text-slate-400" />
                        <Link href={`/dashboard/meetings/${item.meeting_id}`} className="text-indigo-600 font-medium hover:underline truncate">
                          {item.meeting_title}
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-6 bg-slate-50/30">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Validation State</h4>
                      <StatusIndicator status={item.validation_status} />
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Review State</h4>
                      <StatusIndicator status={item.review_status} />
                    </div>

                    {item.confidence !== null && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">AI Confidence</h4>
                        <div className="flex items-center bg-violet-50 text-violet-700 px-3 py-1.5 rounded-md text-sm font-medium border border-violet-100 w-fit">
                          <Sparkles className="w-4 h-4 mr-1.5" />
                          {Math.round(item.confidence * 100)}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {item.evidence && (
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="border-b bg-slate-50/50 py-4">
                  <CardTitle className="text-sm font-semibold flex items-center">
                    <LinkIcon className="w-4 h-4 mr-2 text-slate-400" />
                    Source Evidence
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                   <EvidenceBlock evidence={item.evidence} sourceLocation={item.source_location ? JSON.stringify(item.source_location) : null} className="bg-yellow-50/50 border-yellow-100 shadow-none" />
                </CardContent>
              </Card>
            )}
         </div>

         <div className="space-y-6">
            <AIContext confidence={item.confidence} label="Extraction Profile">
               <p className="text-sm text-slate-600 leading-relaxed">
                  This action item was extracted from <strong>{item.meeting_title}</strong>. 
                  The AI model assigned a {item.confidence !== null ? `${Math.round(item.confidence * 100)}%` : "N/A"} confidence score to this extraction based on the clarity of the commitment in the transcript.
               </p>
            </AIContext>
         </div>
      </div>
    </div>
  );
}
