import { promises as fs } from "fs";
import path from "path";

export interface AccountRecord {
  userId: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface Database {
  accounts: AccountRecord[];
  profiles: import("../types").Profile[];
  actions: import("../types").ActivaAction[];
  participants: import("../types").ActionParticipant[];
  comments: import("../types").Comment[];
  likes: import("../types").Like[];
  savedItems: import("../types").SavedItem[];
  follows: import("../types").Follow[];
  notifications: import("../types").AppNotification[];
  conversations: import("../types").Conversation[];
  conversationMembers: import("../types").ConversationMember[];
  messages: import("../types").Message[];
}

const DB_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DB_DIR, "activa.json");

declare global {
  var __activaDb: Database | undefined;
  var __activaWriteQueue: Promise<unknown> | undefined;
}

async function load(): Promise<Database> {
  if (globalThis.__activaDb) return globalThis.__activaDb;
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    globalThis.__activaDb = JSON.parse(raw) as Database;
  } catch {
    const { createSeedDatabase } = await import("./seed");
    globalThis.__activaDb = createSeedDatabase();
    await persist(globalThis.__activaDb);
  }
  return globalThis.__activaDb;
}

async function persist(db: Database) {
  await fs.mkdir(DB_DIR, { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export async function readDb(): Promise<Database> {
  return load();
}

export async function mutateDb<T>(
  mutator: (db: Database) => T | Promise<T>,
): Promise<T> {
  const run = async () => {
    const db = await load();
    const result = await mutator(db);
    await persist(db);
    return result;
  };
  const previous = globalThis.__activaWriteQueue ?? Promise.resolve();
  const next = previous.then(run, run);
  globalThis.__activaWriteQueue = next.catch(() => undefined);
  return next;
}

export async function resetDb(): Promise<void> {
  const { createSeedDatabase } = await import("./seed");
  globalThis.__activaDb = createSeedDatabase();
  await persist(globalThis.__activaDb);
}

export function newId(): string {
  return crypto.randomUUID();
}
