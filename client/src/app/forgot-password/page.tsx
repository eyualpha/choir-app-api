"use client";

import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "otp" | "done">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendOtp() {
    setLoading(true);
    try {
      await authApi.requestReset(email);
      toast.success("If an account exists, a code was sent to your email");
      setStep("otp");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await authApi.setPassword({ email, otp, password, confirmPassword: confirm });
      toast.success("Password updated");
      setStep("done");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4 sm:p-8">
      <div className="surface-card w-full max-w-md space-y-6 p-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Reset password</h2>
          <p className="mt-1 text-sm text-muted-foreground">We&apos;ll send a code to your email</p>
        </div>
        {step === "email" && (
          <>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-2xl border-border/80 bg-muted/30"
              />
            </div>
            <Button onClick={sendOtp} disabled={loading} className="h-11 w-full rounded-full">
              Send reset code
            </Button>
          </>
        )}
        {step === "otp" && (
          <>
            <div className="space-y-2">
              <Label>OTP Code</Label>
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="h-11 rounded-2xl border-border/80 bg-muted/30"
              />
            </div>
            <div className="space-y-2">
              <Label>New password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-2xl border-border/80 bg-muted/30"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm password</Label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="h-11 rounded-2xl border-border/80 bg-muted/30"
              />
            </div>
            <Button onClick={resetPassword} disabled={loading} className="h-11 w-full rounded-full">
              Update password
            </Button>
          </>
        )}
        {step === "done" && (
          <p className="text-muted-foreground">
            Password updated.{" "}
            <Link href="/login" className="font-medium text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        )}
        <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Back to login
        </Link>
      </div>
    </div>
  );
}
