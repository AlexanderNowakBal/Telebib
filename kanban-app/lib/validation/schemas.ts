import { z } from "zod";

// ─── Board schemas ────────────────────────────────────────────────────────────

export const CreateBoardSchema = z.object({
  workspaceId: z.string().uuid(),
  name: z.string().min(1, "Le nom est requis").max(100),
  template: z.enum(["blank", "basic"]).default("basic"),
});

export const UpdateBoardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  archived: z.boolean().optional(),
});

// ─── Column schemas ───────────────────────────────────────────────────────────

export const CreateColumnSchema = z.object({
  boardId: z.string().uuid(),
  name: z.string().min(1, "Le nom est requis").max(60),
  position: z.number().int().min(0).optional(),
});

export const UpdateColumnSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  position: z.number().int().min(0).optional(),
  isDoneColumn: z.boolean().optional(),
  wipLimit: z.number().int().min(1).nullable().optional(),
  expectedVersion: z.number().int().min(1),
});

// ─── Card schemas ─────────────────────────────────────────────────────────────

export const CreateCardSchema = z.object({
  boardId: z.string().uuid(),
  columnId: z.string().uuid(),
  title: z.string().min(1, "Le titre est requis").max(300),
  description: z.string().max(10000).optional().default(""),
  assigneeId: z.string().uuid().nullable().optional(),
  labelIds: z.array(z.string().uuid()).optional().default([]),
  dueDate: z.string().date().nullable().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  expectedVersion: z.number().int().min(0).default(0),
});

export const UpdateCardSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(10000).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  labelIds: z.array(z.string().uuid()).optional(),
  dueDate: z.string().date().nullable().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  expectedVersion: z.number().int().min(1),
});

export const MoveCardSchema = z.object({
  toColumnId: z.string().uuid(),
  toIndex: z.number().int().min(0),
  expectedVersion: z.number().int().min(1),
  clientMutationId: z.string().uuid().optional(),
});

export const ArchiveCardSchema = z.object({
  archived: z.boolean(),
  expectedVersion: z.number().int().min(1),
});

// ─── Label schemas ────────────────────────────────────────────────────────────

export const CreateLabelSchema = z.object({
  boardId: z.string().uuid(),
  name: z.string().min(1).max(40),
  colorToken: z.string().min(1).max(50),
});

export const UpdateLabelSchema = z.object({
  name: z.string().min(1).max(40).optional(),
  colorToken: z.string().min(1).max(50).optional(),
});

// ─── Workspace schemas ────────────────────────────────────────────────────────

export const CreateWorkspaceSchema = z.object({
  name: z.string().min(1).max(80),
  slug: z.string().min(2).max(40).regex(/^[a-z0-9-]+$/, "Caractères invalides"),
});

export const InviteMemberSchema = z.object({
  email: z.string().email("Email invalide"),
  role: z.enum(["admin", "member", "viewer"]).default("member"),
});

// ─── Auth schemas ─────────────────────────────────────────────────────────────

export const MagicLinkSchema = z.object({
  email: z.string().email("Email invalide"),
});
