"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Plus, Search, Calendar, FileText } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { fetchApi, Meeting } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { Alert } from "@/components/ui/alert";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusIndicator } from "@/components/ui/status-indicator";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadMeetings() {
      try {
        const data = await fetchApi<Meeting[]>("/meetings");
        setMeetings(data);
      } catch (err: any) {
        setError(err.message || "Failed to load meetings");
      } finally {
        setIsLoading(false);
      }
    }
    loadMeetings();
  }, []);

  const filteredMeetings = meetings.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Meetings Intelligence" 
        description="Manage and view all your processed meetings."
      >
        <Link href="/dashboard/meetings/upload">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Upload Meeting
          </Button>
        </Link>
      </SectionHeader>

      <div className="flex items-center space-x-2 bg-white p-3 border border-slate-200 rounded-xl shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search meetings by title..."
            className="pl-9 h-9 bg-slate-50 border-slate-200 focus:bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner className="h-8 w-8 text-indigo-600" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          {error}
        </Alert>
      ) : meetings.length === 0 ? (
        <Card className="shadow-sm border-dashed">
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100">
                <Video className="h-8 w-8 text-indigo-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-slate-900">No meetings found</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-sm">
                You haven't uploaded any meetings yet. Get started by uploading a transcript.
              </p>
              <Link href="/dashboard/meetings/upload" className="mt-6">
                <Button variant="outline" className="font-medium">
                  Upload your first meeting
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : filteredMeetings.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 border border-slate-100 rounded-xl">
          <h3 className="text-sm font-medium text-slate-900">No matches found</h3>
          <p className="text-sm text-slate-500 mt-1">No meetings match your search query.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredMeetings.map((meeting) => (
            <Link key={meeting.id} href={`/dashboard/meetings/${meeting.id}`} className="group h-full">
              <Card className="h-full border-slate-200 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md flex flex-col">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                      <FileText className="h-5 w-5" />
                    </div>
                    <StatusIndicator status={meeting.processing_status} spin={meeting.processing_status === "PROCESSING"} pulse={meeting.processing_status === "PROCESSING"} />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-lg leading-snug line-clamp-2 mb-3 group-hover:text-indigo-600 transition-colors">
                    {meeting.title}
                  </h3>
                  <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2.5 text-sm text-slate-600">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                      <span className="font-medium">{new Date(meeting.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className="bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium tracking-wide uppercase">
                        {meeting.source_type || "UNKNOWN"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
