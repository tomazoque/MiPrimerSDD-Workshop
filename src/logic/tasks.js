import { createTaskRepository } from '../persistence/task-repository.js';

function fields(title, description = '') {
  const name = title.trim();
  if (!name) throw Error('Please enter a title.');
  return { title: name, description: description.trim() ? description : '' };
}

function find(tasks, id) {
  const task = tasks.find(task => task.id === id);
  if (!task) throw Error('Task not found.');
  return task;
}

export function createTaskService(repository = createTaskRepository()) {
  function change(id, update) {
    const tasks = globalThis.structuredClone(repository.load());
    const task = find(tasks, id); update(task);
    repository.save(tasks); return task;
  }
  return {
    list(filter = 'All') {
      return globalThis.structuredClone(repository.load()).filter(task => filter === 'All' || task.done === (filter === 'Done'));
    },
    get(id) { return globalThis.structuredClone(find(repository.load(), id)); },
    add(title, description) {
      const values = fields(title, description);
      const task = { id: globalThis.crypto.randomUUID(), ...values, done: false };
      const tasks = globalThis.structuredClone(repository.load());
      repository.save([...tasks, task]);
      return task;
    },
    toggle(id) {
      return change(id, task => { task.done = !task.done; });
    },
    update(id, title, description) {
      const values = fields(title, description);
      return change(id, task => Object.assign(task, values));
    },
    remove(id) {
      const tasks = repository.load(); find(tasks, id);
      repository.save(tasks.filter(task => task.id !== id));
    },
  };
}
