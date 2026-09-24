"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account settings and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Your personal account details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Full Name</p>
              <p className="text-base text-slate-900 font-medium">{user?.full_name || "Not provided"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Email Address</p>
              <p className="text-base text-slate-900 font-medium">{user?.email}</p>
            </div>
          </div>
          
          <div className="pt-4">
            <Button variant="secondary" disabled>Edit Profile</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>API Access</CardTitle>
          <CardDescription>
            Manage your personal access tokens.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">You currently don't have any active API tokens.</p>
          <Button variant="secondary" disabled>Generate Token</Button>
        </CardContent>
      </Card>
    </div>
  );
}
