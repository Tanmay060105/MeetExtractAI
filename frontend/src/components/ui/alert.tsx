import * as React from "react"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "warning" | "success"
  title?: string
}

export function Alert({ className, variant = "default", title, children, ...props }: AlertProps) {
  const variants = {
    default: "bg-slate-50 text-slate-800 border-slate-200",
    destructive: "bg-red-50 text-red-800 border-red-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  }

  const icons = {
    default: <Info className="h-5 w-5 text-slate-500 mt-0.5 shrink-0" aria-hidden="true" />,
    destructive: <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" aria-hidden="true" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" aria-hidden="true" />,
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" aria-hidden="true" />,
  }

  return (
    <div
      role="alert"
      className={cn("relative w-full rounded-lg border p-4 flex gap-3", variants[variant], className)}
      {...props}
    >
      {icons[variant]}
      <div className="flex-1 min-w-0">
        {title && <h5 className="mb-1 font-medium leading-none tracking-tight">{title}</h5>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  )
}
