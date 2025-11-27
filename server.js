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

// Route to control a specific light by ID (on/off)
app.post('/lights/:id/control', async (req, res) => {
  try {
    const { id } = req.params;
    const { on } = req.body;

    // Validate that 'on' is a boolean
    if (typeof on !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: "on" must be a boolean',
      });
    }

    const response = await axios.put(`${HUE_API_BASE}/lights/${id}/state`, { on });

    // Check if the Hue bridge returned any errors
    if (response.data[0] && response.data[0].error) {
      return res.status(400).json({
        success: false,
        error: response.data[0].error.description,
      });
    }

    res.json({
      success: true,
      lightId: id,
      isOn: on,
      message: `Light ${id} turned ${on ? 'on' : 'off'}`,
    });
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
