"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { notificationsApi } from "@/lib/api-client";
import type { Notification } from "@/lib/types";

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);

  const load = () =>
    notificationsApi.list().then((r) => setItems((r as { notifications?: Notification[] }).notifications ?? []));

  useEffect(() => {
    load().catch(() => toast.error("Failed to load notifications"));
  }, []);

  return (
    <div>
      <PageHeader title="Notifications" description="Your alerts and messages" />
      <div className="mb-4">
        <Button variant="outline" className="rounded-xl" onClick={() => notificationsApi.markAllRead().then(load)}>
          Mark all read
        </Button>
      </div>
      <div className="space-y-2">
        {items.map((n) => (
          <Card key={n._id} className={`rounded-2xl border-0 shadow-sm ${!n.isRead ? "ring-2 ring-violet-200" : ""}`}>
            <CardContent className="flex justify-between p-4">
              <div>
                <p className="font-medium">{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.body}</p>
                <p className="text-xs text-muted-foreground mt-1">{format(new Date(n.createdAt), "PPp")}</p>
              </div>
              {!n.isRead && (
                <Button size="sm" onClick={() => notificationsApi.markRead(n._id).then(load)} className="rounded-xl">
                  Mark read
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
