"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Plus, Search, Calendar, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { fetchApi, Meeting } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>;
      case "PENDING":
      case "PROCESSING":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Clock className="w-3 h-3 mr-1" /> Processing</Badge>;
      case "FAILED":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><AlertCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Meetings</h1>
          <p className="text-slate-500 mt-1">Manage and view all your processed meetings.</p>
        </div>
        <Link href="/dashboard/meetings/upload">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Upload Meeting
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search meetings..."
            className="pl-9"
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
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3 text-sm text-red-700">{error}</div>
          </div>
        </div>
      ) : meetings.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Video className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No meetings found</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-sm">
                You haven't uploaded any meetings yet. Get started by uploading a transcript.
              </p>
              <Link href="/dashboard/meetings/upload" className="mt-6">
                <Button variant="secondary">
                  Upload your first meeting
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : filteredMeetings.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No meetings match your search.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMeetings.map((meeting) => (
            <Link key={meeting.id} href={`/dashboard/meetings/${meeting.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-slate-200 hover:border-indigo-300">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                      <FileText className="h-5 w-5" />
                    </div>
                    {getStatusBadge(meeting.processing_status)}
                  </div>
                  <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
                    {meeting.title}
                  </h3>
                  <div className="mt-auto pt-4 flex flex-col gap-2 text-sm text-slate-500">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      {new Date(meeting.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-xs">
                      <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">
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
