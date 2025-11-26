import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import dotenv from 'dotenv';

const isRealBridgeTest = process.env.REAL_BRIDGE === 'true';

describe.skipIf(!isRealBridgeTest)('Real Hue Bridge Integration', () => {
  let app;

  beforeAll(async () => {
    delete process.env.TEST_MODE; // Use real credentials
    dotenv.config();

    if (!process.env.HUE_BRIDGE_IP || !process.env.HUE_USERNAME) {
      throw new Error('Real Hue Bridge credentials not configured');
    }

    console.log('⚠️  Testing against REAL Hue Bridge:', process.env.HUE_BRIDGE_IP);
    const module = await import('../../server.js');
    app = module.default;
  });

  it('should connect to real bridge', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
  });

  it('should get real light status', async () => {
    const response = await request(app).get('/status');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
