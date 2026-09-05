import { ChevronDownIcon } from "../icons";
import { DropdownMenu } from "../ui";

import type { SortKey } from "../../types";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "updatedAt", label: "Last updated" },
  { value: "name", label: "Name" },
  { value: "createdAt", label: "Created" },
  { value: "manual", label: "Manual" },
];

export const sortLabel = (sort: SortKey) =>
  SORT_OPTIONS.find((option) => option.value === sort)?.label ?? "Last updated";

/** Sort dropdown shared by the dashboard and the project page (`.SortButton` look). */
export const SortMenu = ({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (sort: SortKey) => void;
}) => (
  <DropdownMenu
    trigger={(props) => (
      <button
        type="button"
        className="SortButton"
        aria-label={`Sort: ${sortLabel(value)}`}
        title="Sort"
        {...props}
      >
        <span className="SortButton__prefix">Sort</span>
        <span>{sortLabel(value)}</span>
        {ChevronDownIcon}
      </button>
    )}
  >
    {SORT_OPTIONS.map((option) => (
      <DropdownMenu.Item
        key={option.value}
        selected={option.value === value}
        onSelect={() => onChange(option.value)}
      >
        {option.label}
      </DropdownMenu.Item>
    ))}
  </DropdownMenu>
);
