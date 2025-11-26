import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';

// Mock axios before importing server
vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  return {
    default: {
      ...actual.default,
      get: vi.fn().mockResolvedValue({
        data: {
          state: { on: true, bri: 254, reachable: true },
          name: 'Living Room 1',
        },
      }),
      put: vi.fn().mockResolvedValue({
        data: [{ success: { '/lights/1/state/on': true } }],
      }),
    },
  };
});

describe('API Routes - Unit Tests', () => {
  let app;

  beforeAll(async () => {
    const module = await import('../../../server.js');
    app = module.default;
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
    });
  });

  describe('GET /status', () => {
    it('should return light status successfully', async () => {
      const response = await request(app).get('/status');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /control', () => {
    it('should validate boolean input', async () => {
      const response = await request(app).post('/control').send({ on: 'invalid' });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
