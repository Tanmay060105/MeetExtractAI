import React from "react";
import { Video, CheckSquare, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import { DashboardSummary } from "@/lib/api";

interface PipelineTrackerProps {
  summary: DashboardSummary | null;
}

export function PipelineTracker({ summary }: PipelineTrackerProps) {
  if (!summary) return null;

  const stages = [
    {
      label: "Meetings Processed",
      value: summary.total_meetings,
      icon: <Video className="w-4 h-4 text-slate-500" />,
      bgColor: "bg-slate-100",
      borderColor: "border-slate-200",
      textColor: "text-slate-700"
    },
    {
      label: "Actions Extracted",
      value: summary.total_action_items,
      icon: <CheckSquare className="w-4 h-4 text-violet-500" />,
      bgColor: "bg-violet-50",
      borderColor: "border-violet-100",
      textColor: "text-violet-700"
    },
    {
      label: "Pending Review",
      value: summary.needs_review,
      icon: <ShieldAlert className="w-4 h-4 text-amber-500" />,
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-700"
    },
    {
      label: "Completed",
      value: summary.completed_actions,
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-700"
    }
  ];

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-4 md:p-6 shadow-sm overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2 relative">
        
        {/* Desktop Connecting Line */}
        <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-slate-100 -z-10 -translate-y-1/2"></div>
        
        {stages.map((stage, index) => (
          <React.Fragment key={stage.label}>
            <div className="flex flex-col items-center bg-white px-2 z-10 w-full md:w-1/4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full ${stage.bgColor} border ${stage.borderColor} mb-3 shadow-sm transition-transform hover:scale-105`}>
                {stage.icon}
              </div>
              <div className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
                {stage.value}
              </div>
              <div className={`text-xs font-semibold uppercase tracking-wider text-center ${stage.textColor}`}>
                {stage.label}
              </div>
            </div>
            
            {/* Mobile connecting arrow */}
            {index < stages.length - 1 && (
              <div className="md:hidden text-slate-300 py-1">
                <ArrowRight className="w-5 h-5 rotate-90" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
