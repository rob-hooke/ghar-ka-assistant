import { beforeAll, afterEach, vi } from 'vitest';

beforeAll(() => {
  process.env.TEST_MODE = 'true';
  process.env.HUE_BRIDGE_IP = '192.168.1.100';
  process.env.HUE_USERNAME = 'test-username-123';
  process.env.LIGHT_ID = '1';
  process.env.PORT = '3001';
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});
