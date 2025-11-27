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

  it('should handle timeout on lights list request', async () => {
    const response = await request(app).get('/lights');
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Failed to get lights');
  });

  it('should handle timeout on light control request', async () => {
    const response = await request(app).post('/lights/1/control').send({ on: true });
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Failed to control light');
  });

  it('should still respond to health check during bridge timeout', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
