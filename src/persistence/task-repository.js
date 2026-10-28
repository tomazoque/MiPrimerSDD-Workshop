const KEY = 'curso-pswe-07.tasks';

function valid(tasks) {
  if (!Array.isArray(tasks)) return false;
  const ids = new Set();
  return tasks.every(task => {
    if (!task || typeof task.id !== 'string' || !task.id || ids.has(task.id)) return false;
    ids.add(task.id);
    return typeof task.title === 'string' && task.title.trim().length > 0
      && typeof task.description === 'string' && typeof task.done === 'boolean';
  });
}

export function createTaskRepository(storage) {
  return {
    load() {
      try {
        const raw = (storage ?? globalThis.localStorage).getItem(KEY);
        const tasks = raw === null ? [] : JSON.parse(raw);
        if (!valid(tasks)) throw Error('Invalid records');
        return tasks;
      } catch {
        throw Error('Saved tasks could not be read. Check storage access and reload. Existing data has not been changed.');
      }
    },
    save(tasks) {
      try {
        (storage ?? globalThis.localStorage).setItem(KEY, JSON.stringify(tasks));
      } catch {
        throw Error('Could not save your changes. Check browser storage and try again.');
      }
    },
  };
}
