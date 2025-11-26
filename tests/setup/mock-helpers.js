import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import {
  mockLightStatus,
  mockAllLights,
  mockControlSuccess,
  mockControlError,
  mockUnauthorized,
} from '../fixtures/hue-responses.js';

export function createAxiosMock() {
  return new MockAdapter(axios);
}

export function setupSuccessfulBridge(
  mock,
  bridgeIP = '192.168.1.100',
  username = 'test-username-123'
) {
  const baseURL = `http://${bridgeIP}/api/${username}`;

  mock.onGet(new RegExp(`${baseURL}/lights/\\d+`)).reply(200, mockLightStatus);
  mock.onGet(`${baseURL}/lights`).reply(200, mockAllLights);
  mock.onPut(new RegExp(`${baseURL}/lights/\\d+/state`)).reply(200, mockControlSuccess);
}

export function setupUnreachableBridge(mock) {
  mock.onAny().timeout();
}

export function setupUnauthorized(
  mock,
  bridgeIP = '192.168.1.100',
  username = 'test-username-123'
) {
  const baseURL = `http://${bridgeIP}/api/${username}`;
  mock.onAny(new RegExp(baseURL)).reply(401, mockUnauthorized);
}

export function setupBridgeError(mock, bridgeIP = '192.168.1.100', username = 'test-username-123') {
  const baseURL = `http://${bridgeIP}/api/${username}`;
  mock.onPut(new RegExp(`${baseURL}/lights/\\d+/state`)).reply(200, mockControlError);
}
