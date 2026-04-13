"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Monitor,
  Server,
  Layers,
  Smartphone,
  ChevronRight,
  Sparkles,
  Cpu,
  ArrowLeft,
  Code,
  Database,
  BookOpen,
} from "lucide-react";
import RocketSVG from "@/components/RocketSVG";

const domains = [
  {
    id: "aiml",
    label: "AI/ML",
    description: "Python, LLMs, Computer Vision",
    icon: Brain,
    gradient: "from-purple-400/25 to-fuchsia-400/25",
    borderColor: "border-purple-400/40",
    activeGlow: "shadow-purple-400/20",
  },
  {
    id: "frontend",
    label: "Frontend",
    description: "React, Next.js, Performance",
    icon: Monitor,
    gradient: "from-blue-400/25 to-cyan-400/25",
    borderColor: "border-blue-400/40",
    activeGlow: "shadow-blue-400/20",
  },
  {
    id: "system-design",
    label: "System Design",
    description: "Scalability, Distributed Systems",
    icon: Layers,
    gradient: "from-amber-400/25 to-orange-400/25",
    borderColor: "border-amber-400/40",
    activeGlow: "shadow-amber-400/20",
  },
  {
    id: "backend",
    label: "Backend",
    description: "Node.js, Go, Microservices",
    icon: Server,
    gradient: "from-emerald-400/25 to-green-400/25",
    borderColor: "border-emerald-400/40",
    activeGlow: "shadow-emerald-400/20",
  },
  {
    id: "mobile",
    label: "Mobile",
    description: "Flutter, Swift, Kotlin",
    icon: Smartphone,
    gradient: "from-pink-400/25 to-rose-400/25",
    borderColor: "border-pink-400/40",
    activeGlow: "shadow-pink-400/20",
  },
  {
    id: "devops",
    label: "DevOps/Cloud",
    description: "AWS, Docker, CI/CD",
    icon: Cpu,
    gradient: "from-teal-400/25 to-cyan-400/25",
    borderColor: "border-teal-400/40",
    activeGlow: "shadow-teal-400/20",
  },
  {
    id: "dsa",
    label: "DSA",
    description: "Arrays, Trees, Graphs, DP",
    icon: Code,
    gradient: "from-red-400/25 to-orange-400/25",
    borderColor: "border-red-400/40",
    activeGlow: "shadow-red-400/20",
  },
  {
    id: "dbms",
    label: "DBMS",
    description: "Normalization, SQL, Transactions",
    icon: BookOpen,
    gradient: "from-indigo-400/25 to-violet-400/25",
    borderColor: "border-indigo-400/40",
    activeGlow: "shadow-indigo-400/20",
  },
  {
    id: "database",
    label: "Database",
    description: "MongoDB, PostgreSQL, Redis",
    icon: Database,
    gradient: "from-sky-400/25 to-blue-400/25",
    borderColor: "border-sky-400/40",
    activeGlow: "shadow-sky-400/20",
  },
];

const levels = [
  { id: "fresher", label: "Fresher", description: "0-1 years" },
  { id: "junior", label: "Junior", description: "1-3 years" },
  { id: "mid", label: "Mid-Level", description: "3-5 years" },
  { id: "senior", label: "Senior", description: "5+ years" },
];

const questionCounts = [3, 5, 8];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function SetupPage() {
  const router = useRouter();
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState<number>(5);
  const [isStarting, setIsStarting] = useState(false);

  const canStart = selectedDomain && selectedLevel;

  const handleStart = () => {
    if (!canStart) return;
    setIsStarting(true);

    const params = new URLSearchParams({
      domain: selectedDomain,
      level: selectedLevel,
      count: selectedCount.toString(),
    });

    setTimeout(() => {
      router.push(`/interview?${params.toString()}`);
    }, 600);
  };

  return (
    <div className="relative max-w-4xl mx-auto px-4 py-8 sm:py-12 z-10">
      {/* ===== FIXED CENTERED ROCKET BACKGROUND ===== */}
      <div className="fixed left-1/2 -translate-x-1/2 top-[30%] z-[-1] pointer-events-none opacity-40">
        <div className="animate-rocket-float">
          <RocketSVG size={350} />
        </div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Setup Your <span className="gradient-text">Interview</span>
        </h1>
        <p className="text-text-secondary">
          Tailor your practice session to your career goals.
        </p>
      </motion.div>

      {/* ===== SECTION 1: DOMAIN ===== */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <span className="text-sm font-bold text-accent">1</span>
          </div>
          <h2 className="text-lg font-bold uppercase tracking-wider text-text-secondary">
            Select Domain
          </h2>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          {domains.map((domain) => {
            const isSelected = selectedDomain === domain.id;
            return (
              <motion.button
                key={domain.id}
                variants={item}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedDomain(domain.id)}
                className={`relative p-5 rounded-2xl text-left transition-all duration-300 cursor-pointer
                  ${
                    isSelected
                      ? `glass border-2 ${domain.borderColor} glow-orange-strong`
                      : "glass glass-hover border border-white/30"
                  }`}
              >
                {/* Active indicator */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent flex items-center justify-center"
                    >
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${domain.gradient} flex items-center justify-center mb-3`}
                >
                  <domain.icon
                    className={`w-5 h-5 ${
                      isSelected ? "text-accent" : "text-text-secondary"
                    }`}
                  />
                </div>
                <h3 className="font-bold text-sm mb-0.5">{domain.label}</h3>
                <p className="text-xs text-text-muted">{domain.description}</p>
              </motion.button>
            );
          })}
        </motion.div>
      </motion.section>

      {/* ===== SECTION 2: EXPERIENCE LEVEL ===== */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <span className="text-sm font-bold text-accent">2</span>
          </div>
          <h2 className="text-lg font-bold uppercase tracking-wider text-text-secondary">
            Experience Level
          </h2>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {levels.map((level) => {
            const isSelected = selectedLevel === level.id;
            return (
              <motion.button
                key={level.id}
                variants={item}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedLevel(level.id)}
                className={`p-4 rounded-xl text-center transition-all duration-300 cursor-pointer
                  ${
                    isSelected
                      ? "glass border-2 border-accent/40 glow-orange"
                      : "glass glass-hover border border-white/30"
                  }`}
              >
                <h3
                  className={`font-bold text-sm mb-0.5 ${
                    isSelected ? "text-accent" : ""
                  }`}
                >
                  {level.label}
                </h3>
                <p className="text-xs text-text-muted">{level.description}</p>
              </motion.button>
            );
          })}
        </motion.div>
      </motion.section>

      {/* ===== SECTION 3: NUMBER OF QUESTIONS ===== */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-14"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <span className="text-sm font-bold text-accent">3</span>
          </div>
          <h2 className="text-lg font-bold uppercase tracking-wider text-text-secondary">
            Number of Questions
          </h2>
        </div>

        <div className="flex gap-3">
          {questionCounts.map((count) => {
            const isSelected = selectedCount === count;
            return (
              <motion.button
                key={count}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCount(count)}
                className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-300 cursor-pointer
                  ${
                    isSelected
                      ? "bg-accent text-white glow-orange"
                      : "glass glass-hover border border-white/30 text-text-secondary"
                  }`}
              >
                {count}
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      {/* ===== START BUTTON ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <AnimatePresence>
          {isStarting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                {/* Rocket launch animation */}
                <motion.div
                  animate={{ y: [0, -30, -200] }}
                  transition={{ duration: 1.2, ease: "easeIn" }}
                >
                  <RocketSVG size={100} />
                </motion.div>
                <p className="text-lg font-bold gradient-text mt-4">
                  Launching your interview...
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={
            canStart
              ? { scale: 1.02, boxShadow: "0 0 50px rgba(249,115,22,0.35)" }
              : {}
          }
          whileTap={canStart ? { scale: 0.98 } : {}}
          onClick={handleStart}
          disabled={!canStart}
          className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer
            ${
              canStart
                ? "bg-accent text-white glow-orange hover:bg-accent/90"
                : "glass border border-white/30 text-text-muted cursor-not-allowed"
            }`}
        >
          <Sparkles className="w-5 h-5" />
          {canStart ? "Start Interview" : "Select domain and experience level"}
          {canStart && <ChevronRight className="w-5 h-5" />}
        </motion.button>

        {/* Selection Summary */}
        <AnimatePresence>
          {canStart && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 glass rounded-xl text-center overflow-hidden"
            >
              <p className="text-sm text-text-secondary">
                <span className="text-accent font-semibold">
                  {domains.find((d) => d.id === selectedDomain)?.label}
                </span>{" "}
                ·{" "}
                <span className="text-text-primary font-medium">
                  {levels.find((l) => l.id === selectedLevel)?.label}
                </span>{" "}
                · {selectedCount} questions
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
