import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';
import request from 'supertest';
import axios from 'axios';
import {
  mockAllLights,
  mockControlSuccess,
  mockControlError,
} from '../../fixtures/hue-responses.js';

// Mock axios module
vi.mock('axios');

describe('API Routes - Unit Tests', () => {
  let app;

  beforeAll(async () => {
    // Set up default mocks for lights endpoint
    axios.get = vi.fn().mockResolvedValue({
      data: mockAllLights,
    });

    axios.put = vi.fn().mockResolvedValue({
      data: mockControlSuccess,
    });

    const module = await import('../../../server.js');
    app = module.default;
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mocks to default values
    axios.get.mockResolvedValue({
      data: mockAllLights,
    });

    axios.put.mockResolvedValue({
      data: mockControlSuccess,
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
    });

    it('should not include lightID in response', async () => {
      const response = await request(app).get('/health');
      expect(response.body).not.toHaveProperty('lightID');
    });
  });

  describe('GET /lights', () => {
    it('should return all lights with normalized format', async () => {
      const response = await request(app).get('/lights');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.lights).toHaveLength(3);
    });

    it('should transform lights to array with correct properties', async () => {
      const response = await request(app).get('/lights');
      const light = response.body.lights[0];

      expect(light).toHaveProperty('id', '1');
      expect(light).toHaveProperty('name', 'Living Room 1');
      expect(light).toHaveProperty('isOn', true);
      expect(light).toHaveProperty('brightness', 254);
      expect(light).toHaveProperty('reachable', true);
      expect(light).toHaveProperty('type', 'Extended color light');
    });

    it('should include lights with different states', async () => {
      const response = await request(app).get('/lights');
      const { lights } = response.body;

      // Light 1 is on
      const light1 = lights.find((l) => l.id === '1');
      expect(light1.isOn).toBe(true);

      // Light 2 is off
      const light2 = lights.find((l) => l.id === '2');
      expect(light2.isOn).toBe(false);

      // Light 3 is unreachable
      const light3 = lights.find((l) => l.id === '3');
      expect(light3.reachable).toBe(false);
    });

    it('should handle empty lights response', async () => {
      axios.get.mockResolvedValueOnce({ data: {} });

      const response = await request(app).get('/lights');

      expect(response.status).toBe(200);
      expect(response.body.lights).toHaveLength(0);
    });

    it('should handle bridge errors', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      const response = await request(app).get('/lights');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to get lights');
    });
  });

  describe('POST /lights/:id/control', () => {
    it('should turn on a specific light', async () => {
      const response = await request(app).post('/lights/2/control').send({ on: true });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.lightId).toBe('2');
      expect(response.body.isOn).toBe(true);
      expect(response.body.message).toBe('Light 2 turned on');
    });

    it('should turn off a specific light', async () => {
      axios.put.mockResolvedValueOnce({
        data: [{ success: { '/lights/3/state/on': false } }],
      });

      const response = await request(app).post('/lights/3/control').send({ on: false });

      expect(response.status).toBe(200);
      expect(response.body.isOn).toBe(false);
      expect(response.body.message).toBe('Light 3 turned off');
    });

    it('should validate boolean input - reject string', async () => {
      const response = await request(app).post('/lights/1/control').send({ on: 'true' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('must be a boolean');
    });

    it('should validate boolean input - reject number', async () => {
      const response = await request(app).post('/lights/1/control').send({ on: 1 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate boolean input - reject missing', async () => {
      const response = await request(app).post('/lights/1/control').send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle Hue bridge errors', async () => {
      axios.put.mockResolvedValueOnce({
        data: mockControlError,
      });

      const response = await request(app).post('/lights/99/control').send({ on: true });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not available');
    });

    it('should handle network errors', async () => {
      axios.put.mockRejectedValueOnce(new Error('Connection refused'));

      const response = await request(app).post('/lights/1/control').send({ on: true });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to control light');
    });
  });
});
