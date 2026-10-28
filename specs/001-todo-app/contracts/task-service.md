# Logic and Persistence Contracts

**Source**: [../spec.md](../spec.md), [../data-model.md](../data-model.md).

These synchronous module contracts support UI -> logic -> persistence. They are not HTTP
endpoints. UI code must not import persistence or access localStorage directly.

## Application logic

`createTaskService(repository)` uses the two-operation repository below. Production wiring
may select the real repository in the logic layer; tests pass a fresh fake. Returned tasks
must not give callers mutable references to the repository's saved collection.

| Operation | Inputs | Successful result | Rules |
|---|---|---|---|
| list(filter = All) | All, Pending, or Done | Matching Task array | Preserve creation order; do not write. |
| get(id) | Task identity | Selected Task | Missing id fails; do not write. |
| add(title, description) | Form fields | New Task | Validate title; generate id; initial done=false; append then persist. |
| update(id, title, description) | Identity and form fields | Updated Task | Validate; preserve id, done, and position; persist. |
| toggle(id) | Task identity | Updated Task | Invert only done; persist. |
| remove(id) | Task identity | No task result required | Remove only matching id; persist. |

Descriptions omitted or containing only whitespace normalize to an empty string; otherwise
preserve text and line breaks. Titles are trimmed and must remain nonblank. Duplicate titles
are valid. A missing task identity for get/update/toggle/remove fails without a write.

Mutations load a valid collection, change isolated data, and save before returning success.
No optimistic acknowledgment, queued write, mutation on cancel, cached shadow store, or
background synchronization is introduced.

## Repository

`createTaskRepository(storage)` supports an injected object with browser-style getItem/setItem
for tests, while production uses browser localStorage inside this module only.

| Operation | Successful result | Error contract |
|---|---|---|
| load() | Fresh, validated Task array; empty if key absent | Throw on denied access, malformed JSON, invalid record shapes/types, blank titles, or duplicate IDs. Never write as recovery. |
| save(tasks) | Return only after a complete successful write | Throw on quota/access/write failure; do not clear the old key first. |

Store one array at `curso-pswe-07.tasks`. Use JSON serialization without adding metadata fields.
The service supplies valid records; use the shared record-validation rule when checking stored data.

## Errors

Use ordinary errors with clear messages for: required title, task not found, saved tasks
unreadable, and changes not saved. Application logic must propagate persistence errors to
the UI. No error-class hierarchy or recovery framework is required.

- Validation failure: no persistence change; the UI retains form input and focuses Title.
- Read failure: no reset/overwrite; the UI shows failure rather than a normal empty collection.
- A read failure prevents writes until a successful read; correcting access and reloading the
  application can restore the unchanged collection. This does not authorize automatic resets.
- Write failure: no success notification or navigation that discards recoverable input;
  retain prior saved data. Single-entry write failure semantics do not imply a multi-window transaction.
- After a write failure, retry is a new deliberate invocation through the existing Save,
  completion action, or deletion confirmation once storage access is restored. A successful
  retry persists the change once; cancellation/back does not write. No automatic retry loop
  or additional recovery interface is introduced (FR-015).

## Contract verification

- Use a new fake repository per logic test and a new fake storage object per repository test.
- Check required titles, optional/multiline descriptions, duplicate titles with distinct IDs,
  all filters, both status transitions, edit invariants, survivor order, and missing identities.
- Inject denied reads, invalid JSON/records, duplicate saved IDs, and write failures. Assert
  error propagation, no silent reset, no write on failed validation/read, and unchanged prior data.
- Verify that only persistence imports/accesses browser storage in application source.
