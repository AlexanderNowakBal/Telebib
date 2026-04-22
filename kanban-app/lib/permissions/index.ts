// ─── Permission helpers ───────────────────────────────────────────────────────
// Pure functions — no I/O, safe to unit-test without mocks.

import type { Role } from "@/lib/types/domain";

/** Roles that can create or configure boards */
export function canManageBoard(role: Role): boolean {
  return role === "owner" || role === "admin";
}

/** Roles that can create/edit/move/archive cards */
export function canEditCard(role: Role): boolean {
  return role === "owner" || role === "admin" || role === "member";
}

/** Roles that can create/rename/reorder/delete columns */
export function canManageColumns(role: Role): boolean {
  return role === "owner" || role === "admin";
}

/** Roles that can manage labels */
export function canManageLabels(role: Role): boolean {
  return role === "owner" || role === "admin" || role === "member";
}

/** Roles that can invite/remove workspace members */
export function canManageMembers(role: Role): boolean {
  return role === "owner" || role === "admin";
}

/** Only owner can delete workspace or change roles */
export function canDeleteWorkspace(role: Role): boolean {
  return role === "owner";
}

export function canChangeRoles(role: Role): boolean {
  return role === "owner";
}
