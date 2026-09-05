import React, { useState } from "react";

import { DEFAULT_PROJECT_EMOJIS, PROJECT_COLORS } from "../../constants";
import { CheckIcon, PlusIcon } from "../icons";
import {
  Dialog,
  DialogActionButton,
  DialogActions,
  TagInput,
  TextField,
} from "../ui";

import { ColorSwatches } from "./ColorSwatches";
import { EmojiPicker } from "./EmojiPicker";

import "./ProjectDialog.scss";

import type { Project, ProjectColor } from "../../types";

export type ProjectFormValues = {
  name: string;
  emoji: string;
  color: ProjectColor;
  tags: string[];
};

const randomItem = <T,>(items: readonly T[]): T =>
  items[Math.floor(Math.random() * items.length)];

const ProjectForm = ({
  project,
  tagSuggestions,
  onSubmit,
  onCancel,
}: {
  project?: Project;
  tagSuggestions: string[];
  onSubmit: (values: ProjectFormValues) => Promise<unknown> | void;
  onCancel: () => void;
}) => {
  const [name, setName] = useState(project?.name ?? "");
  const [emoji, setEmoji] = useState(
    () => project?.emoji ?? randomItem(DEFAULT_PROJECT_EMOJIS),
  );
  const [color, setColor] = useState<ProjectColor>(
    () => project?.color ?? randomItem(PROJECT_COLORS),
  );
  const [tags, setTags] = useState<string[]>(project?.tags ?? []);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      await onSubmit({ name, emoji, color, tags });
    } finally {
      setBusy(false);
    }
  };

  const heading = project ? "Edit project" : "New project";

  return (
    <form
      className="ProjectDialog__form"
      onSubmit={submit}
      style={
        {
          "--pd-accent": `var(--pc-${color})`,
          "--pd-accent-bg": `var(--pc-${color}-bg)`,
        } as React.CSSProperties
      }
    >
      {/* the identity you are choosing, shown at the size the card will use */}
      <div className="ProjectDialog__hero">
        <div className="ProjectDialog__hero-tile" aria-hidden>
          {emoji}
        </div>
        <h2 className="ProjectDialog__hero-title">{heading}</h2>
      </div>
      <div className="ProjectDialog__fields">
        <TextField
          label="Name"
          value={name}
          onChange={setName}
          placeholder="Untitled project"
          autoFocus
          selectOnRender={!!project}
          fullWidth
          maxLength={120}
        />
        <div className="ProjectDialog__field">
          <div className="Dialog__field-label">Appearance</div>
          <ColorSwatches value={color} onChange={setColor} />
          <EmojiPicker value={emoji} onChange={setEmoji} color={color} />
        </div>
        <div className="ProjectDialog__field">
          <TagInput
            label="Tags"
            value={tags}
            onChange={setTags}
            suggestions={tagSuggestions}
          />
          <p className="Dialog__hint">
            Tags are shared with designs and searchable with #tag.
          </p>
        </div>
        <DialogActions>
          <DialogActionButton
            label="Cancel"
            onClick={onCancel}
            disabled={busy}
          />
          <DialogActionButton
            type="submit"
            actionType="primary"
            label={project ? "Save changes" : "Create project"}
            icon={project ? CheckIcon : PlusIcon}
            disabled={busy}
          />
        </DialogActions>
      </div>
    </form>
  );
};

/** Create (no `project`) or edit a project: name, emoji, colour, tags. */
export const ProjectDialog = ({
  open,
  onClose,
  project,
  tagSuggestions = [],
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  project?: Project;
  tagSuggestions?: string[];
  onSubmit: (values: ProjectFormValues) => Promise<unknown> | void;
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    title={false}
    aria-label={project ? "Edit project" : "New project"}
    size="small"
    className="ProjectDialog"
  >
    <ProjectForm
      key={project?.id ?? "new"}
      project={project}
      tagSuggestions={tagSuggestions}
      onSubmit={onSubmit}
      onCancel={onClose}
    />
  </Dialog>
);
