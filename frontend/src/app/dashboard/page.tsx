"use client";

import { useEffect, useState } from "react";
import { Video, CheckSquare, Clock, ShieldAlert, ChevronRight, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { fetchApi, DashboardSummary, Meeting, ReviewQueueItem, ActionItemWithMeeting } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { SectionHeader } from "@/components/ui/section-header";
import { PipelineTracker } from "@/components/ui/pipeline-tracker";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [reviews, setReviews] = useState<ReviewQueueItem[]>([]);
  const [overdueActions, setOverdueActions] = useState<ActionItemWithMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [summaryData, meetingsData, reviewsData, actionsData] = await Promise.all([
          fetchApi<DashboardSummary>("/analytics/dashboard"),
          fetchApi<Meeting[]>("/meetings"),
          fetchApi<ReviewQueueItem[]>("/reviews/pending"),
          fetchApi<ActionItemWithMeeting[]>("/action-items")
        ]);
        
        setSummary(summaryData);
        setMeetings(meetingsData.slice(0, 5)); // Just take 5
        setReviews(reviewsData.slice(0, 5));
        
        const now = new Date();
        const overdue = actionsData
          .filter(a => a.deadline && new Date(a.deadline) < now && a.status !== "COMPLETED")
          .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
          .slice(0, 5);
        setOverdueActions(overdue);

      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboard();
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

  return (
    <div className="space-y-8">
      <SectionHeader 
        title="Command Center" 
        description="Overview of your AI meeting intelligence workspace."
      />

      <PipelineTracker summary={summary} />

      <div className="grid gap-8 lg:grid-cols-2">
        
        {/* Left Column: Needs Attention */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2 text-amber-500" />
              Needs Attention
            </h2>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Review Queue</span>
              {reviews.length > 0 && (
                <Link href="/dashboard/reviews" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center">
                  View All <ChevronRight className="w-3 h-3 ml-0.5" />
                </Link>
              )}
            </div>
            
            {reviews.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-900">Queue empty</p>
                <p className="text-xs text-slate-500 mt-1">No action items require human review.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {reviews.map((review) => (
                  <Link key={review.id} href={`/dashboard/reviews/${review.id}`} className="block hover:bg-slate-50 transition-colors p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{review.task}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                          <span className="flex items-center truncate max-w-[150px]" title={review.meeting_title}>
                            <Video className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            {review.meeting_title}
                          </span>
                        </div>
                      </div>
                      <StatusIndicator status={review.review_status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-rose-200 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
            <div className="bg-rose-50/50 border-b border-rose-100 px-4 py-3 flex justify-between items-center pl-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">Overdue Actions</span>
              {overdueActions.length > 0 && (
                <Link href="/dashboard/actions" className="text-xs font-medium text-rose-600 hover:text-rose-700 flex items-center">
                  View All <ChevronRight className="w-3 h-3 ml-0.5" />
                </Link>
              )}
            </div>
            
            {overdueActions.length === 0 ? (
              <div className="p-8 text-center pl-5">
                <CheckSquare className="w-8 h-8 mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-900">No overdue items</p>
                <p className="text-xs text-slate-500 mt-1">All action items are on track.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 pl-1">
                {overdueActions.map((action) => (
                  <Link key={action.id} href={`/dashboard/actions/${action.id}`} className="block hover:bg-slate-50 transition-colors p-4 pl-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{action.task}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                          <span className="flex items-center text-rose-600 font-medium">
                            <Calendar className="w-3.5 h-3.5 mr-1" />
                            {action.deadline ? new Date(action.deadline).toLocaleDateString() : ""}
                          </span>
                        </div>
                      </div>
                      <StatusIndicator status={action.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-indigo-500" />
              Recent Activity
            </h2>
            <Link href="/dashboard/meetings" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              View All Meetings
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
             <div className="space-y-6">
               {meetings.length === 0 ? (
                 <div className="py-12 text-center">
                   <Video className="w-8 h-8 mx-auto text-slate-300 mb-3" />
                   <p className="text-sm font-medium text-slate-900">No recent meetings</p>
                   <p className="text-xs text-slate-500 mt-1">Upload a transcript to get started.</p>
                 </div>
               ) : (
                 <div className="relative border-l border-slate-200 ml-3 space-y-8 pb-4">
                   {meetings.map((meeting, index) => (
                     <div key={meeting.id} className="relative pl-6">
                       <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-white"></div>
                       <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-1">
                          <Link href={`/dashboard/meetings/${meeting.id}`} className="font-medium text-slate-900 text-sm hover:text-indigo-600 transition-colors">
                            {meeting.title}
                          </Link>
                          <div className="shrink-0 mt-1 sm:mt-0">
                            <StatusIndicator status={meeting.processing_status} />
                          </div>
                       </div>
                       <p className="text-xs text-slate-500 mt-1 flex items-center">
                         <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                         {new Date(meeting.created_at).toLocaleString()}
                       </p>
                     </div>
                   ))}
                 </div>
               )}
             </div>
          </div>
          
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Intelligence Pipeline Health</h3>
            </div>
            <div className="space-y-4">
              <div>
                 <div className="flex justify-between text-xs font-medium mb-1">
                   <span className="text-slate-600">Action Completion</span>
                   <span className="text-slate-900">{summary?.completion_rate || 0}%</span>
                 </div>
                 <div className="w-full bg-slate-200 rounded-full h-1.5">
                   <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${summary?.completion_rate || 0}%` }}></div>
                 </div>
              </div>
              <div>
                 <div className="flex justify-between text-xs font-medium mb-1">
                   <span className="text-slate-600">Average AI Confidence</span>
                   <span className="text-violet-700">{Math.round((summary?.average_confidence || 0) * 100)}%</span>
                 </div>
                 <div className="w-full bg-slate-200 rounded-full h-1.5">
                   <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: `${(summary?.average_confidence || 0) * 100}%` }}></div>
                 </div>
              </div>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
