import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "ai"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200",
    destructive: "border-transparent bg-rose-100 text-rose-800 hover:bg-rose-200",
    success: "border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
    warning: "border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200",
    ai: "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100",
    outline: "text-slate-700 border-slate-200",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
