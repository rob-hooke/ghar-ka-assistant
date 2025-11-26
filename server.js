const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Philips Hue configuration
const { HUE_BRIDGE_IP } = process.env;
const { HUE_USERNAME } = process.env;
const LIGHT_ID = process.env.LIGHT_ID || '1';

// Check if required environment variables are set (skip in test mode)
if (!process.env.TEST_MODE && (!HUE_BRIDGE_IP || !HUE_USERNAME)) {
  console.error('Error: HUE_BRIDGE_IP and HUE_USERNAME must be set in .env file');
  console.log('Please configure your .env file with:');
  console.log('HUE_BRIDGE_IP=your.bridge.ip.address');
  console.log('HUE_USERNAME=your-hue-username');
  console.log('LIGHT_ID=1 (optional, defaults to 1)');
  process.exit(1);
}

// Base URL for Hue API
const HUE_API_BASE = `http://${HUE_BRIDGE_IP}/api/${HUE_USERNAME}`;

// Route to get bulb status
app.get('/status', async (req, res) => {
  try {
    const response = await axios.get(`${HUE_API_BASE}/lights/${LIGHT_ID}`);
    const lightData = response.data;

    res.json({
      success: true,
      isOn: lightData.state.on,
      brightness: lightData.state.bri,
      reachable: lightData.state.reachable,
      name: lightData.name,
    });
  } catch (error) {
    console.error('Error getting light status:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get light status',
      details: error.message,
    });
  }
});

// Route to control bulb (on/off)
app.post('/control', async (req, res) => {
  try {
    const { on } = req.body;

    if (typeof on !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: "on" must be a boolean',
      });
    }

    const response = await axios.put(`${HUE_API_BASE}/lights/${LIGHT_ID}/state`, { on });

    // Check if the Hue bridge returned any errors
    if (response.data[0] && response.data[0].error) {
      return res.status(400).json({
        success: false,
        error: response.data[0].error.description,
      });
    }

    res.json({
      success: true,
      isOn: on,
      message: `Light turned ${on ? 'on' : 'off'}`,
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

// Route to get all lights (for debugging)
app.get('/lights', async (req, res) => {
  try {
    const response = await axios.get(`${HUE_API_BASE}/lights`);
    res.json({
      success: true,
      lights: response.data,
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    bridgeIP: HUE_BRIDGE_IP,
    lightID: LIGHT_ID,
  });
});

// Export app for testing
module.exports = app;

// Only start server if run directly (not imported for tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Connected to Hue Bridge at ${HUE_BRIDGE_IP}`);
    console.log(`💡 Controlling light ID: ${LIGHT_ID}`);
    console.log(`\nOpen http://localhost:${PORT} in your browser to control your bulb`);
  });
}
