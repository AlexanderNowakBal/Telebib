// ─── Domain Types ────────────────────────────────────────────────────────────
// Central TypeScript definitions for every entity in the Kanban domain.
// These are shared between the BFF API layer and the React UI layer.

export type Role = "owner" | "admin" | "member" | "viewer";

export type Priority = "low" | "medium" | "high";

// ─── Profile ─────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Workspace ───────────────────────────────────────────────────────────────

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  defaultLocale: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  workspaceId: string;
  userId: string;
  role: Role;
  joinedAt: string;
  profile: Pick<Profile, "id" | "displayName" | "avatarUrl">;
}

// ─── Board ───────────────────────────────────────────────────────────────────

export interface Board {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Column ──────────────────────────────────────────────────────────────────

export interface Column {
  id: string;
  boardId: string;
  name: string;
  position: number;
  isDoneColumn: boolean;
  wipLimit: number | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Label ───────────────────────────────────────────────────────────────────

export interface Label {
  id: string;
  boardId: string;
  name: string;
  colorToken: string;
}

// ─── Card ────────────────────────────────────────────────────────────────────

export interface Card {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string;
  assigneeId: string | null;
  priority: Priority;
  dueDate: string | null;
  position: number;
  version: number;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  labels: Label[];
  assignee: Pick<Profile, "id" | "displayName" | "avatarUrl"> | null;
}

// ─── Board Snapshot (full board load) ────────────────────────────────────────

export interface BoardSnapshot {
  board: Board;
  columns: Column[];
  cards: Card[];
  labels: Label[];
  members: WorkspaceMember[];
}

// ─── Realtime Events ─────────────────────────────────────────────────────────

export type RealtimeEvent =
  | { type: "card.created"; cardId: string; columnId: string; position: number; version: number }
  | { type: "card.updated"; cardId: string; changes: Partial<Card>; version: number }
  | { type: "card.moved"; cardId: string; fromColumnId: string; toColumnId: string; position: number; version: number }
  | { type: "card.archived"; cardId: string; archived: boolean; version: number }
  | { type: "column.created"; columnId: string; position: number }
  | { type: "column.updated"; columnId: string; changes: Partial<Column>; version: number }
  | { type: "board.updated"; boardId: string; changes: Partial<Board> };

// ─── Offline Outbox ──────────────────────────────────────────────────────────

export interface OutboxEntry {
  id: string; // clientMutationId
  createdAt: number; // Date.now()
  endpoint: string;
  method: "POST" | "PATCH" | "DELETE";
  body: unknown;
  retries: number;
}
