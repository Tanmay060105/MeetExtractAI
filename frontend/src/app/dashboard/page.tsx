"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, CheckSquare, ClipboardCheck, Clock, AlertCircle, Percent, Target } from "lucide-react";
import { fetchApi, DashboardSummary, Meeting, ReviewQueueItem } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [reviews, setReviews] = useState<ReviewQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [summaryData, meetingsData, reviewsData] = await Promise.all([
          fetchApi<DashboardSummary>("/analytics/dashboard"),
          fetchApi<Meeting[]>("/meetings"),
          fetchApi<ReviewQueueItem[]>("/reviews/pending")
        ]);
        
        setSummary(summaryData);
        setMeetings(meetingsData.slice(0, 5)); // Just take 5
        setReviews(reviewsData.slice(0, 5));
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
      <div className="rounded-md bg-red-50 p-4 border border-red-200">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your meeting intelligence.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
            <Video className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total_meetings || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Action Items</CardTitle>
            <CheckSquare className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total_action_items || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed / Pending</CardTitle>
            <Clock className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.completed_actions || 0} / {summary?.pending_actions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.needs_review || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Percent className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.completion_rate || 0}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Actions</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.overdue_actions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <Target className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((summary?.average_confidence || 0) * 100)}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Meetings</CardTitle>
            <CardDescription>
              Your most recently processed meetings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {meetings.length === 0 ? (
              <div className="flex h-[250px] items-center justify-center rounded-md border border-dashed border-slate-200">
                <div className="text-center">
                  <Video className="mx-auto h-8 w-8 text-slate-300" />
                  <h3 className="mt-2 text-sm font-semibold text-slate-900">No meetings yet</h3>
                  <p className="mt-1 text-sm text-slate-500">Upload a meeting to get started.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {meetings.map((meeting) => (
                  <div key={meeting.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <Link href={`/dashboard/meetings/${meeting.id}`} className="font-medium text-slate-900 hover:underline">
                        {meeting.title}
                      </Link>
                      <div className="text-sm text-slate-500">
                        {new Date(meeting.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="outline">{meeting.processing_status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Review Queue</CardTitle>
            <CardDescription>
              Action items requiring your approval.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <div className="flex h-[250px] items-center justify-center rounded-md border border-dashed border-slate-200">
                <div className="text-center">
                  <ClipboardCheck className="mx-auto h-8 w-8 text-slate-300" />
                  <h3 className="mt-2 text-sm font-semibold text-slate-900">Queue empty</h3>
                  <p className="mt-1 text-sm text-slate-500">You're all caught up.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="flex flex-col border-b pb-4 last:border-0 last:pb-0 gap-2">
                    <Link href={`/dashboard/reviews/${review.id}`} className="font-medium text-slate-900 hover:underline line-clamp-1">
                      {review.task}
                    </Link>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-500 line-clamp-1 max-w-[200px]">
                        {review.meeting_title}
                      </div>
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Needs Review</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
