---
description: "Dependency-ordered implementation tasks for Curso-PSWE-07"
---

# Tasks: Curso-PSWE-07 To-Do Application

**Input**: Design documents from `specs/001-todo-app/`.
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/](contracts/), and [quickstart.md](quickstart.md).
**Tests**: Mandatory under Constitution IV and the plan's Validation Strategy.
**Organization**: Setup, foundation, then US1 (P1), US5 (P1), US2 (P2), US3 (P2), US4 (P3), and final integration.
**Execution status**: 38/40 tasks completed. T039/T040 remain pending required manual Firefox/actual-Safari verification; checked markers record implemented and verified work.

## Format: `[ID] [P?] [Story] Description`

- Every task has a checkbox, sequential T-number, exact file path, and requirement reference.
- `[P]` identifies independent work within the explicitly described dependency wave; it never overrides a dependency or authorizes concurrent edits to the same file.
- `[USn]` refers to the numbered user story in spec.md, regardless of its phase position.
- Application paths are relative to the repository root; feature documents use `specs/001-todo-app/`.
- Production dependency direction is UI -> logic -> persistence. No task introduces a framework, backend, or runtime dependency.

## Execution Rules

1. Follow Red-Green-Refactor for every new production behavior. Write the relevant assertions, observe meaningful failure, implement the minimum behavior, then refactor with tests passing. Missing dependencies, broken imports, or an unavailable server do not by themselves establish the behavioral red step; establish only the minimum scaffolding needed to reach an assertion.
2. Already-passing behavior from an earlier phase stays as regression coverage; do not deliberately break it to manufacture a red result. Record red/green evidence at the phase checkpoints in quickstart.md.
3. Use new fake repositories/storage per unit test, new isolated contexts per ordinary browser test, and a unique temporary persistent profile per reopening test. No shared mutable fixture state or arbitrary sleeps.
4. Do not mark a production task complete until its requiring tests pass. A checkpoint must not claim unfinished UI actions are implemented.
5. Preserve the reviewer-owned checklist at `checklists/ux-persistence.md`; these tasks do not evaluate or change its markers. The implementation skill handles its checklist gate when invoked.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish only the tooling selected by the plan.

- [X] T001 Initialize a private ES-module Node 24 project in `package.json`, install only ESLint and @playwright/test as development dependencies, generate `package-lock.json`, and create `.gitignore` for dependencies and test artifacts; add no runtime packages. [FR-016; Plan Technical Context; Constitution VI]
- [X] T002 [P] Configure JavaScript linting in `eslint.config.js`, including browser/Node environments, generated-output ignores, UI-to-persistence import restrictions, and storage-access restrictions outside the persistence module. [FR-016; Constitution III/VI]
- [X] T003 [P] Configure `playwright.config.js` with bundled Chromium, 360px and 1280px viewports, isolated contexts, the fixed `http://127.0.0.1:4173` origin, and automatic test-server start/stop; install its matching Chromium binary. [FR-012/FR-014; SC-003/SC-005; Plan Technical Context]
- [X] T004 Add `start`, `lint`, `test:unit`, `test:acceptance`, and combined `test` scripts to `package.json`, using the planned Node runner and server paths; verify tool discovery without generating feature behavior. Depends on T002-T003. [FR-016; Plan Validation Strategy; Constitution VI]

**Checkpoint**: Tooling is ready; application behavior is still unimplemented.

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish tested storage and HTTP delivery needed by every browser journey.

### Tests first

- [X] T005 [P] Write and run repository contract tests in `tests/unit/task-repository.test.js` for empty storage, round trips, fresh returned data, record types, blank titles, duplicate IDs, malformed JSON, denied storage access including the storage getter, quota/write failure, and preservation of old bytes; observe failure for missing repository behavior. [FR-002/FR-012/FR-015; contracts/task-service.md]
- [X] T006 [P] Write and run server behavior tests in `tests/unit/serve.test.js` for the entry/assets, content types, GET/HEAD behavior, loopback serving, unknown paths, and rejection of arbitrary workspace/metadata paths; use isolated temporary fixtures and observe failure before server implementation. [FR-001/FR-016; Plan Project Structure]

### Implementation

- [X] T007 Implement injected-storage `load()`/`save(tasks)` in `src/persistence/task-repository.js` for the single `curso-pswe-07.tasks` JSON array, validating the data-model field types and unique/nonblank identity rules; missing key means empty, invalid/unreadable data throws without reset, and writes never clear the old key first. Pass T005 before completion. [FR-002/FR-012/FR-015; data-model.md Persistence boundary]
- [X] T008 Implement `scripts/serve.js` with Node standard APIs, the fixed loopback URL, and an explicit allowlist for index.html and planned app assets; pass T006, rerun T005, and record foundational red/green evidence in `specs/001-todo-app/quickstart.md`. [FR-001/FR-016; Plan Project Structure; Constitution IV]

**Checkpoint**: Repository and server contracts pass. No story UI work starts before this phase completes.

## Phase 3: User Story 1 - Create and Inspect a Task (Priority: P1) - MVP Slice

**Goal**: Create tasks, see them in the list, and inspect their details.
**Independent Test**: Starting empty, identify the app, reject blank titles, create a task with/without description, open detail, return, and cancel another creation; cover US1 acceptance scenarios 1-8.

### Tests first

- [X] T009 [P] [US1] Write and run add/list/get contract tests in `tests/unit/tasks.test.js` using fresh fake repositories: empty collection, field normalization, unique stable IDs, duplicate titles, Pending default, creation order, invalid-title no-write, missing-task errors, and returned-data isolation. [FR-002/FR-003/FR-005/FR-006; data-model.md Task]
- [X] T010 [P] [US1] Write and run the US1 acceptance cases in `tests/acceptance/todo.spec.js`, including header/document name, empty state, shared form fields, validation/input retention, successful creation, cancellation/Escape, detail content/actions, No description, back navigation, literal markup-like text, and initial form focus. Before T014, observe failing list/detail/add-form assertions at 360px and 1280px for targets at least 44x44px, normal-text contrast at least 4.5:1 and large-text contrast at least 3:1, long-text wrapping without horizontal overflow, visible keyboard focus, modal focus containment, and focus restoration. Apply FR-014's explicit large-text classification, and assert FR-005/FR-006's direct Add task availability and title-before-description hierarchy; exact spacing remains within FR-013's bounded design discretion. [FR-001/FR-002/FR-003/FR-005/FR-006/FR-011/FR-013/FR-014; SC-005/SC-006; US1.1-US1.8]

### Implementation

- [X] T011 [US1] Implement `createTaskService(repository)` with add/list-All/get in `src/logic/tasks.js`, using string id/title/description and boolean done. Apply the exact rules: id "Nonempty, unique within the collection; generated once as a UUID; immutable."; title "Required; trim outer whitespace; reject an empty result."; description "Optional input becomes an empty string when omitted or whitespace-only; otherwise preserve the entered text and line breaks."; done "false at creation; true means Done and false means Pending." Persist before returning success; pass T009. [FR-002/FR-003/FR-005/FR-006/FR-012; data-model.md Task]
- [X] T012 [US1] Create semantic list/detail regions, required action controls, the shared labelled add/edit form structure, app name/document title, and module/style references in `index.html`, driven by T010; do not claim later edit/toggle/delete actions work yet. [FR-001/FR-003/FR-005/FR-006/FR-007/FR-008; contracts/ui.md]
- [X] T013 [P] [US1] Implement list/detail/back navigation and the add mode of the shared form in `src/ui/app.js`, with literal text, draft-only input, title validation, Save/Cancel/Escape, and focus restoration; access tasks only through logic. Depends on T011-T012 and the red assertions in T010. [FR-002/FR-003/FR-005/FR-006/FR-011/FR-014]
- [X] T014 [P] [US1] Implement the initial responsive design and native form-dialog styling in `src/ui/styles.css`: light background, generous spacing, one sans-serif family/accent, larger/bolder titles, 44x44px targets, readable contrast, visible focus, and long-text wrapping. Depends on T012 and the red assertions in T010; may run alongside T013. Keep exact spacing, font sizes, accent shade, and decoration within FR-013's explicit design bounds; apply FR-014's large-text classification. [FR-013/FR-014; SC-005/SC-006]
- [X] T015 [US1] Run and pass the US1 unit/acceptance cases and lint, refactor only covered behavior, and record outcomes plus the SC-001 create/open walkthrough in `specs/001-todo-app/quickstart.md`; identify later-story action controls as unfinished in this partial demo. Use SC-001's fixed Read chapter walkthrough, ready-list start, title/Pending endpoint, and setup exclusions at both viewport widths. [FR-001/FR-002/FR-003/FR-005/FR-006; SC-001/SC-002; Constitution IV/VI]

**Checkpoint**: US1 is independently demonstrable. This is an incremental slice, not the completed feature.

## Phase 4: User Story 5 - Resume Tasks After Reopening (Priority: P1)

**Goal**: Prove durable saved state early and provide explicit storage-failure feedback.
**Independent Test**: Persist new tasks through the UI, and separately arrange a representative saved collection with updated fields/status and a removed record before the first close. Reopen the same dedicated browser profile three times without re-seeding it, and compare the stored collection. Inject read/write failure, restore access, retry through existing controls, and verify non-destructive feedback and reload recovery.

The standalone persistence fixtures do not require the later edit/toggle/delete UI. They are test setup only and do not constitute the final integrated UI proof. T035 adds that proof after US2-US4 are available; US5's complete end-to-end sign-off includes T035/T040.
Early US5.5-US5.6 recovery checks cover the existing add-form Save and denied-read/reload flows.
Completion retry is covered by T021/T023, edit Save retry by T026/T028, and deletion-confirmation
retry by T031/T033 when those controls are implemented; no early test requires future actions.

### Tests first

- [X] T016 [P] [US5] Add failure-propagation and persisted-snapshot regression cases to `tests/unit/tasks.test.js` for denied reads, failed saves, unchanged prior data, and fresh service/repository instances; reuse already-green guarantees without manufacturing failures. Cover a restored storage backend after a denied read or failed write: a new deliberate invocation succeeds once, while no retry or mutation happens automatically. [FR-012/FR-015; US5.1-US5.6; contracts/task-service.md]
- [X] T017 [P] [US5] Create `tests/acceptance/persistence.spec.js` for UI-created tasks and representative saved fixtures across three real close/relaunch cycles using one unique temporary profile and the exact origin; never re-seed after reopening or import exported storageState. Add read/write-error acceptance cases to `tests/acceptance/todo.spec.js`, including corrupt/invalid data and retained form input; observe new feedback assertions failing before T018. Also cover the available US5.5-US5.6 flows: retry the add-form Save after restored write access and assert one saved task and non-destructive Cancel; with valid saved data and denied read access, prevent writes and restore the original collection after access is corrected and the application reloaded. Keep malformed data errors non-destructive without promising automatic repair. Completion/edit/deletion retry cases belong to T021/T026/T031. [FR-012/FR-015; SC-003; US5.1-US5.6]

### Implementation

- [X] T018 [US5] Implement storage-read/write failure feedback in `src/ui/app.js`, forwarding any necessary ordinary errors through `src/logic/tasks.js`: unreadable data must not appear as a normal empty collection, failed saves retain form values, and no failed operation claims success or silently resets data. Pass T016-T017. Keep the existing add-form Save control available for deliberate retry after restored access; preserve non-destructive cancellation/back, prevent writes until a valid read succeeds, and permit same-address/profile reload recovery without reset or automatic write retries. Bind later completion/edit/deletion retry behavior in T023/T028/T033, not in this phase. [FR-012/FR-015; contracts/ui.md; contracts/task-service.md Errors]
- [X] T019 [US5] Pass the standalone US5 unit/browser cases and existing US1 regression suite, then document retention boundaries, red/green evidence, and the remaining T035 integrated-proof dependency in `specs/001-todo-app/quickstart.md`. [FR-012/FR-015; SC-003; Constitution IV/VI]

**Checkpoint**: Persistence and failure safety are verified independently; full edit/status/delete UI retention is verified again in Phase 8.

## Phase 5: User Story 2 - Track Completion and Filter Tasks (Priority: P2)

**Goal**: Toggle completion and focus the list using All/Pending/Done.
**Independent Test**: With representative Pending/Done tasks, exercise all filters and both status transitions, completed styling, no-match states, and return-to-filter behavior; cover US2 scenarios 1-6.

### Tests first

- [X] T020 [P] [US2] Write and run filter/toggle unit cases in `tests/unit/tasks.test.js`, including both transitions, stable identity/content/order, exact filter subsets, missing IDs, and failed-save preservation. [FR-004/FR-007/FR-009/FR-011/FR-015; US2]
- [X] T021 [P] [US2] Write and run US2 scenarios in `tests/acceptance/todo.spec.js` for active-filter semantics, All/Pending/Done membership, action/status labels, muted struck-through completed titles, both empty-result cases, retained filter after status changes, keyboard access, and failed-toggle feedback. After a failed completion write, restore storage access and retry through the existing completion control; assert one successful change, no automatic retry, and non-destructive Back behavior (US5.5). [FR-004/FR-007/FR-009/FR-011/FR-014/FR-015; US2.1-US2.6]

### Implementation

- [X] T022 [US2] Extend `src/logic/tasks.js` with filtering and persisted toggle; enforce "Pending selects done=false; Done selects done=true." and preserve all task fields except done during a toggle. Pass T020. [FR-004/FR-007/FR-012; data-model.md Completion filter/State transitions]
- [X] T023 [US2] Connect filters/status actions and completed indicators in `src/ui/app.js` and `src/ui/styles.css`; enforce "An in-memory value: All, Pending, or Done." and "All is the startup default." Preserve the current filter while opening and returning from detail; it need not survive reopening. Pass T021. Preserve the completion control after a failed write for deliberate retry once access is restored; Back remains non-destructive and no automatic retry occurs (FR-015). [FR-004/FR-007/FR-009/FR-011/FR-014]
- [X] T024 [US2] Pass US2 acceptance and all previous unit/browser cases, refactor covered logic/UI only, and record results in `specs/001-todo-app/quickstart.md`. [FR-004/FR-007/FR-009/FR-011; SC-002/SC-004; Constitution IV/VI]

**Checkpoint**: US2 works independently with existing tasks and preserves prior behavior.

## Phase 6: User Story 3 - Edit Task Information (Priority: P2)

**Goal**: Edit task fields through the existing form without changing identity or status.
**Independent Test**: On an existing task, save valid edits, reject a blank title, cancel edits, and clear the description; cover US3 scenarios 1-5.

### Tests first

- [X] T025 [P] [US3] Write and run update unit cases in `tests/unit/tasks.test.js` for trimmed required titles, exact description normalization from T011, preserved line breaks, unchanged identity/status/order, missing IDs, and failed-write preservation. [FR-002/FR-008/FR-015; US3; data-model.md Task]
- [X] T026 [P] [US3] Write and run US3 scenarios in `tests/acceptance/todo.spec.js` for prefilled shared form, valid Save, unchanged completion, blank-title validation, Cancel/Escape, cleared-description fallback, failed-save input retention, and edit-dialog focus behavior. Before T028, observe failing edit-mode assertions at 360px and 1280px for targets at least 44x44px, normal-text contrast at least 4.5:1 and large-text contrast at least 3:1, long-text wrapping without horizontal overflow, visible keyboard focus, modal focus containment, and focus restoration. Reuse already-passing shared-form checks as regression coverage without manufacturing failures. Apply FR-014's explicit large-text classification when evaluating edit-form contrast. After a failed edit Save, restore storage access and retry with the retained fields; assert one update and unchanged identity/status, while Cancel remains non-destructive (US5.5). [FR-002/FR-006/FR-008/FR-014/FR-015; SC-005/SC-006; US3.1-US3.5]

### Implementation

- [X] T027 [US3] Implement update in `src/logic/tasks.js` using the same field rules as add; preserve id, done, and array position, fail missing identities without writes, and pass T025. [FR-002/FR-008/FR-012/FR-015; data-model.md State transitions]
- [X] T028 [US3] Wire Edit into the existing form in `src/ui/app.js`, with prefill, draft-only values, save-to-detail, Cancel/Escape, validation, failure retention, and restored focus; reuse the existing form rather than add another one. Pass T026. Keep the existing Save and retained draft available after failed persistence for deliberate retry after restored access; do not retry automatically (FR-015). [FR-002/FR-006/FR-008/FR-014/FR-015; contracts/ui.md Shared add/edit form]
- [X] T029 [US3] Pass US3 acceptance and previous regressions, refactor covered shared-form behavior, and record results in `specs/001-todo-app/quickstart.md`. [FR-002/FR-006/FR-008; SC-002; Constitution IV/VI]

**Checkpoint**: US3 works on existing tasks independently of deletion and preserves completion status.

## Phase 7: User Story 4 - Delete a Task Deliberately (Priority: P3)

**Goal**: Remove only the selected task after explicit confirmation.
**Independent Test**: Cancel one deletion, confirm another, then remove the final matching task; cover US4 scenarios 1-4 without altering other tasks.

### Tests first

- [X] T030 [P] [US4] Write and run remove unit cases in `tests/unit/tasks.test.js` for exactly one selected identity, survivor order/content, last task, missing ID, and unchanged prior data on failed persistence. [FR-010/FR-012/FR-015; US4; data-model.md State transitions]
- [X] T031 [P] [US4] Write and run US4 scenarios in `tests/acceptance/todo.spec.js` for warning styling, explicit confirmation, default Cancel focus, Cancel/Escape preservation, confirmed deletion, last-match empty state, return focus, and failed-delete feedback. Before T033, observe failing delete-confirmation assertions at 360px and 1280px for targets at least 44x44px, normal-text contrast at least 4.5:1 and large-text contrast at least 3:1, long-text wrapping without horizontal overflow, visible keyboard focus, modal focus containment, and focus restoration. Reuse already-passing dialog checks as regression coverage without manufacturing failures. Apply FR-014's explicit large-text classification to confirmation text and warning-action labels. After a failed confirmed-delete write, restore storage access and retry through the same confirmation; assert only the selected task is removed, no automatic retry, and non-destructive Cancel/Escape (US5.5). [FR-010/FR-011/FR-014/FR-015; SC-005/SC-006; US4.1-US4.4]

### Implementation

- [X] T032 [US4] Implement remove in `src/logic/tasks.js`, changing only the selected identity and reporting success only after saving the survivor array; pass T030. [FR-010/FR-012/FR-015; contracts/task-service.md]
- [X] T033 [US4] Add the labelled native delete confirmation to `index.html`, wire confirm/cancel behavior in `src/ui/app.js`, and add distinct warning styles in `src/ui/styles.css`; focus Cancel, write only after confirmation, keep the dialog on failure, preserve the list filter, and restore useful focus after removal. Pass T031. Allow deliberate retry through the existing Delete confirmation after restored access; retain Cancel/Escape without writes and never retry automatically (FR-015). [FR-010/FR-011/FR-013/FR-014/FR-015; contracts/ui.md Delete confirmation]
- [X] T034 [US4] Pass US4 acceptance and all earlier unit/browser cases, refactor covered deletion behavior, and record results in `specs/001-todo-app/quickstart.md`. [FR-010/FR-011/FR-015; SC-002; Constitution IV/VI]

**Checkpoint**: All task actions are implemented; final integrated persistence and quality gates remain.

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Close cross-story acceptance and document the finished deliverable without expanding scope.

- [X] T035 [P] Extend `tests/acceptance/persistence.spec.js` with the complete UI-driven sequence: create tasks, edit title/description, change completion, confirm one deletion, and close/relaunch the browser three times with the same temporary profile/origin; assert every saved field/status and deletion each cycle without fixture reseeding or exported storageState. Depends on T034 and closes US5's integrated-proof dependency. [FR-008/FR-010/FR-012; SC-003; US5]
- [X] T036 [P] Consolidate and rerun the existing cross-screen keyboard/responsive acceptance assertions in `tests/acceptance/todo.spec.js` across both screens, add/edit form modes, and confirmation at 360px/1280px: all targets at least 44x44px, actual normal-text contrast at least 4.5:1 and large-text contrast at least 3:1, no horizontal overflow with long text, visible focus, focus containment/restoration, and literal user text. Reuse the checks established before their corresponding implementation tasks; do not introduce previously deferred tests for already-implemented behavior. Use FR-014's explicit large-text classification, including muted/completed text and warning-action labels. [FR-013/FR-014; SC-005/SC-006]
- [X] T037 Resolve only requirement failures exposed by T035-T036 in `src/ui/app.js`, `src/ui/styles.css`, `index.html`, or the affected logic/storage module, after observing their failing assertions; if those checks already pass, retain coverage without speculative refactoring or new features. [FR-012/FR-013/FR-014/FR-015/FR-016; Constitution I/IV]
- [X] T038 [P] Add actual startup, install/test commands, Node/browser prerequisites, fixed-URL retention boundaries, and data-clearing limitations to `README.md`; align the operational instructions in `specs/001-todo-app/quickstart.md` with the completed scripts. May run alongside T035-T037 without editing application/tests. [FR-012/FR-016; Plan Technical Context; research.md]
- [ ] T039 Perform the quickstart manual keyboard, focus, long-text, contrast, and responsive review and measure SC-001's walkthrough. Require the plan's browser matrix to pass: Chromium automated acceptance plus manual core-flow smoke reviews in Firefox and actual Safari for create/view/edit/toggle/filter/delete and reopening persistence in the same normal profile and exact origin. Record each browser's version, platform, review date, result, and evidence in `specs/001-todo-app/quickstart.md`; do not substitute Playwright WebKit for Safari or reseed persistence after reopening. Any failed or unavailable required browser check stays pending and prevents completing T039. [FR-012/FR-013/FR-014; SC-001/SC-003/SC-005/SC-006; Plan Target Platform]
- [ ] T040 Run `npm run lint`, all unit/acceptance tests via `npm test`, and the complete quickstart scenarios; review FR-001-FR-016 traceability, layer boundaries, dependency scope, test isolation, and all six constitutional principles. Complete only after every required browser check in T039 passes; an unavailable or failed browser check leaves T039 and T040 pending. Record actual results and close the US5 integrated gate in `specs/001-todo-app/quickstart.md` and update completed implementation-task markers in `specs/001-todo-app/tasks.md`, never reviewer checklist markers. [FR-001-FR-016; SC-001-SC-006; Constitution I-VI]

**Final checkpoint**: Every required story and acceptance scenario passes. Recorded results must distinguish verified behavior, manual review, and any remaining limitation.

## Dependencies & Execution Order

### Phase dependencies

| Phase | Prerequisite | Deliverable / gate |
|---|---|---|
| Setup | None | T001 -> T002/T003 -> T004 |
| Foundation | Setup complete | T005 -> T007; T006 -> T008; both branches green |
| US1 (P1) | Foundation complete | T009/T010 -> T011 -> T012 -> T013/T014 -> T015 |
| US5 standalone (P1) | US1 complete | T016/T017 -> T018 -> T019 |
| US2 (P2) | US1/US5 baseline | T020/T021 -> T022 -> T023 -> T024 |
| US3 (P2) | US1 shared form; scheduled after US2 | T025/T026 -> T027 -> T028 -> T029 |
| US4 (P3) | Prior baseline; retained filters available | T030/T031 -> T032 -> T033 -> T034 |
| Final integration | US1-US4 plus standalone US5 | T035/T036 -> T037; T038 independently; then T039 -> T040 |

### Story dependency graph

```text
Setup -> Foundation -> US1 (P1) -> US5 standalone (P1)
                                  |
                                  v
                               US2 (P2) -> US3 (P2) -> US4 (P3)
                                  \___________|___________/
                                              |
                                              v
                              Integrated US5 proof (T035)
                                              |
                                              v
                                  Final quality gate (T040)
```

US2 and US3 are logically independently testable with existing tasks, but their changes share
`src/logic/tasks.js`, `src/ui/app.js`, and `tests/acceptance/todo.spec.js`. The prescribed default
execution is serial across stories to avoid file conflicts. US5's standalone retention checks
are independent of later UI actions; the full create/edit/toggle/delete reopening journey is
explicitly dependent on those actions and is not signed off early.

### Within each story

- Write behavior/contract assertions first, then add the minimum corresponding logic and UI.
- Keep user-story tests and any contract additions in the planned unit/acceptance files.
- Pass the story's checks and existing regressions before the next checkpoint.
- Reuse one Task representation and one add/edit form; do not add separate models, APIs, or abstractions.

### Parallel opportunities

Independent waves: T002/T003; T005/T006; T009/T010; T013/T014 after T011-T012;
T016/T017; T020/T021; T025/T026; T030/T031; T035/T036 after T034.
T038 may run with the final test/fix wave because it touches documentation only; finish it
before T039-T040 update the same quickstart document.

No parallel task may overlap an unfinished writer to one of its files. These are execution
opportunities, not instructions to spawn agents or implement work during task generation.

## Parallel Examples by User Story

| Story | Safe parallel example | Required join |
|---|---|---|
| US1 | T009 unit contracts and T010 browser acceptance; later T013 UI logic and T014 CSS after T012 | Both test tasks precede behavior; both UI/CSS tasks precede T015. |
| US5 | T016 logic failure tests and T017 browser persistence/failure tests | Join before T018; T035 remains the later full-UI proof. |
| US2 | T020 unit filter/toggle cases and T021 browser status/filter cases | Join before T022-T023; pass T024 before another story edits shared files. |
| US3 | T025 update-unit cases and T026 shared-form browser cases | Join before T027-T028; pass T029 before deletion work. |
| US4 | T030 removal-unit cases and T031 confirmation-browser cases | Join before T032-T033; pass T034 before final integration. |

## Coverage Map

| Requirement / acceptance group | Tasks |
|---|---|
| FR-001, FR-003, FR-005, FR-006; US1.1-US1.8 | T006, T008-T015 |
| FR-002; field types, identity, normalization, defaults | T005, T007, T009-T011, T025-T028 |
| FR-004, FR-007, FR-009, FR-011; US2.1-US2.6 | T020-T024 |
| FR-008; US3.1-US3.5 | T025-T029 |
| FR-010; US4.1-US4.4 | T030-T034 |
| FR-012, FR-015; US5.1-US5.6 | T005, T007, T016-T019, T022, T027, T032, T035, T040 |
| FR-013, FR-014; visual/accessibility across all stories | T003, T010, T012-T014, T021, T026, T031, T033, T036-T037, T039 |
| FR-016; bounded dependencies, source exposure, architecture, scope | T001-T004, T006, T008, T037-T040 |
| SC-001 create/open walkthrough | T015, T039-T040 |
| SC-002 all acceptance outcomes | Every story checkpoint and T040 |
| SC-003 three true reopening cycles | T017, T019, T035, T040 |
| SC-004 exact filter subsets / empty results | T020-T024 |
| SC-005 widths / targets / contrast; SC-006 keyboard | T010, T014, T021, T026, T031, T036-T037, T039-T040 |

## Implementation Strategy

### MVP first

Complete setup/foundation and US1 for a create/list/detail demonstration. Add the immediately
following US5 phase for early P1 retention/failure safety. Neither milestone claims the entire
requested app is finished; edit, completion/filter behavior, deletion, and final integrated
persistence sign-off remain required.

### Incremental delivery

1. Establish the test harness and tested storage/server contracts.
2. Deliver US1 and validate all eight acceptance scenarios.
3. Verify standalone US5 persistence and error handling before lower-priority UI expansion.
4. Add US2, US3, and US4 sequentially, preserving prior tests.
5. Complete the real UI-driven three-relaunch journey, cross-cutting accessibility review,
   operational documentation, and final lint/test/constitution gate.

## Notes

- Each task must trace to the stated FR/SC or an explicit constitution/plan delivery obligation.
- Do not add accounts, categories, due dates, priorities, search, sync, public hosting, service workers, or runtime packages.
- Use the actual same origin/profile for persistence; a page reload alone does not prove reopening.
- Only update tasks to completed after doing and verifying them. Requirement-review checklists remain reviewer-owned.
- No app code, dependencies, test files, or test results are created by this task-generation command.

## Pending Final Browser Gate

T001-T038 are completed. T039/T040 remain unchecked because this Windows session exposes no
connected browser surfaces for manual Firefox or actual Safari review. Automated Chromium and
screenshot inspection do not substitute for those required checks. The required matrix remains
unchanged. Complete the evidence in quickstart.md before closing the final two tasks.
