"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileMusic, Shield, User } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { DEMO_CREDENTIALS } from "@/lib/demo-credentials";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    router.replace("/dashboard");
    return null;
  }

  async function signIn(loginEmail: string, loginPassword: string) {
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signIn(email, password);
  }

  async function loginAsDemo(role: "admin" | "member") {
    const creds = DEMO_CREDENTIALS[role];
    setEmail(creds.email);
    setPassword(creds.password);
    await signIn(creds.email, creds.password);
  }

  return (
    <div className="flex min-h-screen bg-canvas p-3 sm:p-4">
      <div className="app-shell mx-auto w-full max-w-6xl">
        <div className="relative hidden w-1/2 overflow-hidden lg:block">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/hero-choir.jpg)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          <div className="relative flex h-full flex-col justify-between p-10">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <FileMusic className="size-5 text-white" strokeWidth={1.75} />
              </div>
              <span className="text-xl font-bold text-white">HarmoniQ</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold leading-tight text-white text-balance">
                Your choir, harmonized.
              </h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-white/75">
                Rehearsals, setlists, attendance, and member engagement — all in one beautiful
                workspace.
              </p>
            </div>
            <p className="text-sm text-white/50">HarmoniQ Choir Platform v2.0</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-sm space-y-6">
            <div className="lg:hidden">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <FileMusic className="size-5" />
                </div>
                <span className="text-lg font-bold">HarmoniQ</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Sign in</h2>
                <p className="mt-1 text-sm text-muted-foreground">Access your choir dashboard</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11 rounded-2xl border-border/80 bg-muted/30"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-2xl border-border/80 bg-muted/30"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                <Link href="/forgot-password" className="font-medium text-foreground hover:underline">
                  Forgot password?
                </Link>
              </p>
            </form>

            <div className="rounded-2xl border border-border/80 bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Portfolio demo
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try the app with sample choir data. One-click login below.
              </p>
              <div className="mt-3 space-y-2 rounded-xl bg-background/80 p-3 font-mono text-xs text-foreground">
                <p>
                  <span className="text-muted-foreground">Admin:</span> {DEMO_CREDENTIALS.admin.email}
                </p>
                <p>
                  <span className="text-muted-foreground">Pass:</span> {DEMO_CREDENTIALS.admin.password}
                </p>
                <p className="pt-1">
                  <span className="text-muted-foreground">Member:</span> {DEMO_CREDENTIALS.member.email}
                </p>
                <p>
                  <span className="text-muted-foreground">Pass:</span> {DEMO_CREDENTIALS.member.password}
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  className="h-10 rounded-full"
                  onClick={() => loginAsDemo("admin")}
                >
                  <Shield className="mr-1.5 size-4" />
                  Admin demo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  className="h-10 rounded-full"
                  onClick={() => loginAsDemo("member")}
                >
                  <User className="mr-1.5 size-4" />
                  Member demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
