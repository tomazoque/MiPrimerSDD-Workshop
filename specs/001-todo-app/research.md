# Research: Curso-PSWE-07 To-Do Application

**Date**: 2026-10-26 | **Input**: [spec.md](spec.md)

All planning unknowns are resolved. Research was divided between platform/storage and
testing/accessibility, then consolidated against the six constitutional principles.

## 1. Application platform and delivery

**Decision**: Static HTML/CSS with native JavaScript modules. Use a small Node.js
standard-library server on `http://127.0.0.1:4173`; no build step or runtime dependencies.

**Rationale**: Two screens and local task operations do not require a framework or backend.
Native modules should be served over HTTP with a JavaScript content type. A stable loopback
origin also supplies the context needed for browser APIs and consistent local storage.
Serve only the application entry and assets through an explicit allowlist.

**Alternatives considered**: A framework/bundler adds setup without a required capability;
native desktop packaging adds a distribution problem; opening index.html directly has
module-loading restrictions and unreliable file-origin storage behavior. No service worker,
PWA installation, public deployment, or server persistence is required.

**Sources**: [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules),
[Node HTTP API](https://nodejs.org/api/http.html),
[secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts).

## 2. Persistence scope and representation

**Decision**: Store one JSON array under `curso-pswe-07.tasks` in localStorage.
Preserve array order as creation order. The supported retention environment is the same
origin and normal browser profile; clearing data and private-session teardown are excluded.

**Rationale**: This directly supports FR-012 without accounts, synchronization, or a backend.
Protocol/host/port are part of the origin, so the run guide must use one fixed URL.
The array needs no indexes, timestamp field, schema envelope, or migration framework.

**Alternatives considered**: sessionStorage does not satisfy durable reopening. IndexedDB
offers transactional/asynchronous features without a current requirement for them. A remote
database adds deployment and data-management responsibilities beyond the requested scope.

**Sources**: [WHATWG Web Storage](https://html.spec.whatwg.org/multipage/webstorage.html),
[localStorage behavior](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).

## 3. Failure safety and identity

**Decision**: Validate stored records on read. Missing key means no tasks; malformed JSON,
wrong record types, duplicate IDs, and denied access are explicit read failures. Each mutation
loads valid data, changes an isolated collection, and writes once before reporting success.
Keep storage access, including obtaining localStorage itself, inside error handling.
Never clear data before saving or silently replace unreadable data.

Generate IDs once with native `crypto.randomUUID()` and preserve them through edit/status
changes. Titles may be identical; task identity is independent of title.

**Rationale**: FR-015 requires visible failures and preservation of existing data. A failed
single setItem leaves the prior entry unchanged under the storage contract. This does not
make a read/change/write sequence a cross-window transaction; no multi-window synchronization
or locking system is added. Fresh reads avoid an unnecessary application cache.

**Alternatives considered**: Resetting on JSON errors loses user data; optimistic success
before writing misrepresents failure; a UUID dependency or migration/locking framework is
unnecessary for the specified single-user task collection.

**Sources**: [Storage interface and failures](https://html.spec.whatwg.org/multipage/webstorage.html#the-storage-interface),
[JSON.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse),
[randomUUID](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID).

## 4. Development tools and test isolation

**Decision**: Node.js 24.x; built-in node:test and strict assertions; ESLint and
@playwright/test as the only development dependencies. Use Playwright's matching bundled
Chromium as the automated baseline, not a mandatory locally installed Edge channel.
Resolve compatible package versions and record the lockfile in the implementation phase.

**Rationale**: Node 24 is supported by the selected tools and is already installed here.
Native unit testing avoids a separate test framework; ESLint and Playwright replace far
more complicated custom lint/browser tooling. Fresh fake repositories and independent
browser contexts keep scenarios fast and isolated. Tests must fail for the missing behavior
before the production change, then pass before refactoring.

**Alternatives considered**: Another unit runner offers little for plain modules; manual-only
acceptance cannot provide repeatable regression checks; forcing Edge/Chrome installation
reduces portability. No application dependency is needed for test tools.

**Sources**: [Node test runner](https://nodejs.org/api/test.html),
[ESLint prerequisites](https://eslint.org/docs/latest/use/getting-started),
[Playwright requirements](https://playwright.dev/docs/intro#system-requirements),
[browser installation](https://playwright.dev/docs/browsers),
[test isolation](https://playwright.dev/docs/browser-contexts).

## 5. Persistence acceptance beyond a page reload

**Decision**: Verify SC-003 using a unique temporary persistent browser profile. Save through
the UI, close the browser context, relaunch with the same profile and origin, and repeat for
three cycles. Compare fields/status and confirmed deletions after every relaunch.

**Rationale**: A reload or restoring exported storageState could conceal failure to retain
data after closing the application. A real relaunch tests the specified boundary without
touching the user's ordinary browser profile or sharing state between tests.

**Alternatives considered**: Page reloads remain useful smoke checks, but do not alone prove
SC-003. Reusing a personal browser profile is unnecessary and unsafe for test isolation.

**Source**: [Persistent browser contexts](https://playwright.dev/docs/api/class-browsertype#browser-type-launch-persistent-context).

## 6. Accessible interaction and visual validation

**Decision**: Native dialog elements for the shared form and delete confirmation. Label each
dialog, focus Title for add/edit and Cancel for deletion, support Escape cancellation,
contain keyboard focus while modal, and restore useful focus on close.

Verify both screens and dialog states at 360px and 1280px, with long text, keyboard-only flows,
target measurements, and actual foreground/background contrast. Keep completed text readable.

**Rationale**: Native controls meet the interaction needs without a modal library. Automated
checks cover repeatable outcomes; a short manual keyboard/visual review catches limitations
that measurements alone do not establish. The spec's 44x44px rule applies to every target.

**Alternatives considered**: A modal framework adds runtime complexity; custom focus trapping
duplicates native behavior. Screenshot-only testing does not prove keyboard access or contrast.

**Sources**: [HTML dialog](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element),
[WAI modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/),
[contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
[target size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html).
