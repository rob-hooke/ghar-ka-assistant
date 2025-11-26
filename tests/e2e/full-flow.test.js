import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';

// Mock axios for e2e tests
vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: {
        state: { on: true, bri: 254, reachable: true },
        name: 'Test Light',
      },
    }),
    put: vi.fn().mockResolvedValue({
      data: [{ success: { '/lights/1/state/on': true } }],
    }),
  },
}));

describe('End-to-End - Complete User Flow', () => {
  let app;

  beforeAll(async () => {
    const module = await import('../../server.js');
    app = module.default;
  });

  it('should complete full bulb control workflow', async () => {
    // Health check
    const health = await request(app).get('/health');
    expect(health.status).toBe(200);

    // Get initial status
    const status1 = await request(app).get('/status');
    expect(status1.body.success).toBe(true);

    // Turn light on
    const turnOn = await request(app).post('/control').send({ on: true });
    expect(turnOn.body.success).toBe(true);

    // Get all lights
    const lights = await request(app).get('/lights');
    expect(lights.body.success).toBe(true);
  });
});
