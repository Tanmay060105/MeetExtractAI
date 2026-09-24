"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { fetchApi, ReviewDetailResponse, ActionStatus, ReviewDecision, ActionItemEdit } from "@/lib/api";
import { AlertCircle, CheckCircle2, ChevronLeft, Calendar, User, FileText, Check, X } from "lucide-react";
import Link from "next/link";

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
      <div className="rounded-md bg-red-50 p-4 border border-red-200">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
        <Button onClick={() => router.push("/dashboard/reviews")} variant="secondary" className="mt-4">
          Back to Queue
        </Button>
      </div>
    );
  }

  const { action_item, transcript_context, reviews } = data;
  const isNeedsReview = action_item.review_status === "NEEDS_REVIEW";

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Link href="/dashboard/reviews" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-4">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Review Queue
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Review Action Item</h1>
            <p className="text-slate-500 mt-1">Review validation flags and approve or reject this AI extraction.</p>
          </div>
          <Badge variant="outline" className={isNeedsReview ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-700"}>
            {action_item.review_status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {isNeedsReview && (
            <div className="rounded-md bg-amber-50 p-4 border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-3 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-amber-800">Flagged Reasons</h3>
                  <div className="mt-1 text-sm text-amber-700">
                    {action_item.review_reasons?.join(", ")}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {!isEditing ? (
                  <>
                    <Button 
                      variant="secondary" 
                      onClick={() => setIsEditing(true)}
                      className="bg-white border-amber-300 text-amber-700 hover:bg-amber-100"
                    >
                      Edit AI Output
                    </Button>
                    <Button 
                      onClick={() => submitDecision("APPROVED")}
                      disabled={isSubmitting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-1.5" />
                      Approve As Is
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="secondary" 
                      onClick={() => setIsEditing(false)}
                      className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      Cancel Edit
                    </Button>
                    <Button 
                      onClick={() => submitDecision("EDITED_AND_APPROVED")}
                      disabled={isSubmitting}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-1.5" />
                      Save & Approve
                    </Button>
                  </>
                )}
                <Button 
                  onClick={() => submitDecision("REJECTED")}
                  disabled={isSubmitting}
                  variant="danger"
                >
                  <X className="w-4 h-4 mr-1.5" />
                  Reject
                </Button>
              </div>
            </div>
          )}

          <Card>
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="text-base font-semibold">Action Item Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Task Description</label>
                {isEditing ? (
                  <Input 
                    value={editedTask} 
                    onChange={e => setEditedTask(e.target.value)} 
                    className="mt-1 font-medium"
                  />
                ) : (
                  <div className="mt-1 text-base font-medium text-slate-900">{action_item.task}</div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase flex items-center">
                    <User className="w-3 h-3 mr-1"/> Owner
                  </label>
                  {isEditing ? (
                    <Input 
                      value={editedOwner} 
                      onChange={e => setEditedOwner(e.target.value)} 
                      className="mt-1 h-9"
                    />
                  ) : (
                    <div className="mt-1 text-sm text-slate-700">{action_item.owner_name || "Unassigned"}</div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase flex items-center">
                    <Calendar className="w-3 h-3 mr-1"/> Deadline
                  </label>
                  <div className="mt-1 text-sm text-slate-700">
                    {action_item.deadline ? new Date(action_item.deadline).toLocaleString() : "None"}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">Status</label>
                  {isEditing ? (
                    <select 
                      value={editedStatus}
                      onChange={e => setEditedStatus(e.target.value as ActionStatus)}
                      className="mt-1 block w-full h-9 rounded-md border border-slate-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="BLOCKED">BLOCKED</option>
                    </select>
                  ) : (
                    <div className="mt-1 text-sm text-slate-700">{action_item.status}</div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">AI Confidence</label>
                  <div className="mt-1 text-sm text-slate-700">
                    {action_item.confidence !== null ? `${Math.round(action_item.confidence * 100)}%` : "N/A"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="border-b bg-slate-50/50 py-3">
              <CardTitle className="text-sm font-semibold flex items-center">
                <FileText className="w-4 h-4 mr-2 text-slate-500"/>
                AI Extracted Evidence
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm text-slate-700 italic">"{action_item.evidence}"</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b bg-slate-50/50 py-3">
              <CardTitle className="text-sm font-semibold">Meeting Context</CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm text-slate-600">
              <div className="font-medium text-slate-900 mb-2">{action_item.meeting_title}</div>
              <div className="h-64 overflow-y-auto whitespace-pre-wrap bg-slate-50 p-3 rounded border text-xs">
                {transcript_context || "No transcript available for this meeting."}
              </div>
            </CardContent>
          </Card>

          {reviews.length > 0 && (
            <Card>
              <CardHeader className="border-b bg-slate-50/50 py-3">
                <CardTitle className="text-sm font-semibold">Review History</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="text-sm border-l-2 border-indigo-200 pl-3">
                    <div className="font-medium text-slate-900 flex justify-between">
                      {rev.decision}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(rev.created_at).toLocaleString()}
                    </div>
                    {rev.notes && <div className="mt-1 text-slate-600">{rev.notes}</div>}
                    {rev.new_value && (
                      <div className="mt-2 p-2 bg-slate-50 rounded border text-xs overflow-auto">
                        <div className="font-medium mb-1">Edits applied:</div>
                        <pre>{JSON.stringify(rev.new_value, null, 2)}</pre>
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
