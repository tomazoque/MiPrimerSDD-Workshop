<!--
Sync Impact Report (review scratch; remove before committing)
Version: unratified scaffold -> 1.0.0 (initial adoption).
Modified principles: placeholder principles -> six project rules below.
Added sections: Constitution Check; Completion Review.
Removed sections: none.
Follow-up TODOs: none. Plan template already includes Constitution Check.
-->
# Curso-PSWE-07 Constitution

## Core Principles

### I. SIMPLICITY FIRST (YAGNI)

Implementations MUST use the simplest solution that satisfies the spec. They MUST NOT add
features, abstractions, configuration options, or dependencies "just in case". Any added
complexity MUST have a written justification in the plan.

Rationale: Solving only current requirements keeps change and maintenance costs low.

### II. SIMPLE, CLEAR DESIGN

Code MUST use small functions and modules with a single responsibility and intention-revealing
names. Abstractions MUST address real duplication and MUST NOT serve only one use.
Code MUST NOT be optimized before a measured need exists.

Rationale: Clear, focused code is easier to understand, test, and change.

### III. STRUCTURED ARCHITECTURE

Code MUST separate UI (screens/components), application logic (task operations), and persistence
(storage), with dependencies pointing only UI -> logic -> persistence. UI MUST NOT access
storage directly. Persistence MUST expose a small interface that can be replaced or faked in tests.

Rationale: Layer boundaries isolate changes and make business logic independently testable.

### IV. TEST-DRIVEN DEVELOPMENT (NON-NEGOTIABLE)

Development MUST follow Red-Green-Refactor: write and run a failing test, pass it with minimum
code, then refactor. Production code MUST NOT exist without a test that required it.
Business logic MUST have unit tests; each user story MUST have at least one acceptance test
mirroring its acceptance scenarios. Tests MUST be fast, run independently, and share no mutable state.

Rationale: Test-first development proves required behavior and protects it during changes.

### V. SPEC IS THE SOURCE OF TRUTH

Every implementation task MUST trace to a requirement in the spec. Work absent from the spec
MUST be treated as out of scope. Ambiguous requirements MUST be clarified before implementation.

Rationale: Traceability prevents scope drift and makes completion verifiable.

### VI. DEPENDENCIES AND QUALITY

Implementations MUST prefer standard-library and platform features. A third-party dependency
MUST be added only when its written plan justification shows it removes more complexity than
it adds. Code MUST pass linting and all tests before being considered done.

Rationale: Fewer dependencies and passing checks reduce maintenance and regression risk.

## Constitution Check

Every plan MUST include a "Constitution Check" verifying all six principles before implementation
begins, including requirement traceability, layer boundaries, test-first work, and complexity justifications.

## Completion Review

Every change MUST be reviewed against the spec and this constitution, with lint and test results
recorded before it is marked done.

## Governance

This constitution MUST override conflicting project practices. Amendments MUST include a written
rationale, an updated amendment date, and a semantic version bump: MAJOR for incompatible rule
changes, MINOR for new or expanded rules, PATCH for clarifications.

**Version**: 1.0.0 | **Ratified**: 2026-10-26 | **Last Amended**: 2026-10-26
