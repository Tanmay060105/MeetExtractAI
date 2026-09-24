"use client";

import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex flex-1">
        {/* Optional: Add search or page context here later */}
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-slate-700 flex items-center">
              <UserIcon className="w-4 h-4 mr-2 text-slate-400" />
              {user.full_name || user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={logout} className="text-slate-500 hover:text-slate-700">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
