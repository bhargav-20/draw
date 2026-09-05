import {
  ArchiveIcon,
  ArrowRightIcon,
  CopyIcon,
  DotsIcon,
  MoveIcon,
  PencilIcon,
  RestoreIcon,
  TagIcon,
  TrashIcon,
} from "../icons";
import { DropdownMenu, IconButton } from "../ui";

import type { Design } from "../../types";

export type DesignMenuActions = {
  onOpen: () => void;
  onDuplicate: () => void;
  onRename: () => void;
  onEditTags: () => void;
  onMove: () => void;
  onArchiveToggle: () => void;
  onDelete: () => void;
};

/** Kebab menu of a design card. */
export const DesignMenu = ({
  design,
  onOpen,
  onDuplicate,
  onRename,
  onEditTags,
  onMove,
  onArchiveToggle,
  onDelete,
}: { design: Design } & DesignMenuActions) => {
  const archived = !!design.archivedAt;
  return (
    <DropdownMenu
      trigger={(props) => (
        <IconButton
          {...props}
          variant="ghost"
          size="sm"
          icon={DotsIcon}
          label={`Design actions for ${design.name}`}
        />
      )}
    >
      <DropdownMenu.Item icon={ArrowRightIcon} onSelect={onOpen}>
        Open
      </DropdownMenu.Item>
      <DropdownMenu.Item icon={CopyIcon} onSelect={onDuplicate}>
        Duplicate
      </DropdownMenu.Item>
      <DropdownMenu.Item icon={PencilIcon} onSelect={onRename}>
        Rename
      </DropdownMenu.Item>
      <DropdownMenu.Item icon={TagIcon} onSelect={onEditTags}>
        Edit tags
      </DropdownMenu.Item>
      <DropdownMenu.Item icon={MoveIcon} onSelect={onMove}>
        Move to project…
      </DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item
        icon={archived ? RestoreIcon : ArchiveIcon}
        onSelect={onArchiveToggle}
      >
        {archived ? "Restore" : "Archive"}
      </DropdownMenu.Item>
      <DropdownMenu.Item icon={TrashIcon} onSelect={onDelete} danger>
        Delete permanently
      </DropdownMenu.Item>
    </DropdownMenu>
  );
};
