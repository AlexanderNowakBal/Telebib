"use client";

import { useState, useId } from "react";
import type { Profile, Label, Priority } from "@/lib/types/domain";
import { PRIORITY_LABELS } from "@/lib/utils";

interface Filters {
  query: string;
  assigneeId: string | null;
  labelIds: string[];
  priority: Priority | null;
  overdue: boolean;
}

interface BoardToolbarProps {
  filters: Filters;
  members: Pick<Profile, "id" | "displayName">[];
  labels: Label[];
  onFilterChange: (filters: Filters) => void;
}

export function BoardToolbar({ filters, members, labels, onFilterChange }: BoardToolbarProps) {
  const searchId = useId();

  function update(patch: Partial<Filters>) {
    onFilterChange({ ...filters, ...patch });
  }

  const hasActiveFilters =
    filters.query ||
    filters.assigneeId ||
    filters.labelIds.length > 0 ||
    filters.priority ||
    filters.overdue;

  return (
    <div
      role="toolbar"
      aria-label="Filtres du board"
      className="flex flex-wrap items-center gap-2 border-b bg-white px-4 py-2"
    >
      {/* Search */}
      <div className="flex items-center gap-1">
        <label htmlFor={searchId} className="sr-only">
          Rechercher
        </label>
        <input
          id={searchId}
          type="search"
          placeholder="Rechercher…"
          value={filters.query}
          onChange={(e) => update({ query: e.target.value })}
          className="rounded border px-2 py-1 text-sm w-40 focus:ring-2 focus:ring-blue-600 focus:outline-none"
        />
      </div>

      {/* Assignee filter */}
      <select
        value={filters.assigneeId ?? ""}
        onChange={(e) => update({ assigneeId: e.target.value || null })}
        className="rounded border px-2 py-1 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
        aria-label="Filtrer par assigné"
      >
        <option value="">Tous les membres</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.displayName}
          </option>
        ))}
      </select>

      {/* Priority filter */}
      <select
        value={filters.priority ?? ""}
        onChange={(e) => update({ priority: (e.target.value as Priority) || null })}
        className="rounded border px-2 py-1 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
        aria-label="Filtrer par priorité"
      >
        <option value="">Toutes les priorités</option>
        {(["low", "medium", "high"] as Priority[]).map((p) => (
          <option key={p} value={p}>
            {PRIORITY_LABELS[p]}
          </option>
        ))}
      </select>

      {/* Overdue toggle */}
      <label className="flex items-center gap-1 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={filters.overdue}
          onChange={(e) => update({ overdue: e.target.checked })}
          className="accent-blue-600"
        />
        En retard
      </label>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={() =>
            update({ query: "", assigneeId: null, labelIds: [], priority: null, overdue: false })
          }
          className="rounded border px-2 py-1 text-sm text-red-600 hover:bg-red-50"
          aria-label="Effacer tous les filtres"
        >
          Effacer
        </button>
      )}
    </div>
  );
}
