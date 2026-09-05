import clsx from "clsx";

import { CloseIcon } from "../icons";

import "./Tag.scss";

export const Tag = ({
  label,
  onRemove,
  onClick,
  active,
  className,
}: {
  label: string;
  onRemove?: () => void;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}) => {
  const Element = onClick ? "button" : "span";
  return (
    <Element
      className={clsx("Tag", className, {
        "Tag--interactive": !!onClick,
        "Tag--active": active,
      })}
      onClick={onClick}
      type={onClick ? "button" : undefined}
    >
      <span className="Tag__label">{label}</span>
      {onRemove && (
        <button
          type="button"
          className="Tag__remove"
          aria-label={`Remove tag ${label}`}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
        >
          {CloseIcon}
        </button>
      )}
    </Element>
  );
};

export const TagList = ({
  tags,
  className,
  onTagClick,
}: {
  tags: string[];
  className?: string;
  onTagClick?: (tag: string) => void;
}) =>
  tags.length ? (
    <div className={clsx("TagList", className)}>
      {tags.map((tag) => (
        <Tag
          key={tag}
          label={tag}
          onClick={onTagClick ? () => onTagClick(tag) : undefined}
        />
      ))}
    </div>
  ) : null;
