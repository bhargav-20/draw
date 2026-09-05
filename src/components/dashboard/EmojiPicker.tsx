import clsx from "clsx";
import React from "react";

import { DEFAULT_PROJECT_EMOJIS } from "../../constants";

import "./EmojiPicker.scss";

import type { ProjectColor } from "../../types";

const PRESETS: readonly string[] = DEFAULT_PROJECT_EMOJIS;

/** first grapheme of the typed text (emoji can span several code points) */
const firstGrapheme = (text: string): string => {
  const trimmed = text.trim();
  if (!trimmed) {
    return "";
  }
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, {
      granularity: "grapheme",
    });
    const first = segmenter.segment(trimmed)[Symbol.iterator]().next();
    return first.done ? trimmed : first.value.segment;
  }
  return Array.from(trimmed)[0] ?? "";
};

/** Preset emoji tiles plus a free-text box for any other emoji. */
export const EmojiPicker = ({
  value,
  onChange,
  color = "gray",
  label = "Icon",
}: {
  value: string;
  onChange: (emoji: string) => void;
  /** accent for the selected tile */
  color?: ProjectColor;
  label?: string;
}) => {
  const isCustom = !PRESETS.includes(value);
  const selectedStyle = {
    background: `var(--pc-${color}-bg)`,
  } as React.CSSProperties;

  return (
    <div className="EmojiPicker" role="radiogroup" aria-label={label}>
      {PRESETS.map((emoji) => {
        const selected = emoji === value;
        return (
          <button
            key={emoji}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={emoji}
            className={clsx("EmojiPicker__option", {
              "EmojiPicker__option--selected": selected,
            })}
            style={selected ? selectedStyle : undefined}
            onClick={() => onChange(emoji)}
          >
            {emoji}
          </button>
        );
      })}
      <input
        className={clsx("EmojiPicker__custom", {
          "EmojiPicker__custom--selected": isCustom && value,
        })}
        style={isCustom && value ? selectedStyle : undefined}
        value={isCustom ? value : ""}
        placeholder="Other"
        aria-label="Custom emoji"
        title="Type any emoji"
        spellCheck={false}
        autoComplete="off"
        onChange={(event) => {
          const emoji = firstGrapheme(event.target.value);
          if (emoji) {
            onChange(emoji);
          }
        }}
      />
    </div>
  );
};
