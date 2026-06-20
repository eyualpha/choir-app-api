"use client";

import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { configureApiUrl } from "@/lib/api-config";

export function Providers({
  children,
  apiUrl,
}: {
  children: React.ReactNode;
  apiUrl: string;
}) {
  configureApiUrl(apiUrl);

  return (
    <AuthProvider>
      {children}
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
