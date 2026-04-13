"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const isInterviewActive = pathname === "/interview";

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 glass border-b border-white/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl" role="img" aria-label="rocket">
              🚀
            </span>
            <span className="text-lg font-bold tracking-tight text-text-primary">
              Interview<span className="gradient-text">AI</span>
            </span>
          </Link>

          {/* Center – interview indicator */}
          {isInterviewActive && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm text-accent font-medium">
                Interview in Progress
              </span>
            </motion.div>
          )}

          {/* Right – CTA */}
          <div className="flex items-center gap-3">
            {!isInterviewActive && (
              <Link href="/setup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-all duration-300 glow-orange cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Start Practice
                </motion.button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
