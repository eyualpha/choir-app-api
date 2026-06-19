"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { authApi } from "@/lib/api-client";
import { ApiError } from "@/lib/api";

export default function ProfilePage() {
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  async function changePassword() {
    try {
      await authApi.changePassword(password, confirm);
      toast.success("Password updated");
      setPassword("");
      setConfirm("");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed");
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <PageHeader title="Profile" description="Your account settings" />
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="space-y-2 p-5">
          <p className="text-lg font-semibold">{user?.name}</p>
          <p className="text-muted-foreground">{user?.email}</p>
          <div className="flex gap-2 mt-2">
            <Badge>{user?.role}</Badge>
            {user?.voicePart && <Badge variant="secondary">{user.voicePart}</Badge>}
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="space-y-3 p-5">
          <h3 className="font-semibold">Change password</h3>
          <div><Label>New password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl" /></div>
          <div><Label>Confirm</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="rounded-xl" /></div>
          <Button onClick={changePassword} className="rounded-full">Update password</Button>
        </CardContent>
      </Card>
    </div>
  );
}
