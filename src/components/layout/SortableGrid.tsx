import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import React, { useEffect, useId, useMemo, useRef, useState } from "react";

import type { DragEndEvent } from "@dnd-kit/core";

/** What a card needs to take part in drag-reordering. */
export type SortableItemHandle = {
  /** ref for the card element (the thing that moves) */
  setNodeRef: (node: HTMLElement | null) => void;
  /** transform/transition for the card element */
  style: React.CSSProperties;
  isDragging: boolean;
  /** spread on the card: pointer drags can start anywhere on it */
  pointerProps: { onPointerDown?: React.PointerEventHandler<HTMLElement> };
  /** spread on a dedicated drag handle button: keyboard reordering + a11y attributes */
  handleProps: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    ref: (node: HTMLElement | null) => void;
  };
};

/** A completed drop: `activeId` was dragged onto `overId`'s position. */
export type SortableMove = { activeId: string; overId: string };

/**
 * Applies a drop to a *complete* id list (the grid may only show a filtered
 * subset): the moved id lands where `overId` currently sits, everything else
 * keeps its relative order.
 */
export const applyMove = (
  ids: string[],
  { activeId, overId }: SortableMove,
): string[] => {
  const from = ids.indexOf(activeId);
  const to = ids.indexOf(overId);
  if (from === -1 || to === -1 || from === to) {
    return ids;
  }
  const next = [...ids];
  next.splice(to, 0, ...next.splice(from, 1));
  return next;
};

type SortableGridProps<T extends { id: string }> = {
  items: T[];
  renderItem: (item: T, handle: SortableItemHandle) => React.ReactNode;
  /** called after a drop; the parent derives and persists the full order */
  onReorder: (move: SortableMove) => void;
  /** rendered before the sortable items (e.g. a "new" card) */
  leading?: React.ReactNode;
  className?: string;
};

const SortableItem = ({
  id,
  children,
}: {
  id: string;
  children: (handle: SortableItemHandle) => React.ReactNode;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const { onKeyDown, onPointerDown } = listeners ?? {};

  return (
    <>
      {children({
        setNodeRef,
        style: {
          transform: CSS.Translate.toString(transform),
          transition,
          zIndex: isDragging ? 1 : undefined,
        },
        isDragging,
        pointerProps: {
          onPointerDown: onPointerDown as
            | React.PointerEventHandler<HTMLElement>
            | undefined,
        },
        handleProps: {
          ...attributes,
          onKeyDown: onKeyDown as
            | React.KeyboardEventHandler<HTMLButtonElement>
            | undefined,
          ref: setActivatorNodeRef,
        },
      })}
    </>
  );
};

/**
 * A `.CardGrid` whose items can be reordered by dragging (pointer, 6px
 * activation distance so clicks still work) or via a keyboard handle.
 * The dropped order is shown immediately; the parent persists it and the
 * next `items` prop wins once it arrives.
 */
export const SortableGrid = <T extends { id: string }>({
  items,
  renderItem,
  onReorder,
  leading,
  className,
}: SortableGridProps<T>) => {
  const contextId = useId();
  const [override, setOverride] = useState<{ base: T[]; items: T[] } | null>(
    null,
  );
  const ordered = override && override.base === items ? override.items : items;
  const ids = useMemo(() => ordered.map((item) => item.id), [ordered]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Cards are stretched links: the `click` that follows a pointer drop would
  // navigate. dnd-kit only stops its propagation (document capture), which
  // does not cancel an anchor's default action, so we cancel it here. Our
  // capture listener is registered before dnd-kit's, hence it runs first.
  const dragging = useRef(false);
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (dragging.current) {
        event.preventDefault();
      }
    };
    document.addEventListener("click", onClick, { capture: true });
    return () =>
      document.removeEventListener("click", onClick, { capture: true });
  }, []);
  const handleDragStart = () => {
    dragging.current = true;
  };
  const settleDrag = () => {
    // the click is dispatched in the same task as the pointerup
    window.setTimeout(() => {
      dragging.current = false;
    }, 0);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    settleDrag();
    if (!over || active.id === over.id) {
      return;
    }
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) {
      return;
    }
    setOverride({ base: items, items: arrayMove(ordered, from, to) });
    onReorder({ activeId: String(active.id), overId: String(over.id) });
  };

  return (
    <DndContext
      id={contextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={settleDrag}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className={clsx("CardGrid", className)}>
          {leading}
          {ordered.map((item) => (
            <SortableItem key={item.id} id={item.id}>
              {(handle) => renderItem(item, handle)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
