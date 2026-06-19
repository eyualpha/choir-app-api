"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  CalendarDays,
  ClipboardList,
  FolderOpen,
  Megaphone,
  Mic2,
  MoreHorizontal,
  Music,
  Plus,
  Users,
} from "lucide-react";
import { announcementsApi, eventsApi } from "@/lib/api-client";
import type { Announcement, ChoirEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

const shortcuts = [
  { href: "/members", label: "Members", icon: Users, chip: "chip-pastel-lavender" },
  { href: "/songs", label: "Songs", icon: Music, chip: "chip-pastel-mint" },
  { href: "/practice", label: "Practice", icon: Mic2, chip: "chip-pastel-peach" },
  { href: "/assignments", label: "Tasks", icon: ClipboardList, chip: "chip-pastel-sky" },
];

export function AppRightPanel() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [nextEvent, setNextEvent] = useState<ChoirEvent | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [annRes, eventsRes] = await Promise.all([
          announcementsApi.list(),
          eventsApi.upcoming(),
        ]);
        if (cancelled) return;
        setAnnouncements((annRes.announcements?.slice(0, 4) as Announcement[]) ?? []);
        const events =
          (eventsRes as { events?: ChoirEvent[] }).events ??
          (eventsRes as { data?: { events?: ChoirEvent[] } }).data?.events ??
          [];
        setNextEvent(Array.isArray(events) && events.length > 0 ? events[0] : null);
      } catch {
        /* optional panel */
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <aside className="hidden w-[300px] shrink-0 flex-col border-l border-border/60 bg-background xl:flex">
      <div className="flex-1 overflow-y-auto p-5">
        <section>
          <h3 className="text-sm font-bold text-foreground">Shortcuts</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {shortcuts.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-transform hover:scale-[1.02]",
                  item.chip
                )}
              >
                <item.icon className="size-3.5" strokeWidth={1.75} />
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Latest news</h3>
            <Link href="/announcements" className="text-xs font-medium text-muted-foreground hover:text-foreground">
              See all
            </Link>
          </div>
          <ul className="mt-3 space-y-1">
            {announcements.length === 0 ? (
              <li className="rounded-xl px-2 py-3 text-sm text-muted-foreground">
                No announcements yet
              </li>
            ) : (
              announcements.map((a) => (
                <li key={a._id}>
                  <Link
                    href="/announcements"
                    className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted/60"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                      <Megaphone className="size-4" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{a.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {format(new Date(a.createdAt), "MMM d")}
                      </p>
                    </div>
                    <MoreHorizontal className="size-4 shrink-0 text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="mt-8">
          <div
            className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/30"
            style={{
              backgroundImage: "url(/hero-choir.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
            <div className="relative p-4">
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-white/20 p-1.5 backdrop-blur-sm">
                  <CalendarDays className="size-4 text-white" />
                </div>
                <Link
                  href="/events"
                  className="flex size-8 items-center justify-center rounded-lg border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <Plus className="size-4" />
                </Link>
              </div>
              {nextEvent ? (
                <>
                  <p className="mt-8 text-xs font-medium uppercase tracking-wide text-white/70">
                    Next up
                  </p>
                  <p className="mt-1 text-base font-bold leading-snug text-white">{nextEvent.title}</p>
                  <p className="mt-1 text-xs text-white/80">
                    {format(new Date(nextEvent.startAt), "EEE, MMM d · h:mm a")}
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-8 text-xs font-medium uppercase tracking-wide text-white/70">
                    Featured
                  </p>
                  <p className="mt-1 text-base font-bold leading-snug text-white">
                    Your choir hub
                  </p>
                  <p className="mt-1 text-xs text-white/80">Schedule events to see them here</p>
                </>
              )}
            </div>
          </div>
          <Link
            href="/resources"
            className="mt-3 flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <FolderOpen className="size-3.5" />
            Browse sheet music & files
          </Link>
        </section>
      </div>

      {user?.voicePart && (
        <div className="border-t border-border/60 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Your section
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">{user.voicePart}</p>
        </div>
      )}
    </aside>
  );
}
