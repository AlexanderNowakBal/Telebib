import { openDB } from "idb";
import type { OutboxEntry } from "@/lib/types/domain";

const DB_NAME = "kanban-offline";
const DB_VERSION = 1;

async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Board snapshot cache: key = boardId, value = snapshot JSON
      if (!db.objectStoreNames.contains("snapshots")) {
        db.createObjectStore("snapshots");
      }
      // Outbox: mutations to replay when back online
      if (!db.objectStoreNames.contains("outbox")) {
        const store = db.createObjectStore("outbox", { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
      }
    },
  });
}

// ─── Snapshot cache ──────────────────────────────────────────────────────────

export async function saveSnapshot(boardId: string, snapshot: unknown): Promise<void> {
  const db = await getDb();
  await db.put("snapshots", { snapshot, savedAt: Date.now() }, boardId);
}

export async function loadSnapshot(boardId: string): Promise<unknown | null> {
  const db = await getDb();
  const record = await db.get("snapshots", boardId);
  return record?.snapshot ?? null;
}

// ─── Outbox ──────────────────────────────────────────────────────────────────

export async function enqueueOutbox(entry: OutboxEntry): Promise<void> {
  const db = await getDb();
  await db.put("outbox", entry);
}

export async function getPendingOutbox(): Promise<OutboxEntry[]> {
  const db = await getDb();
  return db.getAllFromIndex("outbox", "createdAt");
}

export async function removeFromOutbox(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("outbox", id);
}

/**
 * Replay the outbox when back online.
 * Removes entries that succeed; increments retries for failures.
 */
export async function flushOutbox(): Promise<void> {
  const entries = await getPendingOutbox();
  for (const entry of entries) {
    try {
      const res = await fetch(entry.endpoint, {
        method: entry.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry.body),
      });
      if (res.ok) {
        await removeFromOutbox(entry.id);
      } else {
        await updateRetries(entry);
      }
    } catch {
      await updateRetries(entry);
    }
  }
}

async function updateRetries(entry: OutboxEntry): Promise<void> {
  if (entry.retries >= 5) {
    await removeFromOutbox(entry.id);
    return;
  }
  const db = await getDb();
  await db.put("outbox", { ...entry, retries: entry.retries + 1 });
}
