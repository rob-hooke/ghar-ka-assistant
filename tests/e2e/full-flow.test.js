import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { mockAllLights } from '../fixtures/hue-responses.js';

// Mock axios for e2e tests
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe('End-to-End - Multi-Light Control Flow', () => {
  let app;
  let axios;

  beforeAll(async () => {
    axios = (await import('axios')).default;
    const module = await import('../../server.js');
    app = module.default;
  });

  beforeEach(() => {
    // Reset mocks before each test
    axios.get.mockResolvedValue({ data: mockAllLights });
    axios.put.mockResolvedValue({ data: [{ success: { '/lights/1/state/on': true } }] });
  });

  it('should complete full multi-light control workflow', async () => {
    // 1. Health check - verify server is running
    const health = await request(app).get('/health');
    expect(health.status).toBe(200);
    expect(health.body.status).toBe('ok');

    // 2. Get all lights - verify we receive normalized light data
    const lights = await request(app).get('/lights');
    expect(lights.status).toBe(200);
    expect(lights.body.success).toBe(true);
    expect(lights.body.lights).toBeInstanceOf(Array);
    expect(lights.body.lights.length).toBeGreaterThan(0);

    // Verify light structure
    const firstLight = lights.body.lights[0];
    expect(firstLight).toHaveProperty('id');
    expect(firstLight).toHaveProperty('name');
    expect(firstLight).toHaveProperty('isOn');
    expect(firstLight).toHaveProperty('reachable');

    // 3. Control a specific light - turn it on
    const turnOn = await request(app).post('/lights/1/control').send({ on: true });
    expect(turnOn.status).toBe(200);
    expect(turnOn.body.success).toBe(true);
    expect(turnOn.body.lightId).toBe('1');
    expect(turnOn.body.isOn).toBe(true);

    // 4. Control a different light - turn it off
    axios.put.mockResolvedValueOnce({
      data: [{ success: { '/lights/2/state/on': false } }],
    });

    const turnOff = await request(app).post('/lights/2/control').send({ on: false });
    expect(turnOff.status).toBe(200);
    expect(turnOff.body.success).toBe(true);
    expect(turnOff.body.lightId).toBe('2');
    expect(turnOff.body.isOn).toBe(false);

    // 5. Fetch lights again to simulate auto-refresh
    const refreshedLights = await request(app).get('/lights');
    expect(refreshedLights.status).toBe(200);
    expect(refreshedLights.body.success).toBe(true);
  });

  it('should handle lights with different states', async () => {
    const lights = await request(app).get('/lights');

    // Should have lights in different states (on, off, unreachable)
    const lightsArray = lights.body.lights;

    // Find an unreachable light (light 3 in our mock)
    const unreachableLight = lightsArray.find((l) => !l.reachable);
    expect(unreachableLight).toBeTruthy();

    // Find a light that is off (light 2 in our mock)
    const offLight = lightsArray.find((l) => l.reachable && !l.isOn);
    expect(offLight).toBeTruthy();

    // Find a light that is on (light 1 in our mock)
    const onLight = lightsArray.find((l) => l.reachable && l.isOn);
    expect(onLight).toBeTruthy();
  });

  it('should validate control input', async () => {
    // Invalid input should be rejected
    const invalid = await request(app).post('/lights/1/control').send({ on: 'yes' });
    expect(invalid.status).toBe(400);
    expect(invalid.body.success).toBe(false);
  });

  it('should control light brightness', async () => {
    // Set brightness on a light
    axios.put.mockResolvedValueOnce({
      data: [
        { success: { '/lights/1/state/bri': 127 } },
        { success: { '/lights/1/state/on': true } },
      ],
    });

    const setBrightness = await request(app).post('/lights/1/control').send({ bri: 127 });
    expect(setBrightness.status).toBe(200);
    expect(setBrightness.body.success).toBe(true);
    expect(setBrightness.body.brightness).toBe(127);

    // Set brightness and turn on together
    axios.put.mockResolvedValueOnce({
      data: [
        { success: { '/lights/2/state/on': true } },
        { success: { '/lights/2/state/bri': 200 } },
      ],
    });

    const setBoth = await request(app).post('/lights/2/control').send({ on: true, bri: 200 });
    expect(setBoth.status).toBe(200);
    expect(setBoth.body.success).toBe(true);
    expect(setBoth.body.isOn).toBe(true);
    expect(setBoth.body.brightness).toBe(200);
  });
});
