import { cn } from "@/lib/utils"
import { CheckCircle2, AlertCircle, Clock, CheckCircle, ShieldAlert, Sparkles, AlertTriangle, FileSearch, XCircle } from "lucide-react"

export type StatusType = "SUCCESS" | "WARNING" | "DANGER" | "INFO" | "AI" | "PENDING"

interface StatusIndicatorProps {
  status: string
  type?: StatusType
  className?: string
  iconClassName?: string
  pulse?: boolean
  spin?: boolean
}

const statusConfig: Record<string, { type: StatusType, defaultIcon: any, label: string }> = {
  // Processing Status
  "COMPLETED": { type: "SUCCESS", defaultIcon: CheckCircle2, label: "Completed" },
  "PENDING": { type: "PENDING", defaultIcon: Clock, label: "Pending" },
  "PROCESSING": { type: "INFO", defaultIcon: Clock, label: "Processing" },
  "FAILED": { type: "DANGER", defaultIcon: AlertCircle, label: "Failed" },
  
  // Action Status
  "OPEN": { type: "INFO", defaultIcon: AlertCircle, label: "Open" },
  "IN_PROGRESS": { type: "PENDING", defaultIcon: Clock, label: "In Progress" },
  "DONE": { type: "SUCCESS", defaultIcon: CheckCircle, label: "Done" },
  "CANCELLED": { type: "DANGER", defaultIcon: XCircle, label: "Cancelled" },
  
  // Validation Status
  "VALID": { type: "SUCCESS", defaultIcon: CheckCircle2, label: "Valid" },
  "INVALID": { type: "DANGER", defaultIcon: ShieldAlert, label: "Invalid" },
  "AMBIGUOUS": { type: "WARNING", defaultIcon: AlertTriangle, label: "Ambiguous" },
  "UNKNOWN": { type: "INFO", defaultIcon: FileSearch, label: "Unknown" },
  
  // Review Status
  "READY": { type: "SUCCESS", defaultIcon: CheckCircle, label: "Ready" },
  "NEEDS_REVIEW": { type: "WARNING", defaultIcon: AlertTriangle, label: "Needs Review" },
}

const typeStyles: Record<StatusType, string> = {
  SUCCESS: "text-emerald-700 bg-emerald-50 border-emerald-200",
  WARNING: "text-amber-700 bg-amber-50 border-amber-200",
  DANGER: "text-rose-700 bg-rose-50 border-rose-200",
  INFO: "text-slate-700 bg-slate-50 border-slate-200",
  AI: "text-violet-700 bg-violet-50 border-violet-200",
  PENDING: "text-blue-700 bg-blue-50 border-blue-200",
}

export function StatusIndicator({ status, type, className, iconClassName, pulse, spin }: StatusIndicatorProps) {
  const config = statusConfig[status] || { type: type || "INFO", defaultIcon: AlertCircle, label: status }
  const actualType = type || config.type
  const Icon = config.defaultIcon
  
  return (
    <span className={cn("inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border", typeStyles[actualType], className)}>
      <Icon className={cn("w-3 h-3 mr-1.5", spin && "animate-spin", iconClassName)} />
      {config.label}
      {pulse && (
        <span className="relative flex h-2 w-2 ml-2">
          <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", 
            actualType === 'SUCCESS' && "bg-emerald-400",
            actualType === 'WARNING' && "bg-amber-400",
            actualType === 'DANGER' && "bg-rose-400",
            actualType === 'INFO' && "bg-slate-400",
            actualType === 'AI' && "bg-violet-400",
            actualType === 'PENDING' && "bg-blue-400"
          )}></span>
          <span className={cn("relative inline-flex rounded-full h-2 w-2",
            actualType === 'SUCCESS' && "bg-emerald-500",
            actualType === 'WARNING' && "bg-amber-500",
            actualType === 'DANGER' && "bg-rose-500",
            actualType === 'INFO' && "bg-slate-500",
            actualType === 'AI' && "bg-violet-500",
            actualType === 'PENDING' && "bg-blue-500"
          )}></span>
        </span>
      )}
    </span>
  )
}
