import clsx from "clsx";
import React from "react";

import { PROJECT_COLORS } from "../../constants";

import "./ColorSwatches.scss";

import type { ProjectColor } from "../../types";

/** Round swatches for the project accent colour (`--pc-<color>` tokens). */
export const ColorSwatches = ({
  value,
  onChange,
  label = "Colour",
}: {
  value: ProjectColor;
  onChange: (color: ProjectColor) => void;
  label?: string;
}) => (
  <div className="ColorSwatches" role="radiogroup" aria-label={label}>
    {PROJECT_COLORS.map((color) => (
      <button
        key={color}
        type="button"
        role="radio"
        aria-checked={color === value}
        aria-label={color}
        title={color}
        className={clsx("ColorSwatches__swatch", {
          "ColorSwatches__swatch--selected": color === value,
        })}
        style={{ "--swatch": `var(--pc-${color})` } as React.CSSProperties}
        onClick={() => onChange(color)}
      />
    ))}
  </div>
);
