"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { setlistsApi } from "@/lib/api-client";

interface Setlist {
  _id: string;
  title: string;
  status: string;
  totalEstimatedMinutes?: number;
  isTemplate?: boolean;
}

export default function SetlistsPage() {
  const [setlists, setSetlists] = useState<Setlist[]>([]);

  useEffect(() => {
    setlistsApi.list()
      .then((r) => setSetlists((r as { setlists?: Setlist[] }).setlists ?? []))
      .catch(() => toast.error("Failed to load setlists"));
  }, []);

  return (
    <div>
      <PageHeader title="Setlists" description="Service and rehearsal setlists" />
      <div className="grid gap-3 md:grid-cols-2">
        {setlists.map((s) => (
          <Card key={s._id} className="rounded-2xl border-0 shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="font-semibold">{s.title}</p>
                <p className="text-sm text-muted-foreground">
                  {s.totalEstimatedMinutes ? `${s.totalEstimatedMinutes} min` : "—"}
                </p>
              </div>
              <Badge>{s.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
