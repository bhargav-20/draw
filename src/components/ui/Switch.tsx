import clsx from "clsx";

import "./Switch.scss";

// styles: `.excalidraw .Switch` from @excalidraw/excalidraw/index.css
// (port of upstream components/Switch.tsx, with an optional inline label)

export type SwitchProps = {
  name: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  title?: string;
  disabled?: boolean;
};

export const Switch = ({
  name,
  checked,
  onChange,
  label,
  title,
  disabled = false,
}: SwitchProps) => {
  const control = (
    <div className={clsx("Switch", { toggled: checked, disabled })}>
      <input
        name={name}
        id={name}
        title={title}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(!checked)}
      />
    </div>
  );
  if (!label) {
    return control;
  }
  return (
    <label className="SwitchField" htmlFor={name}>
      {control}
      <span className="SwitchField__label">{label}</span>
    </label>
  );
};
