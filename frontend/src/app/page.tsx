"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  MessageSquare,
  BarChart3,
  Zap,
  ArrowRight,
  Shield,
} from "lucide-react";
import RocketSVG from "@/components/RocketSVG";

/* ── data ── */
const features = [
  {
    icon: Brain,
    title: "Adaptive Questions",
    description:
      "AI tailors questions based on your role, experience, and responses in real-time.",
    gradient: "from-green-400/20 to-emerald-400/20",
    iconColor: "text-green-600",
  },
  {
    icon: MessageSquare,
    title: "Instant Feedback",
    description:
      "Get detailed coaching after every answer — what's strong, what's missing, and how to improve.",
    gradient: "from-blue-400/20 to-cyan-400/20",
    iconColor: "text-blue-600",
  },
  {
    icon: BarChart3,
    title: "Performance Reports",
    description:
      "Comprehensive scorecards with strengths, weaknesses, and personalized improvement plans.",
    gradient: "from-purple-400/20 to-pink-400/20",
    iconColor: "text-purple-600",
  },
  {
    icon: Zap,
    title: "Follow-up Probes",
    description:
      "The AI digs deeper with follow-up questions just like a real interviewer would.",
    gradient: "from-amber-400/20 to-orange-400/20",
    iconColor: "text-amber-600",
  },
];

const stats = [
  { value: "5+", label: "Tech Domains" },
  { value: "4", label: "Difficulty Levels" },
  { value: "∞", label: "Practice Sessions" },
  { value: "AI", label: "Powered Coach" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

/* ──────────────────────────────── */
export default function HomePage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  /* Rocket stays centered and rises gently — never disappears */
  const rocketY = useTransform(scrollYProgress, [0, 0.5, 1], [0, -250, -500]);
  const rocketScale = useTransform(scrollYProgress, [0, 0.4, 1], [1, 0.85, 0.7]);

  /* Parallax cloud movement (push downward as you scroll) */
  const cloud1Y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const cloud2Y = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const cloud3Y = useTransform(scrollYProgress, [0, 1], [0, 420]);

  return (
    <div ref={pageRef} className="relative">

      {/* ═══════ FIXED CENTERED ROCKET — always visible ═══════ */}
      <motion.div
        style={{ y: rocketY, scale: rocketScale }}
        className="fixed left-1/2 -translate-x-1/2 top-[45%] z-[5] pointer-events-none"
      >
        <div className="animate-rocket-float">
          <RocketSVG size={220} />
        </div>
      </motion.div>

      {/* ═══════ PARALLAX EXTRA CLOUDS ═══════ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[3]">
        <motion.div
          style={{ y: cloud1Y }}
          className="absolute rounded-full bg-white/50 blur-sm"
        >
          <div
            className="rounded-full bg-white/60"
            style={{ width: 400, height: 120, position: "absolute", left: "-5vw", top: "60vh" }}
          />
        </motion.div>
        <motion.div
          style={{ y: cloud2Y }}
          className="absolute rounded-full bg-white/40 blur-md"
        >
          <div
            className="rounded-full bg-white/70"
            style={{ width: 350, height: 100, position: "absolute", left: "65vw", top: "50vh" }}
          />
        </motion.div>
        <motion.div
          style={{ y: cloud3Y }}
          className="absolute rounded-full bg-white/60 blur-[3px]"
        >
          <div
            className="rounded-full bg-white/80"
            style={{ width: 500, height: 140, position: "absolute", left: "20vw", top: "75vh" }}
          />
        </motion.div>
      </div>

      {/* ═══════════ SECTION 1 — HERO ═══════════ */}
      <section className="relative h-screen min-h-[800px] flex flex-col items-center justify-start pt-24 sm:pt-32 overflow-hidden px-4 z-10">
        {/* Title — sits ABOVE the rocket visually */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight text-white text-center relative z-20"
        >
          Let&apos;s accelerate
          <br />
          your <span className="text-[#FFC107]">career</span>
        </motion.h1>

        {/* This empty div pushes the CTA down so the rocket is isolated in the middle */}
        <div className="flex-1" />

        {/* CTA Buttons — placed at the bottom of the hero screen */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-20 mb-16"
        >
          <Link href="/setup">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 40px rgba(249,115,22,0.35)",
              }}
              whileTap={{ scale: 0.95 }}
              className="group flex items-center gap-3 px-8 py-4 rounded-xl bg-accent text-white font-bold text-lg transition-all duration-300 glow-orange cursor-pointer"
            >
              Start Practicing
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* ═══════════ SECTION 2 — STATS ═══════════ */}
      <motion.section
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="max-w-5xl mx-auto px-4 py-12 relative z-10"
      >
        <div className="glass rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div key={i} variants={item} className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold gradient-text mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-text-muted">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ═══════════ SECTION 3 — FEATURES ═══════════ */}
      <section className="max-w-6xl mx-auto px-4 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-text-primary">
            Everything You Need to{" "}
            <span className="gradient-text">Ace Your Interview</span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Our AI adapts to your skill level and domain, providing a realistic
            and challenging interview experience.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={item}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass glass-hover rounded-2xl p-8 group cursor-default"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-accent">
                {feature.title}
              </h3>
              <p className="text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════ SECTION 4 — HOW IT WORKS ═══════════ */}
      <section className="max-w-5xl mx-auto px-4 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="space-y-8"
        >
          {[
            {
              step: "01",
              title: "Choose Your Domain",
              desc: "Select from AI/ML, Frontend, System Design, Backend, and more — plus your experience level.",
            },
            {
              step: "02",
              title: "Practice in Real-Time",
              desc: "The AI asks questions one by one and gives instant, detailed feedback on every answer.",
            },
            {
              step: "03",
              title: "Get Your Report",
              desc: "Receive a comprehensive performance score with strengths, weaknesses, and actionable recommendations.",
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              variants={item}
              className="flex items-start gap-6 p-6 glass rounded-2xl glass-hover"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center">
                <span className="text-xl font-bold gradient-text">
                  {s.step}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">{s.title}</h3>
                <p className="text-text-secondary">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════ SECTION 5 — CTA ═══════════ */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-12 glow-orange relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <span className="text-3xl mb-4 block">🚀</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to <span className="gradient-text">Level Up</span>?
            </h2>
            <p className="text-text-secondary mb-8 max-w-lg mx-auto">
              Start a practice session now. No signup required, no time limits,
              just pure interview preparation powered by AI.
            </p>
            <Link href="/setup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 px-10 py-4 rounded-xl bg-accent text-white font-bold text-lg glow-orange cursor-pointer"
              >
                🚀 Begin Your Interview
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 text-center relative z-10">
        <p className="text-sm text-text-muted">
          Built with ❤️ by{" "}
          <span className="text-text-secondary font-medium">Rahul Dev</span> —
          InterviewAI © 2026
        </p>
      </footer>
    </div>
  );
}
