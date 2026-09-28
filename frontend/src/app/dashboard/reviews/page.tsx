"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardCheck, AlertCircle, Calendar, User, ChevronRight, Video, Sparkles } from "lucide-react";
import { fetchApi, ReviewQueueItem } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusIndicator } from "@/components/ui/status-indicator";

export default function ReviewQueuePage() {
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [groupedItems, setGroupedItems] = useState<Record<string, ReviewQueueItem[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPendingReviews = async () => {
      try {
        const data = await fetchApi<ReviewQueueItem[]>("/reviews/pending");
        setItems(data);
        
        // Group by meeting title
        const grouped = data.reduce((acc, item) => {
          const title = item.meeting_title || "Unknown Meeting";
          if (!acc[title]) acc[title] = [];
          acc[title].push(item);
          return acc;
        }, {} as Record<string, ReviewQueueItem[]>);
        
        setGroupedItems(grouped);
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
      <Alert variant="destructive">
        {error}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Review Queue" 
        description="Approve, edit, or reject action items flagged by validation." 
      />

      {items.length === 0 ? (
        <Card className="shadow-sm border-slate-200 border-dashed">
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center p-16 text-center">
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
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([meetingTitle, meetingItems]) => (
            <div key={meetingTitle} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 flex items-center text-sm">
                  <Video className="w-4 h-4 mr-2 text-indigo-500" />
                  {meetingTitle}
                </h3>
                <span className="text-xs font-medium bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-600">
                  {meetingItems.length} item{meetingItems.length > 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="divide-y divide-slate-100">
                {meetingItems.map((item) => (
                  <div key={item.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-6 justify-between group">
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 mt-0.5">
                           <AlertCircle className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 text-base leading-snug">{item.task}</h4>
                          <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider mt-1 flex flex-wrap gap-x-2 gap-y-1">
                            {item.review_reasons?.map((reason, idx) => (
                              <span key={idx} className="bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">{reason}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600 pl-8">
                        <div className="flex items-center">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-2">Owner</span>
                          <User className="w-4 h-4 mr-1 text-slate-400" />
                          <span className="font-medium text-slate-700">{item.owner_name || "Unassigned"}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-2">Deadline</span>
                          <Calendar className="w-4 h-4 mr-1 text-slate-400" />
                          <span className="font-medium text-slate-700">{item.deadline ? new Date(item.deadline).toLocaleDateString() : "No deadline"}</span>
                        </div>
                        {item.confidence !== null && (
                           <div className="flex items-center">
                             <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-2">AI Signal</span>
                             <span className="bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded font-medium text-xs flex items-center">
                               <Sparkles className="w-3 h-3 mr-1" />
                               {Math.round(item.confidence * 100)}%
                             </span>
                           </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between md:justify-center border-t border-slate-100 md:border-t-0 pt-4 md:pt-0">
                      <div className="hidden md:block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 text-right">Action</div>
                      <Link href={`/dashboard/reviews/${item.id}`} className="inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-indigo-600 shadow-sm h-9 px-4 w-full md:w-auto group-hover:border-indigo-200">
                        Review <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
