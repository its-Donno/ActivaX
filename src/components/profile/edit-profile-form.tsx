"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/constants";
import { updateProfileAction } from "@/lib/actions/profile";
import type { FormState } from "@/lib/validation";
import type { Profile } from "@/lib/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const initial: FormState = { ok: false };

export function EditProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(updateProfileAction, initial);
  const [interests, setInterests] = useState<string[]>(profile.interests);
  const [skillsOffered, setSkillsOffered] = useState<string[]>(profile.skillsOffered);
  const [skillsWanted, setSkillsWanted] = useState<string[]>(profile.skillsWanted);
  const [offerInput, setOfferInput] = useState("");
  const [wantInput, setWantInput] = useState("");

  useEffect(() => {
    if (state.ok) {
      toast.success(state.message ?? "Profile updated");
      router.push(`/u/${profile.username}`);
    }
  }, [state.ok, state.message, router, profile.username]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Edit profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-5">
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                name="displayName"
                defaultValue={profile.displayName}
                required
                minLength={2}
                maxLength={60}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                defaultValue={profile.username}
                required
                pattern="[a-z0-9_]+"
              />
              {state.fieldErrors?.username && (
                <p className="text-xs text-destructive">
                  {state.fieldErrors.username[0]}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={profile.bio}
              maxLength={280}
              rows={3}
            />
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                defaultValue={profile.location ?? ""}
                maxLength={80}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                name="avatarUrl"
                defaultValue={profile.avatarUrl ?? ""}
                maxLength={500}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Interests</Label>
            <div className="flex flex-wrap gap-2">
              {Object.values(CATEGORIES).map((c) => {
                const active = interests.includes(c.id);
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() =>
                      setInterests((prev) =>
                        prev.includes(c.id)
                          ? prev.filter((x) => x !== c.id)
                          : [...prev, c.id],
                      )
                    }
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors ${active ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"}`}
                  >
                    <span aria-hidden>{c.emoji}</span>
                    {c.label}
                  </button>
                );
              })}
            </div>
            <input type="hidden" name="interests" value={interests.join(",")} />
          </div>

          <div className="grid gap-2">
            <Label>Skills you can offer</Label>
            <Input
              value={offerInput}
              onChange={(e) => setOfferInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (offerInput.trim()) {
                    setSkillsOffered((prev) => [...prev, offerInput.trim()]);
                    setOfferInput("");
                  }
                }
              }}
              placeholder="Add a skill and press Enter"
            />
            <div className="flex flex-wrap gap-2">
              {skillsOffered.map((s) => (
                <Badge
                  key={s}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() =>
                    setSkillsOffered((prev) => prev.filter((x) => x !== s))
                  }
                >
                  {s} ×
                </Badge>
              ))}
            </div>
            <input
              type="hidden"
              name="skillsOffered"
              value={skillsOffered.join(",")}
            />
          </div>

          <div className="grid gap-2">
            <Label>Skills you want to learn</Label>
            <Input
              value={wantInput}
              onChange={(e) => setWantInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (wantInput.trim()) {
                    setSkillsWanted((prev) => [...prev, wantInput.trim()]);
                    setWantInput("");
                  }
                }
              }}
              placeholder="Add a skill and press Enter"
            />
            <div className="flex flex-wrap gap-2">
              {skillsWanted.map((s) => (
                <Badge
                  key={s}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() =>
                    setSkillsWanted((prev) => prev.filter((x) => x !== s))
                  }
                >
                  {s} ×
                </Badge>
              ))}
            </div>
            <input
              type="hidden"
              name="skillsWanted"
              value={skillsWanted.join(",")}
            />
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
