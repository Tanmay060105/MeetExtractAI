import { cn } from "@/lib/utils"

interface MetricBarProps {
  value: number
  max?: number
  label?: string
  valueLabel?: string
  colorClass?: string
  className?: string
  showTrack?: boolean
}

export function MetricBar({ 
  value, 
  max = 100, 
  label, 
  valueLabel, 
  colorClass = "bg-indigo-500", 
  className,
  showTrack = true 
}: MetricBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {(label || valueLabel) && (
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          {label && <span>{label}</span>}
          {valueLabel && <span>{valueLabel}</span>}
        </div>
      )}
      <div className={cn("h-2 w-full overflow-hidden rounded-full", showTrack ? "bg-slate-100" : "bg-transparent")}>
        <div 
          className={cn("h-full transition-all duration-500 ease-in-out", colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
