# MacBook Home Server Deployment Guide

This guide will walk you through deploying the Hue Control application to your factory-reset MacBook as a Docker-based home server.

## Prerequisites

- Factory-reset MacBook with internet connection
- Philips Hue Bridge on the same local network
- Hue Bridge IP address and API username

---

## Part 1: MacBook Setup

### Step 1: Install Docker Desktop

1. **Download Docker Desktop:**
   - Open Safari and go to: https://www.docker.com/products/docker-desktop/
   - Click "Download for Mac"
   - Choose your Mac type (Apple Silicon or Intel)

2. **Install Docker:**
   - Open the downloaded `.dmg` file
   - Drag Docker.app to Applications folder
   - Launch Docker Desktop from Applications
   - Accept the service agreement
   - Allow privileged access when prompted (required for networking)

3. **Configure Docker Desktop:**
   - Open Docker Desktop preferences (top menu bar icon → Settings)
   - Go to **General**:
     - ✅ Check "Start Docker Desktop when you log in"
     - ✅ Use recommended settings
   - Go to **Resources**:
     - Use defaults (sufficient for this app)
   - Click "Apply & Restart"

4. **Verify Installation:**

   ```bash
   # Open Terminal (Applications → Utilities → Terminal)
   docker --version
   # Should show: Docker version 24.x.x or higher

   docker-compose --version
   # Should show: Docker Compose version v2.x.x or higher

   docker run hello-world
   # Should download and run a test container successfully
   ```

### Step 2: Set Custom Hostname (Optional but Recommended)

This allows you to access the app via `http://hue-server.local:3000` instead of an IP address.

```bash
# Open Terminal and run these commands:
sudo scutil --set ComputerName "HueServer"
sudo scutil --set LocalHostName "hue-server"
sudo scutil --set HostName "hue-server.local"

# Verify the hostname:
hostname
# Should show: hue-server.local
```

### Step 3: Get Your MacBook IP Address (For Reference)

```bash
# Find your IP address:
ifconfig | grep "inet " | grep -v 127.0.0.1

# Example output:
# inet 192.168.1.100 netmask 0xffffff00 broadcast 192.168.1.255
#      ^^^^^^^^^^^^^ This is your IP address
```

---

## Part 2: Project Setup

### Step 1: Get the Project Files

If you haven't already, clone or copy the project to your MacBook:

```bash
# Navigate to your Desktop
cd ~/Desktop

# If using git:
git clone https://github.com/rob-hooke/ghar-ka-assistant.git homeassistant
cd homeassistant

# If copying from another machine, ensure the files are at:
# /Users/[your-username]/Desktop/homeassistant
```

### Step 2: Configure Environment Variables

```bash
# Make sure you're in the project directory
cd ~/Desktop/homeassistant

# Create .env file from example
cp .env.example .env

# Edit the .env file
nano .env
```

Update these values in the `.env` file:

```bash
# Replace with your Hue Bridge IP address
HUE_BRIDGE_IP=10.0.0.101

# Replace with your Hue API username
HUE_USERNAME=lMU0pPjQ4KTtPhCu8LiHEJEB9Y33BmNLHsnKfrxd

# Leave these as-is:
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
LOG_FILE=/app/logs/hue-control.log
```

Press `Ctrl+X`, then `Y`, then `Enter` to save and exit.

**Note:** If you don't have a Hue API username yet, see "Getting Hue Credentials" section below.

### Step 3: Verify Hue Bridge Connectivity

```bash
# Test connection to Hue Bridge
ping -c 3 10.0.0.101
# Replace 10.0.0.101 with your actual Hue Bridge IP

# Should see responses like:
# 64 bytes from 10.0.0.101: icmp_seq=0 ttl=64 time=2.123 ms
```

---

## Part 3: Deploy the Application

### Step 1: Build the Docker Image

```bash
# Navigate to project directory
cd ~/Desktop/homeassistant

# Build the Docker image
docker-compose build

# This will take 1-2 minutes the first time
# Expected output:
# Building hue-control
# Step 1/11 : FROM node:20-alpine
# ...
# Successfully built abc123def456
# Successfully tagged homeassistant_hue-control:latest
```

### Step 2: Start the Container

```bash
# Start the container in detached mode (runs in background)
docker-compose up -d

# Expected output:
# Creating network "homeassistant_hue-network" with the default driver
# Creating hue-control ... done
```

### Step 3: Verify Deployment

```bash
# 1. Check if container is running
docker ps | grep hue-control

# Expected output:
# abc123  homeassistant_hue-control  Up X seconds (healthy)  0.0.0.0:3000->3000/tcp  hue-control

# 2. Check container logs
docker logs hue-control

# Expected output:
# 2025-11-29 14:45:00 [INFO] Server started on port 3000
# 2025-11-29 14:45:00 [INFO] Connected to Hue Bridge at 10.0.0.101
# 🚀 Server running on http://localhost:3000
# 📡 Connected to Hue Bridge at 10.0.0.101

# 3. Test health endpoint
curl http://localhost:3000/health

# Expected output:
# {"status":"ok","bridgeIP":"10.0.0.101"}

# 4. Test lights endpoint
curl http://localhost:3000/lights

# Expected output:
# {"success":true,"lights":[...]}
```

---

## Part 4: Access the Application

### From the MacBook Itself:

```bash
# Open in browser
open http://localhost:3000

# Or manually open Safari and go to:
# http://localhost:3000
```

### From Other Devices on Your Network:

**Using mDNS (.local domain):**

1. **From iPhone/iPad:**
   - Connect to same Wi-Fi network
   - Open Safari
   - Navigate to: `http://hue-server.local:3000`

2. **From Windows PC:**
   - Ping test: `ping hue-server.local`
   - Open Chrome/Edge: `http://hue-server.local:3000`

3. **From Mac/Linux:**
   - Open browser: `http://hue-server.local:3000`

4. **From Android:**
   - Connect to Wi-Fi
   - Open Chrome: `http://hue-server.local:3000`

**Using IP Address (if mDNS doesn't work):**

- Use: `http://192.168.1.100:3000`
- Replace `192.168.1.100` with your MacBook's actual IP (from Step 3 of Part 1)

---

## Part 5: Verify Everything Works

### Test Checklist:

- [ ] Web interface loads on MacBook
- [ ] All lights are displayed in grid layout
- [ ] Can toggle lights on/off
- [ ] Brightness sliders work
- [ ] Can access from phone/tablet on same network
- [ ] Unreachable lights are grayed out (if any)

### Test Auto-Start on Boot:

```bash
# Restart your MacBook
sudo reboot

# After restart (wait 2 minutes for everything to boot):
# Open Terminal and check if container is running
docker ps | grep hue-control

# Should show the container running automatically
```

---

## Part 6: View Logs

### Docker Logs (Console Output):

```bash
# View recent logs
docker logs hue-control

# Follow logs in real-time
docker logs -f hue-control

# Last 100 lines
docker logs --tail 100 hue-control

# Since 30 minutes ago
docker logs --since 30m hue-control
```

### Application Logs (Light Commands):

```bash
# Navigate to logs directory
cd ~/Desktop/homeassistant/logs

# View today's log file
cat hue-control-2025-11-29.log

# Follow logs in real-time
tail -f hue-control-*.log

# Search for errors
grep ERROR hue-control-*.log

# View specific light actions
grep "Light 1" hue-control-*.log
```

**Log Format Example:**

```
2025-11-29 14:45:23 [INFO] Server started on port 3000
2025-11-29 14:45:23 [INFO] Connected to Hue Bridge at 10.0.0.101
2025-11-29 14:45:30 [INFO] Fetched 8 lights from Hue Bridge
2025-11-29 14:46:15 [INFO] Light 6 - Light 6 turned on
2025-11-29 14:46:25 [INFO] Light 6 - Light 6 turned on, brightness set to 200
2025-11-29 14:47:10 [INFO] Light 6 - Light 6 turned off
```

---

## Common Management Commands

### Starting/Stopping the Application:

```bash
# Stop the container
docker-compose down

# Start the container
docker-compose up -d

# Restart the container
docker-compose restart

# View container status
docker-compose ps
```

### Updating the Application:

```bash
# Pull latest code (if using git)
cd ~/Desktop/homeassistant
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Verify update
docker logs hue-control --tail 50
```

### Checking Health Status:

```bash
# Container health
docker ps
# Look for "(healthy)" in STATUS column

# Detailed health info
docker inspect --format='{{.State.Health.Status}}' hue-control

# Resource usage
docker stats hue-control
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs for errors
docker logs hue-control

# Common causes:

# 1. .env file missing or incorrect
cat .env
# Verify HUE_BRIDGE_IP and HUE_USERNAME are set

# 2. Port 3000 already in use
lsof -i :3000
# If something is using port 3000, change PORT in .env

# 3. Docker not running
docker ps
# If error, open Docker Desktop application

# 4. Build failed
docker-compose build --no-cache
```

### Can't Access from Other Devices

```bash
# 1. Verify MacBook and other device are on same Wi-Fi
# 2. Check macOS firewall settings:
#    System Preferences → Security & Privacy → Firewall
#    Ensure Docker is allowed

# 3. Test with IP instead of .local:
#    http://192.168.1.100:3000

# 4. Verify port binding:
docker port hue-control
# Should show: 3000/tcp -> 0.0.0.0:3000
```

### Lights Not Responding

```bash
# 1. Verify Hue Bridge connectivity from container
docker exec hue-control ping -c 3 10.0.0.101

# 2. Check environment variables
docker exec hue-control sh -c 'echo $HUE_BRIDGE_IP'
docker exec hue-control sh -c 'echo $HUE_USERNAME'

# 3. Test Hue API directly
curl http://10.0.0.101/api/YOUR_USERNAME/lights

# 4. Restart container
docker-compose restart
```

### Health Check Failing

```bash
# Test health endpoint manually
curl http://localhost:3000/health

# From inside container
docker exec hue-control wget -qO- http://localhost:3000/health

# View health logs
docker inspect hue-control | grep -i health -A 10
```

---

## Getting Hue Credentials

If you don't have your Hue Bridge IP and username yet:

### Find Hue Bridge IP:

**Method 1: Philips Hue App**

- Open Hue app on phone
- Go to Settings → Hue Bridges → [Your Bridge]
- Note the IP address

**Method 2: Router Admin Panel**

- Look for device named "Philips-hue" or similar
- Note its IP address

**Method 3: Network Scan**

```bash
# On macOS, use:
dns-sd -B _hue._tcp
```

### Get Hue API Username:

1. **Press the Link Button on Your Hue Bridge**
   - Physical button on top of the bridge
   - You have 30 seconds to complete next step

2. **Create API User:**

   ```bash
   # Replace BRIDGE_IP with your actual bridge IP
   curl -X POST -d '{"devicetype":"hue_control_app"}' \
     http://BRIDGE_IP/api

   # Example response:
   # [{"success":{"username":"lMU0pPjQ4KTtPhCu8LiHEJEB9Y33BmNLHsnKfrxd"}}]

   # Copy the username value to your .env file
   ```

---

## Optional Enhancements

### Install Portainer (Docker Management GUI)

```bash
docker run -d -p 9000:9000 --name portainer \
  --restart=unless-stopped \
  -v /var/run/docker.sock:/var/run/docker.sock \
  portainer/portainer-ce

# Access at: http://hue-server.local:9000
```

### Set Static IP for MacBook

1. Go to System Preferences → Network
2. Select your connection (Wi-Fi or Ethernet)
3. Click "Advanced" → "TCP/IP"
4. Change "Configure IPv4" to "Manually"
5. Enter desired IP address (e.g., 192.168.1.100)
6. Set Subnet Mask: 255.255.255.0
7. Set Router: (your router's IP, usually 192.168.1.1)
8. Click OK → Apply

### Create Bookmark on Mobile Devices

**iPhone/iPad:**

1. Open Safari and navigate to `http://hue-server.local:3000`
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Name it "Hue Control"
5. Tap "Add"

**Android:**

1. Open Chrome and navigate to `http://hue-server.local:3000`
2. Tap the menu (three dots)
3. Tap "Add to Home screen"
4. Name it "Hue Control"
5. Tap "Add"

---

## Success Criteria

Your deployment is successful when:

✅ Container auto-starts when MacBook boots
✅ Application accessible at `http://hue-server.local:3000` from any device on network
✅ All lights display correctly in grid layout
✅ Can control lights (on/off/brightness)
✅ Light commands are logged to `~/Desktop/homeassistant/logs/`
✅ Health checks show "healthy" status
✅ Can access from phone/tablet/computer on same network

---

## Quick Reference

```bash
# === COMMON COMMANDS ===

# Start application
cd ~/Desktop/homeassistant
docker-compose up -d

# Stop application
docker-compose down

# Restart application
docker-compose restart

# View logs
docker logs -f hue-control

# Check status
docker ps | grep hue-control

# Access application
open http://localhost:3000

# === USEFUL URLS ===

# On MacBook:
http://localhost:3000

# From other devices:
http://hue-server.local:3000

# Or use MacBook IP:
http://192.168.1.100:3000
```

---

## Support

If you encounter issues not covered in this guide:

1. Check Docker Desktop is running
2. Verify `.env` file has correct credentials
3. Ensure MacBook and devices are on same network
4. Check firewall settings allow Docker
5. Review logs: `docker logs hue-control`

For more details, see the main [README.md](README.md) file.
