import React from "react";

import { SortableGrid } from "../layout/SortableGrid";

import { DesignCard } from "./DesignCard";

import type { SortableMove } from "../layout/SortableGrid";
import type { DesignMenuActions } from "./DesignMenu";

import type { Design } from "../../types";

type DesignGridProps = {
  designs: Design[];
  onReorder: (move: SortableMove) => void;
  onTagClick?: (tag: string) => void;
  /** per-card action callbacks */
  actions: (design: Design) => DesignMenuActions;
  /** rendered first (the "new design" card) */
  leading?: React.ReactNode;
};

/** Drag-sortable grid of design cards. */
export const DesignGrid = ({
  designs,
  onReorder,
  onTagClick,
  actions,
  leading,
}: DesignGridProps) => (
  <SortableGrid
    items={designs}
    onReorder={onReorder}
    leading={leading}
    renderItem={(design, sortable) => (
      <DesignCard
        design={design}
        sortable={sortable}
        onTagClick={onTagClick}
        {...actions(design)}
      />
    )}
  />
);
