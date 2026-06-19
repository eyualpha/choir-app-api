"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { announcementsApi } from "@/lib/api-client";
import { ApiError } from "@/lib/api";
import type { Announcement } from "@/lib/types";

export default function AnnouncementsPage() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const load = () =>
    announcementsApi.list().then((r) => setItems(r.announcements as Announcement[] ?? []));

  useEffect(() => {
    load().catch(() => toast.error("Failed to load"));
  }, []);

  async function create() {
    try {
      await announcementsApi.create(title, message);
      toast.success("Posted");
      setTitle("");
      setMessage("");
      load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Announcements" description="Choir news and updates" />
      {isAdmin && (
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="space-y-3 p-5">
            <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" /></div>
            <div><Label>Message</Label><Textarea value={message} onChange={(e) => setMessage(e.target.value)} className="rounded-xl" /></div>
            <Button onClick={create} className="rounded-full">Publish</Button>
          </CardContent>
        </Card>
      )}
      <div className="space-y-3">
        {items.map((a) => (
          <Card key={a._id} className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex justify-between">
                <p className="font-semibold">{a.title}</p>
                {isAdmin && (
                  <Button size="sm" variant="destructive" onClick={() => announcementsApi.delete(a._id).then(load)}>
                    Delete
                  </Button>
                )}
              </div>
              <p className="mt-2 text-muted-foreground">{a.message}</p>
              <p className="mt-2 text-xs text-muted-foreground">{format(new Date(a.createdAt), "PPp")}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
