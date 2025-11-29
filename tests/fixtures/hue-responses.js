// Mock Hue Bridge API responses for individual light data
export const mockLightStatus = {
  state: {
    on: true,
    bri: 254,
    hue: 10000,
    sat: 254,
    reachable: true,
  },
  name: 'Living Room 1',
  type: 'Extended color light',
};

export const mockLightStatusOff = {
  ...mockLightStatus,
  state: { ...mockLightStatus.state, on: false },
};

// Mock response for GET /lights (multiple lights with varied states)
export const mockAllLights = {
  1: mockLightStatus,
  2: {
    ...mockLightStatus,
    name: 'Bedroom',
    state: { ...mockLightStatus.state, on: false },
  },
  3: {
    ...mockLightStatus,
    name: 'Kitchen',
    state: { ...mockLightStatus.state, reachable: false },
  },
};

// Helper to create control success response for any light ID
export const mockControlSuccessForLight = (lightId, state) => [
  { success: { [`/lights/${lightId}/state/on`]: state } },
];

export const mockControlSuccess = [{ success: { '/lights/1/state/on': true } }];

// Brightness control success responses
export const mockBrightnessSuccess = [
  { success: { '/lights/1/state/bri': 127 } },
  { success: { '/lights/1/state/on': true } },
];

export const mockBrightnessAndOnSuccess = [
  { success: { '/lights/1/state/on': true } },
  { success: { '/lights/1/state/bri': 200 } },
];

export const mockControlError = [
  {
    error: {
      type: 3,
      address: '/lights/1/state/on',
      description: 'resource, /lights/1/state/on, not available',
    },
  },
];

export const mockUnauthorized = [
  {
    error: {
      type: 1,
      address: '/',
      description: 'unauthorized user',
    },
  },
];
