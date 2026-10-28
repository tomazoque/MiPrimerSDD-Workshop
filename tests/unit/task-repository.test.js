import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTaskRepository } from '../../src/persistence/task-repository.js';

const task = { id: 'first', title: 'Read', description: 'Line one\nLine two', done: false };
function backend(initial = null) {
  let value = initial;
  let writes = 0;
  return { getItem: () => value, setItem: (key, next) => { assert.equal(key, 'curso-pswe-07.tasks'); value = next; writes++; }, value: () => value, writes: () => writes };
}

test('missing key, round trip, recreation, and saved deletion', () => {
  const storage = backend();
  const repo = createTaskRepository(storage);
  assert.deepEqual(repo.load(), []);
  repo.save([task]);
  assert.deepEqual(createTaskRepository(storage).load(), [task]);
  const read = repo.load(); read[0].title = 'Uncommitted';
  assert.equal(repo.load()[0].title, 'Read');
  repo.save([]);
  assert.deepEqual(repo.load(), []);
});

test('invalid records/JSON never silently reset or overwrite saved bytes', () => {
  const invalid = ['bad json', '{}', '[null]', JSON.stringify([task, task]),
    ...['id','title','description','done'].map(key => JSON.stringify([{ ...task, [key]: null }])),
    JSON.stringify([{ ...task, id: '' }]), JSON.stringify([{ ...task, title: '  ' }])];
  for (const raw of invalid) {
    const storage = backend(raw);
    assert.throws(() => createTaskRepository(storage).load(), /could not be read/i);
    assert.equal(storage.value(), raw);
    assert.equal(storage.writes(), 0);
  }
});

test('read denial, write denial, quota failure, and lazy storage getter denial are errors', () => {
  const repo = createTaskRepository({ getItem: () => { throw Error('Denied'); }, setItem: () => { throw Error('Quota'); } });
  assert.throws(() => repo.load(), /could not be read/i);
  assert.throws(() => repo.save([task]), /could not save/i);
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  try {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw Error('Policy'); } });
    const lazy = createTaskRepository();
    assert.throws(() => lazy.load(), /could not be read/i);
    assert.throws(() => lazy.save([task]), /could not save/i);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
});
