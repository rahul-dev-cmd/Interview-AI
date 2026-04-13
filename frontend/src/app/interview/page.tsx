"use client";

import { useState, useRef, useEffect, useCallback, Suspense, memo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  ArrowLeft,
  Loader2,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  CheckCircle2,
} from "lucide-react";
import RocketSVG from "@/components/RocketSVG";

interface Message {
  role: "assistant" | "user";
  content: string;
}

interface BrowserSpeechRecognitionResult {
  0: {
    transcript: string;
  };
  isFinal: boolean;
}

interface BrowserSpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: ArrayLike<BrowserSpeechRecognitionResult>;
}

interface BrowserSpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface BrowserSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;
const LISTENING_SILENCE_TIMEOUT_MS = 3500;
const LISTENING_RESTART_DELAY_MS = 250;

const speechTokenReplacements: Array<[RegExp, string]> = [
  [/!==/g, " not triple equals "],
  [/===/g, " triple equals "],
  [/!=/g, " not equals "],
  [/==/g, " double equals "],
  [/<=/g, " less than or equal to "],
  [/>=/g, " greater than or equal to "],
  [/=>/g, " arrow "],
  [/&&/g, " logical and "],
  [/\|\|/g, " logical or "],
  [/@/g, " at symbol "],
  [/\$/g, " dollar sign "],
];

const formatTextForSpeech = (text: string) => {
  const cleanedText = text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/#{1,6}\s*/g, "")
    .replace(/```([\s\S]*?)```/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\[INTERVIEW_COMPLETE\]/g, "")
    .replace(/[.-]\s+/g, ". ")
    .trim();

  return speechTokenReplacements
    .reduce(
      (result, [pattern, replacement]) => result.replace(pattern, replacement),
      cleanedText
    )
    .replace(/\s+/g, " ")
    .trim();
};

const normalizeTranscript = (text: string) => text.replace(/\s+/g, " ").trim();

const combineTranscriptParts = (...parts: string[]) =>
  parts
    .map((part) => normalizeTranscript(part))
    .filter(Boolean)
    .join(" ")
    .trim();

const MessageItem = memo(({ msg, isAI }: { msg: Message; isAI: boolean }) => {
  const displayContent = msg.content
    .replace("[INTERVIEW_COMPLETE]", "")
    .replace(/\*\*Question\s*\d+(\/\d+)?:\*\*\s*/gi, "")
    .trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, x: isAI ? -15 : 15 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-4 w-full md:max-w-4xl ${
        isAI ? "mr-auto" : "ml-auto flex-row-reverse"
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center mt-1
          ${isAI ? "bg-accent/20" : "bg-blue-500/20"}`}
      >
        {isAI ? (
          <Bot className="w-6 h-6 text-accent" />
        ) : (
          <User className="w-6 h-6 text-blue-500" />
        )}
      </div>

      {/* Bubble */}
      <div className="flex-1 max-w-[85%]">
        <div
          className={`p-5 rounded-3xl text-base md:text-[17px] leading-relaxed whitespace-pre-wrap shadow-md
            ${
              isAI
                ? "glass border border-white/40 rounded-tl-sm text-text-primary"
                : "bg-accent/15 border border-accent/25 rounded-tr-sm text-text-primary"
            }`}
        >
          {displayContent}
        </div>
      </div>
    </motion.div>
  );
});
MessageItem.displayName = "MessageItem";

function InterviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const domain = searchParams.get("domain") || "frontend";
  const level = searchParams.get("level") || "fresher";
  const totalQuestions = parseInt(searchParams.get("count") || "5");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  const restartTimeoutRef = useRef<number | null>(null);
  const listeningIntentRef = useRef(false);
  const baseInputRef = useRef("");
  const finalTranscriptRef = useRef("");
  const recognitionSessionIdRef = useRef(0);
  const hasHeardSpeechRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isLoadingRef = useRef(false);
  const isCompleteRef = useRef(false);

  const domainLabels: Record<string, string> = {
    aiml: "AI/ML",
    frontend: "Frontend Development",
    "system-design": "System Design",
    backend: "Backend Development",
    mobile: "Mobile Development",
    devops: "DevOps/Cloud",
    dsa: "Data Structures & Algorithms",
    dbms: "Database Management Systems (DBMS)",
    database: "Databases (MongoDB, PostgreSQL, Redis)",
  };

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Start interview on mount
  useEffect(() => {
    startInterview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Text-to-Speech function
  const speakText = useCallback(
    (text: string) => {
      if (!isSpeechEnabled) {
        setTimeout(() => {
          window.dispatchEvent(new Event("startListeningEvent"));
        }, 500);
        return;
      }

      window.speechSynthesis.cancel();

      const cleanText = formatTextForSpeech(text);

      if (!cleanText) {
        window.dispatchEvent(new Event("startListeningEvent"));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = "en-US";

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find(
          (v) => v.lang.startsWith("en") && v.name.includes("Google")
        ) || voices.find((v) => v.lang.startsWith("en-US"));
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        window.dispatchEvent(new Event("startListeningEvent"));
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        window.dispatchEvent(new Event("startListeningEvent"));
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSpeechEnabled]
  );

  const toggleSpeech = () => {
    if (isSpeechEnabled) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setIsSpeechEnabled(!isSpeechEnabled);
  };

  const inputStateRef = useRef(input);
  useEffect(() => {
    inputStateRef.current = input;
  }, [input]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    isCompleteRef.current = isComplete;
  }, [isComplete]);

  const clearSilenceTimeout = useCallback(() => {
    if (silenceTimeoutRef.current !== null) {
      window.clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  }, []);

  const clearRestartTimeout = useCallback(() => {
    if (restartTimeoutRef.current !== null) {
      window.clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  }, []);

  const stopListeningSession = useCallback(
    (preserveDraft = true) => {
      listeningIntentRef.current = false;
      hasHeardSpeechRef.current = false;
      clearSilenceTimeout();
      clearRestartTimeout();

      const recognition = recognitionRef.current;
      recognitionRef.current = null;

      if (preserveDraft) {
        setInput((currentInput) => normalizeTranscript(currentInput));
      }

      setIsListening(false);

      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {
          void e;
        }
      }
    },
    [clearRestartTimeout, clearSilenceTimeout]
  );

  const scheduleSilenceStop = useCallback(() => {
    clearSilenceTimeout();

    if (!listeningIntentRef.current || !hasHeardSpeechRef.current) {
      return;
    }

    silenceTimeoutRef.current = window.setTimeout(() => {
      stopListeningSession(true);
    }, LISTENING_SILENCE_TIMEOUT_MS);
  }, [clearSilenceTimeout, stopListeningSession]);

  const startListening = useCallback((resume = false) => {
    if (recognitionRef.current || isLoadingRef.current || isCompleteRef.current) {
      return;
    }

    const SpeechRecognition =
      (
        window as Window & {
          SpeechRecognition?: BrowserSpeechRecognitionConstructor;
        }
      ).SpeechRecognition ||
      (
        window as Window & {
          webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
        }
      ).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    listeningIntentRef.current = true;
    clearRestartTimeout();
    clearSilenceTimeout();
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    if (!resume) {
      baseInputRef.current = normalizeTranscript(inputStateRef.current);
      finalTranscriptRef.current = "";
      hasHeardSpeechRef.current = false;
    }

    const recognition = new SpeechRecognition();
    const sessionId = recognitionSessionIdRef.current + 1;
    recognitionSessionIdRef.current = sessionId;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      if (recognitionSessionIdRef.current !== sessionId) return;
      setIsListening(true);
    };

    recognition.onresult = (event: BrowserSpeechRecognitionEvent) => {
      if (recognitionSessionIdRef.current !== sessionId) return;

      let nextFinalTranscript = finalTranscriptRef.current;
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = normalizeTranscript(event.results[i][0].transcript);
        if (event.results[i].isFinal) {
          nextFinalTranscript = combineTranscriptParts(nextFinalTranscript, transcript);
        } else {
          interim = transcript;
        }
      }

      finalTranscriptRef.current = nextFinalTranscript;
      hasHeardSpeechRef.current =
        hasHeardSpeechRef.current || Boolean(nextFinalTranscript || interim);

      setInput(
        combineTranscriptParts(
          baseInputRef.current,
          nextFinalTranscript,
          interim
        )
      );

      scheduleSilenceStop();
    };

    recognition.onerror = (event: BrowserSpeechRecognitionErrorEvent) => {
      if (recognitionSessionIdRef.current !== sessionId) return;

      setIsListening(false);

      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        listeningIntentRef.current = false;
        clearSilenceTimeout();
        clearRestartTimeout();
      }
    };

    recognition.onend = () => {
      if (recognitionSessionIdRef.current !== sessionId) return;

      recognitionRef.current = null;
      setIsListening(false);
      clearSilenceTimeout();

      if (
        !listeningIntentRef.current ||
        isSpeakingRef.current ||
        isLoadingRef.current ||
        isCompleteRef.current
      ) {
        return;
      }

      restartTimeoutRef.current = window.setTimeout(() => {
        startListening(true);
      }, LISTENING_RESTART_DELAY_MS);
    };

    try {
      recognition.start();
    } catch (e) {
      recognitionRef.current = null;
      listeningIntentRef.current = false;
      void e;
    }
  }, [clearRestartTimeout, clearSilenceTimeout, scheduleSilenceStop]);

  useEffect(() => {
    const handleStartListening = () => {
      if (!listeningIntentRef.current && !recognitionRef.current) {
        startListening();
      }
    };
    window.addEventListener("startListeningEvent", handleStartListening);
    return () =>
      window.removeEventListener("startListeningEvent", handleStartListening);
  }, [startListening]);

  const toggleListening = () => {
    if (isListening) {
      stopListeningSession(true);
    } else {
      startListening();
    }
  };

  useEffect(() => {
    return () => {
      listeningIntentRef.current = false;
      clearSilenceTimeout();
      clearRestartTimeout();
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      window.speechSynthesis.cancel();
    };
  }, [clearRestartTimeout, clearSilenceTimeout]);

  const startInterview = async () => {
    setIsTyping(true);

    const systemMessage = {
      role: "system" as const,
      content: `You are an expert technical interviewer conducting a LIVE ${
        domainLabels[domain] || domain
      } interview for a ${level}-level candidate. You behave like a real human interviewer - warm, professional, and conversational.

CRITICAL FLOW - follow this EXACT loop for every interaction:

STEP 1: ASK - Ask exactly ONE question. Never ask more than one question in a single message. Wait for the candidate to respond.
STEP 2: LISTEN & EVALUATE - First understand what the candidate actually meant. Correctly interpret short answers and shorthand such as "idk", "I don't know", "not sure", "maybe", or incomplete fragments before judging the answer. Evaluate BOTH the content quality AND how they communicated it.
STEP 3: FEEDBACK - Give compact, specific feedback grounded ONLY in the candidate's actual answer. Keep it to 1-2 short sentences and under 35 words total. Structure it as:
   Sentence 1: Briefly say what they actually showed, missed, or admitted. If they were unsure, say that plainly instead of praising them.
   Sentence 2: Add ONE small communication tip prefixed with "Tip:" only if it is useful.
STEP 4: DECIDE - Based on the quality of their answer, decide ONE of these:
   a) If the answer was shallow, vague, off-topic, or missed key points -> ask a follow-up to dig deeper on the SAME topic (this still counts as the next question number).
   b) If the answer was sufficient -> move to a DIFFERENT topic/concept for the next question.
   Then go back to STEP 1.

SPECIAL CASES:
- If the candidate says "idk", "I don't know", "not sure", or clearly shows uncertainty, acknowledge that honestly. Do NOT pretend it was a good point or a strong answer.
- Never say things like "good observation", "solid point", or similar praise unless the candidate clearly earned it.
- Never invent details the candidate did not mention. Every feedback sentence must be traceable to their actual words or obvious meaning.
- If the answer is partial, mention the specific part they got and the specific gap in a few words.

RULES:
1. You have a total budget of ${totalQuestions} questions (including any follow-ups). Track and display the count as "**Question X/${totalQuestions}:**" before every question.
2. ONLY ask ONE question per message. NEVER bundle multiple questions together. This is the MOST IMPORTANT rule.
3. Do NOT give the correct answer or a detailed explanation. Save all detailed technical feedback for the end report. Just acknowledge briefly and move on.
4. Make questions progressively harder as the interview goes on. Tailor difficulty to ${level} level.
5. Cover different topics/concepts across the ${
        domainLabels[domain] || domain
      } domain - do not stay stuck on one area unless doing a follow-up.
6. When all ${totalQuestions} questions have been asked AND answered, output ONLY the exact string [INTERVIEW_COMPLETE]. No summary, no sign-off - just that token.
7. NEVER output bullet-point lists of strengths/weaknesses during the interview.
8. Keep your tone natural and conversational - like a friendly but thorough interviewer, not a robot reading from a script.

Start by warmly greeting the candidate, making them comfortable, and then asking **Question 1/${totalQuestions}**.`,
    };

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [systemMessage],
          interview_config: { domain, level, totalQuestions },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Backend error:", data);
        throw new Error(data.detail || `Server error ${response.status}`);
      }

      const aiContent = data.content;
      if (!aiContent) {
        console.error("No content in response:", data);
        throw new Error("Empty response from AI");
      }

      const aiMessage: Message = { role: "assistant", content: aiContent };
      setMessages([aiMessage]);
      setConversationHistory([
        systemMessage as unknown as Message,
        aiMessage,
      ]);
      setCurrentQuestion(1);

      speakText(aiContent);
    } catch (err) {
      console.error("Start interview error:", err);
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      const fallbackMsg: Message = {
        role: "assistant",
        content: `⚠️ **Error starting interview:** ${errorMsg}\n\nMake sure:\n1. Backend is running: \`cd backend && python main.py\`\n2. OpenRouter API key is set in \`backend/.env\`\n3. Check the backend terminal for detailed error logs.`,
      };
      setMessages([fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || isComplete) return;

    stopListeningSession(false);

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    inputStateRef.current = "";
    setIsLoading(true);
    setIsTyping(true);

    const updatedHistory = [...conversationHistory, userMessage];
    setConversationHistory(updatedHistory);

    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedHistory,
          interview_config: { domain, level, totalQuestions },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Backend error:", data);
        throw new Error(data.detail || `Server error ${response.status}`);
      }

      const aiContent = data.content;
      if (!aiContent) {
        console.error("No content in response:", data);
        throw new Error("Empty response from AI");
      }

      const aiMessage: Message = { role: "assistant", content: aiContent };
      setMessages((prev) => [...prev, aiMessage]);
      setConversationHistory((prev) => [...prev, aiMessage]);

      speakText(aiContent);

      if (aiContent.includes("[INTERVIEW_COMPLETE]")) {
        setIsComplete(true);
      } else {
        const questionMatch = aiContent.match(/Question\s+(\d+)/i);
        if (questionMatch) {
          setCurrentQuestion(parseInt(questionMatch[1]));
        }
      }
    } catch (err) {
      console.error("Send message error:", err);
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ **Error:** ${errorMsg}\n\nCheck the backend terminal for details.`,
        },
      ]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px";
  };

  const goToReport = () => {
    sessionStorage.setItem(
      "interviewData",
      JSON.stringify({
        messages: conversationHistory,
        config: { domain, level, totalQuestions },
      })
    );
    router.push("/report");
  };

  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-white/30">
        <motion.div
          className="h-full progress-bar rounded-r-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Interview Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-3 glass border-b border-white/20 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/setup")}
            className="p-1.5 rounded-lg hover:bg-white/30 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-text-muted" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm">🚀</span>
              <span className="font-semibold text-sm">
                {domainLabels[domain] || domain} Interview
              </span>
            </div>
            <span className="text-xs text-text-muted capitalize">
              {level} Level
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">
            Question {currentQuestion}/{totalQuestions}
          </span>
          <div className="w-20 h-1.5 rounded-full bg-white/30 overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <button
            onClick={toggleSpeech}
            className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
              isSpeechEnabled
                ? "bg-accent/20 text-accent"
                : "hover:bg-white/30 text-text-muted"
            } ${isSpeaking ? "animate-pulse" : ""}`}
            title={isSpeechEnabled ? "Mute AI voice" : "Enable AI voice"}
          >
            {isSpeechEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
        </div>
      </motion.div>

      {/* ===== FIXED CENTERED ROCKET BACKGROUND ===== */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[30%] z-[-1] pointer-events-none opacity-20">
        <div className="animate-rocket-float">
          <RocketSVG size={350} />
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 relative z-10">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <MessageItem key={i} msg={msg} isAI={msg.role === "assistant"} />
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-3 max-w-3xl"
            >
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-accent" />
              </div>
              <div className="glass px-5 py-4 rounded-2xl rounded-tl-sm border border-white/30">
                <div className="flex gap-1.5">
                  <span className="typing-dot w-2 h-2 rounded-full bg-accent" />
                  <span className="typing-dot w-2 h-2 rounded-full bg-accent" />
                  <span className="typing-dot w-2 h-2 rounded-full bg-accent" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interview Complete Banner */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto glass rounded-2xl p-6 text-center glow-orange-strong border border-accent/30"
            >
              <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Interview Complete! 🎉
              </h3>
              <p className="text-text-secondary text-sm mb-5">
                Great job! Let&apos;s see how you performed.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToReport}
                className="px-8 py-3 rounded-xl bg-accent text-white font-bold glow-orange cursor-pointer"
              >
                View Performance Report →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      {!isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 glass border-t border-white/20 relative z-10"
        >
          {/* Listening indicator */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="max-w-3xl mx-auto mb-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm text-red-500 font-medium">
                  Listening... Speak your answer
                </span>
                <span className="ml-auto text-xs text-text-muted">
                  Click mic to stop
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="max-w-3xl mx-auto flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleTextareaResize}
                onKeyDown={handleKeyDown}
                placeholder={
                  isListening
                    ? "🎤 Listening..."
                    : "Type or click 🎤 to speak your answer..."
                }
                disabled={isLoading}
                rows={1}
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/20 resize-none text-sm text-text-primary placeholder:text-text-muted transition-all duration-200 disabled:opacity-50"
                style={{ maxHeight: "150px" }}
              />
            </div>

            {/* Microphone Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleListening}
              disabled={isLoading}
              className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer
                ${
                  isListening
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse"
                    : "glass border border-white/30 text-text-muted hover:text-accent hover:border-accent/30"
                }`}
              title={isListening ? "Stop listening" : "Speak your answer"}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </motion.button>

            {/* Send Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer
                ${
                  input.trim() && !isLoading
                    ? "bg-accent text-white glow-orange"
                    : "glass border border-white/30 text-text-muted"
                }`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-rocket-float mb-4">
              <RocketSVG size={80} />
            </div>
            <p className="text-text-secondary">Loading interview...</p>
          </div>
        </div>
      }
    >
      <InterviewContent />
    </Suspense>
  );
}
