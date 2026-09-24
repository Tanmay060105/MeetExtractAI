"use client";

import { useEffect, useState, use } from "react";
import { fetchApi, Meeting, Transcript, ActionItem } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Calendar, CheckCircle2, Clock, FileText, ChevronLeft, Search, User, Lightbulb } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MeetingDetailsPage({ params }: { params: Promise<{ meetingId: string }> }) {
  const router = useRouter();
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
    
    if (meeting && (meeting.processing_status === "PENDING" || meeting.processing_status === "PROCESSING")) {
      intervalId = setInterval(() => {
        loadMeeting();
      }, 3000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [meeting]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800 border-0"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>;
      case "PENDING":
        return <Badge className="bg-blue-100 text-blue-800 border-0"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "PROCESSING":
        return <Badge className="bg-blue-100 text-blue-800 border-0"><Clock className="w-3 h-3 mr-1 animate-spin" /> Processing</Badge>;
      case "FAILED":
        return <Badge className="bg-red-100 text-red-800 border-0"><AlertCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getValidationBadge = (status: string) => {
    switch (status) {
      case "VALID":
        return <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 text-xs font-medium">Valid</Badge>;
      case "INVALID":
        return <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50 text-xs font-medium">Invalid</Badge>;
      case "AMBIGUOUS":
        return <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50 text-xs font-medium">Ambiguous</Badge>;
      default:
        return <Badge variant="outline" className="text-slate-500 text-xs font-medium">Unknown</Badge>;
    }
  };

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
        <div className="rounded-md bg-red-50 p-4 border border-red-200 max-w-3xl">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3 text-sm text-red-700">
              <p className="font-medium">Error loading meeting</p>
              <p className="mt-1">{error || "Meeting not found"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const needsReviewCount = actionItems.filter(a => a.review_status === "NEEDS_REVIEW").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/meetings" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to meetings
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{meeting.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
              <div className="flex items-center">
                <Calendar className="mr-1.5 h-4 w-4" />
                {new Date(meeting.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <FileText className="mr-1.5 h-4 w-4" />
                {meeting.source_type || "Unknown"}
              </div>
              <div>
                {getStatusBadge(meeting.processing_status)}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {needsReviewCount > 0 && (
              <Link href="/dashboard/reviews">
                <Button variant="secondary" className="border-orange-200 text-orange-700 hover:bg-orange-50">
                  {needsReviewCount} Action(s) Need Review
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 w-full justify-start overflow-x-auto bg-transparent border-b rounded-none h-12 p-0">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-6"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="transcript" 
            disabled={!transcript}
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-6 disabled:opacity-50"
          >
            Transcript
          </TabsTrigger>
          <TabsTrigger 
            value="actions" 
            disabled={meeting.processing_status !== "COMPLETED"}
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-6 flex items-center gap-2 disabled:opacity-50"
          >
            Action Items
            {actionItems.length > 0 && (
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-medium">
                {actionItems.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="review" 
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-6 disabled:opacity-50"
          >
            Review Context
          </TabsTrigger>
          <TabsTrigger 
            value="insights" 
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-6 disabled:opacity-50"
          >
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="focus-visible:outline-none">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Meeting Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-3 gap-1 border-b border-slate-100 pb-3">
                  <div className="text-slate-500 font-medium">Status</div>
                  <div className="col-span-2 font-medium">{getStatusBadge(meeting.processing_status)}</div>
                </div>
                <div className="grid grid-cols-3 gap-1 border-b border-slate-100 pb-3">
                  <div className="text-slate-500 font-medium">Source Type</div>
                  <div className="col-span-2 text-slate-900">{meeting.source_type || "N/A"}</div>
                </div>
                <div className="grid grid-cols-3 gap-1 border-b border-slate-100 pb-3">
                  <div className="text-slate-500 font-medium">Created</div>
                  <div className="col-span-2 text-slate-900">{new Date(meeting.created_at).toLocaleString()}</div>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-slate-500 font-medium">Updated</div>
                  <div className="col-span-2 text-slate-900">{new Date(meeting.updated_at).toLocaleString()}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Extraction Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {meeting.processing_status === "COMPLETED" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-center">
                      <div className="text-3xl font-bold text-slate-900 mb-1">{actionItems.length}</div>
                      <div className="text-sm font-medium text-slate-500">Total Action Items</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-1">{needsReviewCount}</div>
                      <div className="text-sm font-medium text-orange-600">Needs Review</div>
                    </div>
                  </div>
                ) : meeting.processing_status === "FAILED" ? (
                  <div className="text-center py-6 text-slate-500 text-sm">
                    Extraction failed. No summary available.
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Spinner className="h-8 w-8 text-indigo-500 mb-4" />
                    <p className="text-sm text-slate-500">Processing meeting content...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transcript" className="focus-visible:outline-none">
          <Card>
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Meeting Transcript</CardTitle>
                  <CardDescription>Raw extracted text from the source</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto p-6 bg-slate-50/50">
                {transcript?.normalized_text ? (
                  <div className="prose prose-sm prose-slate max-w-none font-mono text-[13px] leading-relaxed whitespace-pre-wrap">
                    {transcript.normalized_text}
                  </div>
                ) : transcript?.raw_text ? (
                  <div className="prose prose-sm prose-slate max-w-none font-mono text-[13px] leading-relaxed whitespace-pre-wrap">
                    {transcript.raw_text}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    Transcript content is empty or unavailable.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="focus-visible:outline-none">
          <div className="space-y-4">
            {actionItems.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-slate-100 p-4 rounded-full mb-4">
                    <CheckCircle2 className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-1">No action items found</h3>
                  <p className="text-sm text-slate-500 max-w-sm">
                    The AI did not extract any specific action items or tasks from this meeting.
                  </p>
                </CardContent>
              </Card>
            ) : (
              actionItems.map(item => (
                <Card key={item.id} className={`overflow-hidden ${item.review_status === 'NEEDS_REVIEW' ? 'border-orange-200 shadow-sm' : 'border-slate-200'}`}>
                  {item.review_status === "NEEDS_REVIEW" && (
                    <div className="bg-orange-50 px-4 py-2 text-xs font-medium text-orange-700 flex items-center border-b border-orange-100">
                      <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                      This item was flagged for review
                    </div>
                  )}
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-start gap-4 justify-between">
                      <div className="space-y-3 flex-1">
                        <div>
                          <h4 className="font-medium text-slate-900 text-base leading-snug">{item.task}</h4>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1.5 text-slate-400" />
                            {item.owner_name || "Unassigned"}
                          </div>
                          
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                            {item.deadline ? new Date(item.deadline).toLocaleDateString() : "No deadline"}
                          </div>
                        </div>

                        {item.evidence && (
                          <div className="mt-4 bg-slate-50 rounded-md p-3 border border-slate-100 relative">
                            <div className="absolute -left-2.5 -top-2.5 bg-white border border-slate-200 rounded p-1 shadow-sm text-indigo-600">
                              <Search className="w-3 h-3" />
                            </div>
                            <p className="text-sm italic text-slate-600 ml-2">"{item.evidence}"</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 shrink-0 md:w-32">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-0">{item.status}</Badge>
                        {getValidationBadge(item.validation_status)}
                        {item.confidence !== null && (
                          <div className="text-xs text-slate-500 mt-1 flex items-center">
                            <Lightbulb className="w-3 h-3 mr-1" />
                            {Math.round(item.confidence * 100)}% Conf
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="review" className="focus-visible:outline-none">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-slate-100 p-4 rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">Meeting Review</h3>
              <p className="text-sm text-slate-500 max-w-sm mb-6">
                Action items that need human validation are managed in the global Review Queue.
              </p>
              {needsReviewCount > 0 ? (
                <Link href="/dashboard/reviews">
                  <Button variant="default">
                    Review {needsReviewCount} Action Items
                  </Button>
                </Link>
              ) : (
                <Button variant="secondary" disabled>
                  No reviews required
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="focus-visible:outline-none">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-slate-100 p-4 rounded-full mb-4">
                <Lightbulb className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">Meeting Insights</h3>
              <p className="text-sm text-slate-500 max-w-sm mb-2">
                Advanced analytics and thematic meeting insights will be available in Phase 10.
              </p>
              <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50 mt-4">Coming Soon</Badge>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
