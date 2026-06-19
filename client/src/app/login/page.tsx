"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileMusic } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
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
          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
            <div className="lg:hidden">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <FileMusic className="size-5" />
                </div>
                <span className="text-lg font-bold">HarmoniQ</span>
              </div>
            </div>
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
        </div>
      </div>
    </div>
  );
}
