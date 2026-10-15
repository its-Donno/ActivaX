"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, POPULAR_SKILLS } from "@/lib/constants";
import { completeOnboardingAction } from "@/lib/actions/auth";
import type { FormState } from "@/lib/validation";
import { useState } from "react";

const initial: FormState = { ok: false };

export default function OnboardingPage() {
  const [state, formAction, pending] = useActionState(
    completeOnboardingAction,
    initial,
  );
  const [interests, setInterests] = useState<string[]>([]);
  const [skillsOffered, setSkillsOffered] = useState<string[]>([]);
  const [skillsWanted, setSkillsWanted] = useState<string[]>([]);
  const [offerInput, setOfferInput] = useState("");
  const [wantInput, setWantInput] = useState("");

  function toggleInterest(id: string) {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function addFromInput(
    value: string,
    setter: (s: string[]) => void,
    current: string[],
    clear: () => void,
  ) {
    const v = value.trim();
    if (v) {
      setter([...current, v]);
      clear();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">Set up your profile</CardTitle>
          <p className="text-sm text-muted-foreground">
            Help others find you and discover actions you&apos;ll care about.
          </p>
        </CardHeader>
        <CardContent className="grid gap-6">
          <form action={formAction} className="grid gap-5">
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  required
                  minLength={2}
                  maxLength={60}
                />
                {state.fieldErrors?.displayName && (
                  <p className="text-xs text-destructive">
                    {state.fieldErrors.displayName[0]}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  required
                  minLength={3}
                  maxLength={30}
                  pattern="[a-z0-9_]+"
                  placeholder="lowercase_letters_and_underscores"
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
              <Textarea id="bio" name="bio" maxLength={280} rows={3} />
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" maxLength={80} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <Input id="avatarUrl" name="avatarUrl" maxLength={500} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Interests</Label>
              <div className="flex flex-wrap gap-2">
                {Object.values(CATEGORIES).map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => toggleInterest(c.id)}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors ${interests.includes(c.id) ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"}`}
                  >
                    <span aria-hidden>{c.emoji}</span>
                    {c.label}
                  </button>
                ))}
              </div>
              <input
                type="hidden"
                name="interests"
                value={interests.join(",")}
              />
            </div>

            <div className="grid gap-2">
              <Label>Skills you can offer</Label>
              <Input
                value={offerInput}
                onChange={(e) => setOfferInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFromInput(
                      offerInput,
                      setSkillsOffered,
                      skillsOffered,
                      () => setOfferInput(""),
                    );
                  }
                }}
                placeholder="Add skills and press Enter"
              />
              <div className="flex flex-wrap gap-2">
                {[...skillsOffered, ...POPULAR_SKILLS.filter((s) => !skillsOffered.includes(s)).slice(0, 4)].slice(0, 12).map((s) => (
                  <Badge
                    key={s}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => {
                      setSkillsOffered((prev) =>
                        prev.includes(s) ? prev : [...prev, s],
                      );
                    }}
                  >
                    {s}
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
                    addFromInput(
                      wantInput,
                      setSkillsWanted,
                      skillsWanted,
                      () => setWantInput(""),
                    );
                  }
                }}
                placeholder="Add skills and press Enter"
              />
              <div className="flex flex-wrap gap-2">
                {[...skillsWanted, ...POPULAR_SKILLS.filter((s) => !skillsWanted.includes(s)).slice(0, 4)].map((s) => (
                  <Badge
                    key={s}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => {
                      setSkillsWanted((prev) =>
                        prev.includes(s) ? prev : [...prev, s],
                      );
                    }}
                  >
                    {s}
                  </Badge>
                ))}
              </div>
              <input
                type="hidden"
                name="skillsWanted"
                value={skillsWanted.join(",")}
              />
            </div>

            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <Button type="submit" disabled={pending} className="w-full md:w-auto md:self-end">
              {pending ? "Saving..." : "Complete profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
