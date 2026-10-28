import { test, expect, chromium } from '@playwright/test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { addTask, openTask } from './helpers.js';

test('US5: UI-created and representative saved tasks survive three actual browser relaunches', async ({}, info) => {
  const profile = await mkdtemp(join(tmpdir(), 'curso-profile-'));
  let context;
  try {
    context = await chromium.launchPersistentContext(profile, { headless: true, viewport: info.project.use.viewport });
    let page = await context.newPage(); await page.goto('http://127.0.0.1:4173');
    await addTask(page, 'Created through UI', 'Persist this');
    await page.evaluate(() => {
      const tasks = JSON.parse(window.localStorage.getItem('curso-pswe-07.tasks'));
      tasks.push({ id: 'kept', title: 'Revised snapshot', description: 'Updated\nDescription', done: true },
        { id: 'removed', title: 'Removed snapshot', description: '', done: false });
      window.localStorage.setItem('curso-pswe-07.tasks', JSON.stringify(tasks));
      window.localStorage.setItem('curso-pswe-07.tasks', JSON.stringify(tasks.filter(task => task.id !== 'removed')));
    });
    for (let cycle = 1; cycle <= 3; cycle++) {
      await context.close();
      context = await chromium.launchPersistentContext(profile, { headless: true, viewport: info.project.use.viewport });
      page = await context.newPage(); await page.goto('http://127.0.0.1:4173');
      await expect(page.getByRole('button', { name: /^Open task:/ })).toHaveCount(2);
      await expect(page.getByRole('button', { name: 'Open task: Removed snapshot' })).toHaveCount(0);
      await openTask(page, 'Revised snapshot');
      await expect(page.locator('#detail-status')).toHaveText('Done');
      await expect(page.getByText('Updated\nDescription', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Back to tasks' }).click();
      await openTask(page, 'Created through UI');
      await expect(page.getByText('Persist this', { exact: true })).toBeVisible();
      console.log(`Standalone persistence ${info.project.name}: browser relaunch ${cycle}/3 passed`);
    }
  } finally {
    await context?.close();
    expect(profile.startsWith(join(tmpdir(), 'curso-profile-'))).toBe(true);
    await rm(profile, { recursive: true, force: true });
  }
});

test('US5 integrated: real UI edit/completion/confirmed deletion persist through three browser relaunches', async ({}, info) => {
  const profile = await mkdtemp(join(tmpdir(), 'curso-profile-'));
  let context;
  try {
    context = await chromium.launchPersistentContext(profile, { headless: true, viewport: info.project.use.viewport });
    let page = await context.newPage(); await page.goto('http://127.0.0.1:4173');
    await addTask(page, 'Original through UI', 'Before'); await openTask(page, 'Original through UI');
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.getByLabel('Title', { exact: true }).fill('Revised through UI');
    await page.getByLabel('Description (optional)').fill('After\nRetained');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await page.getByRole('button', { name: 'Mark as done', exact: true }).click();
    await page.getByRole('button', { name: 'Back to tasks' }).click();
    await addTask(page, 'Removed through UI'); await openTask(page, 'Removed through UI');
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    const confirmation = page.getByRole('dialog', { name: 'Delete task?' });
    await confirmation.getByRole('button', { name: 'Cancel' }).click();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await confirmation.getByRole('button', { name: 'Delete', exact: true }).click();
    await addTask(page, 'Still pending');
    for (let cycle = 1; cycle <= 3; cycle++) {
      await context.close();
      context = await chromium.launchPersistentContext(profile, { headless: true, viewport: info.project.use.viewport });
      page = await context.newPage(); await page.goto('http://127.0.0.1:4173');
      await expect(page.getByRole('button', { name: /^Open task:/ })).toHaveCount(2);
      await expect(page.getByRole('button', { name: 'Open task: Removed through UI' })).toHaveCount(0);
      await openTask(page, 'Revised through UI');
      await expect(page.locator('#detail-status')).toHaveText('Done');
      await expect(page.getByText('After\nRetained', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Back to tasks' }).click();
      await openTask(page, 'Still pending');
      await expect(page.locator('#detail-status')).toHaveText('Pending');
      await expect(page.getByText('No description', { exact: true })).toBeVisible();
      console.log(`Integrated persistence ${info.project.name}: browser relaunch ${cycle}/3 passed`);
    }
  } finally {
    await context?.close();
    expect(profile.startsWith(join(tmpdir(), 'curso-profile-'))).toBe(true);
    await rm(profile, { recursive: true, force: true });
  }
});
