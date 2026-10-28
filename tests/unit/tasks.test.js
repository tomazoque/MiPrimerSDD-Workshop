import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTaskService } from '../../src/logic/tasks.js';

function setup() {
  let tasks = [];
  const repository = { load: () => globalThis.structuredClone(tasks), save: value => { tasks = globalThis.structuredClone(value); } };
  return { repository, service: createTaskService(repository) };
}

test('US1: create, list, inspect; normalize fields, preserve order, and separate duplicate titles', () => {
  const { service } = setup();
  assert.deepEqual(service.list(), []);
  const first = service.add('  Read chapter  ', '  Notes\nKeep lines  ');
  assert.equal(first.title, 'Read chapter');
  assert.equal(first.description, '  Notes\nKeep lines  ');
  assert.equal(first.done, false); assert.ok(first.id);
  const second = service.add('Read chapter', ' \n ');
  assert.notEqual(first.id, second.id); assert.equal(second.description, '');
  assert.deepEqual(service.list(), [first, second]);
  assert.deepEqual(service.get(first.id), first);
  const read = service.get(first.id); read.title = 'Unsaved';
  assert.equal(service.get(first.id).title, 'Read chapter');
  assert.equal(service.add('Optional').description, '');
});

test('US1: blank titles and missing identities fail without writing', () => {
  const { service } = setup();
  for (const title of ['', '  \n ']) assert.throws(() => service.add(title), /title/i);
  assert.throws(() => service.get('missing'), /not found/i);
  assert.deepEqual(service.list(), []);
});

test('US5: read/write failures propagate; deliberate retry succeeds once with no automatic writes', () => {
  let records = [], readDenied = true, writeDenied = false, writes = 0;
  const repository = {
    load() { if (readDenied) throw Error('Read denied'); return globalThis.structuredClone(records); },
    save(value) { writes++; if (writeDenied) throw Error('Write denied'); records = globalThis.structuredClone(value); },
  };
  const service = createTaskService(repository);
  assert.throws(() => service.add('Read later'), /Read denied/); assert.equal(writes, 0);
  readDenied = false; writeDenied = true;
  assert.throws(() => service.add('Read later'), /Write denied/);
  assert.equal(writes, 1); assert.deepEqual(records, []);
  writeDenied = false; const task = service.add('Read later');
  assert.equal(writes, 2); assert.deepEqual(createTaskService(repository).list(), [task]);
});

test('US2: filters and both completion transitions preserve identity, content and order', () => {
  const { service } = setup();
  const first = service.add('First', 'Notes'), second = service.add('Second');
  service.toggle(first.id);
  assert.deepEqual(service.get(first.id), { ...first, done: true });
  assert.deepEqual(service.list('Pending'), [second]);
  assert.deepEqual(service.list('Done'), [{ ...first, done: true }]);
  assert.deepEqual(service.list('All'), [{ ...first, done: true }, second]);
  service.toggle(first.id);
  assert.deepEqual(service.list('Pending'), [first, second]);
  assert.deepEqual(service.list('Done'), []);
  assert.throws(() => service.toggle('missing'), /not found/i);
});

test('US2: failed completion writes do not mutate prior data and permit a deliberate retry', () => {
  const { service, repository } = setup(); const task = service.add('Keep');
  const save = repository.save; repository.save = () => { throw Error('Write failed'); };
  assert.throws(() => service.toggle(task.id), /Write failed/);
  assert.deepEqual(service.get(task.id), task);
  repository.save = save; service.toggle(task.id);
  assert.equal(service.get(task.id).done, true);
});

test('US3: editing preserves identity/status/order, validates fields and supports blank descriptions', () => {
  const { service } = setup();
  const first = service.add('Original', 'Before'), second = service.add('Second');
  service.toggle(first.id);
  const updated = service.update(first.id, '  Revised  ', '  After\nKeep whitespace  ');
  assert.deepEqual(updated, { ...first, title: 'Revised', description: '  After\nKeep whitespace  ', done: true });
  assert.deepEqual(service.list(), [updated, second]);
  assert.throws(() => service.update(first.id, '  ', 'lost'), /title/i);
  assert.deepEqual(service.get(first.id), updated);
  assert.throws(() => service.update('missing', 'Valid'), /not found/i);
  service.update(first.id, 'Revised', ' \n ');
  assert.equal(service.get(first.id).description, '');
});

test('US3: failed edit preserves saved state; explicit retry applies exactly one update', () => {
  const { service, repository } = setup(); const task = service.add('Original');
  const save = repository.save; let attempts = 0;
  repository.save = () => { attempts++; throw Error('Failed update'); };
  assert.throws(() => service.update(task.id, 'Revised'), /Failed update/);
  assert.equal(attempts, 1); assert.deepEqual(service.get(task.id), task);
  repository.save = save; service.update(task.id, 'Revised');
  assert.equal(service.list().length, 1); assert.equal(service.get(task.id).title, 'Revised');
});

test('US4: remove exactly one identity, preserve survivors/order, handle last and missing tasks', () => {
  const { service } = setup();
  const first = service.add('First'), middle = service.add('Middle'), last = service.add('Last');
  service.remove(middle.id);
  assert.deepEqual(service.list(), [first, last]);
  assert.throws(() => service.remove('missing'), /not found/i);
  assert.deepEqual(service.list(), [first, last]);
  service.remove(first.id); service.remove(last.id);
  assert.deepEqual(service.list(), []);
});

test('US4: failed deletion retains all records; explicit retry removes only selected task', () => {
  const { service, repository } = setup(); const first = service.add('Remove'), other = service.add('Keep');
  const save = repository.save; let attempts = 0;
  repository.save = () => { attempts++; throw Error('Delete failed'); };
  assert.throws(() => service.remove(first.id), /Delete failed/);
  assert.equal(attempts, 1); assert.deepEqual(service.list(), [first, other]);
  repository.save = save; service.remove(first.id);
  assert.deepEqual(service.list(), [other]);
});
