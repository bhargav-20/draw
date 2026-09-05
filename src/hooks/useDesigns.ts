import { listAllDesigns, listDesigns } from "../data/designs";

import { useLiveQuery } from "./useLiveQuery";

import type { ProjectId } from "../types";

/** Designs of one project (archived included) – re-runs whenever the `designs` store changes. */
export const useDesigns = (projectId: ProjectId | undefined) => {
  const { data, loading, error } = useLiveQuery(
    () => (projectId ? listDesigns(projectId) : Promise.resolve([])),
    ["designs"],
    [projectId],
  );
  return { designs: data, loading, error };
};

/** Every design across all projects (metadata only – scenes are never loaded here). */
export const useAllDesigns = () => {
  const { data, loading, error } = useLiveQuery(listAllDesigns, ["designs"]);
  return { designs: data, loading, error };
};
