import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Philips Hue configuration
const { HUE_BRIDGE_IP } = process.env;
const { HUE_USERNAME } = process.env;

// Check if required environment variables are set (skip in test mode)
if (!process.env.TEST_MODE && (!HUE_BRIDGE_IP || !HUE_USERNAME)) {
  console.error('Error: HUE_BRIDGE_IP and HUE_USERNAME must be set in .env file');
  console.log('Please configure your .env file with:');
  console.log('HUE_BRIDGE_IP=your.bridge.ip.address');
  console.log('HUE_USERNAME=your-hue-username');
  process.exit(1);
}

// Base URL for Hue API
const HUE_API_BASE = `http://${HUE_BRIDGE_IP}/api/${HUE_USERNAME}`;

// Route to get all lights with normalized response format
app.get('/lights', async (req, res) => {
  try {
    const response = await axios.get(`${HUE_API_BASE}/lights`);
    const rawLights = response.data;

    // Transform raw Hue data to array format with IDs for easier frontend consumption
    const lights = Object.entries(rawLights).map(([id, light]) => ({
      id,
      name: light.name,
      isOn: light.state.on,
      brightness: light.state.bri,
      reachable: light.state.reachable,
      type: light.type,
    }));

    res.json({
      success: true,
      lights,
    });
  } catch (error) {
    console.error('Error getting lights:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get lights',
      details: error.message,
    });
  }
});

// Route to control a specific light by ID (on/off and brightness)
app.post('/lights/:id/control', async (req, res) => {
  try {
    const { id } = req.params;
    const { on, bri } = req.body;

    // Build state object for Hue API
    const state = {};

    // Validate and add 'on' parameter if provided
    if (on !== undefined) {
      if (typeof on !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'Invalid request: "on" must be a boolean',
        });
      }
      state.on = on;
    }

    // Validate and add 'bri' (brightness) parameter if provided
    if (bri !== undefined) {
      if (typeof bri !== 'number' || bri < 1 || bri > 254) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request: "bri" must be a number between 1 and 254',
        });
      }
      state.bri = bri;
      // Auto-turn on light when setting brightness (unless explicitly turning off)
      if (on !== false) {
        state.on = true;
      }
    }

    // Require at least one parameter
    if (Object.keys(state).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: must provide "on" or "bri" parameter',
      });
    }

    const response = await axios.put(`${HUE_API_BASE}/lights/${id}/state`, state);

    // Check if the Hue bridge returned any errors
    if (response.data[0] && response.data[0].error) {
      return res.status(400).json({
        success: false,
        error: response.data[0].error.description,
      });
    }

    // Build response with current state
    const responseData = {
      success: true,
      lightId: id,
    };

    if (state.on !== undefined) {
      responseData.isOn = state.on;
    }

    if (state.bri !== undefined) {
      responseData.brightness = state.bri;
    }

    // Create message
    const changes = [];
    if (state.on !== undefined) {
      changes.push(`turned ${state.on ? 'on' : 'off'}`);
    }
    if (state.bri !== undefined) {
      changes.push(`brightness set to ${state.bri}`);
    }
    responseData.message = `Light ${id} ${changes.join(', ')}`;

    res.json(responseData);
  } catch (error) {
    console.error('Error controlling light:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to control light',
      details: error.message,
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    bridgeIP: HUE_BRIDGE_IP,
  });
});

// Export app for testing
export default app;

// Only start server if run directly (not imported for tests)
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Connected to Hue Bridge at ${HUE_BRIDGE_IP}`);
    console.log(`\nOpen http://localhost:${PORT} in your browser to control your lights`);
  });
}
