"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ACTION_TYPE_LIST, CATEGORY_LIST } from "@/lib/constants";
import { createActionAction } from "@/lib/actions/actions";
import type { FormState } from "@/lib/validation";

const initial: FormState = { ok: false };

export function CreateActionForm({
  onSuccess,
}: {
  onSuccess?: (actionId: string) => void;
}) {
  const [state, formAction, pending] = useActionState(createActionAction, initial);
  const router = useRouter();
  const [type, setType] = React.useState<string>("join");
  const [category, setCategory] = React.useState<string>("community");
  const [tags, setTags] = React.useState<string[]>([]);
  const [skills, setSkills] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState("");
  const [skillInput, setSkillInput] = React.useState("");

  React.useEffect(() => {
    if (state.ok) {
      toast.success("Action created");
      const newId = state.message ?? "";
      if (onSuccess) {
        onSuccess(newId);
      } else if (newId) {
        router.push(`/actions/${newId}`);
        router.refresh();
      }
    }
  }, [state.ok, state.message, onSuccess, router]);

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const v = tagInput.trim();
    if (v) {
      setTags((prev) => [...prev, v]);
      setTagInput("");
    }
  }

  function addSkill(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const v = skillInput.trim();
    if (v) {
      setSkills((prev) => [...prev, v]);
      setSkillInput("");
    }
  }

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="type">Action type</Label>
        <Select value={type} onValueChange={setType} name="type">
          <SelectTrigger id="type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {ACTION_TYPE_LIST.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.emoji} {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory} name="category">
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_LIST.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.emoji} {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required minLength={4} maxLength={120} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
        />
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" placeholder="Online or address" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="eventDate">Event date</Label>
          <Input id="eventDate" name="eventDate" type="datetime-local" />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="mediaUrl">Media URL</Label>
        <Input id="mediaUrl" name="mediaUrl" placeholder="https://..." />
      </div>

      <div className="grid gap-2">
        <Label>Tags</Label>
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={addTag}
          placeholder="Add tags and press Enter"
        />
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <Badge key={t} variant="secondary">
              {t}
            </Badge>
          ))}
        </div>
        <input type="hidden" name="tags" value={tags.join(",")} />
      </div>

      <div className="grid gap-2">
        <Label>Skills needed</Label>
        <Input
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={addSkill}
          placeholder="Add skills and press Enter"
        />
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <Badge key={s} variant="secondary">
              {s}
            </Badge>
          ))}
        </div>
        <input type="hidden" name="skillsNeeded" value={skills.join(",")} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="participantLimit">Participant limit</Label>
        <Input
          id="participantLimit"
          name="participantLimit"
          type="number"
          min={1}
          placeholder="Leave empty for unlimited"
        />
      </div>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create action"}
        </Button>
      </div>
    </form>
  );
}
