import { cn } from "@/lib/utils"
import { Quote } from "lucide-react"

interface EvidenceBlockProps {
  evidence: string
  sourceLocation?: string | null
  className?: string
}

export function EvidenceBlock({ evidence, sourceLocation, className }: EvidenceBlockProps) {
  if (!evidence) return null;

  return (
    <div className={cn("relative rounded-md bg-slate-50 border border-slate-200 p-4 pl-10", className)}>
      <Quote className="absolute left-3 top-4 h-5 w-5 text-slate-300" />
      <div className="text-sm text-slate-700 italic leading-relaxed whitespace-pre-wrap">
        "{evidence}"
      </div>
      {sourceLocation && (
        <div className="mt-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
          Source: {sourceLocation}
        </div>
      )}
    </div>
  )
}
