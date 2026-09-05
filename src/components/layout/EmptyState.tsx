import React from "react";

export const EmptyState = ({
  icon,
  title,
  description,
  actions,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) => (
  <div className="EmptyState">
    <div className="EmptyState__icon" aria-hidden>
      {icon}
    </div>
    <div className="EmptyState__title">{title}</div>
    {description && (
      <div className="EmptyState__description">{description}</div>
    )}
    {actions && <div className="EmptyState__actions">{actions}</div>}
  </div>
);
