"use client";

import { useEffect, useState, use } from "react";
import { fetchApi, Meeting, Transcript, ActionItem } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle2, FileText, ChevronLeft, User, Lightbulb, ShieldAlert, Sparkles, ArrowRight, CheckSquare } from "lucide-react";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { SectionHeader } from "@/components/ui/section-header";
import { AIContext } from "@/components/ui/ai-context";
import { EvidenceBlock } from "@/components/ui/evidence-block";

export default function MeetingDetailsPage({ params }: { params: Promise<{ meetingId: string }> }) {
  const { meetingId } = use(params);

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMeeting = async () => {
    try {
      const data = await fetchApi<Meeting>(`/meetings/${meetingId}`);
      setMeeting(data);
      
      // If completed, load details
      if (data.processing_status === "COMPLETED") {
        try {
          const [tData, aData] = await Promise.all([
            fetchApi<Transcript>(`/meetings/${meetingId}/transcript`),
            fetchApi<ActionItem[]>(`/meetings/${meetingId}/action-items`)
          ]);
          setTranscript(tData);
          setActionItems(aData);
        } catch (detailErr) {
          console.error("Error loading details:", detailErr);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load meeting");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMeeting();
  }, [meetingId]);

  // Polling logic for pending/processing meetings
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (meeting && !["COMPLETED", "FAILED"].includes(meeting.processing_status)) {
      intervalId = setInterval(() => {
        loadMeeting();
      }, 3000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [meeting]);

  if (isLoading && !meeting) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spinner className="h-10 w-10 text-indigo-600" />
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/meetings" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to meetings
        </Link>
        <Alert variant="destructive" title="Error loading meeting">
          {error || "Meeting not found"}
        </Alert>
      </div>
    );
  }

  const needsReviewCount = actionItems.filter(a => a.review_status === "NEEDS_REVIEW").length;
  const avgConfidence = actionItems.length > 0 
    ? actionItems.reduce((acc, curr) => acc + (curr.confidence || 0), 0) / actionItems.length 
    : 0;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/meetings" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 transition-colors mb-2">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to meetings
      </Link>
      
      <SectionHeader 
        title={meeting.title} 
        description={`Source: ${meeting.source_type || "Unknown"} • ${new Date(meeting.created_at).toLocaleDateString()}`}
      >
        <StatusIndicator status={meeting.processing_status} spin={meeting.processing_status === "PROCESSING"} pulse={meeting.processing_status === "PROCESSING"} />
        {needsReviewCount > 0 && (
          <Link href="/dashboard/reviews">
            <Button variant="outline" size="sm" className="border-amber-200 text-amber-700 hover:bg-amber-50">
              {needsReviewCount} Action(s) Need Review
            </Button>
          </Link>
        )}
      </SectionHeader>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 w-full justify-start overflow-x-auto bg-transparent border-b border-slate-200 rounded-none h-12 p-0">
          <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-6">Overview</TabsTrigger>
          <TabsTrigger value="transcript" disabled={!transcript} className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-6 disabled:opacity-50">Transcript</TabsTrigger>
          <TabsTrigger value="actions" disabled={meeting.processing_status !== "COMPLETED"} className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-6 flex items-center gap-2 disabled:opacity-50">
            Action Items
            {actionItems.length > 0 && (
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-medium">{actionItems.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-6 disabled:opacity-50">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="focus-visible:outline-none">
          {meeting.processing_status !== "COMPLETED" && meeting.processing_status !== "FAILED" ? (
             <div className="flex flex-col items-center justify-center py-16 border rounded-xl border-dashed border-slate-200 bg-slate-50/50">
                <Spinner className="h-8 w-8 text-indigo-500 mb-4" />
                <h3 className="text-sm font-semibold text-slate-900">Processing Meeting</h3>
                <p className="text-sm text-slate-500 mt-1">AI is currently extracting intelligence from this meeting...</p>
             </div>
          ) : meeting.processing_status === "FAILED" ? (
             <Alert variant="destructive" title="Extraction Failed">
               There was an error processing this meeting. Please try uploading it again.
             </Alert>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Primary Workspace - Left Column */}
              <div className="lg:col-span-2 space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                    <CheckSquare className="w-5 h-5 mr-2 text-indigo-500" />
                    Extracted Action Items
                  </h2>
                  <Button variant="ghost" size="sm" className="text-indigo-600 p-0 hover:bg-transparent" onClick={() => {
                    const tabTrigger = document.querySelector('[value="actions"]') as HTMLElement;
                    tabTrigger?.click();
                  }}>
                    View All {actionItems.length} <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  {actionItems.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {actionItems.slice(0, 5).map((item) => (
                        <div key={item.id} className={`p-4 hover:bg-slate-50 transition-colors ${item.review_status === 'NEEDS_REVIEW' ? 'bg-amber-50/30' : ''}`}>
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-slate-900 text-base leading-snug">{item.task}</h4>
                              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                                <div className="flex items-center">
                                  <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                  <span className={item.owner_name ? "text-slate-700 font-medium" : "italic"}>{item.owner_name || "Unassigned"}</span>
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                  <span className={item.deadline ? "text-slate-700 font-medium" : "italic"}>{item.deadline ? new Date(item.deadline).toLocaleDateString() : "No deadline"}</span>
                                </div>
                                {item.confidence !== null && (
                                  <div className="flex items-center text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded font-medium">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    {Math.round(item.confidence * 100)}%
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                              <StatusIndicator status={item.status} />
                              {item.review_status === "NEEDS_REVIEW" && (
                                <StatusIndicator status="NEEDS_REVIEW" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-slate-500 text-sm">
                      <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300 mb-3" />
                      No action items were extracted.
                    </div>
                  )}
                </div>

                {needsReviewCount > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start">
                    <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5 mr-3 shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-amber-800">Human Review Required</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        {needsReviewCount} action item{needsReviewCount > 1 ? 's' : ''} require your validation before they are marked as verified.
                      </p>
                      <Link href="/dashboard/reviews">
                        <Button size="sm" variant="outline" className="mt-3 bg-white border-amber-200 text-amber-700 hover:bg-amber-50">
                          Process Queue
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Secondary Context - Right Column */}
              <div className="space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2 text-violet-500" />
                    Intelligence Summary
                  </h2>
                </div>

                <div className="bg-violet-50/50 rounded-xl border border-violet-100 p-5">
                   <div className="flex items-center justify-between mb-4">
                     <span className="text-xs font-semibold uppercase tracking-wider text-violet-700 flex items-center">
                       <Sparkles className="w-3.5 h-3.5 mr-1" /> AI Extraction
                     </span>
                     <span className="text-lg font-bold text-violet-700">{Math.round(avgConfidence * 100)}%</span>
                   </div>
                   
                   <p className="text-sm text-slate-700 leading-relaxed mb-6">
                     This meeting generated <strong className="text-slate-900">{actionItems.length}</strong> tasks. The AI extracted these action items directly from the transcript timeline.
                   </p>
                   
                   <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-lg p-3 border border-slate-100 text-center shadow-sm">
                        <div className="text-2xl font-bold tracking-tight text-slate-900">{actionItems.length}</div>
                        <div className="text-[10px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">Total Actions</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-amber-100 text-center shadow-sm">
                        <div className="text-2xl font-bold tracking-tight text-amber-600">{needsReviewCount}</div>
                        <div className="text-[10px] font-semibold text-amber-600 mt-1 uppercase tracking-wider">Needs Review</div>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Meeting Metadata</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</div>
                      <StatusIndicator status={meeting.processing_status} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Processed On</div>
                      <div className="text-sm font-medium text-slate-900">{new Date(meeting.created_at).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Source Material</div>
                      <div className="text-sm font-medium text-slate-900 flex items-center">
                        <FileText className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        {meeting.source_type || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="transcript" className="focus-visible:outline-none">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-100 p-4 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Meeting Transcript</h3>
                <p className="text-xs text-slate-500 mt-0.5">Raw extracted text from the source document.</p>
              </div>
            </div>
            <div className="max-h-[600px] overflow-y-auto p-6">
              {transcript?.normalized_text ? (
                <div className="prose prose-sm prose-slate max-w-none font-sans leading-relaxed whitespace-pre-wrap">
                  {transcript.normalized_text}
                </div>
              ) : transcript?.raw_text ? (
                <div className="prose prose-sm prose-slate max-w-none font-sans leading-relaxed whitespace-pre-wrap">
                  {transcript.raw_text}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-sm">
                  Transcript content is empty or unavailable.
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="actions" className="focus-visible:outline-none">
          <div className="space-y-4">
            {actionItems.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-xl shadow-sm">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-slate-50 p-4 rounded-full mb-4">
                    <CheckCircle2 className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-base font-medium text-slate-900 mb-1">No action items found</h3>
                  <p className="text-sm text-slate-500 max-w-sm">
                    The AI did not extract any specific action items or tasks from this meeting.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {actionItems.map(item => (
                    <div key={item.id} className={`p-5 transition-colors hover:bg-slate-50 ${item.review_status === 'NEEDS_REVIEW' ? 'bg-amber-50/10' : ''}`}>
                      <div className="flex flex-col lg:flex-row lg:items-start gap-6 justify-between">
                        <div className="space-y-4 flex-1">
                          <div className="flex items-start gap-3">
                            <h4 className="font-semibold text-slate-900 text-base leading-snug">{item.task}</h4>
                            {item.review_status === "NEEDS_REVIEW" && (
                              <div className="mt-0.5 shrink-0">
                                <StatusIndicator status="NEEDS_REVIEW" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                            <div className="flex items-center">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-2">Owner</span>
                              <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                              <span className={item.owner_name ? "font-medium text-slate-700" : "italic text-slate-500"}>
                                {item.owner_name || "Unassigned"}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-2">Deadline</span>
                              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                              <span className={!item.deadline ? "italic text-slate-500" : (new Date(item.deadline) < new Date() && item.status !== "COMPLETED" ? "text-rose-600 font-medium" : "font-medium text-slate-700")}>
                                {item.deadline ? new Date(item.deadline).toLocaleDateString() : "None"}
                              </span>
                            </div>
                            {item.confidence !== null && (
                              <div className="flex items-center">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-2">Confidence</span>
                                <span className="text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded font-medium text-xs flex items-center">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  {Math.round(item.confidence * 100)}%
                                </span>
                              </div>
                            )}
                          </div>

                          {item.evidence && (
                            <EvidenceBlock evidence={item.evidence} sourceLocation={item.source_location ? JSON.stringify(item.source_location) : null} className="mt-3" />
                          )}
                        </div>
                        
                        <div className="flex lg:flex-col items-center lg:items-end gap-3 shrink-0 lg:w-48 lg:border-l lg:border-slate-100 lg:pl-6 pt-4 lg:pt-0 border-t border-slate-100 lg:border-t-0">
                          <div className="w-full">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Action Status</div>
                            <StatusIndicator status={item.status} className="w-full justify-center" />
                          </div>
                          <div className="w-full">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Validation</div>
                            <StatusIndicator status={item.validation_status} className="w-full justify-center" />
                          </div>
                          <Link href={`/dashboard/actions/${item.id}`} className="w-full mt-2 hidden lg:block">
                            <Button variant="outline" className="w-full text-xs h-8 bg-white shadow-sm">View Details</Button>
                          </Link>
                        </div>
                      </div>
                      <Link href={`/dashboard/actions/${item.id}`} className="mt-4 block lg:hidden">
                        <Button variant="outline" className="w-full text-xs h-9 bg-white shadow-sm">View Details</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="focus-visible:outline-none">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-violet-50 p-5 rounded-full mb-5 border border-violet-100 shadow-sm">
                <Lightbulb className="h-8 w-8 text-violet-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Meeting Insights</h3>
              <p className="text-sm text-slate-500 max-w-sm mb-8">
                Thematic intelligence and conversational metrics are currently being analyzed across your workspace.
              </p>
              <div className="w-full max-w-lg text-left bg-slate-50 border border-slate-100 rounded-xl p-6">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-violet-500" />
                    AI Summary
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    This meeting generated <strong className="text-slate-900">{actionItems.length}</strong> tasks with an average AI extraction confidence of <strong className="text-violet-700">{Math.round(avgConfidence * 100)}%</strong>. {needsReviewCount > 0 ? "Some items require human validation." : "All items have been validated."}
                  </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
