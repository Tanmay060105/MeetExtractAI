import { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
}

export function SectionHeader({ title, description, className, children, ...props }: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200", className)} {...props}>
      <div className="space-y-1">
        <h2 className="text-lg font-medium text-slate-800 tracking-tight">{title}</h2>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  )
}
