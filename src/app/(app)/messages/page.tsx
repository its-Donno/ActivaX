import { getCurrentUser } from "@/lib/auth/session";
import { getConversations } from "@/lib/data/messages";
import { ConversationList } from "@/components/messages/conversation-list";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const conversations = await getConversations(user.id);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Private conversations with organizers and collaborators.
        </p>
      </div>
      <ConversationList conversations={conversations} />
    </div>
  );
}
