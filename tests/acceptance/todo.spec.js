import { test, expect } from '@playwright/test';
import { addTask, openTask, assertVisuals, assertModalKeyboard, failWrites, restoreWrites, keyboardActivate } from './helpers.js';

test.beforeEach(async ({ page }) => { await page.goto('/'); });

test('SC001: fixed Read chapter walkthrough from ready list', async ({ page }, info) => {
  const add = page.getByRole('button', { name: 'Add task', exact: true });
  await expect(add).toBeVisible();
  const start = Date.now();
  await add.click(); await page.keyboard.type('Read chapter');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await openTask(page, 'Read chapter');
  await expect(page.getByRole('heading', { name: 'Read chapter', exact: true })).toBeVisible();
  await expect(page.locator('#detail-status')).toHaveText('Pending');
  const elapsed = Date.now() - start;
  expect(elapsed).toBeLessThan(60000);
  console.log(`SC001 ${info.project.name}: ${elapsed}ms (scripted keyboard walkthrough)`);
});

test('US1: identity, creation, validation, cancel, detail and optional description', async ({ page }) => {
  await expect(page).toHaveTitle('Curso-PSWE-07');
  await expect(page.getByRole('banner')).toContainText('Curso-PSWE-07');
  await expect(page.getByText('No tasks yet', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Add task', exact: true }).click();
  await page.getByLabel('Title', { exact: true }).fill('  ');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Please enter a title.', { exact: true })).toBeVisible();
  await page.getByLabel('Title', { exact: true }).fill('Read chapter');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await openTask(page, 'Read chapter');
  await expect(page.getByRole('heading', { name: 'Read chapter', exact: true })).toBeVisible();
  await expect(page.getByText('No description', { exact: true })).toBeVisible();
  await expect(page.locator('#detail-status')).toHaveText('Pending');
  for (const name of ['Edit','Mark as done','Delete']) await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Back to tasks' }).click();
  await page.getByRole('button', { name: 'Add task', exact: true }).click();
  await page.getByLabel('Title', { exact: true }).fill('Cancelled');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Open task: Cancelled' })).toHaveCount(0);
});

test('US1: early visual/accessibility checks on list/detail/add form and literal long text', async ({ page }) => {
  await assertVisuals(page);
  const add = page.getByRole('button', { name: 'Add task', exact: true });
  await expect(add).toBeInViewport();
  await add.focus(); await page.keyboard.press('Enter');
  await assertModalKeyboard(page, 'Title');
  await assertVisuals(page);
  await page.keyboard.press('Escape');
  await expect(add).toBeFocused();
  const title = 'A long task title '.repeat(12);
  await addTask(page, title, '<script>alert("unsafe")</script>\nAnother line');
  await assertVisuals(page);
  await openTask(page, title.trim());
  await expect(page.getByText('<script>alert("unsafe")</script>\nAnother line', { exact: true })).toBeVisible();
  await expect(page.locator('main script')).toHaveCount(0);
  const heading = page.getByRole('heading', { name: title.trim(), exact: true });
  const description = page.locator('#detail-description');
  const sizes = await heading.evaluate((node) => {
    const desc = document.getElementById('detail-description');
    return [parseFloat(window.getComputedStyle(node).fontSize), parseFloat(window.getComputedStyle(desc).fontSize),
      parseInt(window.getComputedStyle(node).fontWeight), parseInt(window.getComputedStyle(desc).fontWeight),
      node.getBoundingClientRect().bottom, desc.getBoundingClientRect().top];
  });
  expect(sizes[0]).toBeGreaterThan(sizes[1]); expect(sizes[2]).toBeGreaterThan(sizes[3]); expect(sizes[4]).toBeLessThanOrEqual(sizes[5]);
  await expect(description).toBeVisible(); await assertVisuals(page);
  await page.getByRole('button', { name: 'Back to tasks' }).click();
  expect(await page.locator(':focus').count()).toBe(1);
});

test('US5: failed Save retains input; deliberate retry saves once; cancellation is non-destructive', async ({ page }) => {
  await failWrites(page);
  await page.getByRole('button', { name: 'Add task', exact: true }).click();
  await page.getByLabel('Title', { exact: true }).fill('Keep my draft');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Could not save');
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Keep my draft');
  expect(await page.evaluate(() => window.__writeAttempts)).toBe(1);
  await restoreWrites(page);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Open task: Keep my draft' })).toHaveCount(1);
  await failWrites(page);
  await page.getByRole('button', { name: 'Add task', exact: true }).click();
  await page.getByLabel('Title', { exact: true }).fill('Cancel draft');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Could not save');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  expect(await page.evaluate(() => window.__writeAttempts)).toBe(1);
  await expect(page.getByRole('button', { name: /^Open task:/ })).toHaveCount(1);
});

test('US5: denied read blocks writes; corrected access plus reload restores original data', async ({ page }) => {
  await addTask(page, 'Existing task', 'Retain this');
  await page.addInitScript(() => {
    if (window.name !== 'access-restored') {
      Storage.prototype.getItem = () => { throw Error('Denied'); };
    }
  });
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('could not be read');
  await expect(page.getByRole('button', { name: 'Add task', exact: true })).toBeDisabled();
  await expect(page.getByText('No tasks yet', { exact: true })).not.toBeVisible();
  await page.evaluate(() => { window.name = 'access-restored'; });
  await page.reload();
  await openTask(page, 'Existing task');
  await expect(page.getByText('Retain this', { exact: true })).toBeVisible();
});

for (const raw of ['malformed data', '[{"title":"Invalid record"}]']) {
  test(`US5: unreadable records are preserved: ${raw}`, async ({ page }) => {
    await page.evaluate(raw => window.localStorage.setItem('curso-pswe-07.tasks', raw), raw);
    await page.reload();
    await expect(page.getByRole('alert')).toContainText('could not be read');
    await expect(page.getByRole('button', { name: 'Add task', exact: true })).toBeDisabled();
    expect(await page.evaluate(() => window.localStorage.getItem('curso-pswe-07.tasks'))).toBe(raw);
  });
}

test('US2: exact filters, active state, completed appearance and retained no-match state', async ({ page }) => {
  await addTask(page, 'Study'); await addTask(page, 'Practice');
  await page.evaluate(() => {
    const records = JSON.parse(window.localStorage.getItem('curso-pswe-07.tasks'));
    records[0].done = true; window.localStorage.setItem('curso-pswe-07.tasks', JSON.stringify(records));
  });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Open task: Study' }).locator('.task-title')).toHaveCSS('text-decoration-line', 'line-through');
  await assertVisuals(page);
  await page.getByRole('button', { name: 'Pending', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pending', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Open task: Study' })).toHaveCount(0);
  await openTask(page, 'Practice');
  await page.getByRole('button', { name: 'Mark as done', exact: true }).click();
  await expect(page.locator('#detail-status')).toHaveText('Done');
  await page.getByRole('button', { name: 'Back to tasks' }).click();
  await expect(page.getByText('No pending tasks', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(page.getByRole('button', { name: /^Open task:/ })).toHaveCount(2);
  for (const title of ['Study','Practice']) {
    await openTask(page, title);
    await page.getByRole('button', { name: 'Mark as not done', exact: true }).click();
    await expect(page.locator('#detail-status')).toHaveText('Pending');
    await page.getByRole('button', { name: 'Back to tasks' }).click();
  }
  await expect(page.getByText('No completed tasks yet', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await expect(page.getByRole('button', { name: /^Open task:/ })).toHaveCount(2);
});

test('US2: completion failure preserves state, Back is safe, and existing action retries once', async ({ page }) => {
  await addTask(page, 'Retry completion'); await openTask(page, 'Retry completion');
  await failWrites(page);
  await page.getByRole('button', { name: 'Mark as done', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Could not save');
  await expect(page.locator('#detail-status')).toHaveText('Pending');
  expect(await page.evaluate(() => window.__writeAttempts)).toBe(1);
  await page.getByRole('button', { name: 'Back to tasks' }).click();
  await openTask(page, 'Retry completion');
  await expect(page.locator('#detail-status')).toHaveText('Pending');
  await restoreWrites(page);
  const action = page.getByRole('button', { name: 'Mark as done', exact: true });
  await action.focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Mark as not done', exact: true })).toBeFocused();
  await expect(page.locator('#detail-status')).toHaveText('Done');
});

test('US3: shared edit form, prefill, validation, cancel, save and clear description', async ({ page }) => {
  await addTask(page, 'Original', 'Before'); await openTask(page, 'Original');
  await page.getByRole('button', { name: 'Mark as done', exact: true }).click();
  const edit = page.getByRole('button', { name: 'Edit', exact: true });
  await edit.click();
  await expect(page.getByRole('dialog', { name: 'Edit task' })).toBeVisible();
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Original');
  await expect(page.getByLabel('Description (optional)')).toHaveValue('Before');
  await assertModalKeyboard(page, 'Title'); await assertVisuals(page);
  await page.getByLabel('Title', { exact: true }).fill('Discard');
  await page.keyboard.press('Escape'); await expect(edit).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Original', exact: true })).toBeVisible();
  await edit.click(); await page.getByLabel('Title', { exact: true }).fill('   ');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Please enter a title.', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Description (optional)')).toHaveValue('Before');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await edit.click();
  await page.getByLabel('Title', { exact: true }).fill('Revised');
  await page.getByLabel('Description (optional)').fill('After\nMultiline');
  await assertVisuals(page);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Revised', exact: true })).toBeVisible();
  await expect(page.getByText('After\nMultiline', { exact: true })).toBeVisible();
  await expect(page.locator('#detail-status')).toHaveText('Done');
  await edit.click(); await page.getByLabel('Description (optional)').fill('');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('No description', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Back to tasks' }).click();
  await expect(page.getByRole('button', { name: /^Open task:/ })).toHaveCount(1);
});

test('US3: failed edit retains fields and status until deliberate successful retry', async ({ page }) => {
  await addTask(page, 'Before retry', 'Keep'); await openTask(page, 'Before retry');
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Title', { exact: true }).fill('After retry');
  await failWrites(page);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Could not save');
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue('After retry');
  expect(await page.evaluate(() => window.__writeAttempts)).toBe(1);
  await restoreWrites(page);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'After retry', exact: true })).toBeVisible();
  await expect(page.locator('#detail-status')).toHaveText('Pending');
  await page.getByRole('button', { name: 'Back to tasks' }).click();
  await expect(page.getByRole('button', { name: /^Open task:/ })).toHaveCount(1);
});

test('FR015: read access lost before detail/edit is reported without changing data', async ({ page }) => {
  await addTask(page, 'Guarded read');
  await page.evaluate(() => {
    window.__nativeGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = () => { throw Error('Read denied'); };
  });
  await openTask(page, 'Guarded read');
  await expect(page.getByRole('alert')).toContainText('could not be read');
  await page.evaluate(() => { Storage.prototype.getItem = window.__nativeGetItem; });
  await openTask(page, 'Guarded read');
  await page.evaluate(() => { Storage.prototype.getItem = () => { throw Error('Read denied'); }; });
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('could not be read');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.evaluate(() => { Storage.prototype.getItem = window.__nativeGetItem; });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Open task: Guarded read' })).toHaveCount(1);
});

test('US4: destructive confirmation, Cancel/Escape, accessible dialog and final-match deletion', async ({ page }) => {
  await addTask(page, 'First'); await addTask(page, 'Second');
  await page.getByRole('button', { name: 'Pending', exact: true }).click();
  await openTask(page, 'First');
  const remove = page.getByRole('button', { name: 'Delete', exact: true });
  await remove.click();
  const confirmation = page.getByRole('dialog', { name: 'Delete task?' });
  await expect(confirmation).toBeVisible();
  await assertModalKeyboard(page, confirmation.getByRole('button', { name: 'Cancel' }));
  await assertVisuals(page);
  const color = await confirmation.getByRole('button', { name: 'Delete', exact: true }).evaluate(node => window.getComputedStyle(node).backgroundColor.match(/\d+/g).map(Number));
  expect(color[0]).toBeGreaterThan(color[1]); expect(color[0]).toBeGreaterThan(color[2]);
  await confirmation.getByRole('button', { name: 'Cancel' }).click();
  await expect(remove).toBeFocused();
  await expect(page.getByRole('heading', { name: 'First', exact: true })).toBeVisible();
  await remove.click(); await page.keyboard.press('Escape'); await expect(remove).toBeFocused();
  await remove.click(); await confirmation.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your tasks', exact: true })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Pending', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Open task: First' })).toHaveCount(0);
  await openTask(page, 'Second'); await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await confirmation.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.getByText('No pending tasks', { exact: true })).toBeVisible();
  await page.reload(); await expect(page.getByText('No tasks yet', { exact: true })).toBeVisible();
});

test('US4: failed deletion keeps confirmation and data; same control retries after restored access', async ({ page }) => {
  await addTask(page, 'Retry deletion'); await addTask(page, 'Keep');
  await openTask(page, 'Retry deletion'); await failWrites(page);
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  const confirmation = page.getByRole('dialog', { name: 'Delete task?' });
  await expect(confirmation).toBeVisible();
  await confirmation.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(confirmation.getByRole('alert')).toContainText('Could not save');
  expect(await page.evaluate(() => window.__writeAttempts)).toBe(1);
  await restoreWrites(page);
  await confirmation.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.getByRole('button', { name: /^Open task:/ })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Open task: Keep' })).toBeVisible();
  await openTask(page, 'Keep'); await failWrites(page);
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await confirmation.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(confirmation.getByRole('alert')).toContainText('Could not save');
  await confirmation.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('heading', { name: 'Keep', exact: true })).toBeVisible();
  expect(await page.evaluate(() => window.__writeAttempts)).toBe(1);
});

test('SC006: whole create/view/edit/toggle/filter/cancel/delete journey with keyboard only', async ({ page }) => {
  await keyboardActivate(page, page.getByRole('button', { name: 'Add task', exact: true }));
  await page.keyboard.type('Keyboard task');
  await keyboardActivate(page, page.getByRole('button', { name: 'Save', exact: true }));
  await keyboardActivate(page, page.getByRole('button', { name: 'Open task: Keyboard task', exact: true }));
  await keyboardActivate(page, page.getByRole('button', { name: 'Edit', exact: true }));
  await page.keyboard.press('ControlOrMeta+A'); await page.keyboard.type('Keyboard revised');
  await keyboardActivate(page, page.getByRole('button', { name: 'Save', exact: true }));
  await keyboardActivate(page, page.getByRole('button', { name: 'Mark as done', exact: true }));
  await keyboardActivate(page, page.getByRole('button', { name: 'Back to tasks' }));
  await keyboardActivate(page, page.getByRole('button', { name: 'Done', exact: true }));
  await keyboardActivate(page, page.getByRole('button', { name: 'Open task: Keyboard revised', exact: true }));
  await keyboardActivate(page, page.getByRole('button', { name: 'Delete', exact: true }));
  const confirmation = page.getByRole('dialog', { name: 'Delete task?' });
  await keyboardActivate(page, confirmation.getByRole('button', { name: 'Cancel', exact: true }));
  await keyboardActivate(page, page.getByRole('button', { name: 'Delete', exact: true }));
  await keyboardActivate(page, confirmation.getByRole('button', { name: 'Delete', exact: true }));
  await expect(page.getByText('No completed tasks yet', { exact: true })).toBeVisible();
  await keyboardActivate(page, page.getByRole('button', { name: 'All', exact: true }));
  await expect(page.getByText('No tasks yet', { exact: true })).toBeVisible();
});
