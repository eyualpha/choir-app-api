"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { eventsApi, rsvpApi } from "@/lib/api-client";
import { ApiError } from "@/lib/api";
import type { ChoirEvent } from "@/lib/types";

export default function EventsPage() {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState<ChoirEvent[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    eventType: "rehearsal",
    startAt: "",
    endAt: "",
    location: "",
  });

  const load = () =>
    eventsApi.list().then((r) => {
      const list = (r as { events?: ChoirEvent[] }).events ?? [];
      setEvents(list);
    });

  useEffect(() => {
    load().catch(() => toast.error("Failed to load events"));
  }, []);

  async function createEvent() {
    try {
      await eventsApi.create({
        ...form,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
      });
      toast.success("Event created");
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed");
    }
  }

  async function rsvp(eventId: string, status: string) {
    try {
      await rsvpApi.submit(eventId, status);
      toast.success("RSVP updated");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "RSVP failed");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <PageHeader title="Events" description="Rehearsals, performances, and meetings" />
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <Button
              className="rounded-full"
              onClick={() => setOpen(true)}
            >
              New event
            </Button>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Create event</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl" />
                </div>
                <div>
                  <Label>Start</Label>
                  <Input type="datetime-local" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} className="rounded-xl" />
                </div>
                <div>
                  <Label>End</Label>
                  <Input type="datetime-local" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} className="rounded-xl" />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="rounded-xl" />
                </div>
                <Button onClick={createEvent} className="w-full rounded-full">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="space-y-3">
        {events.map((e) => (
          <Card key={e._id} className="rounded-2xl border-0 shadow-sm">
            <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{e.title}</p>
                  <Badge variant="secondary">{e.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(e.startAt), "PPp")} · {e.location || "TBD"}
                </p>
                <p className="text-xs text-muted-foreground capitalize">{e.eventType}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="rounded-xl" onClick={() => rsvp(e._id, "attending")}>Attending</Button>
                <Button size="sm" variant="outline" className="rounded-xl" onClick={() => rsvp(e._id, "maybe")}>Maybe</Button>
                <Button size="sm" variant="outline" className="rounded-xl" onClick={() => rsvp(e._id, "not_attending")}>Can&apos;t go</Button>
                {isAdmin && (
                  <>
                    <Button size="sm" className="rounded-xl" onClick={() => eventsApi.complete(e._id).then(load)}>Complete</Button>
                    <Button size="sm" variant="destructive" className="rounded-xl" onClick={() => eventsApi.cancel(e._id).then(load)}>Cancel</Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
