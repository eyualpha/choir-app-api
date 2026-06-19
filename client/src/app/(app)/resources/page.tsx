"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { resourcesApi } from "@/lib/api-client";
import { ApiError } from "@/lib/api";

interface Resource {
  _id: string;
  title: string;
  type: string;
  file?: { url?: string };
}

export default function ResourcesPage() {
  const { isAdmin } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);

  const load = () =>
    resourcesApi.list().then((r) => setResources(r.resources as Resource[] ?? []));

  useEffect(() => {
    load().catch(() => toast.error("Failed to load resources"));
  }, []);

  async function upload() {
    if (!files?.length) return;
    try {
      await resourcesApi.upload(title, "", Array.from(files));
      toast.success("Uploaded");
      load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Upload failed");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Resources" description="Sheet music, recordings, and files" />
      {isAdmin && (
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="space-y-3 p-5">
            <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" /></div>
            <div><Label>Files</Label><Input type="file" multiple onChange={(e) => setFiles(e.target.files)} className="rounded-xl" /></div>
            <Button onClick={upload} className="rounded-full">Upload</Button>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {resources.map((r) => (
          <Card key={r._id} className="rounded-2xl border-0 shadow-sm">
            <CardContent className="flex justify-between p-5">
              <div>
                <p className="font-medium">{r.title}</p>
                <p className="text-sm text-muted-foreground">{r.type}</p>
              </div>
              {r.file?.url && (
                <a href={r.file.url} target="_blank" rel="noreferrer" className="text-violet-600 text-sm">Open</a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
