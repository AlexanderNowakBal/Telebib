"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { BoardSnapshot, Card, Column } from "@/lib/types/domain";
import { Column as ColumnComponent } from "./column";
import { CardItem } from "./card-item";
import { CardDetailDialog } from "@/components/cards/card-detail-dialog";
import { MoveCardSheet } from "./move-card-sheet";
import { BoardHeader } from "./board-header";
import { BoardToolbar } from "./board-toolbar";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { generateMutationId } from "@/lib/utils";

interface Props {
  initialSnapshot: BoardSnapshot;
  userRole: string;
  userId: string;
}

interface Filters {
  query: string;
  assigneeId: string | null;
  labelIds: string[];
  priority: "low" | "medium" | "high" | null;
  overdue: boolean;
}

export function KanbanBoardClient({ initialSnapshot, userRole, userId }: Props) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [filters, setFilters] = useState<Filters>({
    query: "",
    assigneeId: null,
    labelIds: [],
    priority: null,
    overdue: false,
  });
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [detailCard, setDetailCard] = useState<Card | null>(null);
  const [moveCard, setMoveCard] = useState<Card | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const canEdit = userRole === "owner" || userRole === "admin" || userRole === "member";

  // ── Realtime subscription ──────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`board:${snapshot.board.id}`)
      .on("broadcast", { event: "*" }, ({ payload }) => {
        handleRealtimeEvent(payload);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [snapshot.board.id]);

  function handleRealtimeEvent(payload: { type: string; [k: string]: unknown }) {
    // Reload snapshot on any event from another user to keep state consistent
    fetch(`/api/boards/${snapshot.board.id}`)
      .then((r) => r.json())
      .then((res) => { if (res.data) setSnapshot(res.data); })
      .catch(() => {});
  }

  // ── DnD sensors ────────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // ── Filtered cards ─────────────────────────────────────────────────────────
  const filteredCards = useMemo(() => {
    return snapshot.cards.filter((card) => {
      if (filters.query && !card.title.toLowerCase().includes(filters.query.toLowerCase())) return false;
      if (filters.assigneeId && card.assigneeId !== filters.assigneeId) return false;
      if (filters.priority && card.priority !== filters.priority) return false;
      if (filters.labelIds.length > 0 && !filters.labelIds.some((id) => card.labels.some((l) => l.id === id))) return false;
      if (filters.overdue && card.dueDate && new Date(card.dueDate) >= new Date()) return false;
      return true;
    });
  }, [snapshot.cards, filters]);

  const cardsByColumn = useMemo(() => {
    const map = new Map<string, Card[]>();
    for (const col of snapshot.columns) map.set(col.id, []);
    for (const card of filteredCards) map.get(card.columnId)?.push(card);
    for (const entries of map.values()) entries.sort((a, b) => a.position - b.position);
    return map;
  }, [snapshot.columns, filteredCards]);

  // ── Drag end ───────────────────────────────────────────────────────────────
  async function onDragEnd(event: DragEndEvent) {
    const cardId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    setActiveId(null);

    if (!overId || cardId === overId) return;

    const card = snapshot.cards.find((c) => c.id === cardId);
    if (!card) return;

    // Determine target column and index
    const toColumnId = snapshot.columns.some((c) => c.id === overId)
      ? overId
      : snapshot.cards.find((c) => c.id === overId)?.columnId ?? card.columnId;

    const colCards = (cardsByColumn.get(toColumnId) ?? []).filter((c) => c.id !== cardId);
    const overCardIndex = colCards.findIndex((c) => c.id === overId);
    const toIndex = overCardIndex >= 0 ? overCardIndex : colCards.length;

    // Optimistic update
    setSnapshot((prev) => ({
      ...prev,
      cards: prev.cards.map((c) =>
        c.id === cardId ? { ...c, columnId: toColumnId, version: c.version + 1 } : c,
      ),
    }));

    try {
      const res = await fetch(`/api/cards/${cardId}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toColumnId,
          toIndex,
          expectedVersion: card.version,
          clientMutationId: generateMutationId(),
        }),
      });
      if (!res.ok) throw await res.json();
    } catch {
      // Rollback on error
      setSnapshot(initialSnapshot);
      setToast("Erreur lors du déplacement. Rafraîchissement…");
      setTimeout(() => {
        fetch(`/api/boards/${snapshot.board.id}`).then((r) => r.json()).then((res) => {
          if (res.data) setSnapshot(res.data);
        });
      }, 1000);
    }
  }

  // ── Add card ───────────────────────────────────────────────────────────────
  async function handleAddCard(columnId: string, title: string) {
    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        boardId: snapshot.board.id,
        columnId,
        title,
        priority: "medium",
        expectedVersion: 0,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      setSnapshot((prev) => ({
        ...prev,
        cards: [...prev.cards, { ...json.data, labels: [], assignee: null }],
      }));
    }
  }

  // ── Update card ────────────────────────────────────────────────────────────
  async function handleSaveCard(card: Card, updates: Partial<Card & { labelIds: string[] }>) {
    const res = await fetch(`/api/cards/${card.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...updates, expectedVersion: card.version }),
    });
    if (res.ok) {
      const json = await res.json();
      setSnapshot((prev) => ({
        ...prev,
        cards: prev.cards.map((c) => (c.id === card.id ? { ...c, ...json.data, labels: c.labels } : c)),
      }));
    }
  }

  // ── Move card (accessible) ─────────────────────────────────────────────────
  async function handleAccessibleMove(card: Card, toColumnId: string, toIndex: number) {
    const res = await fetch(`/api/cards/${card.id}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toColumnId, toIndex, expectedVersion: card.version }),
    });
    if (res.ok) {
      const json = await res.json();
      setSnapshot((prev) => ({
        ...prev,
        cards: prev.cards.map((c) =>
          c.id === card.id
            ? { ...c, columnId: json.data.toColumnId, position: json.data.position, version: json.data.version }
            : c,
        ),
      }));
    }
  }

  // ── Rename board ───────────────────────────────────────────────────────────
  async function handleRenameBoard(newName: string) {
    const res = await fetch(`/api/boards/${snapshot.board.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    if (res.ok) setSnapshot((prev) => ({ ...prev, board: { ...prev.board, name: newName } }));
  }

  const memberProfiles = snapshot.members.map((m) => m.profile);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <BoardHeader
        board={snapshot.board}
        members={snapshot.members}
        canEdit={canEdit}
        onRename={handleRenameBoard}
      />
      <BoardToolbar
        filters={filters}
        members={memberProfiles}
        labels={snapshot.labels}
        onFilterChange={setFilters}
      />

      {/* Global "Move to…" shortcut button */}
      <div className="flex justify-end px-4 py-2 bg-white border-b">
        <button
          type="button"
          onClick={() => {
            if (snapshot.cards[0]) setMoveCard(snapshot.cards[0]);
          }}
          className="rounded border px-3 py-1.5 text-sm"
          aria-label="Déplacer une carte sans glisser-déposer"
        >
          Déplacer vers…
        </button>
      </div>

      {/* Board columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(e) => setActiveId(String(e.active.id))}
        onDragEnd={onDragEnd}
      >
        <main
          className="flex flex-1 gap-4 overflow-x-auto p-4"
          aria-label={`Board ${snapshot.board.name}`}
        >
          {snapshot.columns.map((col) => (
            <ColumnComponent
              key={col.id}
              column={col}
              cards={cardsByColumn.get(col.id) ?? []}
              canEdit={canEdit}
              onAddCard={handleAddCard}
              onCardClick={(card) => setDetailCard(card)}
            />
          ))}
        </main>

        <DragOverlay>
          {activeId ? (() => {
            const card = snapshot.cards.find((c) => c.id === activeId);
            return card ? <CardItem card={card} onOpen={() => {}} /> : null;
          })() : null}
        </DragOverlay>
      </DndContext>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-neutral-800 px-4 py-2 text-sm text-white shadow-lg"
        >
          {toast}
          <button
            type="button"
            className="ml-3 underline"
            onClick={() => setToast(null)}
            aria-label="Fermer la notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* Card detail dialog */}
      {detailCard && (
        <CardDetailDialog
          card={detailCard}
          labels={snapshot.labels}
          members={snapshot.members}
          open={!!detailCard}
          onOpenChange={(open) => { if (!open) setDetailCard(null); }}
          onSave={(updates) => handleSaveCard(detailCard, updates as Partial<Card & { labelIds: string[] }>)}
          onMoveRequest={() => { setMoveCard(detailCard); setDetailCard(null); }}
        />
      )}

      {/* Move card sheet */}
      {moveCard && (
        <MoveCardSheet
          card={moveCard}
          columns={snapshot.columns}
          open={!!moveCard}
          onOpenChange={(open) => { if (!open) setMoveCard(null); }}
          onMove={(toColumnId, toIndex) => handleAccessibleMove(moveCard, toColumnId, toIndex)}
        />
      )}
    </div>
  );
}
