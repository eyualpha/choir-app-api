"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { songsApi } from "@/lib/api-client";
import { ApiError } from "@/lib/api";
import type { Song } from "@/lib/types";

export default function SongsPage() {
  const { isAdmin } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [composer, setComposer] = useState("");

  const load = () =>
    songsApi.list().then((r) => setSongs((r as { songs?: Song[] }).songs ?? []));

  useEffect(() => {
    load().catch(() => toast.error("Failed to load songs"));
  }, []);

  async function create() {
    try {
      await songsApi.create({ title, composer });
      toast.success("Song added");
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <PageHeader title="Songs" description="Choir repertoire catalog" />
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <Button className="rounded-full" onClick={() => setOpen(true)}>
              Add song
            </Button>
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle>New song</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" /></div>
                <div><Label>Composer</Label><Input value={composer} onChange={(e) => setComposer(e.target.value)} className="rounded-xl" /></div>
                <Button onClick={create} className="w-full rounded-full">Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {songs.map((s) => (
          <Card key={s._id} className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-5">
              <p className="font-semibold">{s.title}</p>
              <p className="text-sm text-muted-foreground">{s.composer || "Unknown composer"}</p>
              {s.keySignature && <p className="text-xs text-violet-600 mt-1">Key: {s.keySignature}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
