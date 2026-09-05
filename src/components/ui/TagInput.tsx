import clsx from "clsx";
import { useMemo, useRef, useState } from "react";

import { normalizeTags } from "../../utils";

import { Tag } from "./Tag";

import "./TagInput.scss";

/**
 * Chips + free text inside an `ExcTextField`-styled box. Enter / comma adds,
 * Backspace on empty removes the last tag. `suggestions` (existing tags not
 * yet added) are offered as clickable chips below the box – a native datalist
 * would swallow the Enter key while its picker is open.
 */
export const TagInput = ({
  value,
  onChange,
  suggestions = [],
  label,
  placeholder = "Add tag…",
  size = "regular",
  className,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  label?: string;
  placeholder?: string;
  size?: "regular" | "compact";
  className?: string;
}) => {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const available = useMemo(
    () => suggestions.filter((tag) => !value.includes(tag)),
    [suggestions, value],
  );

  const commit = (raw: string) => {
    const tags = normalizeTags([...value, ...raw.split(",")]);
    if (tags.length !== value.length || tags.some((t, i) => t !== value[i])) {
      onChange(tags);
    }
    setDraft("");
  };

  return (
    <div
      className={clsx("ExcTextField TagInput", className, {
        "ExcTextField--compact": size === "compact",
      })}
      onClick={() => inputRef.current?.focus()}
    >
      {label && <div className="ExcTextField__label">{label}</div>}
      <div className="ExcTextField__input TagInput__box">
        {value.map((tag) => (
          <Tag
            key={tag}
            label={tag}
            onRemove={() => onChange(value.filter((t) => t !== tag))}
          />
        ))}
        <input
          ref={inputRef}
          value={draft}
          placeholder={value.length ? "" : placeholder}
          aria-label={label ?? "Tags"}
          spellCheck={false}
          autoComplete="off"
          onChange={(event) => {
            const next = event.target.value;
            if (next.includes(",")) {
              commit(next);
            } else {
              setDraft(next);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && draft.trim()) {
              event.preventDefault();
              commit(draft);
            } else if (event.key === "Backspace" && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={() => {
            if (draft.trim()) {
              commit(draft);
            }
          }}
        />
      </div>
      {available.length > 0 && (
        <div className="TagInput__suggestions" aria-label="Suggested tags">
          {available.slice(0, 12).map((tag) => (
            <Tag
              key={tag}
              label={tag}
              onClick={() => onChange(normalizeTags([...value, tag]))}
            />
          ))}
        </div>
      )}
    </div>
  );
};
