# Implementation Plan: Curso-PSWE-07 To-Do Application

**Branch**: `main` | **Date**: 2026-10-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-todo-app/spec.md`

**Feature directory**: `specs/001-todo-app`. Setup resolves the feature identifier as
`001-todo-app`; the Git checkout remains `main`. No branch-creation hook is configured.

## Summary

Deliver the two specified task screens: list/create/filter and detail/edit/toggle/delete.
Use static HTML, CSS, and native JavaScript modules, with browser-local persistence and
no runtime dependencies. Keep UI -> application logic -> persistence. A shared native dialog
provides the add/edit form; a second dialog confirms deletion. No application implementation
is created during this planning phase.

## Technical Context

**Language/Version**: HTML5, CSS, JavaScript ES2022 modules; Node.js 24.x for local serving
and development tools. Node 24.22.1 is available in this workspace.

**Primary Dependencies**: Browser and Node standard APIs only at runtime. Development-only:
ESLint and `@playwright/test`; resolve compatible versions and commit a lockfile during implementation.

**Storage**: One JSON task array at localStorage key `curso-pswe-07.tasks`. Scope: the same
origin and browser profile in normal browsing mode. Missing key means empty; invalid or
inaccessible data means an explicit error, never a silent reset.

**Testing**: Node's built-in test runner and strict assertions for logic/storage/server tests;
Playwright with bundled Chromium for browser acceptance, keyboard, layout, and persistent-profile
relaunch checks; required manual core-flow smoke reviews in Firefox and actual Safari.
ESLint is the completion lint gate.

**Target Platform**: Current Chromium, Firefox, and Safari browsers on desktop/mobile for the
application; automated baseline is bundled Chromium at 360px and 1280px. Windows development
is supported. No native desktop packaging or app installation.

**Project Type**: Static browser application with a loopback-only development HTTP server.
No backend, public API, framework, build step, or deployment work.

**Performance Goals**: Preserve SC-001's create-and-open walkthrough within 60 seconds.
No separate latency, throughput, or scale requirement is specified; do not add optimization
work or performance infrastructure.

**Constraints**: FR-001-FR-016; 44x44px interactive targets; 4.5:1 normal-text / 3:1 large-text
contrast; keyboard-operable dialogs and screens; no horizontal overflow at specified widths.
Use FR-014's explicit large-text classification for every contrast measurement, including
muted/completed text and warning-action labels. FR-005/FR-006/FR-013 bound visual discretion.
No accounts, categories, due dates, priorities, search, synchronization, or service worker.

**Scale/Scope**: One user's task collection in one browser profile; two screens and one shared
add/edit form. No pagination, indexes, arbitrary field limits, or capacity guarantees.
Storage denial/quota failures must be recoverable and visible.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The pre-research assessment and post-design review both pass for the proposed design.
These are design gates; lint, red/green evidence, and passing application tests remain
implementation completion gates.

| Principle | Before research | After design | Evidence / implementation obligation |
|---|---|---|---|
| I. Simplicity first | PASS | PASS | Only FR-001-FR-016; zero runtime dependencies; rejected complexity recorded in research.md. |
| II. Clear design | PASS | PASS | Small named functions and three focused modules; one form reused by add/edit; no speculative abstractions or optimization. |
| III. Structured architecture | PASS | PASS | UI imports logic only; logic imports persistence; replaceable load/save repository documented in contracts/task-service.md. |
| IV. TDD | PASS | PASS | Each story has acceptance coverage; isolated unit and failure tests precede the production behavior they require. Red-Green-Refactor is mandatory. |
| V. Spec is truth | PASS | PASS | Traceability table below covers every FR; each future task must reference those IDs; no unresolved requirements. |
| VI. Dependencies and quality | PASS | PASS | Standard APIs preferred; two development dependencies justified below; lint and all tests must pass before done. |

Any future requirement ambiguity blocks the affected implementation until clarified.
A failing constitution gate must be resolved before implementation begins.

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-app/
  spec.md
  checklists/requirements.md
  plan.md
  research.md
  data-model.md
  contracts/
    ui.md
    task-service.md
  quickstart.md
```

Task generation is a separate phase: `$speckit-tasks` creates tasks.md after this plan.

### Source Code (repository root)

Planned paths only; none are created by this command.

```text
index.html
package.json
package-lock.json
eslint.config.js
playwright.config.js
scripts/
  serve.js
src/
  ui/
    app.js
    styles.css
  logic/
    tasks.js
  persistence/
    task-repository.js
tests/
  unit/
    tasks.test.js
    task-repository.test.js
    serve.test.js
  acceptance/
    todo.spec.js
    persistence.spec.js
```

**Structure Decision**: One small application. UI owns screen/filter/form state and rendering,
logic owns validation and task operations, persistence owns the only browser-storage access.
The repository exposes load/save and accepts an injected storage object for isolated tests;
logic accepts a repository. No container, generic repository framework, or model library.

The development server serves an explicit app-file allowlist over
`http://127.0.0.1:4173`, with correct content types. Repository metadata, docs, configuration,
and arbitrary filesystem paths are not served. It is delivery tooling, not a persistence backend.

## Phase 0: Research Outcome

[research.md](research.md) resolves platform, persistence, failure behavior, testing, and
accessible-dialog decisions. No unresolved research questions remain. The supporting primary
documentation and alternatives are recorded with each decision.

## Phase 1: Design Outcome

- [data-model.md](data-model.md): fields, validation, identity, state transitions, storage boundary.
- [contracts/ui.md](contracts/ui.md): screen/form/delete flows and accessible interaction.
- [contracts/task-service.md](contracts/task-service.md): logic/repository behavior and failure semantics.
- [quickstart.md](quickstart.md): planned commands and end-to-end validation scenarios.

No REST endpoints are needed; the app's user interface is its external interface.
The repository interface exists specifically to satisfy the constitution and test substitution.

## Requirements Traceability

| Spec requirements | Design responsibility | Required verification |
|---|---|---|
| FR-001 | Document title and list header | US1 identity checks |
| FR-002, FR-005 | Shared form and add validation | Unit validation; US1 save/blank/cancel |
| FR-003, FR-006 | List rows, selected detail, back control | US1 fields, no-description, navigation |
| FR-004, FR-007, FR-009, FR-011 | Filter state and completion operations | Unit filtering/toggling; all US2 scenarios |
| FR-008 | Shared edit form and update operation | US3 prefill/save/cancel/blank/clear-description |
| FR-010 | Explicit destructive confirmation and remove | US4 cancel/confirm/last-match deletion |
| FR-012 | Persist before reporting success | US5 plus SC-003's three real browser relaunches |
| FR-013, FR-014 | CSS, labels, focus, keyboard, responsive layout | SC-005/SC-006 at 360px and 1280px; contrast/target measurements |
| FR-015 | Read/write errors through logic to UI | Denied/corrupt reads, quota/write failures, input retention, no overwrite, deliberate retry and reload recovery |
| FR-016 | Bounded scope in every artifact | Review future tasks and changes against spec |

## Validation Strategy

1. For each task operation and story, write a focused test and observe a meaningful failure.
   Then write the minimum production behavior and refactor with the test passing.
   Serving behavior also gets tests before its implementation.
2. Unit tests use fresh fake repositories/storage with no shared mutable data. Cover required
   titles, duplicate titles with distinct identities, stable creation order, edit/status isolation,
   filters, missing identities, remove, invalid saved records, and read/write exceptions.
3. Cover every acceptance scenario in US1-US5, with at least one acceptance test per story.
   Use independent browser contexts and observable UI outcomes; avoid arbitrary sleeps.
4. For SC-003, create a unique temporary persistent browser profile, save through the UI,
   close its browser, and relaunch it with the same profile and exact origin three times.
   Assert all fields/status and confirmed deletion each cycle. Do not restore exported
   storageState, because that could mask a persistence bug.
5. Introduce visual/accessibility assertions with the UI state they require, before its
   implementation: T010 covers list/detail/add form before T013-T014; T026 covers edit before
   T028; T031 covers delete confirmation before T033. At 360px and 1280px, assert targets at
   least 44x44px, normal/large text contrast at least 4.5:1/3:1, no horizontal overflow with
   long text, visible keyboard focus, and applicable dialog focus containment/restoration.
   Observe a failing assertion for each new behavior before adding its production code;
   retain already-passing behavior as regression coverage. T036 consolidates these existing
   assertions across completed flows rather than deferring their first checks. Perform a
   short manual keyboard/visual review too.
6. Completion requires lint and all unit/acceptance tests passing, requirement traceability,
   the browser acceptance matrix below, and a constitution compliance review. Record actual
   results during implementation; no application tests have been run in this planning phase.

### Browser acceptance matrix

| Supported browser | Required verification | Required result |
|---|---|---|
| Chromium | Automated acceptance suite at 360px and 1280px, including core flows and reopening persistence | Pass |
| Firefox | Manual core-flow smoke review at 360px and 1280px, including reopening persistence | Pass |
| Actual Safari | Manual core-flow smoke review at 360px and 1280px, including reopening persistence | Pass |

Core flows are create, view, edit, completion toggle, filter, and confirmed/cancelled deletion.
For each browser, verify saved fields/status and deletion across the three close/reopen cycles
defined by SC-003, using the same origin and a dedicated test profile without exported-state
reseeding. Record browser version, platform, review date, and actual results in quickstart.md.
Playwright WebKit may supply additional evidence but does not substitute for actual Safari.

All three supported browsers must pass before final completion. An unavailable or failed
check remains pending completion, never passed; T039 and T040 must remain incomplete until
the required evidence is passing. Keep this as a future implementation gate: no browser
verification has been performed by this planning amendment.

## Complexity Tracking

No constitutional violations or exceptions are proposed.

The required storage interface is kept to two operations. A standard-library HTTP server is
needed for reliable native-module loading and a stable storage origin. It adds no application
backend or build pipeline.

ESLint catches JavaScript code errors; Playwright supplies repeatable real-browser interaction,
isolation, and relaunch coverage. Both are development-only and remove more validation-tool
complexity than they add. Node's own runner avoids a third testing framework. No runtime
dependency is justified by the current requirements.
