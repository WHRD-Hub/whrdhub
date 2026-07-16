"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, RotateCcw, ShieldAlert, Maximize2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { MarkdownLite } from "@/components/markdown-lite";

type Msg = { role: "user" | "assistant"; content: string };

const HISTORY_KEY = "whrd-chat-history";

function loadHistory(): Msg[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (m): m is Msg =>
          m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
      );
    }
  } catch {
    /* ignore corrupt history */
  }
  return [];
}

export function ChatPanel({ fullPage = false }: { fullPage?: boolean }) {
  const { t, language } = useLanguage();
  const c = t.chat;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load persisted history once on mount (client only).
  useEffect(() => {
    setMessages(loadHistory());
  }, []);

  // Persist history on every change so it survives reloads and is shared
  // between the side panel and the dedicated /chat page.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(messages));
    } catch {
      /* storage full or unavailable — non-fatal */
    }
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, language }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "request failed");
      setMessages(m => [...m, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", content: c.errorMsg }]);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMessages([]);
    setInput("");
    if (typeof window !== "undefined") localStorage.removeItem(HISTORY_KEY);
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border shrink-0">
        <h2 className="font-semibold text-foreground">{c.title}</h2>
        <div className="flex items-center gap-3">
          {!fullPage && (
            <Link
              href="/chat"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-label={c.expand}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{c.expand}</span>
            </Link>
          )}
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{c.newChat}</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3">
        <div className={fullPage ? "max-w-2xl mx-auto space-y-3" : "space-y-3"}>
          {messages.length === 0 && (
            <div className="bg-muted/50 rounded-2xl p-4 text-sm text-muted-foreground leading-relaxed">
              {c.greeting}
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground whitespace-pre-wrap"
                    : "bg-muted text-foreground"
                }`}
              >
                {m.role === "user" ? m.content : <MarkdownLite content={m.content} />}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground rounded-2xl px-3.5 py-2.5 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-4 py-2 flex items-start gap-1.5 text-[11px] text-muted-foreground border-t border-border shrink-0">
        <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>{c.disclaimer}</span>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border flex items-end gap-2 shrink-0">
        <div className={fullPage ? "flex items-end gap-2 w-full max-w-2xl mx-auto" : "flex items-end gap-2 w-full"}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder={c.placeholder}
            className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring max-h-32"
          />
          <button
            type="button"
            onClick={send}
            disabled={loading || !input.trim()}
            aria-label={c.send}
            className="shrink-0 w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
