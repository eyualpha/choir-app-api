"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  Calendar,
  ChevronRight,
  ClipboardList,
  FileMusic,
  FolderOpen,
  Home,
  ListMusic,
  Megaphone,
  Mic2,
  Music,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const discoverNav = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/practice", label: "Practice", icon: Mic2 },
];

const libraryNav = [
  { href: "/songs", label: "Songs", icon: Music },
  { href: "/setlists", label: "Setlists", icon: ListMusic },
  { href: "/resources", label: "Resources", icon: FolderOpen },
];

const choirNav = [
  { href: "/members", label: "Members", icon: Users },
  { href: "/announcements", label: "Announcements", icon: Megaphone },
  { href: "/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

const adminNav = [
  { href: "/admin", label: "Admin Hub", icon: Shield },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
];

function NavSection({
  label,
  items,
  pathname,
  onNavigate,
}: {
  label: string;
  items: typeof discoverNav;
  pathname: string;
  onNavigate: (href: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {label}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
          return (
            <li key={item.href}>
              <button
                type="button"
                onClick={() => onNavigate(item.href)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "nav-pill-active"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="size-[18px] shrink-0" strokeWidth={1.75} />
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  return (
    <aside className="flex w-[240px] shrink-0 flex-col border-r border-border/60 bg-sidebar lg:w-[260px]">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <FileMusic className="size-5" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-base font-bold tracking-tight text-foreground">HarmoniQ</p>
          <p className="text-[11px] text-muted-foreground">Choir Platform</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        <NavSection
          label="Discover"
          items={discoverNav}
          pathname={pathname}
          onNavigate={router.push}
        />
        <NavSection
          label="Library"
          items={libraryNav}
          pathname={pathname}
          onNavigate={router.push}
        />
        <NavSection
          label="Your choir"
          items={choirNav}
          pathname={pathname}
          onNavigate={router.push}
        />
        {isAdmin && (
          <NavSection
            label="Admin"
            items={adminNav}
            pathname={pathname}
            onNavigate={router.push}
          />
        )}
      </nav>

      <div className="border-t border-border/60 p-3">
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="flex w-full items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-muted"
        >
          <Avatar className="size-10 ring-2 ring-border">
            <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
              {user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-semibold text-foreground">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.voicePart || user?.role}
            </p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </button>
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="mt-1 flex w-full items-center gap-3 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Settings className="size-4" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
