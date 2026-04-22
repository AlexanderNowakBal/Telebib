"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card } from "@/lib/types/domain";
import { PRIORITY_COLORS, PRIORITY_LABELS, formatDate, isOverdue } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CardItemProps {
  card: Card;
  onOpen: () => void;
}

export function CardItem({ card, onOpen }: CardItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const overdue = isOverdue(card.dueDate);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow-md",
        isDragging && "ring-2 ring-blue-400",
      )}
    >
      {/* Labels */}
      {card.labels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1" aria-label="Labels">
          {card.labels.map((label) => (
            <span
              key={label.id}
              className="rounded px-1.5 py-0.5 text-xs font-medium"
              style={{ backgroundColor: label.colorToken + "33", color: label.colorToken }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Card title — opens detail dialog */}
      <button
        type="button"
        onClick={onOpen}
        className="w-full text-left text-sm font-medium focus:outline-none focus:underline"
        aria-label={`Ouvrir la carte : ${card.title}`}
        {...listeners}
        {...attributes}
      >
        {card.title}
      </button>

      {/* Footer metadata */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-xs",
            PRIORITY_COLORS[card.priority],
          )}
          aria-label={`Priorité : ${PRIORITY_LABELS[card.priority]}`}
        >
          {PRIORITY_LABELS[card.priority]}
        </span>

        {card.dueDate && (
          <span
            className={cn("text-xs", overdue ? "text-red-600 font-semibold" : "text-neutral-500")}
            aria-label={`Échéance : ${formatDate(card.dueDate)}${overdue ? " (en retard)" : ""}`}
          >
            {formatDate(card.dueDate)}
          </span>
        )}

        {card.assignee && (
          <span
            title={card.assignee.displayName}
            className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white"
            aria-label={`Assigné à ${card.assignee.displayName}`}
          >
            {card.assignee.displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}
