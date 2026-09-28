"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { SectionHeader } from "@/components/ui/section-header";
import { User, Key } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <SectionHeader 
        title="Settings" 
        description="Manage your account settings and preferences."
      />

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50 pb-4">
          <CardTitle className="text-base font-semibold flex items-center">
            <User className="w-4 h-4 mr-2 text-slate-500" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Your personal account details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Full Name</p>
              <p className="text-base text-slate-900 font-medium">{user?.full_name || "Not provided"}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email Address</p>
              <p className="text-base text-slate-900 font-medium">{user?.email}</p>
            </div>
          </div>
          
          <div className="pt-6 mt-4 border-t border-slate-100">
            <Button variant="outline" disabled className="bg-white">Edit Profile</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50 pb-4">
          <CardTitle className="text-base font-semibold flex items-center">
            <Key className="w-4 h-4 mr-2 text-slate-500" />
            API Access
          </CardTitle>
          <CardDescription>
            Manage your personal access tokens.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-slate-600 mb-6">You currently don't have any active API tokens.</p>
          <Button variant="outline" disabled className="bg-white">Generate Token</Button>
        </CardContent>
      </Card>
    </div>
  );
}
