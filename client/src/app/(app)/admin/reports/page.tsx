"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { reportsApi } from "@/lib/api-client";

export default function ReportsPage() {
  const [dashboard, setDashboard] = useState<unknown>(null);
  const [growth, setGrowth] = useState<unknown>(null);
  const [songs, setSongs] = useState<unknown>(null);

  useEffect(() => {
    reportsApi.dashboard().then(setDashboard).catch(() => {});
    reportsApi.memberGrowth().then(setGrowth).catch(() => {});
    reportsApi.songUsage().then(setSongs).catch(() => {});
  }, []);

  return (
    <div>
      <PageHeader title="Reports" description="Analytics and insights" />
      <Tabs defaultValue="dashboard">
        <TabsList className="rounded-xl">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="growth">Member growth</TabsTrigger>
          <TabsTrigger value="songs">Song usage</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="mt-4">
          <Card className="rounded-2xl border-0 shadow-sm"><CardContent className="p-5"><pre className="text-sm">{JSON.stringify(dashboard, null, 2)}</pre></CardContent></Card>
        </TabsContent>
        <TabsContent value="growth" className="mt-4">
          <Card className="rounded-2xl border-0 shadow-sm"><CardContent className="p-5"><pre className="text-sm">{JSON.stringify(growth, null, 2)}</pre></CardContent></Card>
        </TabsContent>
        <TabsContent value="songs" className="mt-4">
          <Card className="rounded-2xl border-0 shadow-sm"><CardContent className="p-5"><pre className="text-sm">{JSON.stringify(songs, null, 2)}</pre></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
