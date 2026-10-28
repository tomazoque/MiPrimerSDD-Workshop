# Data Model: Curso-PSWE-07

**Source**: [spec.md](spec.md), FR-002-FR-012 and FR-015.

## Task

| Field | Representation | Rules |
|---|---|---|
| id | string | Nonempty, unique within the collection; generated once as a UUID; immutable. |
| title | string | Required; trim outer whitespace; reject an empty result. |
| description | string | Optional input becomes an empty string when omitted or whitespace-only; otherwise preserve the entered text and line breaks. |
| done | boolean | false at creation; true means Done and false means Pending. |

No dates, categories, priorities, ownership, or other task attributes are introduced.
Duplicate titles are allowed because identity comes from id. The stored collection is an
ordered array: append new tasks; edit/toggle do not reorder; delete preserves survivor order.

## State transitions

| Operation | Before | After | Preserved / failure rule |
|---|---|---|---|
| Add | No task | New id, validated fields, done=false | Reject invalid title without writing. |
| Edit | Existing task | New title/description | Preserve id, done, and array position. |
| Mark as done | done=false | done=true | Preserve id and content. |
| Mark as not done | done=true | done=false | Preserve id and content. |
| Confirm delete | Existing task | Task absent | Preserve all other tasks. |
| Cancel any form/confirmation | Any task set | Unchanged | No persistence operation. |
| Failed write | Previously saved task set | Same saved set | Report failure; retain recoverable form input. |

Get/update/toggle/remove with an absent id report Task not found without changing stored data.

## Completion filter

An in-memory value: All, Pending, or Done. All is the startup default. Pending selects
done=false; Done selects done=true. Changing filters never changes task records. Preserve
the current filter while opening and returning from detail; it need not survive reopening.

## UI state

The UI owns the selected task id, current screen, filter, and unsaved form values. It may
record the current focus target for accessible navigation. This state is not stored as task
data. Add/edit reuse one form; unsaved edits never mutate a saved task object.

## Persistence boundary

One localStorage entry, key `curso-pswe-07.tasks`, contains the JSON task array. There are
no relationships to external entities, storage envelope, version field, or migrations.
The only persistence contract is [load/save](contracts/task-service.md).

On load, require an array of non-null records with all field types above, nonblank titles,
and unique IDs. A missing key produces an empty collection. Malformed JSON, invalid records,
duplicate IDs, and access denial produce read errors; retain the original stored bytes.

Before a mutation, load the current valid collection and edit an isolated copy. Save the
complete result once; acknowledge success only after the write succeeds. Do not remove the
old key first. The single write provides no cross-window read/modify/write transaction;
multi-window synchronization is outside the specified feature.

Retention applies to the same origin and normal browser profile. Deliberate clearing,
private-session teardown, and changing profile/protocol/host/port do not provide continuity.
