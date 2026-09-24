"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardCheck, AlertCircle, Calendar, User, ChevronRight } from "lucide-react";
import { fetchApi, ReviewQueueItem } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function ReviewQueuePage() {
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPendingReviews = async () => {
      try {
        const data = await fetchApi<ReviewQueueItem[]>("/reviews/pending");
        setItems(data);
      } catch (err: any) {
        setError(err.message || "Failed to load review queue");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPendingReviews();
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Review Queue</h1>
          <p className="text-slate-500 mt-1">Approve, edit, or reject action items flagged by validation.</p>
        </div>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <ClipboardCheck className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Queue is empty</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-sm">
                There are currently no action items requiring human review. You're all caught up!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden border-orange-200 hover:shadow-md transition-shadow">
              <div className="bg-orange-50 px-4 py-2 text-xs font-medium text-orange-700 flex items-center border-b border-orange-100 justify-between">
                <div className="flex items-center">
                  <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                  {item.review_reasons?.join(", ") || "Flagged for review"}
                </div>
                <div className="text-orange-600/70">{item.meeting_title}</div>
              </div>
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                  <div className="space-y-3 flex-1">
                    <h4 className="font-medium text-slate-900 text-base">{item.task}</h4>
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
                  </div>
                  
                  <div className="shrink-0">
                    <Link href={`/dashboard/reviews/${item.id}`} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 h-10 px-4 py-2">
                      Review Item <ChevronRight className="w-4 h-4 ml-1.5 text-slate-400" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
