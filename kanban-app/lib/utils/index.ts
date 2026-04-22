import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate a random request ID for log correlation */
export function generateRequestId(): string {
  return `req_${Math.random().toString(36).slice(2, 11)}`;
}

/** Generate a client mutation ID (UUID v4-like) for the offline outbox */
export function generateMutationId(): string {
  return crypto.randomUUID();
}

/** Reorder items in an array (drag-and-drop helper) */
export function reorderArray<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...array];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

/** Calculate a new position value between two neighbours (integer step strategy) */
export function calculatePosition(
  items: Array<{ position: number }>,
  toIndex: number,
): number {
  const sorted = [...items].sort((a, b) => a.position - b.position);
  const STEP = 1024;

  if (sorted.length === 0) return STEP;
  if (toIndex <= 0) return (sorted[0]?.position ?? STEP) - STEP;
  if (toIndex >= sorted.length) return (sorted[sorted.length - 1]?.position ?? STEP) + STEP;

  const before = sorted[toIndex - 1]?.position ?? 0;
  const after = sorted[toIndex]?.position ?? before + STEP * 2;
  return Math.floor((before + after) / 2);
}

/** Format a date for display (fr-BE locale) */
export function formatDate(date: string | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("fr-BE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/** Check if a date is overdue */
export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

/** Priority labels (fr-BE) */
export const PRIORITY_LABELS: Record<string, string> = {
  low: "Faible",
  medium: "Moyenne",
  high: "Haute",
};

/** Priority colours (Tailwind token) */
export const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};
