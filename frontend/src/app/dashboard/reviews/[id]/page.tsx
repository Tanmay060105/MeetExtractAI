"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { fetchApi, ReviewDetailResponse, ActionStatus, ReviewDecision, ActionItemEdit } from "@/lib/api";
import { Check, X, ChevronLeft, Calendar, User, FileText, Pencil, Save, XCircle, FileSearch, Search, AlertCircle, Clock, Sparkles, Video } from "lucide-react";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { AIContext } from "@/components/ui/ai-context";
import { EvidenceBlock } from "@/components/ui/evidence-block";

export default function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const actionItemId = resolvedParams.id;
  
  const [data, setData] = useState<ReviewDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edits state
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState("");
  const [editedOwner, setEditedOwner] = useState("");
  const [editedStatus, setEditedStatus] = useState<ActionStatus>("PENDING");

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const details = await fetchApi<ReviewDetailResponse>(`/reviews/${actionItemId}`);
        setData(details);
        setEditedTask(details.action_item.task);
        setEditedOwner(details.action_item.owner_name || "");
        setEditedStatus(details.action_item.status);
      } catch (err: any) {
        setError(err.message || "Failed to load review context");
      } finally {
        setIsLoading(false);
      }
    };
    loadDetails();
  }, [actionItemId]);

  const submitDecision = async (decision: ReviewDecision) => {
    setIsSubmitting(true);
    try {
      let edits: ActionItemEdit | undefined;
      
      if (decision === "EDITED_AND_APPROVED") {
        edits = {
          task: editedTask !== data?.action_item.task ? editedTask : undefined,
          owner_name: editedOwner !== (data?.action_item.owner_name || "") ? editedOwner : undefined,
          status: editedStatus !== data?.action_item.status ? editedStatus : undefined,
        };
      }

      await fetchApi(`/reviews/${actionItemId}`, {
        method: "POST",
        body: JSON.stringify({ decision, notes: "Reviewed via UI", edits })
      });
      
      router.push("/dashboard/reviews");
    } catch (err: any) {
      alert(`Failed to submit review: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spinner className="h-10 w-10 text-indigo-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          {error || "Item not found"}
        </Alert>
        <Button onClick={() => router.push("/dashboard/reviews")} variant="secondary">
          Back to Queue
        </Button>
      </div>
    );
  }

  const { action_item, transcript_context, reviews } = data;
  const isNeedsReview = action_item.review_status === "NEEDS_REVIEW";

  return (
    <div className="space-y-6">
      <Link href="/dashboard/reviews" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-2">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Review Queue
      </Link>
      
      <SectionHeader 
        title="Review Action Item" 
        description="Verify the AI-extracted task against the original transcript evidence."
      >
        <StatusIndicator status={action_item.review_status} />
      </SectionHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Action Item & Decision */}
        <div className="space-y-6">
          
          {isNeedsReview && action_item.review_reasons && action_item.review_reasons.length > 0 && (
             <Alert variant="warning" className="border-amber-200 bg-amber-50">
               <AlertCircle className="w-4 h-4 text-amber-600" />
               <div className="ml-2 font-medium text-amber-800">Flagged for Review</div>
               <div className="ml-2 mt-1 text-sm text-amber-700">
                 {action_item.review_reasons.join(" • ")}
               </div>
             </Alert>
          )}

          <div className="bg-white rounded-xl border border-violet-200 shadow-sm overflow-hidden flex flex-col h-full ring-1 ring-violet-50">
            <div className="border-b border-violet-100 bg-violet-50/50 py-3 px-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-violet-800 flex items-center uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  AI Extraction
                </h3>
                <div className="flex items-center gap-2">
                  <StatusIndicator status={action_item.status} />
                  <StatusIndicator status={action_item.validation_status} />
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6 flex-1">
              
              <AIContext confidence={action_item.confidence} highlight={true}>
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Task Description</label>
                    {isEditing ? (
                      <Input 
                        value={editedTask} 
                        onChange={e => setEditedTask(e.target.value)} 
                        className="font-medium bg-white"
                      />
                    ) : (
                      <div className="text-base font-medium text-slate-900">{action_item.task}</div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center">
                        <User className="w-3.5 h-3.5 mr-1 text-slate-400"/> Owner
                      </label>
                      {isEditing ? (
                        <Input 
                          value={editedOwner} 
                          onChange={e => setEditedOwner(e.target.value)} 
                          className="h-9 bg-white"
                        />
                      ) : (
                        <div className="text-sm font-medium text-slate-700">{action_item.owner_name || "Unassigned"}</div>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400"/> Deadline
                      </label>
                      <div className="text-sm font-medium text-slate-700">
                        {action_item.deadline ? new Date(action_item.deadline).toLocaleString() : "No deadline"}
                      </div>
                    </div>
                    
                    {isEditing && (
                      <div className="col-span-2 mt-2 pt-2 border-t border-slate-200">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-slate-400"/> Action Status
                        </label>
                        <select 
                          value={editedStatus}
                          onChange={e => setEditedStatus(e.target.value as ActionStatus)}
                          className="block w-full h-9 rounded-md border border-slate-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 bg-white"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="BLOCKED">BLOCKED</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </AIContext>
            </div>

            {isNeedsReview && (
              <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center">
                   {!isEditing ? (
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(true)}
                        className="bg-white"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit Details
                      </Button>
                   ) : (
                      <Button 
                        variant="ghost" 
                        onClick={() => setIsEditing(false)}
                        className="text-slate-600 hover:text-slate-900"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel Edits
                      </Button>
                   )}
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    variant="outline"
                    onClick={() => submitDecision("REJECTED")}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none border-rose-200 text-rose-700 hover:bg-rose-50"
                  >
                    <X className="w-4 h-4 mr-1.5" />
                    Reject
                  </Button>
                  
                  {!isEditing ? (
                    <Button 
                      onClick={() => submitDecision("APPROVED")}
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-1.5" />
                      Approve
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => submitDecision("EDITED_AND_APPROVED")}
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-1.5" />
                      Edit & Approve
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Transcript Context & Evidence */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="border-b border-slate-100 bg-slate-50/80 py-3 px-5">
              <h3 className="text-sm font-bold text-slate-700 flex items-center uppercase tracking-wider">
                <FileSearch className="w-4 h-4 mr-1.5 text-slate-500"/>
                Transcript Evidence
              </h3>
            </div>
            <div className="flex-1 flex flex-col">
               {action_item.evidence && (
                  <div className="p-5 border-b border-slate-100 bg-amber-50/20">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Target Evidence</div>
                    <EvidenceBlock evidence={action_item.evidence} className="bg-white border-amber-100 shadow-sm" />
                  </div>
               )}
              <div className="p-5 flex-1 flex flex-col min-h-0">
                 <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                   <Video className="w-3.5 h-3.5 mr-1" />
                   {action_item.meeting_title}
                 </div>
                 <div className="flex-1 overflow-y-auto whitespace-pre-wrap bg-slate-50 p-4 rounded-md border border-slate-200 text-sm font-sans leading-relaxed text-slate-700 h-64 lg:h-auto max-h-96">
                   {transcript_context || "No transcript context available."}
                 </div>
              </div>
            </div>
          </div>

          {reviews.length > 0 && (
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="border-b bg-slate-50/50 py-3">
                <CardTitle className="text-sm font-semibold">Review History</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="text-sm border-l-2 border-slate-200 pl-4 py-1 relative">
                    <div className="absolute w-2 h-2 bg-slate-300 rounded-full -left-[5px] top-2"></div>
                    <div className="font-medium text-slate-900">
                      {rev.decision === "APPROVED" && <span className="text-emerald-700">Approved</span>}
                      {rev.decision === "EDITED_AND_APPROVED" && <span className="text-indigo-700">Edited & Approved</span>}
                      {rev.decision === "REJECTED" && <span className="text-rose-700">Rejected</span>}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {new Date(rev.created_at).toLocaleString()}
                    </div>
                    {rev.notes && <div className="mt-1.5 text-slate-600">{rev.notes}</div>}
                    {rev.new_value && (
                      <div className="mt-2 p-2 bg-slate-50 rounded border text-xs overflow-auto">
                        <div className="font-medium mb-1">Edits applied:</div>
                        <pre className="text-slate-600 font-mono text-[11px]">{JSON.stringify(rev.new_value, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}
