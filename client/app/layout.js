import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "GitPulse - GitHub Repository Analytics Dashboard",
  description: "Search, analyze, and save public GitHub repositories with real-time stats, commits, and contributors.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        <Suspense fallback={<div className="h-16 w-full border-b border-slate-800 bg-slate-950" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>GitHub Repository Analytics Dashboard — Node.js Full-Stack Assignment</p>
            <p>Built with Next.js, Express.js, MongoDB & Tailwind CSS</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
