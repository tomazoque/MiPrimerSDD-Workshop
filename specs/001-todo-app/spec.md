# Feature Specification: Curso-PSWE-07 To-Do Application

**Feature Branch**: `main` (no branch-creation hook configured)

**Created**: 2026-10-26

**Status**: Draft

**Input**: User description: "Build a simple to-do list application named Curso-PSWE-07 that helps users organize and track their daily tasks." The original request specifies list/detail screens, creation/editing, status filters, deletion confirmation, persistence, and a minimal responsive design; those requirements are captured below.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and inspect a task (Priority: P1)

As a user, I want to add a task and open its details so I can remember what needs doing.

**Why this priority**: Creating and reading tasks is the smallest useful task-management experience.

**Independent Test**: Start with no tasks, create a task, and open it from the list. Verify its title, optional description, and initial Pending status without editing, filtering, or deleting anything.

**Acceptance Scenarios**:

1. **Given** no tasks exist, **When** the list opens, **Then** the header and application/window title show "Curso-PSWE-07", a friendly empty state appears, and an "Add task" button is visible.
2. **Given** the list is open, **When** the user chooses "Add task", **Then** a form offers a required title, optional description, Save, and Cancel.
3. **Given** the form contains a nonblank title and a description, **When** the user saves, **Then** one Pending task appears in the list with that title and a status indicator.
4. **Given** the title is empty or whitespace only, **When** the user saves, **Then** a title validation message appears, the form retains entered values, and no task is created.
5. **Given** an unfinished creation form, **When** the user cancels, **Then** the form closes and no task is created.
6. **Given** a listed task, **When** the user selects its row, **Then** the detail screen shows a prominent title, its description, a Pending/Done status label, a back control, and Edit, completion-toggle, and Delete actions.
7. **Given** a task has no description, **When** its detail opens, **Then** muted "No description" text appears.
8. **Given** the detail screen is open, **When** the user uses the back control, **Then** the list is shown again.

---

### User Story 2 - Track completion and filter tasks (Priority: P2)

As a user, I want to mark tasks done or pending and filter the list so I can focus on unfinished work.

**Why this priority**: Completion tracking and filters turn a simple list into a useful daily progress tool.

**Independent Test**: Use existing Pending and Done tasks. Toggle their states in detail and verify each filter independently of creation, editing, or deletion.

**Acceptance Scenarios**:

1. **Given** mixed task statuses, **When** the user selects All, Pending, or Done, **Then** only tasks matching that choice appear and the active filter is visibly highlighted.
2. **Given** a Pending task's detail, **When** the user chooses "Mark as done", **Then** its status becomes Done and the action becomes "Mark as not done".
3. **Given** a Done task's detail, **When** the user chooses "Mark as not done", **Then** its status becomes Pending and the action becomes "Mark as done".
4. **Given** a completed task appears in the list, **When** the list is displayed, **Then** its title is struck through and muted, with a completed status indicator.
5. **Given** a filter matches no tasks, **When** it is selected, **Then** a friendly message explains the empty result and the filter controls remain available.
6. **Given** a task was opened from a filtered list, **When** the user returns after changing its status, **Then** the same filter remains active and the visible tasks reflect their current statuses.

---

### User Story 3 - Edit task information (Priority: P2)

As a user, I want to correct a task's title or description without changing its completion status.

**Why this priority**: Users need to maintain accurate task information as their understanding changes.

**Independent Test**: Open an existing task, edit and save it, then try cancelling a second edit. Verify the resulting fields and unchanged completion status.

**Acceptance Scenarios**:

1. **Given** a task's detail is open, **When** the user chooses Edit, **Then** the same form used for adding tasks opens with the current title and description and Save/Cancel controls.
2. **Given** valid revised fields, **When** the user saves, **Then** the existing task's detail and list title reflect the changes, without creating a duplicate or changing its status.
3. **Given** an empty or whitespace-only edited title, **When** the user saves, **Then** validation prevents the update and retains the entered form values for correction.
4. **Given** unsaved edits, **When** the user cancels, **Then** the original title, description, and status remain unchanged.
5. **Given** a task had a description, **When** the user clears it and saves, **Then** its detail shows "No description".

---

### User Story 4 - Delete a task deliberately (Priority: P3)

As a user, I want to remove a task after confirming my intent so I do not delete it accidentally.

**Why this priority**: Deletion keeps the list relevant, while confirmation protects against unintended loss.

**Independent Test**: Open an existing task, cancel one deletion request, then confirm another. Verify only that task is removed.

**Acceptance Scenarios**:

1. **Given** an existing task's detail, **When** the user selects the distinctly warning-colored Delete action, **Then** a confirmation asks whether to delete and offers explicit confirmation and cancellation.
2. **Given** the confirmation is open, **When** the user cancels, **Then** the task and its fields/status remain unchanged.
3. **Given** the confirmation is open, **When** the user confirms, **Then** that task is removed, other tasks remain unchanged, and the list appears.
4. **Given** the last matching task was deleted, **When** the list appears, **Then** the appropriate empty state is shown.

---

### User Story 5 - Resume tasks after reopening (Priority: P1)

As a user, I want saved tasks to remain after closing and reopening the application so I can continue later.

**Why this priority**: A daily task organizer must preserve work between sessions.

**Independent Test**: With existing tasks, change a title, description, and completion status and confirm a deletion. Close and reopen the application in the same user environment, then compare the saved task set and fields.

**Acceptance Scenarios**:

1. **Given** successfully saved tasks, **When** the application is closed and reopened in the same user environment, **Then** all saved titles, descriptions, and completion statuses remain available.
2. **Given** successful edits or completion changes, **When** the application is reopened, **Then** the latest saved values and statuses appear.
3. **Given** a task was successfully deleted after confirmation, **When** the application is reopened, **Then** it remains absent.
4. **Given** a save, update, or deletion cannot be stored, **When** the operation is attempted, **Then** a clear failure message appears, success is not claimed, and recoverable entered values are retained.
5. **Given** a write failed and its form or action remains available, **When** storage access is restored and the user deliberately retries with the existing Save, completion, or deletion-confirmation control, **Then** the requested change is saved once, success is shown only after saving, and unrelated tasks remain unchanged. Cancel or Back before a successful retry leaves the saved collection unchanged.
6. **Given** valid saved tasks could not be read because storage access was denied, **When** the user restores storage access and reloads the application at the same address and profile, **Then** the original collection becomes available without reset or replacement. Until a read succeeds, task writes are prevented. Malformed data is reported without automatic repair or reset.

### Edge Cases

- Empty and whitespace-only titles are invalid in both add and edit forms; descriptions are optional.
- Long titles and multiline descriptions remain readable without horizontal scrolling or obscuring actions.
- Text resembling markup is displayed as task content rather than executed or interpreted as formatting.
- All-empty, no-Pending, and no-Done results each have a friendly empty state.
- Changing a task's status or deleting it may remove it from the active filter without changing that filter.
- Cancelling creation, editing, or deletion never alters saved tasks.
- If saved tasks cannot be read, show an explanatory error rather than silently replacing them with an empty collection.
- At narrow widths and with keyboard navigation, forms, confirmation controls, and screen actions remain reachable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The list header and application/window title MUST display "Curso-PSWE-07".
- **FR-002**: Each task MUST have a nonblank required title, an optional description, and a Done/Pending completion status. New tasks MUST start Pending. Blank titles MUST show validation and prevent saving.
- **FR-003**: The list MUST show all saved tasks by default, each with a title and status indicator; selecting a row MUST open that task's detail.
- **FR-004**: Users MUST be able to select All, Pending, and Done filters. The active filter MUST be highlighted and only matching tasks MUST appear.
- **FR-005**: A clearly visible "Add task" button MUST open a title/description form. It MUST be directly available with the list controls in populated, empty, and filtered-empty states, without opening a menu. Save MUST create one task; Cancel MUST discard unsaved input.
- **FR-006**: Detail MUST show a prominent title, the description or muted "No description", a visible Done/Pending label, and a back control that returns to the list. Prominence means the title precedes the description and uses a larger font size and heavier font weight.
- **FR-007**: Detail MUST offer Edit, completion toggle, and Delete. The toggle MUST read "Mark as done" for Pending and "Mark as not done" for Done, and MUST change the status accordingly.
- **FR-008**: Edit MUST reuse the add-task form with existing values and Save/Cancel controls. Save MUST update only the selected task's fields; Cancel MUST preserve its prior values. Both actions MUST preserve its completion status.
- **FR-009**: Completed list titles MUST be struck through and muted, with a completed status indicator.
- **FR-010**: Delete MUST use a distinct warning color and require confirmation before removal. Cancelling MUST preserve the task; confirming MUST remove only that task and return to the list.
- **FR-011**: The list MUST show a short, friendly empty state when there are no tasks or none match the active filter. Returning from detail MUST preserve the active filter.
- **FR-012**: Successfully saved creation, edits, completion changes, and confirmed deletion MUST survive closing and reopening the application in the same user environment.
- **FR-013**: The application MUST use a light background, generous white space, one sans-serif font family, and a single accent color for primary actions and the active filter; titles MUST be larger and bolder than descriptions. Header, list controls, rows, detail actions, and form fields MUST remain visually separated without overlap. Exact spacing, font sizes, accent shade, and decorative details are bounded design discretion: they MUST preserve these groupings, title hierarchy, minimum target sizes, text contrast, and responsive layout. Delete warning styling is governed by FR-010.
- **FR-014**: Layouts MUST support mobile and desktop without horizontal overflow. Touch/click targets MUST be at least 44x44 px. Text contrast MUST be at least 4.5:1 for normal text and 3:1 for large text, including muted/completed text and warning-action labels. Large text means at least 24 CSS px, or at least 18.667 CSS px with font weight 700 or above; all other text uses the normal-text threshold. Controls MUST have understandable labels, visible keyboard focus, and keyboard access. Supported browsers are Chromium, Firefox, and Safari; all three MUST meet the required browser acceptance matrix in plan.md before completion.
- **FR-015**: Failed reads or writes MUST show a clear error, MUST NOT be presented as successful operations, and MUST NOT silently discard existing saved data. Failed form saves MUST retain recoverable user input. After a write failure, the existing Save, completion action, or deletion-confirmation control MUST remain available for a deliberate retry after storage access is restored; Cancel or Back MUST remain non-destructive. A read failure MUST prevent task writes until the collection is read successfully. Users may reload the application after correcting storage access; recovery MUST NOT reset or replace saved data. No automatic write retry or new recovery/reset control is required.
- **FR-016**: The application MUST NOT add accounts, categories, due dates, priorities, search, synchronization, or other features beyond this specification.

### Key Entities *(include if feature involves data)*

- **Task**: One personal item of work with a required title, optional description, and completion status. Individual tasks can be opened, updated, completed/reopened, and deleted without affecting other tasks. Each task needs a stable identity to distinguish tasks with identical titles.
- **Completion filter**: The current All, Pending, or Done list selection. It changes which tasks are visible without modifying task content or status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can create a title-only task and open its detail within 60 seconds during an acceptance walkthrough. Use a normal browser profile with an empty collection and All selected; start timing when the list is ready for interaction, create the task "Read chapter" with no description using Add task and Save, and stop when its detail shows the title and Pending status. Include all user input and interaction time; exclude browser/server setup and initial application startup. Apply the same procedure at both specified viewport widths.
- **SC-002**: Every acceptance case for creation, viewing, editing, cancellation, status changes, filtering, and deletion yields the specified result, with zero unintended changes to other tasks.
- **SC-003**: Across three close/reopen cycles, 100% of successfully saved task titles, descriptions, and statuses are retained, and 100% of confirmed deletions remain absent.
- **SC-004**: All and each status filter display exactly the expected task set in every acceptance case; every no-match case displays a friendly empty state.
- **SC-005**: At 360px and 1280px viewport widths, both screens and their forms/confirmations remain usable without horizontal scrolling; all interactive targets meet 44x44px and text meets the specified contrast ratios.
- **SC-006**: A user can complete the primary create/view/edit/toggle/filter/delete journeys with keyboard controls alone, with visible focus and no unreachable actions.

## Assumptions

- This is a personal, single-user application; no account, shared task collection, or cross-device continuity is needed.
- Persistence is evaluated on the same device, in the same normal browser profile and application address. Changing the protocol, hostname, or port creates a different address for this purpose. Deliberately clearing application data, uninstalling, or ending a private-browsing session is outside the retention guarantee; no backup or cross-device continuity is promised. The storage technology is a planning decision.
- Required title validation trims outer whitespace and rejects an empty result. Omitted or whitespace-only descriptions become empty; all other description text and line breaks are preserved.
- Task display order follows creation order. All is the initial filter; the current filter is retained when returning from detail but need not survive application restart.
- Save and Cancel are present in both add and edit forms; new tasks default to Pending.
- A deletion confirmation uses explicit confirm/cancel controls and removes data only after confirmation.
- The supplied English screen and action labels are used; localization is outside scope.
- The application depends only on its eventual target platform's ability to retain user data between sessions; platform selection and all implementation details are deferred to planning.
