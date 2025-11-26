# Philips Hue Bulb Control

A simple local web interface to control your Philips Hue bulb (on/off).

## Prerequisites

- Node.js installed (v14 or higher)
- Philips Hue Bridge on your local network
- Hue Bridge IP address
- Hue Bridge username (API key)

## Getting Your Hue Bridge Credentials

### 1. Find Your Bridge IP Address

Visit [https://discovery.meethue.com](https://discovery.meethue.com) or check your router's connected devices.

### 2. Create a Username (API Key)

1. Press the physical button on your Hue Bridge
2. Within 30 seconds, run this command (replace `YOUR_BRIDGE_IP` with your actual IP):

```bash
curl -X POST http://YOUR_BRIDGE_IP/api -d '{"devicetype":"hue_control_app"}'
```

3. You'll receive a response like:
```json
[{"success":{"username":"1234567890abcdef1234567890abcdef"}}]
```

4. Save this username - you'll need it for the `.env` file

### 3. Find Your Light ID

```bash
curl http://YOUR_BRIDGE_IP/api/YOUR_USERNAME/lights
```

This will show all your lights with their IDs.

## Setup

1. Install dependencies:
```bash
cd ~/Desktop/homeassistant
npm install
```

2. Configure your `.env` file with your Hue Bridge details:
```
HUE_BRIDGE_IP=192.168.1.xxx
HUE_USERNAME=your-hue-username-here
LIGHT_ID=1
```

3. Start the server:
```bash
npm start
```

4. Open your browser and go to:
```
http://localhost:3000
```

## Usage

The webpage provides two buttons:
- **Turn On** - Turns your Philips Hue bulb on
- **Turn Off** - Turns your Philips Hue bulb off

The bulb status is automatically refreshed every 5 seconds.

## Project Structure

```
homeassistant/
├── index.html      # Web interface
├── server.js       # Node.js backend server
├── package.json    # Project dependencies
├── .env           # Configuration (not tracked in git)
├── .gitignore     # Git ignore rules
└── README.md      # This file
```

## API Endpoints

- `GET /status` - Get current bulb status
- `POST /control` - Control bulb (send `{"on": true}` or `{"on": false}`)
- `GET /lights` - Get all lights (debugging)
- `GET /health` - Health check

## Troubleshooting

**Server won't start:**
- Make sure you've configured the `.env` file correctly
- Check that your Bridge IP and username are correct

**Can't control the bulb:**
- Verify the LIGHT_ID in your `.env` file matches your bulb
- Make sure your Hue Bridge is powered on and connected
- Check that you're on the same network as the Bridge

**Connection errors:**
- Ensure the Hue Bridge is reachable from your computer
- Try pinging the Bridge IP: `ping YOUR_BRIDGE_IP`

## Development

To run with auto-restart on file changes:
```bash
npm run dev
```
