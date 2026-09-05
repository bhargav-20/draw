import clsx from "clsx";

import { SearchIcon } from "../icons";
import { TextField } from "../ui";

import "./SearchBox.scss";

/** Compact search field; Escape clears it. */
export const SearchBox = ({
  value,
  onChange,
  placeholder = "Search",
  className,
  narrow,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** toolbar width (18rem) instead of the header width (22.5rem) */
  narrow?: boolean;
}) => (
  <TextField
    className={clsx("SearchBox", className, { "SearchBox--narrow": narrow })}
    size="compact"
    icon={SearchIcon}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    aria-label={placeholder}
    onKeyDown={(event) => {
      if (event.key === "Escape" && value) {
        event.stopPropagation();
        onChange("");
      }
    }}
  />
);
