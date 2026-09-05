import { getProject, listProjects } from "../data/projects";

import { useLiveQuery } from "./useLiveQuery";

import type { ProjectId } from "../types";

/** Every project (archived included) – re-runs whenever the `projects` store changes. */
export const useProjects = () => {
  const { data, loading, error } = useLiveQuery(listProjects, ["projects"]);
  return { projects: data, loading, error };
};

/** One project by id; `project` is `undefined` while loading or when it does not exist. */
export const useProject = (id: ProjectId | undefined) => {
  const { data, loading, error } = useLiveQuery(
    () => (id ? getProject(id) : Promise.resolve(undefined)),
    ["projects"],
    [id],
  );
  return { project: data, loading, error };
};
