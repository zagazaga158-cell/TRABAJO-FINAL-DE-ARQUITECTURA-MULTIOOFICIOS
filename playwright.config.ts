import { defineConfig, devices } from '@playwright/test';
import os from 'os';
import path from 'path';

const E2E_PORT = 3101;
const E2E_DATA_DIR = path.join(os.tmpdir(), 'trabajaya-e2e-data');

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 45_000,
  expect: {
    timeout: 10_000
  },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: `http://127.0.0.1:${E2E_PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'npx tsx server.ts',
    url: `http://127.0.0.1:${E2E_PORT}/api/health`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      ...process.env,
      PORT: String(E2E_PORT),
      CONECTA_DATA_DIR: E2E_DATA_DIR,
      DISABLE_HMR: 'true'
    }
  }
});
