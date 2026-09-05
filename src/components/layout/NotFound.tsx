import { Link } from "react-router";

import { AlertIcon } from "../icons";

import { AppShell } from "./AppShell";
import { EmptyState } from "./EmptyState";

export const NotFound = ({
  title = "Page not found",
  description = "Whatever was here doesn't exist in this browser's storage.",
}: {
  title?: string;
  description?: string;
}) => (
  <AppShell>
    <EmptyState
      icon={AlertIcon}
      title={title}
      description={description}
      actions={
        <Link
          to="/"
          className="ExcButton ExcButton--color-primary ExcButton--variant-outlined ExcButton--size-medium"
        >
          <div className="ExcButton__contents">Back to projects</div>
        </Link>
      }
    />
  </AppShell>
);
