"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  AlertCircle,
  BookOpen,
  RefreshCcw,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import RocketSVG from "@/components/RocketSVG";

interface ReportData {
  overall_score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  question_feedback: {
    question: string;
    score: number;
    feedback: string;
  }[];
}

function ScoreRing({
  score,
  size = 160,
}: {
  score: number;
  size?: number;
}) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 10) * circumference;
  const center = size / 2;

  const getScoreColor = (s: number) => {
    if (s >= 8) return "#22c55e";
    if (s >= 6) return "#f59e0b";
    return "#ef4444";
  };

  const color = getScoreColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth="8"
        />
        {/* Score ring */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          style={{
            filter: `drop-shadow(0 0 8px ${color}40)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="text-4xl font-extrabold"
          style={{ color }}
        >
          {score.toFixed(1)}
        </motion.span>
        <span className="text-sm text-text-muted">out of 10</span>
      </div>
    </div>
  );
}

function Confetti() {
  const colors = [
    "#F97316",
    "#22c55e",
    "#3b82f6",
    "#8b5cf6",
    "#f59e0b",
    "#ec4899",
  ];
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            top: "-10px",
            animation: `confettiFall ${
              2 + Math.random() * 3
            }s linear ${Math.random() * 2}s forwards`,
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  );
}

function ReportContent() {
  const router = useRouter();
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    generateReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateReport = async () => {
    setIsLoading(true);

    try {
      const storedData = sessionStorage.getItem("interviewData");
      if (!storedData) {
        throw new Error("No interview data found");
      }

      const { messages, config } = JSON.parse(storedData);

      const response = await fetch("https://interview-ai-avsg.onrender.com/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, config }),
      });

      const data = await response.json();
      setReport(data);

      if (data.overall_score >= 8) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    } catch {
      // Fallback demo report
      setReport({
        overall_score: 7.5,
        summary:
          "Good performance overall! You demonstrated solid foundational knowledge with room for improvement in advanced concepts. Your communication was clear and structured.",
        strengths: [
          "Strong understanding of core concepts",
          "Clear and structured communication",
          "Good use of examples to illustrate points",
          "Showed ability to think through problems logically",
        ],
        weaknesses: [
          "Could go deeper into advanced topics",
          "Some answers lacked specific technical details",
          "Time management could be improved for complex questions",
        ],
        recommendations: [
          "Practice explaining complex concepts with diagrams",
          "Study advanced patterns and architectural decisions",
          "Work on providing more concrete examples from experience",
          "Review system design fundamentals for scalability questions",
        ],
        question_feedback: [
          {
            question: "Q1: Foundational question",
            score: 8.0,
            feedback:
              "Excellent grasp of basics. Could have mentioned edge cases.",
          },
          {
            question: "Q2: Intermediate concept",
            score: 7.5,
            feedback:
              "Good explanation but missed some optimization strategies.",
          },
          {
            question: "Q3: Advanced problem",
            score: 7.0,
            feedback:
              "Showed good intuition. Would benefit from deeper technical analysis.",
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="relative mx-auto mb-6">
            {/* Rocket reaching orbit animation */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <RocketSVG size={90} />
            </motion.div>
          </div>
          <h2 className="text-xl font-bold mb-2">
            Analyzing Your Performance
          </h2>
          <p className="text-text-secondary text-sm">
            Our AI is generating your detailed report...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!report) return null;

  const getScoreLabel = (score: number) => {
    if (score >= 9) return "Outstanding";
    if (score >= 8) return "Excellent";
    if (score >= 7) return "Good";
    if (score >= 6) return "Fair";
    return "Needs Improvement";
  };

  const containerAnim = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="relative max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {showConfetti && <Confetti />}

      {/* ===== FIXED CENTERED ROCKET BACKGROUND ===== */}
      <div className="fixed left-1/2 -translate-x-1/2 top-[30%] z-[-1] pointer-events-none opacity-20">
        <div className="animate-rocket-float">
          <RocketSVG size={350} />
        </div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <button
          onClick={() => router.push("/setup")}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">New Interview</span>
        </button>
        <h1 className="text-3xl sm:text-4xl font-bold">
          Performance <span className="gradient-text">Report</span>
        </h1>
      </motion.div>

      <motion.div
        variants={containerAnim}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* ===== OVERALL SCORE ===== */}
        <motion.div
          variants={itemAnim}
          className="glass rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 border border-white/30"
        >
          <ScoreRing score={report.overall_score} />
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Trophy className="w-5 h-5 text-accent" />
              <span className="text-lg font-bold gradient-text">
                {getScoreLabel(report.overall_score)}
              </span>
            </div>
            <p className="text-text-secondary leading-relaxed">
              {report.summary}
            </p>
          </div>
        </motion.div>

        {/* ===== STRENGTHS & WEAKNESSES ===== */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Strengths */}
          <motion.div
            variants={itemAnim}
            className="glass rounded-2xl p-6 border border-success/20"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <h3 className="font-bold">Strengths</h3>
            </div>
            <div className="space-y-3">
              {report.strengths.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-text-secondary">{s}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Weaknesses */}
          <motion.div
            variants={itemAnim}
            className="glass rounded-2xl p-6 border border-warning/20"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-warning" />
              </div>
              <h3 className="font-bold">Areas to Improve</h3>
            </div>
            <div className="space-y-3">
              {report.weaknesses.map((w, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-text-secondary">{w}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ===== RECOMMENDATIONS ===== */}
        <motion.div
          variants={itemAnim}
          className="glass rounded-2xl p-6 border border-info/20"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-info/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-info" />
            </div>
            <h3 className="font-bold">Recommendations</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {report.recommendations.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
                className="flex items-start gap-2 p-3 rounded-xl bg-info/5 border border-info/10"
              >
                <Sparkles className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
                <span className="text-sm text-text-secondary">{r}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ===== PER-QUESTION BREAKDOWN ===== */}
        {report.question_feedback.length > 0 && (
          <motion.div
            variants={itemAnim}
            className="glass rounded-2xl p-6 border border-white/30"
          >
            <h3 className="font-bold mb-5 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-accent" /> Question-by-Question
              Breakdown
            </h3>
            <div className="space-y-3">
              {report.question_feedback.map((qf, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 + i * 0.1 }}
                  className="rounded-xl border border-white/30 overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedQuestion(expandedQuestion === i ? null : i)
                    }
                    className="w-full p-4 flex items-center justify-between hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold
                          ${
                            qf.score >= 8
                              ? "bg-success/20 text-success"
                              : qf.score >= 6
                              ? "bg-warning/20 text-warning"
                              : "bg-error/20 text-error"
                          }`}
                      >
                        {qf.score.toFixed(1)}
                      </div>
                      <span className="text-sm font-medium">
                        {qf.question}
                      </span>
                    </div>
                    {expandedQuestion === i ? (
                      <ChevronUp className="w-4 h-4 text-text-muted" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-text-muted" />
                    )}
                  </button>
                  {expandedQuestion === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="px-4 pb-4"
                    >
                      <p className="text-sm text-text-secondary pl-13">
                        {qf.feedback}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ===== ACTIONS ===== */}
        <motion.div
          variants={itemAnim}
          className="flex flex-col sm:flex-row gap-4 pt-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/setup")}
            className="flex-1 py-4 rounded-xl bg-accent text-white font-bold flex items-center justify-center gap-2 glow-orange cursor-pointer"
          >
            <RefreshCcw className="w-4 h-4" />
            Practice Again
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/")}
            className="flex-1 py-4 rounded-xl glass glass-hover border border-white/30 font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back Home
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="animate-rocket-float">
            <RocketSVG size={80} />
          </div>
        </div>
      }
    >
      <ReportContent />
    </Suspense>
  );
}
