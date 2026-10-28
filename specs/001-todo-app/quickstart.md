# Quickstart and Validation Guide

**Phase**: Application implemented; automated validation passes. Required manual Firefox and
actual-Safari evidence is still pending, so T039/T040 and final feature acceptance remain open.
The commands below are now runnable; see Implementation Evidence for actual results.

## Prerequisites

- Node.js 24.x and npm on PATH; a normal browser profile for manual persistence validation.
- Network access for initial development dependencies and Playwright's bundled Chromium.
- Access to Firefox and actual Safari for their required manual core-flow smoke reviews;
  Playwright WebKit results cannot substitute for actual Safari evidence.
- Use `http://127.0.0.1:4173` consistently. A different host, port, protocol, or profile uses
  different browser storage. Avoid private browsing for retention checks.

For an installed Windows Node runtime missing from PATH, this session-only setting is sufficient:

```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path
```

## Setup and commands

ESLint and @playwright/test are installed as development-only tools; package.json and its
lockfile record the dependency set. A fresh checkout can use:

```sh
npm ci
npx playwright install chromium
npm run lint
npm run test:unit
npm run test:acceptance
npm test
npm start
```

`npm test` must run both test suites. `npm start` must serve the app on the fixed loopback URL.
The Playwright configuration must start/stop its own server for acceptance tests; no manually
started server should be necessary. Stop an interactive server with Ctrl+C.

Opening index.html directly is not the supported launch path. No production build, runtime
package installation, accounts, database setup, or deployment is needed to use the completed app.

## Test-first development gate

For each task behavior and user story: write the behavior test, run and observe failure for
the missing behavior, implement the minimum code, rerun to green, then refactor. Record
red/green and final lint/test outcomes in implementation review notes. A suite that fails
only because its environment is broken is not sufficient evidence of the behavioral red step.

Add visual/accessibility assertions with each UI state before its implementation:

| Test task | Covered state | Must precede |
|---|---|---|
| T010 | List, detail, and add form | T013-T014 |
| T026 | Edit form mode | T028 |
| T031 | Delete confirmation | T033 |

At 360px and 1280px, these assertions cover targets at least 44x44px, normal/large text
contrast at least 4.5:1/3:1, long-text wrapping without horizontal overflow, visible keyboard
focus, and applicable dialog focus containment/restoration. Observe a failing assertion for
each new behavior before its production code; retain already-passing behavior as regression.
T036 consolidates the existing checks across completed flows and must not be their first
verification after the corresponding behavior has already been implemented.

## End-to-end validation

Run these scenarios at 360px and 1280px widths. Expected interaction details are in
[contracts/ui.md](contracts/ui.md); field rules are in [data-model.md](data-model.md).

| Scenario | Actions | Expected outcome |
|---|---|---|
| US1: create/read | Start empty; verify name/title; open Add task; try blank/whitespace title; save a valid task with and without a description; open detail; return; cancel another creation. | Friendly empty state, visible validation, one Pending task per Save, literal fields, No description fallback, no cancelled task. |
| US2: progress/filter | Start with mixed statuses; exercise All/Pending/Done; toggle each way in detail; return to the filtered list; check no-match state. | Correct subset and active state; correct toggle label; completed list title muted/struck; current filter preserved. |
| US3: edit | Edit an existing task; verify prefill; save revised fields; reject blank title; cancel changes; clear a description. | One updated task; identity/status unchanged; invalid/cancelled edits not saved; No description after clearing. |
| US4: delete | Request deletion; cancel; request again and confirm; delete last matching task. | Explicit confirmation; cancellation preserves data; only selected task removed; appropriate list/empty state. |
| US5 / SC-003: reopen | Create/edit/complete tasks and confirm one deletion; fully close the test browser and relaunch with the same dedicated profile and URL; repeat three times. | All saved fields/status retained at every cycle; deleted task remains absent. |
| FR-015: failures/recovery | Inject storage denial, malformed/invalid records, and failed writes using test fixtures; restore access and retry using the existing Save/action/confirmation control; restore a failed read and reload the same application address/profile. | Clear error; no silent overwrite/reset or false success; unsaved input remains recoverable; retry saves the change once; Cancel/Back remains non-destructive; reads must succeed before writes resume and reload restores the original collection. |

The persistent-profile test must use a unique temporary userDataDir, close it before relaunch,
and clean it up afterward. Do not use the user's normal profile or seed relaunches from exported
storageState. Other tests use fresh isolated contexts. Never share mutable state between scenarios.

## Responsive and keyboard review

- Complete create/view/edit/toggle/filter/delete with keyboard only; confirm visible focus.
- Verify Title focus on form open, Cancel focus on delete confirmation, dialog focus containment,
  Escape cancellation, and useful focus restoration after each close/navigation.
- Check target bounding boxes across list, detail, add/edit form, and confirmation: all at least 44x44px.
- Verify long titles and multiline descriptions at both widths: no horizontal page overflow,
  obscured controls, or unreachable form actions. Markup-like content must render literally.
- Measure actual foreground/background contrast: at least 4.5:1 normal text and 3:1 large text,
  including muted/completed text. Confirm light styling, one accent, and distinct warning-colored Delete.
- Use FR-014's large-text definition: at least 24 CSS px, or at least 18.667 CSS px with font
  weight 700 or above. All other text requires 4.5:1; warning-action labels use the same rules.
- Check the name in the list header and browser tab/window title. Time one title-only create/open
  walkthrough against SC-001's 60-second target.
- Follow SC-001's fixed walkthrough at each width: an empty, ready list with All selected,
  title Read chapter, description empty, and timing through visible detail title/Pending status.
  Include typing and interaction; exclude browser/server setup and initial startup. Evaluate
  Add task availability, title hierarchy, and bounded spacing choices against FR-005/FR-006/FR-013.

## Required browser acceptance

| Browser | Required verification | Passing criteria |
|---|---|---|
| Chromium | Automated acceptance suite at 360px and 1280px | All required scenarios pass, including core flows and three reopening cycles. |
| Firefox | Manual smoke review at 360px and 1280px | Create/view/edit/toggle/filter/delete flows and three reopening cycles pass. |
| Actual Safari | Manual smoke review at 360px and 1280px | Create/view/edit/toggle/filter/delete flows and three reopening cycles pass. |

Include confirmed and cancelled deletion, saved title/description/status, and continued
absence of the deleted task. For every reopening review, keep the same origin and dedicated
test profile across the three close/reopen cycles; do not restore exported state or reseed
the collection after reopening. Use actual Safari for its row; Playwright WebKit is not a
substitute. The scenarios above and [plan.md](plan.md) define the required outcomes.

During implementation, record browser version, platform, review date, results at both widths,
and persistence outcomes in the evidence table below. Pending or failed checks never count as
passed. If a browser is unavailable, its verification and T039/T040 remain incomplete until
passing evidence is available. Rows marked Pending have not been executed; completed rows reflect the implementation evidence below.

| Browser | Version | Platform | Review date | 360px result | 1280px result | Three-cycle persistence | Overall result |
|---|---|---|---|---|---|---|---|
| Chromium | 156.0.8078.4 | Windows x64 | 2026-10-26 | Pass (automated) | Pass (automated) | Pass: 3 real relaunches per scenario/width | Pass (automated baseline) |
| Firefox | Not verified | No connected manual-review surface | Not performed | Pending | Pending | Pending | Pending |
| Actual Safari | Not verified | No connected manual-review surface | Not performed | Pending | Pending | Pending | Pending |

## Completion gate

Lint, all unit/acceptance scenarios, the manual keyboard/visual review, and every required
browser row must pass. T039 and T040 cannot be completed while any required browser check is
pending or failed. Review FR-001-FR-016 traceability and all six constitutional principles.
Record actual results rather than marking planned checks as executed. Passing automated checks does not complete the required manual-browser gate.

## Implementation Evidence - 2026-10-26

- T001-T004: Node 24.22.1, two development dependencies installed with lockfile; bundled Chromium installed; scripts and lint configuration created. Zero runtime packages.
- T005-T008 RED: 4 behavioral assertions failed against minimal stubs (HTTP 404 vs200, missing persisted task, missing validation/read errors). GREEN: 4/4 foundation tests pass, approximately175ms.
- T009 RED: add/get validation tests fail against an intentionally empty service; no missing-module or server error used as red evidence.

- T010 RED: empty page lacked required roles; after functional UI, the quantitative visual test failed on a30.828px target before any CSS was implemented. GREEN T009-T015:6/6 unit tests and4/4 US1 Chromium acceptance checks pass at360/1280; lint passes. Shared form keyboard containment/restoration, long literal content, title hierarchy, measured contrast and target sizes verified. This incremental UI still has future-story controls not wired.

- SC-001 scripted keyboard walkthrough:200ms desktop /138ms mobile on the first recorded run, including input, excluding startup. This is automated evidence, not a human manual-browser sign-off.
- T016-T019 RED:4 explicit error-feedback/read-blocking acceptance failures before handlers. Existing persistence regression already passed. GREEN: 7/7 unit and16/16 Chromium browser checks pass, including three actual browser relaunches in each viewport with dedicated temporary profiles; restored access, deliberate Save retry, cancellation, and corrupt-data preservation pass. Full UI edit/toggle/delete persistence remains for T035.

- T020-T024 RED: completion operation absent and browser assertions failed for missing line-through and retry feedback. GREEN: 9/9 unit tests,20/20 Chromium acceptance checks, and lint pass. Exact filter subsets, both status transitions, retained empty filters, readable completed text, keyboard action focus, safe Back and deliberate completion retry verified.

- T025-T029 RED: update operation and Edit dialog absent. Additional FR-015 red regression exposed unreported read loss immediately before detail/edit; corrected those read handlers without data mutation. GREEN: 11/11 unit and26/26 Chromium browser checks pass. Prefill, validation, shared modal, cleared/multiline descriptions, preserved identity/status/order, Cancel/Escape and explicit edit retry verified.

- T030-T034 RED: removal operation and destructive confirmation were absent. GREEN: 13/13 unit and30/30 Chromium acceptance checks pass; lint passes. Confirmation has safe initial focus, Cancel/Escape, measured warning/contrast/target styling, preserved filter, last-task empty state, failed-delete retention and deliberate retry.

- T035-T038: the complete UI-driven create/edit/complete/confirmed-delete sequence survived three actual browser relaunches at each width, with no exported-state restoration or reseeding. The whole keyboard-only create/view/edit/toggle/filter/cancel/delete journey passes at both widths. Existing quantitative visual assertions were consolidated; no speculative feature changes were needed. README and this guide now describe the actual commands and persistence boundaries.
- Final automated run: `npm run lint` PASS; `npm test` exits 0 with 13/13 unit tests (about154ms) and 34/34 Chromium acceptance checks (19.7s). This fresh run started and stopped its server successfully outside the sandbox after sandbox child-process cleanup restrictions were observed.
- Visual QA: six screenshots captured in an isolated disposable context; desktop list/empty state and mobile list/detail/edit/confirmation reviewed. Targets, contrast, keyboard containment/restoration and overflow are also measured in automated acceptance. Scripted SC-001 walkthrough in the final run:170ms desktop /194ms mobile; this is not a manual-human timing claim.
- Constitution review: three source layers and replaceable load/save repository; UI storage access prohibited by lint; all mutations read/validate before writing and report success after persistence; no runtime dependencies, accounts, sync, additional task fields, or speculative abstractions. Every story has unit/acceptance coverage and recorded test-first evidence. Both requirements-review checklists remain approved and unchanged by implementation.

## Remaining Manual Verification

T039 and T040 remain pending. The connected UI inventory returned no available browser surfaces,
so no manual Firefox or actual-Safari review was performed. Playwright WebKit or Chromium is not
substituted for Safari. The matrix and its completion rule have not been weakened.

On systems with the required browsers, run this same source using Node 24 and `npm start`, use
a dedicated normal browser profile at the fixed URL, and follow the core-flow and three-cycle
reopening scenarios above at both widths. Record browser version/platform/date and actual results
in the evidence table. Only passing evidence for all required browsers allows T039/T040 to close.
