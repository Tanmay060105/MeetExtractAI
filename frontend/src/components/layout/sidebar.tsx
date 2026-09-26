"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Video, 
  CheckSquare, 
  ClipboardCheck, 
  LineChart, 
  Scale, 
  Settings,
  X
} from "lucide-react";

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  const routes = [
    {
      group: "WORKSPACE",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/meetings", label: "Meetings", icon: Video },
        { href: "/dashboard/actions", label: "Action Items", icon: CheckSquare },
        { href: "/dashboard/reviews", label: "Review Queue", icon: ClipboardCheck },
      ]
    },
    {
      group: "ANALYTICS",
      items: [
        { href: "/dashboard/insights", label: "Insights", icon: LineChart },
        { href: "/dashboard/evaluation", label: "Evaluation", icon: Scale },
      ]
    },
    {
      group: "SYSTEM",
      items: [
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
      ]
    }
  ];

  return (
    <div className="flex h-full w-64 flex-col overflow-y-auto border-r border-slate-200 bg-slate-50 px-3 py-4">
      <div className="mb-8 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded bg-indigo-600 flex items-center justify-center mr-3 shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">MeetExtract</span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="lg:hidden rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-6">
        {routes.map((routeGroup, index) => (
          <div key={index}>
            <h4 className="mb-2 px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              {routeGroup.group}
            </h4>
            <ul className="space-y-1">
              {routeGroup.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <Icon
                        className={cn(
                          "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                          isActive ? "text-indigo-700" : "text-slate-400 group-hover:text-slate-500"
                        )}
                        aria-hidden="true"
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
