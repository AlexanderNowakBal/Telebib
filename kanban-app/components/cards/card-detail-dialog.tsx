"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import type { Card, Label, WorkspaceMember, Priority } from "@/lib/types/domain";
import { PRIORITY_LABELS, formatDate } from "@/lib/utils";

interface CardDetailDialogProps {
  card: Card;
  labels: Label[];
  members: WorkspaceMember[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: {
    title?: string;
    description?: string;
    assigneeId?: string | null;
    labelIds?: string[];
    dueDate?: string | null;
    priority?: Priority;
  }) => Promise<void>;
  onMoveRequest: () => void;
}

export function CardDetailDialog({
  card,
  labels,
  members,
  open,
  onOpenChange,
  onSave,
  onMoveRequest,
}: CardDetailDialogProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [assigneeId, setAssigneeId] = useState(card.assigneeId);
  const [selectedLabelIds, setSelectedLabelIds] = useState(card.labels.map((l) => l.id));
  const [dueDate, setDueDate] = useState(card.dueDate ?? "");
  const [priority, setPriority] = useState<Priority>(card.priority);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({
      title: title.trim() || card.title,
      description,
      assigneeId,
      labelIds: selectedLabelIds,
      dueDate: dueDate || null,
      priority,
    });
    setSaving(false);
    onOpenChange(false);
  }

  function toggleLabel(labelId: string) {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId],
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[min(42rem,92vw)] max-h-[90vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl focus:outline-none"
          aria-describedby="card-detail-desc"
        >
          <Dialog.Title className="text-xl font-bold mb-1">Détails de la carte</Dialog.Title>
          <Dialog.Description id="card-detail-desc" className="text-sm text-neutral-500 mb-4">
            Modifier les informations de la carte.
          </Dialog.Description>

          <div className="grid gap-4">
            {/* Title */}
            <label className="grid gap-1">
              <span className="text-sm font-medium">
                Titre <span aria-hidden>*</span>
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                aria-required="true"
              />
            </label>

            {/* Description */}
            <label className="grid gap-1">
              <span className="text-sm font-medium">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </label>

            {/* Priority + Due date */}
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1">
                <span className="text-sm font-medium">Priorité</span>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {(["low", "medium", "high"] as Priority[]).map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium">Date d'échéance</span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </label>
            </div>

            {/* Assignee */}
            <label className="grid gap-1">
              <span className="text-sm font-medium">Assigné à</span>
              <select
                value={assigneeId ?? ""}
                onChange={(e) => setAssigneeId(e.target.value || null)}
                className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Non assigné</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.profile.displayName}
                  </option>
                ))}
              </select>
            </label>

            {/* Labels */}
            {labels.length > 0 && (
              <fieldset>
                <legend className="text-sm font-medium mb-1">Labels</legend>
                <div className="flex flex-wrap gap-2">
                  {labels.map((label) => {
                    const checked = selectedLabelIds.includes(label.id);
                    return (
                      <label key={label.id} className="flex items-center gap-1 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleLabel(label.id)}
                          className="accent-blue-600"
                        />
                        <span
                          className="rounded px-2 py-0.5 text-xs"
                          style={{
                            backgroundColor: label.colorToken + "33",
                            color: label.colorToken,
                          }}
                        >
                          {label.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}
          </div>

          <div className="mt-6 flex items-center gap-2">
            <button
              type="button"
              onClick={onMoveRequest}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Déplacer vers…
            </button>
            <div className="ml-auto flex gap-2">
              <Dialog.Close asChild>
                <button type="button" className="rounded-lg border px-4 py-2 text-sm">
                  Fermer
                </button>
              </Dialog.Close>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                aria-busy={saving}
              >
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
