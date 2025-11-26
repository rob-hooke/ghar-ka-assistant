import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';

// Mock axios to simulate bridge errors
vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockRejectedValue(new Error('ETIMEDOUT')),
    put: vi.fn().mockRejectedValue(new Error('ETIMEDOUT')),
  },
}));

describe('Hue Bridge Error Scenarios', () => {
  let app;

  beforeAll(async () => {
    const module = await import('../../server.js');
    app = module.default;
  });

  it('should handle timeout on status request', async () => {
    const response = await request(app).get('/status');
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });

  it('should handle timeout on control request', async () => {
    const response = await request(app).post('/control').send({ on: true });
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });
});
