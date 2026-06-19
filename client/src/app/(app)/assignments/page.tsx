"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Mic2, Music, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { assignmentsApi } from "@/lib/api-client";
import { ApiError } from "@/lib/api";
import type { User } from "@/lib/types";

interface AssignmentGroups {
  leadSingers: User[];
  backupSingers: User[];
  prayerTeam: User[];
}

const emptyGroups: AssignmentGroups = {
  leadSingers: [],
  backupSingers: [],
  prayerTeam: [],
};

const categories: Array<{
  key: keyof AssignmentGroups;
  label: string;
  description: string;
  icon: typeof Mic2;
}> = [
  {
    key: "leadSingers",
    label: "Lead singers",
    description: "Primary vocal leads for performances",
    icon: Mic2,
  },
  {
    key: "backupSingers",
    label: "Backup singers",
    description: "Supporting vocalists",
    icon: Music,
  },
  {
    key: "prayerTeam",
    label: "Prayer team",
    description: "Members serving in prayer ministry",
    icon: Users,
  },
];

export default function AssignmentsPage() {
  const [groups, setGroups] = useState<AssignmentGroups | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(null);
      try {
        const res = (await assignmentsApi.list()) as {
          assignment?: AssignmentGroups;
        };
        if (cancelled) return;

        const assignment = res.assignment ?? emptyGroups;
        setGroups({
          leadSingers: assignment.leadSingers ?? [],
          backupSingers: assignment.backupSingers ?? [],
          prayerTeam: assignment.prayerTeam ?? [],
        });
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : "We couldn't load assignments right now.";
        setError(message);
        setGroups(emptyGroups);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalAssigned = groups
    ? groups.leadSingers.length + groups.backupSingers.length + groups.prayerTeam.length
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        description="Lead singers, backups, and prayer team"
      />

      {groups === null ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : error ? (
        <div className="surface-card p-6">
          <EmptyState
            icon={ClipboardList}
            title="Couldn't load assignments"
            description={error}
          />
        </div>
      ) : totalAssigned === 0 ? (
        <div className="surface-card p-6">
          <EmptyState
            icon={ClipboardList}
            title="No assignments yet"
            description="When directors assign lead singers, backups, or prayer team members, they'll appear here."
          />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {categories.map(({ key, label, description, icon: Icon }) => {
            const members = groups[key];
            return (
              <section key={key} className="surface-card overflow-hidden">
                <div className="border-b border-border/60 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <Icon className="size-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <h2 className="font-bold text-foreground">{label}</h2>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  {members.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No members assigned</p>
                  ) : (
                    <ul className="space-y-2">
                      {members.map((member) => (
                        <li
                          key={member._id ?? member.id ?? member.email}
                          className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3"
                        >
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.voicePart ? `${member.voicePart} · ` : ""}
                            {member.email}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
