"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useAuth } from "@/contexts/auth-context";
import { announcementsApi, eventsApi, notificationsApi, reportsApi } from "@/lib/api-client";
import type { Announcement, ChoirEvent } from "@/lib/types";
import { StatCard } from "@/components/dashboard/stat-card";
import { SectionPanel } from "@/components/dashboard/section-panel";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Bell,
  Calendar,
  CalendarDays,
  FolderOpen,
  Megaphone,
  Mic2,
  Music,
  Play,
  Users,
  Volume2,
} from "lucide-react";

interface DashboardSummary {
  members?: { total?: number; admins?: number };
  events?: { upcoming?: number };
  library?: { activeSongs?: number; resources?: number };
  engagement?: {
    attendanceRecordsLast30Days?: number;
    unreadNotifications?: number;
    activeAnnouncements?: number;
  };
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [upcoming, setUpcoming] = useState<ChoirEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unread, setUnread] = useState(0);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [eventsRes, annRes, unreadRes] = await Promise.all([
          eventsApi.upcoming(),
          announcementsApi.list(),
          notificationsApi.unreadCount(),
        ]);

        if (cancelled) return;

        const events =
          (eventsRes as { events?: ChoirEvent[] }).events ??
          (eventsRes as { data?: { events?: ChoirEvent[] } }).data?.events ??
          [];
        const eventList = Array.isArray(events) ? events.slice(0, 8) : [];
        setUpcoming(eventList);
        if (eventList.length > 0) setActiveEventId(eventList[0]._id);
        setAnnouncements((annRes.announcements?.slice(0, 4) as Announcement[]) ?? []);
        setUnread((unreadRes as { count?: number }).count ?? 0);

        if (isAdmin) {
          const reportRes = await reportsApi.dashboard();
          if (!cancelled) {
            const data =
              (reportRes as { dashboard?: DashboardSummary }).dashboard ??
              (reportRes as DashboardSummary);
            setSummary(data);
          }
        }
      } catch {
        /* sections show empty states */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const quickActions = [
    { href: "/practice", label: "Log practice", description: "Track rehearsal time", icon: Mic2 },
    { href: "/events", label: "Events", description: "RSVP & schedules", icon: CalendarDays },
    { href: "/announcements", label: "News", description: "Choir updates", icon: Megaphone },
    { href: "/resources", label: "Resources", description: "Scores & files", icon: FolderOpen },
  ];

  const featuredEvent = upcoming[0];
  const today = format(new Date(), "EEEE, MMMM d");

  return (
    <div className="mx-auto max-w-4xl space-y-6 lg:max-w-none lg:space-y-8">
      {/* Welcome strip */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{today}</p>
          <p className="mt-0.5 text-lg font-bold text-foreground">
            Welcome back, {user?.name?.split(" ")[0]}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {user?.voicePart && (
            <Badge variant="secondary" className="rounded-full border-0">
              {user.voicePart}
            </Badge>
          )}
          {unread > 0 && (
            <Badge className="rounded-full bg-primary text-primary-foreground">{unread} new</Badge>
          )}
        </div>
      </div>

      {/* Hero — trending-style banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/50">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/hero-choir.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />
        <div className="relative flex min-h-[200px] flex-col justify-end p-6 sm:min-h-[220px] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Featured</p>
          <h2 className="mt-2 max-w-md text-2xl font-bold leading-tight text-white sm:text-3xl text-balance">
            {featuredEvent?.title ?? "Your choir hub for rehearsals & performances"}
          </h2>
          <p className="mt-2 max-w-sm text-sm text-white/75">
            {featuredEvent
              ? `${format(new Date(featuredEvent.startAt), "EEEE, MMM d · h:mm a")}${featuredEvent.location ? ` · ${featuredEvent.location}` : ""}`
              : "Manage setlists, track practice, and keep every voice aligned."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={featuredEvent ? "/events" : "/songs"}
              className={cn(
                buttonVariants(),
                "rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
              )}
            >
              <Play className="mr-2 size-4 fill-current" />
              {featuredEvent ? "View event" : "Browse songs"}
            </Link>
            <Link
              href="/members"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "rounded-full border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
              )}
            >
              {isAdmin ? "Manage members" : "View members"}
            </Link>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {isAdmin && summary ? (
          <>
            <StatCard
              label="Active members"
              value={summary.members?.total ?? 0}
              hint={`${summary.members?.admins ?? 0} admins`}
              icon={Users}
              accent="violet"
            />
            <StatCard
              label="Upcoming events"
              value={summary.events?.upcoming ?? upcoming.length}
              hint="Scheduled ahead"
              icon={Calendar}
              accent="blue"
            />
            <StatCard
              label="Songs in library"
              value={summary.library?.activeSongs ?? 0}
              hint={`${summary.library?.resources ?? 0} resources`}
              icon={Music}
              accent="emerald"
            />
            <StatCard
              label="Notifications"
              value={unread}
              hint={`${summary.engagement?.activeAnnouncements ?? 0} live announcements`}
              icon={Bell}
              accent="amber"
            />
          </>
        ) : (
          <>
            <StatCard label="Upcoming events" value={upcoming.length} icon={Calendar} accent="violet" />
            <StatCard label="Announcements" value={announcements.length} icon={Megaphone} accent="blue" />
            <StatCard label="Unread alerts" value={unread} icon={Bell} accent="amber" />
            <StatCard label="Your voice" value={user?.voicePart ?? "—"} icon={Users} accent="emerald" />
          </>
        )}
      </div>

      {/* Shortcuts */}
      <SectionPanel title="Shortcuts" description="Jump to common tasks">
        <QuickActions actions={quickActions} />
      </SectionPanel>

      {/* Playlist-style events table */}
      <SectionPanel
        title="Upcoming schedule"
        description="Rehearsals and performances"
        href="/events"
      >
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No upcoming events"
            description="When directors schedule rehearsals, they'll appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="pb-3 pl-2 font-semibold">#</th>
                  <th className="pb-3 font-semibold">Event</th>
                  <th className="hidden pb-3 font-semibold sm:table-cell">Type</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="hidden pb-3 font-semibold md:table-cell">Location</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((event, index) => {
                  const active = activeEventId === event._id;
                  return (
                    <tr key={event._id}>
                      <td colSpan={5} className="p-0">
                        <Link
                          href="/events"
                          onMouseEnter={() => setActiveEventId(event._id)}
                          className={cn(
                            "my-1 flex items-center rounded-2xl px-2 py-3 transition-all",
                            active
                              ? "surface-elevated bg-card"
                              : "hover:bg-muted/50"
                          )}
                        >
                          <span className="flex w-8 shrink-0 items-center justify-center text-muted-foreground">
                            {active ? (
                              <Volume2 className="size-4 text-primary" strokeWidth={1.75} />
                            ) : (
                              <span className="text-xs tabular-nums">{index + 1}</span>
                            )}
                          </span>
                          <span className="min-w-0 flex-1 truncate font-semibold text-foreground">
                            {event.title}
                          </span>
                          <span className="hidden w-24 shrink-0 capitalize text-muted-foreground sm:block">
                            {event.eventType}
                          </span>
                          <span className="w-36 shrink-0 text-muted-foreground">
                            {format(new Date(event.startAt), "MMM d, h:mm a")}
                          </span>
                          <span className="hidden w-32 shrink-0 truncate text-muted-foreground md:block">
                            {event.location || "—"}
                          </span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionPanel>

      {/* Announcements cards */}
      {announcements.length > 0 && (
        <SectionPanel title="Announcements" href="/announcements">
          <ul className="space-y-2">
            {announcements.map((a) => (
              <li
                key={a._id}
                className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-3.5 transition-colors hover:bg-muted/50"
              >
                <p className="font-semibold text-foreground">{a.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {format(new Date(a.createdAt), "PP")}
                </p>
              </li>
            ))}
          </ul>
        </SectionPanel>
      )}

      {isAdmin && summary && (
        <div className="surface-card grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Attendance (30d)</p>
            <p className="mt-1 text-xl font-bold">{summary.engagement?.attendanceRecordsLast30Days ?? 0}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Live announcements</p>
            <p className="mt-1 text-xl font-bold">{summary.engagement?.activeAnnouncements ?? 0}</p>
          </div>
          <div className="col-span-2 flex items-end justify-end">
            <Link href="/admin/reports" className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}>
              Open reports
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
