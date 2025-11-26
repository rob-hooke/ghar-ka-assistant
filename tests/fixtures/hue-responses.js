// Mock Hue Bridge API responses
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

export const mockAllLights = {
  1: mockLightStatus,
  2: { ...mockLightStatus, name: 'Bedroom' },
};

export const mockControlSuccess = [{ success: { '/lights/1/state/on': true } }];

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
