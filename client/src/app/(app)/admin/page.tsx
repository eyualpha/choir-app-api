"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { remindersApi, auditApi, engagementApi } from "@/lib/api-client";

export default function AdminPage() {
  const [pending, setPending] = useState<unknown[]>([]);
  const [audit, setAudit] = useState<unknown[]>([]);
  const [leaders, setLeaders] = useState<unknown[]>([]);

  useEffect(() => {
    remindersApi.pending().then((r) => setPending((r as { pending?: unknown[] }).pending ?? [])).catch(() => {});
    auditApi.list().then((r) => setAudit((r as { items?: unknown[] }).items ?? [])).catch(() => {});
    engagementApi.leaderboard().then((r) => setLeaders((r as { leaders?: unknown[] }).leaders ?? [])).catch(() => {});
  }, []);

  return (
    <div>
      <PageHeader title="Admin Hub" description="Reminders, audit, and engagement" />
      <Tabs defaultValue="reminders">
        <TabsList className="rounded-xl">
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>
        <TabsContent value="reminders" className="space-y-4 mt-4">
          <Button
            className="rounded-full"
            onClick={() => remindersApi.sendEvents().then(() => toast.success("Reminders sent"))}
          >
            Send event reminders
          </Button>
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-5">
              <pre className="text-sm overflow-auto">{JSON.stringify(pending, null, 2)}</pre>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="audit" className="mt-4">
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-5">
              <pre className="text-sm overflow-auto max-h-96">{JSON.stringify(audit, null, 2)}</pre>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="engagement" className="mt-4">
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-5">
              <pre className="text-sm overflow-auto">{JSON.stringify(leaders, null, 2)}</pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
