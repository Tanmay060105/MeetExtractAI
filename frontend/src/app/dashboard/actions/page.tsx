"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckSquare, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ActionItemsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Action Items</h1>
          <p className="text-slate-500 mt-1">Track and manage all extracted tasks across your meetings.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search tasks or owners..."
            className="pl-9"
          />
        </div>
        <Button variant="secondary" className="w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4 text-slate-500" />
          Filter
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <CheckSquare className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No action items found</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm">
              When you process meetings, the extracted action items will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
