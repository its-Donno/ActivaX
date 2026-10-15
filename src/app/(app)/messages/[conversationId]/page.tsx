import { getCurrentUser } from "@/lib/auth/session";
import { getConversationForUser, markConversationRead } from "@/lib/data/messages";
import { notFound, redirect } from "next/navigation";
import { ChatWindow } from "@/components/messages/chat-window";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { conversationId } = await params;
  const conversation = await getConversationForUser(conversationId, user.id);
  if (!conversation) notFound();
  await markConversationRead(conversationId, user.id);

  return (
    <div className="rounded-xl bg-card ring-1 ring-foreground/10">
      <ChatWindow
        conversationId={conversationId}
        userId={user.id}
        messages={conversation.messages}
      />
    </div>
  );
}
