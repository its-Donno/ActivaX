import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signUpSchema = z.object({
  fullName: z.string().min(2, "Enter your name"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

export const onboardingSchema = z.object({
  displayName: z.string().min(2, "Display name is required").max(60),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers, and underscores"),
  bio: z.string().max(280, "Keep your bio under 280 characters").optional(),
  location: z.string().max(80).optional(),
  avatarUrl: z.string().max(500).optional(),
  interests: z.array(z.string()).default([]),
  skillsOffered: z.array(z.string()).default([]),
  skillsWanted: z.array(z.string()).default([]),
});

export const actionTypeEnum = z.enum([
  "ask",
  "try",
  "join",
  "help",
  "share",
  "project",
]);

export const categoryEnum = z.enum([
  "environment",
  "education",
  "technology",
  "community",
  "health",
  "arts",
]);

export const createActionSchema = z.object({
  type: actionTypeEnum,
  title: z.string().min(4, "Give your action a clear title").max(120),
  description: z
    .string()
    .min(10, "Add a few details so people know what to expect")
    .max(2000),
  category: categoryEnum,
  mediaUrl: z.string().max(500).optional(),
  location: z.string().max(120).optional(),
  eventDate: z.string().optional(),
  tags: z.array(z.string().max(30)).max(8).default([]),
  skillsNeeded: z.array(z.string().max(40)).max(10).default([]),
  participantLimit: z
    .union([z.number().int().positive().max(100000), z.null()])
    .optional(),
});

export const commentSchema = z.object({
  body: z.string().min(1, "Write something first").max(1000),
});

export const messageSchema = z.object({
  body: z.string().min(1).max(2000),
});

export const profileSchema = onboardingSchema;

export type FormState = {
  ok: boolean;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export function zodToFieldErrors(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    out[key] = out[key] ? [...out[key], issue.message] : [issue.message];
  }
  return out;
}
