"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { usersApi, rosterApi } from "@/lib/api-client";
import type { User } from "@/lib/types";

export default function MembersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    usersApi.list()
      .then((r) => setUsers(r.users ?? []))
      .catch(() => toast.error("Failed to load members"));
    rosterApi.voiceParts().catch(() => {});
  }, []);

  return (
    <div>
      <PageHeader title="Members" description="Choir roster and voice parts" />
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Voice</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u._id || u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.voicePart || "—"}</TableCell>
                <TableCell><Badge variant="secondary">{u.role}</Badge></TableCell>
                <TableCell>{u.isActive ? "Active" : "Inactive"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
