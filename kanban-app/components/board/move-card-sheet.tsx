"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import type { Card, Column } from "@/lib/types/domain";

interface MoveCardSheetProps {
  card: Card;
  columns: Column[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMove: (toColumnId: string, toIndex: number) => Promise<void>;
}

/**
 * Accessible alternative to drag-and-drop for mobile and keyboard users.
 * Fulfils WCAG 2.2 SC 2.5.7: all drag operations must have a pointer/keyboard alternative.
 */
export function MoveCardSheet({ card, columns, open, onOpenChange, onMove }: MoveCardSheetProps) {
  const [selectedColumnId, setSelectedColumnId] = useState(card.columnId);
  const [toIndex, setToIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  async function handleMove() {
    setLoading(true);
    await onMove(selectedColumnId, toIndex);
    setLoading(false);
    onOpenChange(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white p-6 shadow-xl sm:left-1/2 sm:bottom-auto sm:top-1/2 sm:w-96 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl">
          <Dialog.Title className="text-lg font-bold mb-1">Déplacer la carte</Dialog.Title>
          <Dialog.Description className="text-sm text-neutral-500 mb-4">
            Choisissez une colonne de destination et une position.
          </Dialog.Description>

          <div className="grid gap-4">
            <div className="grid gap-1">
              <label htmlFor="move-column" className="text-sm font-medium">
                Colonne
              </label>
              <select
                id="move-column"
                value={selectedColumnId}
                onChange={(e) => setSelectedColumnId(e.target.value)}
                className="rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-1">
              <label htmlFor="move-index" className="text-sm font-medium">
                Position (à partir de 0)
              </label>
              <input
                id="move-index"
                type="number"
                min={0}
                value={toIndex}
                onChange={(e) => setToIndex(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Annuler
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={handleMove}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              aria-busy={loading}
            >
              {loading ? "Déplacement…" : "Déplacer"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
