"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppRightPanel } from "@/components/layout/app-right-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, ChevronLeft, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Home",
  "/events": "Events",
  "/songs": "Songs",
  "/setlists": "Setlists",
  "/members": "Members",
  "/practice": "Practice",
  "/announcements": "Announcements",
  "/assignments": "Assignments",
  "/resources": "Resources",
  "/notifications": "Notifications",
  "/profile": "Profile",
  "/admin": "Admin",
  "/admin/reports": "Reports",
};

function getPageTitle(pathname: string) {
  if (pageTitles[pathname]) return pageTitles[pathname];
  const match = Object.entries(pageTitles).find(
    ([path]) => path !== "/dashboard" && pathname.startsWith(path)
  );
  return match?.[1] ?? "HarmoniQ";
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    setMobileNav(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="size-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const title = getPageTitle(pathname);
  const canGoBack = pathname !== "/dashboard";

  return (
    <div className="min-h-screen bg-canvas p-2 sm:p-3 md:p-4">
      <div className="app-shell">
        {/* Mobile sidebar overlay */}
        {mobileNav && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileNav(false)}
            aria-hidden
          />
        )}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:static lg:translate-x-0",
            mobileNav ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <AppSidebar />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex shrink-0 items-center gap-2 border-b border-border/60 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full lg:hidden"
              onClick={() => setMobileNav(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
            {canGoBack && (
              <Button
                variant="ghost"
                size="icon"
                className="hidden rounded-full sm:inline-flex"
                onClick={() => router.back()}
                aria-label="Go back"
              >
                <ChevronLeft className="size-5" />
              </Button>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-bold tracking-tight text-foreground sm:text-xl">
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/notifications"
                className="relative inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Bell className="size-[18px]" strokeWidth={1.75} />
              </Link>
              <Badge variant="secondary" className="hidden rounded-full border-0 sm:inline-flex">
                {user.role}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-muted-foreground hover:text-foreground"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                aria-label="Sign out"
              >
                <LogOut className="size-[18px]" strokeWidth={1.75} />
              </Button>
            </div>
          </header>

          <div className="flex min-h-0 flex-1">
            <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
            <AppRightPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
