"use client";

import { useState } from "react";
import type { Board, WorkspaceMember } from "@/lib/types/domain";

interface BoardHeaderProps {
  board: Board;
  members: WorkspaceMember[];
  canEdit: boolean;
  onRename: (newName: string) => Promise<void>;
}

export function BoardHeader({ board, members, canEdit, onRename }: BoardHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(board.name);
  const [saving, setSaving] = useState(false);

  async function handleRename() {
    if (!name.trim() || name === board.name) {
      setEditing(false);
      setName(board.name);
      return;
    }
    setSaving(true);
    await onRename(name.trim());
    setSaving(false);
    setEditing(false);
  }

  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-white px-4 py-3 shadow-sm">
      {/* Board name — editable inline */}
      {editing && canEdit ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRename();
          }}
          className="flex items-center gap-2"
        >
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === "Escape" && (setEditing(false), setName(board.name))}
            className="rounded border px-2 py-1 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-label="Renommer le board"
            disabled={saving}
          />
        </form>
      ) : (
        <h1
          className="text-xl font-bold"
          tabIndex={canEdit ? 0 : undefined}
          role={canEdit ? "button" : undefined}
          aria-label={canEdit ? `Renommer ${board.name}` : board.name}
          onKeyDown={(e) => e.key === "Enter" && canEdit && setEditing(true)}
          onClick={() => canEdit && setEditing(true)}
        >
          {board.name}
        </h1>
      )}

      {/* Member avatars */}
      <div className="ml-auto flex items-center gap-1" aria-label={`${members.length} membres`}>
        {members.slice(0, 5).map((m) => (
          <span
            key={m.userId}
            title={m.profile.displayName}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white"
            aria-label={m.profile.displayName}
          >
            {m.profile.displayName.charAt(0).toUpperCase()}
          </span>
        ))}
        {members.length > 5 && (
          <span className="text-sm text-neutral-500">+{members.length - 5}</span>
        )}
      </div>
    </header>
  );
}
