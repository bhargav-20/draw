import clsx from "clsx";
import React, {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";

import "./TextField.scss";

// styles: `.excalidraw .ExcTextField*` from @excalidraw/excalidraw/index.css
// (port of upstream components/TextField.tsx)

type TextFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  label?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  readonly?: boolean;
  selectOnRender?: boolean;
  autoFocus?: boolean;
  className?: string;
  type?: "text" | "search";
  /** compact 2.25rem height (toolbars) instead of the 3rem dialog height */
  size?: "regular" | "compact";
  "aria-label"?: string;
  name?: string;
  maxLength?: number;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      value,
      onChange,
      onKeyDown,
      onBlur,
      onFocus,
      label,
      placeholder,
      icon,
      fullWidth,
      readonly,
      selectOnRender,
      autoFocus,
      className,
      type = "text",
      size = "regular",
      name,
      maxLength,
      ...rest
    },
    ref,
  ) => {
    const innerRef = useRef<HTMLInputElement | null>(null);
    useImperativeHandle(ref, () => innerRef.current!);

    useLayoutEffect(() => {
      if (selectOnRender) {
        innerRef.current?.select();
      }
    }, [selectOnRender]);

    return (
      <div
        className={clsx("ExcTextField", className, {
          "ExcTextField--fullWidth": fullWidth,
          "ExcTextField--hasIcon": !!icon,
          "ExcTextField--compact": size === "compact",
        })}
        onClick={() => innerRef.current?.focus()}
      >
        {icon}
        {label && <div className="ExcTextField__label">{label}</div>}
        <div
          className={clsx("ExcTextField__input", {
            "ExcTextField__input--readonly": readonly,
          })}
        >
          <input
            className={clsx({ "is-redacted": false })}
            readOnly={readonly}
            type={type}
            value={value}
            placeholder={placeholder}
            ref={innerRef}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            onFocus={onFocus}
            autoFocus={autoFocus}
            name={name}
            maxLength={maxLength}
            aria-label={rest["aria-label"] ?? label ?? placeholder}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    );
  },
);
TextField.displayName = "TextField";
