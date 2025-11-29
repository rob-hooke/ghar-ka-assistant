import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Window } from 'happy-dom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Frontend UI - Lights Grid', () => {
  let window;
  let document;

  beforeEach(() => {
    const html = fs.readFileSync(path.resolve(__dirname, '../../../index.html'), 'utf-8');
    window = new Window();
    document = window.document;
    document.write(html);
    global.fetch = vi.fn();
  });

  describe('HTML Structure', () => {
    it('should have container element', () => {
      const container = document.querySelector('.container');
      expect(container).toBeTruthy();
    });

    it('should have lights grid container', () => {
      const grid = document.getElementById('lightsGrid');
      expect(grid).toBeTruthy();
      expect(grid.classList.contains('lights-grid')).toBe(true);
    });

    it('should have loading message initially', () => {
      const loading = document.getElementById('loadingMessage');
      expect(loading).toBeTruthy();
      expect(loading.textContent).toContain('Loading');
    });

    it('should have message element for notifications', () => {
      const message = document.getElementById('message');
      expect(message).toBeTruthy();
      expect(message.classList.contains('message')).toBe(true);
    });

    it('should have correct page title', () => {
      const h1 = document.querySelector('h1');
      expect(h1).toBeTruthy();
      expect(h1.textContent).toContain('Hue');
    });
  });

  describe('CSS Styles', () => {
    it('should have lights-grid styles defined', () => {
      const styles = document.querySelector('style');
      expect(styles).toBeTruthy();
      expect(styles.textContent).toContain('.lights-grid');
    });

    it('should have light-card styles defined', () => {
      const styles = document.querySelector('style');
      expect(styles.textContent).toContain('.light-card');
    });

    it('should have toggle-btn styles defined', () => {
      const styles = document.querySelector('style');
      expect(styles.textContent).toContain('.toggle-btn');
    });

    it('should have unreachable state styles', () => {
      const styles = document.querySelector('style');
      expect(styles.textContent).toContain('.unreachable');
    });
  });

  describe('JavaScript Functions', () => {
    it('should have fetchAllLights function in script', () => {
      const script = document.querySelector('script');
      expect(script).toBeTruthy();
      expect(script.textContent).toContain('fetchAllLights');
    });

    it('should have renderLights function in script', () => {
      const script = document.querySelector('script');
      expect(script.textContent).toContain('renderLights');
    });

    it('should have toggleLight function in script', () => {
      const script = document.querySelector('script');
      expect(script.textContent).toContain('toggleLight');
    });

    it('should have escapeHtml function for XSS protection', () => {
      const script = document.querySelector('script');
      expect(script.textContent).toContain('escapeHtml');
    });

    it('should have 5-second polling interval', () => {
      const script = document.querySelector('script');
      expect(script.textContent).toContain('setInterval');
      expect(script.textContent).toContain('5000');
    });

    it('should call fetchAllLights on page load', () => {
      const script = document.querySelector('script');
      // Check that fetchAllLights is called at the end (not in setInterval)
      expect(script.textContent).toMatch(/fetchAllLights\(\);[\s\S]*setInterval/);
    });

    it('should have setBrightness function in script', () => {
      const script = document.querySelector('script');
      expect(script.textContent).toContain('setBrightness');
    });
  });

  describe('Brightness Controls', () => {
    it('should have brightness-control styles defined', () => {
      const styles = document.querySelector('style');
      expect(styles.textContent).toContain('.brightness-control');
    });

    it('should have brightness-slider styles defined', () => {
      const styles = document.querySelector('style');
      expect(styles.textContent).toContain('.brightness-slider');
    });

    it('should have brightness-label styles defined', () => {
      const styles = document.querySelector('style');
      expect(styles.textContent).toContain('.brightness-label');
    });

    it('should include brightness conversion logic in script', () => {
      const script = document.querySelector('script');
      // Check for brightness conversion: 254 (Hue max) appears in script
      expect(script.textContent).toContain('254');
    });
  });
});
