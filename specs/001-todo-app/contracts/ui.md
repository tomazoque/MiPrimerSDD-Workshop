# UI Contract: Curso-PSWE-07

**Source**: [../spec.md](../spec.md). The UI is the application's external interface;
there is no network API or authentication flow.

## List screen

- Show Curso-PSWE-07 in the header and document/window title (FR-001).
- Display tasks in creation order, with a status indicator and title; selecting a row opens
  that task's detail. Completed titles are struck through and muted (FR-003/FR-009).
- Provide All, Pending, Done controls, with exactly one visibly and accessibly active state.
  All is initially selected; no-match results show friendly copy (FR-004/FR-011).
- Keep Add task clearly visible, including in empty and filtered-empty states (FR-005).
- If reading fails, show the error and hide the normal no-tasks empty state. Do not treat
  unreadable data as empty or allow a mutation to silently overwrite it (FR-015).
- Prevent task writes while reads fail. After correcting storage access, the user can reload
  the application at the same address/profile to read the original collection again; recovery
  never resets or replaces saved data. No new recovery button is required (FR-015).

## Detail screen

- Show the selected title prominently, literal description text or muted No description,
  and a visible Done/Pending label (FR-006).
- Back returns to the list with the current filter; if status changed, recompute membership.
  Restore useful focus to the originating row when present, otherwise the list heading/control.
- Provide Edit, the current completion action, and Delete. Mark as done applies to Pending;
  Mark as not done applies to Done. Refresh detail only after successful storage (FR-007).
- Failed mutations retain the prior saved state and show a clear error (FR-015).
- After storage access is restored, the existing completion action permits a deliberate retry;
  Back remains available without changing saved tasks. Do not retry automatically (FR-015).

## Shared add/edit form

- One native modal dialog provides Title, Description (optional), Save, and Cancel.
  Its accessible title distinguishes Add task and Edit task (FR-005/FR-008).
- Add starts blank. Edit is prefilled from the selected task. Focus Title on opening.
- Empty/whitespace title: show an associated validation message, mark the field invalid,
  focus it, retain entered values, and do not save (FR-002).
- Save creates or updates through application logic. On successful add, return to the list
  with its current filter. On successful edit, return to the updated detail without changing
  completion status. Blank description displays No description in detail.
- Cancel or Escape closes without writes. A write error keeps the form and values available.
- After storage access is restored, the existing Save control retries the retained input;
  Cancel/Escape still discards only the unsaved draft. A successful retry saves once (FR-015).
- Modal focus stays inside the dialog; closing restores the invoker's focus when available.

## Delete confirmation

- Delete uses a distinct warning color and opens a labelled confirmation with Cancel and
  Delete buttons. Focus Cancel by default. Opening alone does not mutate data (FR-010).
- Cancel or Escape preserves the task and returns focus to its Delete action.
- Confirm removes only the selected task, then returns to the current filtered list and
  focuses a surviving list heading/control. If it was the final match, show the empty state.
- Failed deletion keeps the confirmation available and reports failure; do not claim success.
- After storage access is restored, its existing Delete control permits a deliberate retry;
  Cancel/Escape preserves the task. Never perform an automatic deletion retry (FR-015).

## Visual and accessible behavior

- Light background, generous whitespace, one sans-serif family, one accent for primary
  actions/active filter, and larger/bolder titles than descriptions (FR-013).
- Add task is directly available with list controls without a menu in every normal list
  state. The detail title precedes its description and uses a larger font size/heavier weight.
  Exact spacing, typography sizes, accent shade, and decoration remain design discretion within
  FR-013's separated, non-overlapping groups and the measurable accessibility/layout bounds.
- Minimum 44x44px targets; text contrast at least 4.5:1 normal / 3:1 large. Muted/completed
  text must still meet the applicable ratio (FR-014).
- Classify text using FR-014: large is at least 24 CSS px, or at least 18.667 CSS px at weight
  700 or above; otherwise use 4.5:1. Warning-action labels follow the same text rules.
- At 360px and 1280px, long titles and multiline descriptions wrap without document-level
  horizontal scrolling. Screen and dialog actions remain reachable.
- All actions work by keyboard with visible focus. Fields and dialogs have accessible names;
  errors are announced. Task text is rendered as text, never as user-supplied HTML.
- No additional controls or features outside FR-001-FR-016.
