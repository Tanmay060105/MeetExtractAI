"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, CheckSquare, ClipboardCheck, Clock } from "lucide-react";

export default function DashboardPage() {
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
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-slate-500 mt-1">Awaiting data</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Action Items</CardTitle>
            <CheckSquare className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-slate-500 mt-1">Awaiting data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Actions</CardTitle>
            <Clock className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-slate-500 mt-1">Awaiting data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-slate-500 mt-1">Awaiting data</p>
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
            <div className="flex h-[250px] items-center justify-center rounded-md border border-dashed border-slate-200">
              <div className="text-center">
                <Video className="mx-auto h-8 w-8 text-slate-300" />
                <h3 className="mt-2 text-sm font-semibold text-slate-900">No meetings yet</h3>
                <p className="mt-1 text-sm text-slate-500">Upload a meeting to get started.</p>
              </div>
            </div>
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
            <div className="flex h-[250px] items-center justify-center rounded-md border border-dashed border-slate-200">
              <div className="text-center">
                <ClipboardCheck className="mx-auto h-8 w-8 text-slate-300" />
                <h3 className="mt-2 text-sm font-semibold text-slate-900">Queue empty</h3>
                <p className="mt-1 text-sm text-slate-500">You're all caught up.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
