import { PlusIcon } from "../icons";

import "./NewDesignCard.scss";

/** Dashed "New design" card, rendered first in the design grid. */
export const NewDesignCard = ({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    className="NewDesignCard"
    onClick={onClick}
    disabled={disabled}
    aria-label="New design"
  >
    <span className="NewDesignCard__icon" aria-hidden>
      {PlusIcon}
    </span>
    <span className="NewDesignCard__title">New design</span>
    <span className="NewDesignCard__hint muted">Blank canvas</span>
  </button>
);
