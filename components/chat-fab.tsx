"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ChatPanel } from "@/components/chat-panel";

export function ChatFab() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={t.chat.fabLabel}
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetTitle className="sr-only">{t.chat.title}</SheetTitle>
        <ChatPanel />
      </SheetContent>
    </Sheet>
  );
}
