"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckSquare, Search, ChevronRight, User, Calendar, FileText, FileJson, Loader2, Download, Video, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { fetchApi, downloadApi, ActionItemWithMeeting, ActionStatus } from "@/lib/api";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusIndicator } from "@/components/ui/status-indicator";

type FilterType = "ALL" | "PENDING" | "COMPLETED" | "OVERDUE" | "NEEDS_REVIEW" | "UNASSIGNED";
type SortType = "DEADLINE" | "CONFIDENCE" | "STATUS" | "CREATED_DATE" | "MEETING";

export default function ActionItemsPage() {
  const [items, setItems] = useState<ActionItemWithMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const [sortBy, setSortBy] = useState<SortType>("CREATED_DATE");
  const [sortDesc, setSortDesc] = useState(true);

  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = async (format: "csv" | "json") => {
    if (filteredAndSortedItems.length === 0) {
      alert("No action items to export.");
      return;
    }
    
    try {
      setIsExporting(true);
      setShowExportMenu(false);
      const ids = filteredAndSortedItems.map(item => item.id);
      await downloadApi(
        "/export/action-items", 
        `action_items_export_${new Date().toISOString().split('T')[0]}.${format}`,
        {
          method: "POST",
          body: JSON.stringify({ format, action_item_ids: ids })
        }
      );
    } catch (err: any) {
      alert(`Export failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const loadActions = async () => {
      try {
        const data = await fetchApi<ActionItemWithMeeting[]>("/action-items");
        setItems(data);
      } catch (err: any) {
        setError(err.message || "Failed to load action items");
      } finally {
        setIsLoading(false);
      }
    };
    loadActions();
  }, []);

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.task.toLowerCase().includes(q) || 
        (item.owner_name && item.owner_name.toLowerCase().includes(q)) ||
        item.meeting_title.toLowerCase().includes(q)
      );
    }

    const now = new Date();
    switch (activeFilter) {
      case "PENDING":
        result = result.filter(item => item.status === "PENDING" || item.status === "IN_PROGRESS");
        break;
      case "COMPLETED":
        result = result.filter(item => item.status === "COMPLETED");
        break;
      case "OVERDUE":
        result = result.filter(item => item.deadline && new Date(item.deadline) < now && item.status !== "COMPLETED");
        break;
      case "NEEDS_REVIEW":
        result = result.filter(item => item.review_status === "NEEDS_REVIEW");
        break;
      case "UNASSIGNED":
        result = result.filter(item => !item.owner_name);
        break;
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "DEADLINE":
          if (!a.deadline) comparison = 1;
          else if (!b.deadline) comparison = -1;
          else comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          break;
        case "CONFIDENCE":
          comparison = (a.confidence || 0) - (b.confidence || 0);
          break;
        case "STATUS":
          comparison = a.status.localeCompare(b.status);
          break;
        case "CREATED_DATE":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "MEETING":
          comparison = a.meeting_title.localeCompare(b.meeting_title);
          break;
      }
      return sortDesc ? -comparison : comparison;
    });

    return result;
  }, [items, searchQuery, activeFilter, sortBy, sortDesc]);

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

  const FilterButton = ({ type, label }: { type: FilterType, label: string }) => (
    <button
      onClick={() => setActiveFilter(type)}
      className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
        activeFilter === type 
          ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200" 
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Action Items" 
        description="Track and manage all extracted tasks across your meetings."
      >
        <div className="relative">
          <Button 
            onClick={() => setShowExportMenu(!showExportMenu)} 
            disabled={isExporting || items.length === 0}
            variant="outline"
            className="flex items-center gap-2 bg-white"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export List
          </Button>
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-md shadow-lg z-10 py-1">
              <button
                onClick={() => handleExport("csv")}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
              >
                <FileText className="h-4 w-4 text-slate-400" />
                Download CSV
              </button>
              <button
                onClick={() => handleExport("json")}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
              >
                <FileJson className="h-4 w-4 text-slate-400" />
                Download JSON
              </button>
            </div>
          )}
        </div>
      </SectionHeader>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search tasks, owners, or meetings..."
            className="pl-9 bg-slate-50 border-slate-200 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <FilterButton type="ALL" label="All" />
          <FilterButton type="PENDING" label="Pending" />
          <FilterButton type="COMPLETED" label="Completed" />
          <FilterButton type="OVERDUE" label="Overdue" />
          <FilterButton type="NEEDS_REVIEW" label="Needs Review" />
          <FilterButton type="UNASSIGNED" label="Unassigned" />
        </div>
      </div>

      <div className="flex justify-end items-center text-sm text-slate-500 gap-2 px-1">
        <span className="font-medium uppercase tracking-wider text-xs">Sort by:</span>
        <select 
          className="bg-transparent border-none font-medium text-slate-700 focus:ring-0 cursor-pointer h-8 text-sm p-0 pr-4"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortType)}
        >
          <option value="CREATED_DATE">Created Date</option>
          <option value="DEADLINE">Deadline</option>
          <option value="CONFIDENCE">Confidence</option>
          <option value="STATUS">Status</option>
          <option value="MEETING">Meeting</option>
        </select>
        <button 
          onClick={() => setSortDesc(!sortDesc)} 
          className="hover:bg-slate-100 p-1.5 rounded-md text-slate-400 hover:text-slate-700 transition-colors"
          title={sortDesc ? "Descending" : "Ascending"}
        >
          {sortDesc ? "↓" : "↑"}
        </button>
      </div>

      {filteredAndSortedItems.length === 0 ? (
        <Card className="shadow-sm border-dashed">
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 border border-slate-100">
                <CheckSquare className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mt-4 text-base font-medium text-slate-900">No action items found</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-sm">
                {items.length === 0 
                  ? "When you process meetings, the extracted action items will appear here." 
                  : "Try adjusting your search or filters."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="grid gap-4 md:hidden">
            {filteredAndSortedItems.map((item) => (
              <div key={item.id} className={`bg-white rounded-xl overflow-hidden shadow-sm border ${item.review_status === 'NEEDS_REVIEW' ? 'border-amber-200 ring-1 ring-amber-50' : 'border-slate-200'}`}>
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <StatusIndicator status={item.status} />
                    {item.review_status === "NEEDS_REVIEW" && (
                       <StatusIndicator status="NEEDS_REVIEW" />
                    )}
                  </div>
                  <h3 className="font-medium text-slate-900 leading-snug">{item.task}</h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center">
                      <User className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      <span className={!item.owner_name ? "italic text-slate-400" : "font-medium"}>
                        {item.owner_name || "Unassigned"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      <span className={!item.deadline ? "italic text-slate-400" : (new Date(item.deadline) < new Date() && item.status !== "COMPLETED" ? "text-rose-600 font-medium" : "font-medium")}>
                        {item.deadline ? new Date(item.deadline).toLocaleDateString() : "None"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Video className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      <span className="truncate">{item.meeting_title}</span>
                    </div>
                  </div>
                  <Link 
                    href={`/dashboard/actions/${item.id}`}
                    className="flex items-center justify-center w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-indigo-600 font-medium text-sm rounded-md transition-colors border border-slate-100"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Premium List View */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="col-span-5">Task</div>
              <div className="col-span-2">Owner</div>
              <div className="col-span-2">Deadline</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1"></div>
            </div>
            
            <div className="divide-y divide-slate-100">
              {filteredAndSortedItems.map((item) => (
                 <Link 
                   key={item.id} 
                   href={`/dashboard/actions/${item.id}`}
                   className={`group grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-slate-50 ${item.review_status === 'NEEDS_REVIEW' ? 'bg-amber-50/10' : ''}`}
                 >
                   <div className="col-span-5 pr-4">
                      <div className="flex items-start gap-3">
                         <h4 className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">{item.task}</h4>
                         {item.review_status === "NEEDS_REVIEW" && (
                            <div className="mt-0.5 shrink-0">
                               <ShieldAlert className="w-4 h-4 text-amber-500" />
                            </div>
                         )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                        <Video className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[250px]">{item.meeting_title}</span>
                      </div>
                   </div>
                   
                   <div className="col-span-2">
                     <div className="flex items-center text-sm">
                       <User className="w-4 h-4 mr-1.5 text-slate-400" />
                       <span className={!item.owner_name ? "italic text-slate-500" : "font-medium text-slate-700 truncate"}>{item.owner_name || "Unassigned"}</span>
                     </div>
                   </div>
                   
                   <div className="col-span-2">
                     <div className="flex items-center text-sm">
                       <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                       <span className={!item.deadline ? "italic text-slate-500" : (new Date(item.deadline) < new Date() && item.status !== "COMPLETED" ? "text-rose-600 font-medium" : "font-medium text-slate-700")}>
                         {item.deadline ? new Date(item.deadline).toLocaleDateString() : "None"}
                       </span>
                     </div>
                   </div>
                   
                   <div className="col-span-2 flex flex-col gap-1.5">
                      <StatusIndicator status={item.status} />
                      {item.review_status === "NEEDS_REVIEW" && (
                         <StatusIndicator status="NEEDS_REVIEW" />
                      )}
                   </div>
                   
                   <div className="col-span-1 flex justify-end">
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                   </div>
                 </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
