import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/acceptance',
  fullyParallel: true,
  workers: 2,
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1280, height: 900 } } },
    { name: 'mobile', use: { browserName: 'chromium', viewport: { width: 360, height: 800 } } },
  ],
  webServer: { command: 'node scripts/serve.js', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI },
});
