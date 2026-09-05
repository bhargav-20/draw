import { formatRelativeTime } from "../../utils";
import { TagList } from "../ui";

import type { Design, Project } from "../../types";

export type DesignSearchResult = { design: Design; project: Project };

/**
 * "Designs" group shown on the dashboard while searching: compact rows that
 * open the design straight in the editor.
 */
export const DesignSearchResults = ({
  results,
  onOpen,
}: {
  results: DesignSearchResult[];
  onOpen: (result: DesignSearchResult) => void;
}) => {
  if (!results.length) {
    return null;
  }
  return (
    <section className="DesignResults" aria-label="Matching designs">
      <h2 className="DesignResults__title">Designs</h2>
      <div className="DesignResults__list">
        {results.map((result) => (
          <button
            key={result.design.id}
            type="button"
            className="Island DesignResult"
            onClick={() => onOpen(result)}
          >
            <span
              className="DesignResult__emoji"
              style={{ background: `var(--pc-${result.project.color}-bg)` }}
              aria-hidden
            >
              {result.project.emoji}
            </span>
            <span className="DesignResult__text">
              <span className="DesignResult__name text-ellipsis">
                {result.design.name}
              </span>
              <span className="DesignResult__project text-ellipsis muted">
                {result.project.name} · edited{" "}
                {formatRelativeTime(result.design.updatedAt)}
              </span>
            </span>
            <TagList
              tags={result.design.tags.slice(0, 3)}
              className="DesignResult__tags"
            />
          </button>
        ))}
      </div>
    </section>
  );
};
