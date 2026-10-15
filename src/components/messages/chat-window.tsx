"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/common/user-avatar";
import { sendMessageAction } from "@/lib/actions/messages";
import type { Message } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ChatWindow({
  conversationId,
  userId,
  messages: initialMessages,
}: {
  conversationId: string;
  userId: string;
  messages: Array<Message & { sender: import("@/lib/types").ProfileSummary }>;
}) {
  const [messages, setMessages] = React.useState(initialMessages);
  const [body, setBody] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMessages(initialMessages);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [initialMessages]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!body.trim()) return;
    startTransition(async () => {
      const res = await sendMessageAction(conversationId, body);
      if (res.ok && res.message) {
        setMessages((prev) => [
          ...prev,
          {
            ...res.message,
            sender: {
              id: userId,
              displayName: "You",
              username: "you",
              avatarUrl: null,
              bio: "",
            },
          },
        ]);
        setBody("");
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      } else {
        toast.error(res.error ?? "Couldn't send message");
      }
    });
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col">
      <div className="flex items-center gap-2 border-b p-3">
        <Button variant="ghost" size="icon-sm" asChild className="md:hidden">
          <Link href="/messages">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="text-sm font-medium">Conversation</div>
      </div>
      <div className="flex-1 space-y-2 overflow-auto p-3">
        {messages.map((m) => {
          const mine = m.senderId === userId;
          return (
            <div
              key={m.id}
              className={cn("flex gap-2", mine ? "justify-end" : "justify-start")}
            >
              {!mine && (
                <UserAvatar user={m.sender} size="sm" link={false} />
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-xl px-3 py-2 text-sm",
                  mine
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                <p className="whitespace-pre-line">{m.body}</p>
                <p
                  className={cn(
                    "mt-0.5 text-[10px] text-right opacity-70",
                    mine ? "text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  {timeAgo(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={onSubmit}
        className="flex items-end gap-2 border-t p-3"
      >
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message..."
          maxLength={2000}
          rows={2}
          className="min-h-[44px]"
        />
        <Button type="submit" disabled={pending || !body.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
