import { expect } from '@playwright/test';

export async function addTask(page, title, description = '') {
  await page.getByRole('button', { name: 'Add task', exact: true }).click();
  await page.getByLabel('Title', { exact: true }).fill(title);
  await page.getByLabel('Description (optional)').fill(description);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
}
export async function openTask(page, title) {
  await page.getByRole('button', { name: `Open task: ${title}`, exact: true }).click();
}

export async function failWrites(page) {
  await page.evaluate(() => {
    window.__nativeSetItem = Storage.prototype.setItem;
    window.__writeAttempts = 0;
    Storage.prototype.setItem = () => { window.__writeAttempts++; throw Error('Storage full'); };
  });
}
export async function restoreWrites(page) {
  await page.evaluate(() => { Storage.prototype.setItem = window.__nativeSetItem; });
}

export async function keyboardActivate(page, target) {
  for (let step = 0; step < 30; step++) {
    if (await target.evaluate(node => node === document.activeElement)) break;
    await page.keyboard.press('Tab');
  }
  await expect(target).toBeFocused();
  await page.keyboard.press('Enter');
}

export async function assertVisuals(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  for (const control of await page.locator('button,input,textarea').all()) {
    if (!await control.isVisible()) continue;
    const box = await control.boundingBox();
    expect(box.width, await control.getAttribute('id')).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  const violations = await page.evaluate(() => {
    const rgb = color => color.match(/[\d.]+/g).map(Number);
    const luminance = color => rgb(color).slice(0, 3).map(v => {
      const s = v / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4;
    }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
    const errors = [];
    for (const node of document.querySelectorAll('h1,h2,p,label,button,input,textarea,.task-title,.status-label,.optional')) {
      if (!node.getClientRects().length || !node.textContent.trim() && !node.matches('input,textarea')) continue;
      const style = window.getComputedStyle(node);
      let parent = node;
      let background = 'rgb(255,255,255)';
      while (parent) {
        const color = window.getComputedStyle(parent).backgroundColor;
        const values = rgb(color);
        if (values.length === 3 || values[3] === 1) { background = color; break; }
        parent = parent.parentElement;
      }
      const a = luminance(style.color), b = luminance(background);
      const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
      const size = parseFloat(style.fontSize), weight = parseInt(style.fontWeight);
      const minimum = size >= 24 || size >= 18.667 && weight >= 700 ? 3 : 4.5;
      if (ratio + .01 < minimum) errors.push({ text: node.textContent.slice(0, 50), ratio, minimum });
    }
    return errors;
  });
  expect(violations).toEqual([]);
}

export async function assertModalKeyboard(page, firstLabel) {
  const dialog = page.getByRole('dialog');
  const first = typeof firstLabel === 'string' ? page.getByLabel(firstLabel, { exact: true }) : firstLabel;
  await expect(first).toBeFocused();
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press(i % 2 ? 'Shift+Tab' : 'Tab');
    expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true);
  }
  const focused = page.locator(':focus');
  const outline = await focused.evaluate(node => window.getComputedStyle(node).outlineStyle);
  expect(outline).not.toBe('none');
}
