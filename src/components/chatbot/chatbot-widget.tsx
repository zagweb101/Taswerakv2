"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react";
import { toast } from "sonner";
import { brandGradientText } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "أهلاً بك في تصويرك! 📸 أنا المساعد الذكي. كيف أقدر أساعدك؟",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = () => {
    if (!input.trim() || pending) return;
    const userMsg = input.trim();
    setInput("");

    setMessages((prev) => {
      const newMessages: Message[] = [...prev, { role: "user", content: userMsg }];

      startTransition(async () => {
        try {
          const res = await fetch("/api/chatbot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: userMsg,
              history: prev.map((m) => ({ role: m.role, content: m.content })),
            }),
          });
          const data = await res.json();
          if (!res.ok || !data.ok) throw new Error(data.error || "فشل الرد");

          setMessages([...newMessages, { role: "assistant", content: data.reply }]);
        } catch (err: any) {
          setMessages([...newMessages, {
            role: "assistant",
            content: "عذراً، تعذّر الرد الآن. تواصل معنا على info@taswerak.com",
          }]);
        }
      });

      return newMessages;
    });
  };

  const quickQuestions = [
    "ما هي أسعار الدورات؟",
    "كيف أدفع؟",
    "هل هناك شهادة؟",
    "كم مدة الدورة؟",
  ];

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-50 h-14 w-14 rounded-full brand-gradient text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="المساعد الذكي"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute top-0 right-0 h-3 w-3 bg-emerald-400 rounded-full ring-2 ring-white animate-pulse" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 left-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[500px] max-h-[80vh] bg-card rounded-2xl border border-border/60 shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="brand-gradient p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">تصويرك بوت</div>
                <div className="text-white/80 text-xs flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  متصل الآن
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white p-1"
              aria-label="إغلاق"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto nice-scroll p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center shrink-0",
                  msg.role === "assistant" ? "brand-gradient" : "bg-muted"
                )}>
                  {msg.role === "assistant" ? (
                    <Bot className="h-3.5 w-3.5 text-white" />
                  ) : (
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
                <div className={cn(
                  "rounded-2xl px-3 py-2 text-sm max-w-[75%]",
                  msg.role === "assistant"
                    ? "bg-muted/50 text-foreground"
                    : "brand-gradient text-white"
                )}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}

            {pending && (
              <div className="flex gap-2">
                <div className="h-7 w-7 rounded-full brand-gradient flex items-center justify-center shrink-0">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="bg-muted/50 rounded-2xl px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}

            {/* Quick questions (only on first interaction) */}
            {messages.length === 1 && !pending && (
              <div className="pt-2">
                <div className="text-xs text-muted-foreground mb-2">أسئلة شائعة:</div>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); }}
                      className="text-xs px-3 py-1.5 rounded-full bg-muted/60 hover:bg-muted text-foreground transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border/40 p-3 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="اكتب سؤالك..."
                className="flex-1 rounded-xl bg-muted/40 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0A9ED9]/30"
                disabled={pending}
              />
              <button
                onClick={send}
                disabled={pending || !input.trim()}
                className="h-10 w-10 rounded-xl brand-gradient text-white flex items-center justify-center disabled:opacity-50 shrink-0"
                aria-label="إرسال"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
