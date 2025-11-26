import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';
import request from 'supertest';
import axios from 'axios';

// Mock axios module
vi.mock('axios');

describe('API Routes - Unit Tests', () => {
  let app;

  beforeAll(async () => {
    // Set up default mocks
    axios.get = vi.fn().mockResolvedValue({
      data: {
        state: { on: true, bri: 254, reachable: true },
        name: 'Living Room 1',
      },
    });

    axios.put = vi.fn().mockResolvedValue({
      data: [{ success: { '/lights/1/state/on': true } }],
    });

    const module = await import('../../../server.js');
    app = module.default;
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mocks to default values
    axios.get.mockResolvedValue({
      data: {
        state: { on: true, bri: 254, reachable: true },
        name: 'Living Room 1',
      },
    });

    axios.put.mockResolvedValue({
      data: [{ success: { '/lights/1/state/on': true } }],
    });
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
