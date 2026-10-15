"use client";

import * as React from "react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/common/user-avatar";
import { addCommentAction } from "@/lib/actions/actions";
import type { CommentWithAuthor } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import { toast } from "sonner";

export function CommentSection({
  actionId,
  comments: initialComments,
}: {
  actionId: string;
  comments: CommentWithAuthor[];
  userId: string;
}) {
  const [comments, setComments] = React.useState(initialComments);
  const [body, setBody] = React.useState("");
  const [pending, startTransition] = useTransition();

  React.useEffect(() => setComments(initialComments), [initialComments]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!body.trim()) return;
    startTransition(async () => {
      const res = await addCommentAction(actionId, body);
      if (res.ok && res.comment) {
        setComments((prev) => [...prev, res.comment]);
        setBody("");
      } else {
        toast.error(res.error ?? "Couldn't post comment");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={onSubmit} className="flex gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment..."
          maxLength={1000}
          rows={2}
        />
        <Button type="submit" disabled={pending || !body.trim()}>
          Post
        </Button>
      </form>
      <div className="flex flex-col gap-3">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <UserAvatar user={c.author} size="sm" />
            <div className="flex-1 rounded-lg border p-2.5">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{c.author.displayName}</span>
                <span className="text-xs text-muted-foreground">
                  @{c.author.username} · {timeAgo(c.createdAt)}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                {c.body}
              </p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground">No comments yet. Start the conversation.</p>
        )}
      </div>
    </div>
  );
}
