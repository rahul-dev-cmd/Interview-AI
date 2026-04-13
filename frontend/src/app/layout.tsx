import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "InterviewAI — Accelerate Your Career",
  description:
    "Master your tech interviews with adaptive AI practice. Get real-time feedback, personalized follow-ups, and comprehensive performance reports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* ===== Ambient Cloud Layers ===== */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {/* far – very soft */}
          <div
            className="absolute rounded-full bg-white/30 blur-md"
            style={{
              width: 420,
              height: 110,
              top: "18%",
              animation: "driftRight 90s linear infinite",
            }}
          />
          <div
            className="absolute rounded-full bg-white/25 blur-md"
            style={{
              width: 350,
              height: 90,
              top: "32%",
              animation: "driftLeft 80s linear infinite",
              animationDelay: "-25s",
            }}
          />

          {/* mid */}
          <div
            className="absolute rounded-full bg-white/45 blur-sm"
            style={{
              width: 500,
              height: 130,
              top: "52%",
              animation: "driftRight 65s linear infinite",
              animationDelay: "-15s",
            }}
          />
          <div
            className="absolute rounded-full bg-white/40 blur-sm"
            style={{
              width: 380,
              height: 100,
              top: "60%",
              animation: "driftLeft 55s linear infinite",
              animationDelay: "-30s",
            }}
          />

          {/* near – bright & dense */}
          <div
            className="absolute rounded-full bg-white/70 blur-[2px]"
            style={{
              width: 600,
              height: 160,
              top: "74%",
              animation: "driftRight 45s linear infinite",
              animationDelay: "-10s",
            }}
          />
          <div
            className="absolute rounded-full bg-white/65 blur-[3px]"
            style={{
              width: 550,
              height: 140,
              top: "82%",
              animation: "driftLeft 50s linear infinite",
              animationDelay: "-20s",
            }}
          />

          {/* Bottom cloud floor gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-[22vh] bg-gradient-to-t from-white/70 via-white/30 to-transparent" />
        </div>

        {/* ===== App Shell ===== */}
        <div className="relative z-10 min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
