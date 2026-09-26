"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckSquare, Search, Filter, AlertCircle, ChevronRight, User, Calendar, Clock, CheckCircle2, XCircle, HelpCircle, AlertTriangle, Download, FileText, FileJson, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { fetchApi, downloadApi, ActionItemWithMeeting, ActionStatus } from "@/lib/api";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";

type FilterType = "ALL" | "PENDING" | "COMPLETED" | "OVERDUE" | "NEEDS_REVIEW" | "UNASSIGNED";
type SortType = "DEADLINE" | "CONFIDENCE" | "STATUS" | "CREATED_DATE" | "MEETING";

function getStatusBadge(status: ActionStatus) {
  switch (status) {
    case "COMPLETED": return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50"><CheckCircle2 className="w-3 h-3 mr-1"/> Completed</Badge>;
    case "IN_PROGRESS": return <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50"><Clock className="w-3 h-3 mr-1"/> In Progress</Badge>;
    case "BLOCKED": return <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50"><XCircle className="w-3 h-3 mr-1"/> Blocked</Badge>;
    case "NEEDS_REVIEW": return <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50"><AlertTriangle className="w-3 h-3 mr-1"/> Needs Review</Badge>;
    default: return <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100"><HelpCircle className="w-3 h-3 mr-1"/> Pending</Badge>;
  }
}

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

    // 1. Search (Task, Owner, Meeting)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.task.toLowerCase().includes(q) || 
        (item.owner_name && item.owner_name.toLowerCase().includes(q)) ||
        item.meeting_title.toLowerCase().includes(q)
      );
    }

    // 2. Filter
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

    // 3. Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "DEADLINE":
          if (!a.deadline) comparison = 1; // nulls last
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
      className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
        activeFilter === type 
          ? "bg-indigo-100 text-indigo-700" 
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Action Items</h1>
          <p className="text-slate-500 mt-1">Track and manage all extracted tasks across your meetings.</p>
        </div>
        <div className="relative">
          <Button 
            onClick={() => setShowExportMenu(!showExportMenu)} 
            disabled={isExporting || items.length === 0}
            variant="secondary"
            className="flex items-center gap-2"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export
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
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search tasks, owners, or meetings..."
            className="pl-9 bg-slate-50 border-slate-200"
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

      <div className="flex justify-end items-center text-sm text-slate-500 gap-2">
        <span>Sort by:</span>
        <select 
          className="bg-transparent border-none font-medium text-slate-700 focus:ring-0 cursor-pointer"
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
          className="ml-2 hover:bg-slate-100 p-1 rounded"
          title={sortDesc ? "Descending" : "Ascending"}
        >
          {sortDesc ? "↓" : "↑"}
        </button>
      </div>

      {filteredAndSortedItems.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <CheckSquare className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No action items found</h3>
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
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    {getStatusBadge(item.status)}
                    {item.review_status === "NEEDS_REVIEW" && (
                      <Badge variant="outline" className="text-amber-600 border-amber-200">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Needs Review
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{item.task}</h3>
                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 opacity-50" />
                      <span className={!item.owner_name ? "italic opacity-50" : ""}>
                        {item.owner_name || "Unassigned"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 opacity-50" />
                      <span className={!item.deadline ? "italic opacity-50" : (new Date(item.deadline) < new Date() && item.status !== "COMPLETED" ? "text-red-600 font-medium" : "")}>
                        {item.deadline ? new Date(item.deadline).toLocaleDateString() : "None"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 opacity-50" />
                      <span className="truncate">{item.meeting_title}</span>
                    </div>
                  </div>
                  <Link 
                    href={`/dashboard/actions/${item.id}`}
                    className="flex items-center justify-center w-full py-2 bg-slate-50 hover:bg-slate-100 text-indigo-600 font-medium rounded-md transition-colors"
                  >
                    View Details
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b text-slate-500 uppercase font-medium text-xs">
                <tr>
                  <th className="px-4 py-3 min-w-[250px]">Task</th>
                  <th className="px-4 py-3">Meeting</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Deadline</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 line-clamp-2">{item.task}</div>
                      {item.review_status === "NEEDS_REVIEW" && (
                        <div className="flex items-center text-xs text-amber-600 mt-1 font-medium">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Needs Review
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 truncate max-w-[150px]" title={item.meeting_title}>
                      {item.meeting_title}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center text-slate-600">
                        <User className="w-3.5 h-3.5 mr-1.5 opacity-50" />
                        <span className={!item.owner_name ? "italic opacity-50" : ""}>
                          {item.owner_name || "Unassigned"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center text-slate-600">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-50" />
                        <span className={!item.deadline ? "italic opacity-50" : (new Date(item.deadline) < new Date() && item.status !== "COMPLETED" ? "text-red-600 font-medium" : "")}>
                          {item.deadline ? new Date(item.deadline).toLocaleDateString() : "None"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link 
                        href={`/dashboard/actions/${item.id}`}
                        className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                      >
                        View
                        <ChevronRight className="w-4 h-4 ml-0.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
