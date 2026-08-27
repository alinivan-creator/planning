import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { Providers } from "@/components/Providers";
import { findDemoUser } from "@/lib/auth/users";
import { SESSION_COOKIE } from "@/lib/rbac";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0284c7",
};

export const metadata: Metadata = {
  title: "TuraPlan — Management ture și HR",
  description:
    "Platformă B2B de management al turelor, concediilor și documentelor angajaților.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const jar = await cookies();
  const initialUser = findDemoUser(jar.get(SESSION_COOKIE)?.value);

  return (
    <html
      lang="ro"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-100 text-slate-900">
        <Providers initialUser={initialUser}>{children}</Providers>
      </body>
    </html>
  );
}
