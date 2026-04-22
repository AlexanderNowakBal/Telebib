"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Column as ColumnType, Card } from "@/lib/types/domain";
import { CardItem } from "./card-item";

interface ColumnProps {
  column: ColumnType;
  cards: Card[];
  canEdit: boolean;
  onAddCard: (columnId: string, title: string) => Promise<void>;
  onCardClick: (card: Card) => void;
}

export function Column({ column, cards, canEdit, onAddCard, onCardClick }: ColumnProps) {
  const [addingCard, setAddingCard] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  async function handleAddCard(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSaving(true);
    await onAddCard(column.id, newTitle.trim());
    setNewTitle("");
    setAddingCard(false);
    setSaving(false);
  }

  return (
    <section
      aria-labelledby={`col-${column.id}`}
      className={`flex w-72 shrink-0 flex-col rounded-xl border bg-neutral-100 transition-colors ${isOver ? "border-blue-400 bg-blue-50" : ""}`}
    >
      {/* Column header */}
      <header className="flex items-center justify-between px-3 pt-3 pb-1">
        <h2 id={`col-${column.id}`} className="font-semibold text-sm text-neutral-700">
          {column.name}
          {column.wipLimit ? (
            <span className="ml-2 text-xs text-neutral-400">
              {cards.length}/{column.wipLimit}
            </span>
          ) : (
            <span className="ml-2 text-xs text-neutral-400">{cards.length}</span>
          )}
        </h2>
        {column.isDoneColumn && (
          <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">
            Fait
          </span>
        )}
      </header>

      {/* Cards */}
      <div ref={setNodeRef} className="flex-1 overflow-y-auto px-2 py-1">
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2" aria-label={`Cartes de la colonne ${column.name}`}>
            {cards.map((card) => (
              <li key={card.id}>
                <CardItem card={card} onOpen={() => onCardClick(card)} />
              </li>
            ))}
          </ul>
        </SortableContext>
      </div>

      {/* Add card */}
      {canEdit && (
        <div className="px-2 pb-2 pt-1">
          {addingCard ? (
            <form onSubmit={handleAddCard} className="grid gap-1">
              <label htmlFor={`new-card-${column.id}`} className="sr-only">
                Titre de la carte
              </label>
              <textarea
                id={`new-card-${column.id}`}
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setAddingCard(false);
                    setNewTitle("");
                  }
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddCard(e as unknown as React.FormEvent);
                  }
                }}
                placeholder="Titre de la carte"
                rows={2}
                className="w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                aria-label="Titre de la carte"
              />
              <div className="flex gap-1">
                <button
                  type="submit"
                  disabled={saving || !newTitle.trim()}
                  className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                  aria-busy={saving}
                >
                  Créer la carte
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddingCard(false);
                    setNewTitle("");
                  }}
                  className="rounded border px-3 py-1 text-sm"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setAddingCard(true)}
              className="flex w-full items-center gap-1 rounded px-2 py-1.5 text-sm text-neutral-500 hover:bg-neutral-200"
              aria-label={`Ajouter une carte à ${column.name}`}
            >
              <span aria-hidden>+</span> Ajouter
            </button>
          )}
        </div>
      )}
    </section>
  );
}
