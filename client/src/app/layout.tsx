import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from "@/components/providers";
import { resolveApiUrlFromEnv } from "@/lib/api-config";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HarmoniQ — Choir Management",
  description: "Modern choir management platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Read on the server at request time so Vercel env vars apply without a stale build bundle.
  const apiUrl = resolveApiUrlFromEnv(
    process.env.NEXT_PUBLIC_API_URL,
    process.env.API_URL
  );

  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__HARMONIQ_API_URL=${JSON.stringify(apiUrl)};`,
          }}
        />
        <Providers apiUrl={apiUrl}>{children}</Providers>
      </body>
    </html>
  );
}
