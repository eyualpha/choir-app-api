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
import { practiceApi } from "@/lib/api-client";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

interface PracticeLog {
  _id: string;
  minutes: number;
  notes?: string;
  practicedAt?: string;
}

export default function PracticePage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<PracticeLog[]>([]);
  const [minutes, setMinutes] = useState("30");
  const [notes, setNotes] = useState("");

  const load = () =>
    practiceApi.list().then((r) => setLogs((r as { logs?: PracticeLog[] }).logs ?? []));

  useEffect(() => {
    load().catch(() => toast.error("Failed to load practice logs"));
  }, []);

  async function submit() {
    try {
      await practiceApi.create({ minutes: Number(minutes), notes });
      toast.success("Practice logged");
      setNotes("");
      load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed");
    }
  }

  useEffect(() => {
    if (user?.id) practiceApi.stats(user.id).catch(() => {});
  }, [user]);

  return (
    <div className="space-y-6">
      <PageHeader title="Practice" description="Log your rehearsal and practice time" />
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="space-y-3 p-5">
          <div><Label>Minutes</Label><Input value={minutes} onChange={(e) => setMinutes(e.target.value)} className="rounded-xl" /></div>
          <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-xl" /></div>
          <Button onClick={submit} className="rounded-full">Log practice</Button>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {logs.map((l) => (
          <Card key={l._id} className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-4 flex justify-between">
              <span>{l.minutes} minutes — {l.notes || "No notes"}</span>
              <span className="text-sm text-muted-foreground">
                {l.practicedAt ? format(new Date(l.practicedAt), "PP") : ""}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
