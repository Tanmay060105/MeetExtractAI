import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"

interface AIContextProps {
  confidence?: number | null
  label?: string
  children: React.ReactNode
  className?: string
  highlight?: boolean
}

export function AIContext({ confidence, label = "AI Extracted", children, className, highlight = false }: AIContextProps) {
  const getConfidenceLevel = (score: number) => {
    if (score >= 0.85) return { text: "High", color: "text-emerald-700 bg-emerald-50 border-emerald-200" }
    if (score >= 0.60) return { text: "Medium", color: "text-amber-700 bg-amber-50 border-amber-200" }
    return { text: "Low", color: "text-rose-700 bg-rose-50 border-rose-200" }
  }

  const conf = typeof confidence === "number" ? getConfidenceLevel(confidence) : null

  return (
    <div className={cn("rounded-lg border p-3", highlight ? "bg-violet-50/50 border-violet-100" : "bg-white border-slate-200", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center text-xs font-medium text-violet-700">
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          {label}
        </div>
        {conf && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{Math.round(confidence! * 100)}%</span>
            <span className={cn("px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border", conf.color)}>
              {conf.text}
            </span>
          </div>
        )}
      </div>
      <div className="text-sm text-slate-900">
        {children}
      </div>
    </div>
  )
}
