import { createTaskService } from '../logic/tasks.js';

const tasks = createTaskService();
const byId = id => document.getElementById(id);
const dialog = byId('task-dialog');
const deleteDialog = byId('delete-dialog');
let selectedId = null;
let filter = 'All';
let editingId = null;

function message(id, text = '') {
  const node = byId(id); node.textContent = text; node.hidden = !text;
}

function taskRow(task) {
  const li = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button'; button.className = `task-row${task.done ? ' is-done' : ''}`; button.dataset.taskId = task.id;
  button.setAttribute('aria-label', `Open task: ${task.title}`);
  button.setAttribute('aria-description', task.done ? 'Done' : 'Pending');
  const indicator = document.createElement('span');
  indicator.className = 'task-indicator'; indicator.setAttribute('aria-hidden', 'true');
  indicator.textContent = task.done ? '✓' : '';
  const title = document.createElement('span'); title.className = 'task-title'; title.textContent = task.title;
  const arrow = document.createElement('span'); arrow.className = 'row-arrow'; arrow.textContent = '›'; arrow.setAttribute('aria-hidden', 'true');
  button.append(indicator, title, arrow);
  button.addEventListener('click', () => showDetail(task.id));
  li.append(button); return li;
}

function showList(focusId = null) {
  try {
    const list = tasks.list(filter);
    byId('task-list').replaceChildren(...list.map(taskRow));
    byId('empty-state').hidden = list.length > 0;
    const copy = {
      All: ['No tasks yet', 'Start with one small thing. Add your first task above.'],
      Pending: ['No pending tasks', 'All clear for now. Add a task whenever you need to.'],
      Done: ['No completed tasks yet', 'Small steps count. Your completed tasks will appear here.'],
    };
    byId('empty-heading').textContent = copy[filter][0];
    byId('empty-description').textContent = copy[filter][1];
    for (const button of document.querySelectorAll('[data-filter]')) button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
    byId('list-screen').hidden = false; byId('detail-screen').hidden = true;
    selectedId = null;
    if (focusId) {
      const row = [...document.querySelectorAll('[data-task-id]')].find(button => button.dataset.taskId === focusId);
      (row ?? byId('list-heading')).focus();
    }
    message('page-error'); byId('add-task').disabled = false;
    for (const button of document.querySelectorAll('[data-filter]')) button.disabled = false;
  } catch (error) {
    message('page-error', error.message);
    byId('empty-state').hidden = true; byId('add-task').disabled = true;
    for (const button of document.querySelectorAll('[data-filter]')) button.disabled = true;
  }
}

function showDetail(id, focus = true) {
  try {
    const task = tasks.get(id); selectedId = id;
    byId('detail-title').textContent = task.title;
    byId('detail-description').textContent = task.description || 'No description';
    byId('detail-description').classList.toggle('muted', !task.description);
    byId('detail-status').textContent = task.done ? 'Done' : 'Pending';
    byId('detail-status').classList.toggle('is-done', task.done);
    byId('toggle-task').textContent = task.done ? 'Mark as not done' : 'Mark as done';
    byId('list-screen').hidden = true; byId('detail-screen').hidden = false;
    message('page-error');
    if (focus) byId('detail-title').focus();
  } catch (error) { message('page-error', error.message); }
}

function openForm(id = null) {
  try {
    const task = id ? tasks.get(id) : null;
    editingId = id;
    byId('task-form').reset();
    byId('form-heading').textContent = task ? 'Edit task' : 'Add task';
    byId('task-title').value = task?.title ?? '';
    byId('task-description').value = task?.description ?? '';
    byId('title-error').hidden = true; byId('task-title').removeAttribute('aria-invalid');
    message('form-error');
    dialog.showModal(); byId('task-title').focus();
    message('page-error');
  } catch (error) { message('page-error', error.message); }
}

function saveForm(event) {
  event.preventDefault();
  const title = byId('task-title');
  const invalid = !title.value.trim();
  title.setAttribute('aria-invalid', String(invalid)); byId('title-error').hidden = !invalid;
  if (invalid) { title.focus(); return; }
  try {
      const description = byId('task-description').value;
      if (editingId) tasks.update(editingId, title.value, description);
      else tasks.add(title.value, description);
      dialog.close();
      if (editingId) showDetail(editingId);
      else showList();
  } catch (error) { message('form-error', error.message); }
}

byId('add-task').addEventListener('click', () => openForm());
byId('edit-task').addEventListener('click', () => openForm(selectedId));
byId('back').addEventListener('click', () => showList(selectedId));
byId('task-form').addEventListener('submit', saveForm);
byId('cancel-form').addEventListener('click', () => dialog.close());
for (const button of document.querySelectorAll('[data-filter]')) {
  button.addEventListener('click', () => { filter = button.dataset.filter; showList(); });
}
byId('toggle-task').addEventListener('click', () => {
  try { tasks.toggle(selectedId); showDetail(selectedId, false); }
  catch (error) { message('page-error', error.message); }
});
byId('delete-task').addEventListener('click', () => {
  message('delete-error'); deleteDialog.showModal();
});
byId('cancel-delete').addEventListener('click', () => deleteDialog.close());
byId('confirm-delete').addEventListener('click', () => {
  try {
      const removedId = selectedId;
      tasks.remove(removedId); deleteDialog.close(); showList(removedId);
  } catch (error) { message('delete-error', error.message); }
});
showList();
