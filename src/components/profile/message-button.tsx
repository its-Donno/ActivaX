"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startConversationAction } from "@/lib/actions/messages";

export function MessageButton({
  userId,
  size = "sm",
  variant = "outline",
  className,
}: {
  userId: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "secondary";
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function onClick() {
    startTransition(async () => {
      const conversationId = await startConversationAction(userId);
      router.push(`/messages/${conversationId}`);
    });
  }

  return (
    <Button
      size={size}
      variant={variant}
      onClick={onClick}
      disabled={pending}
      className={className}
    >
      <MessageCircle className="size-4" /> Message
    </Button>
  );
}
