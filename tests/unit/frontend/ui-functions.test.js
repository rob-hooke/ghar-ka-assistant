import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Window } from 'happy-dom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Frontend UI Functions', () => {
  let window;
  let document;

  beforeEach(() => {
    const html = fs.readFileSync(path.resolve(__dirname, '../../../index.html'), 'utf-8');
    window = new Window();
    document = window.document;
    document.write(html);
    global.fetch = vi.fn();
  });

  it('should have HTML structure', () => {
    const container = document.querySelector('.container');
    expect(container).toBeTruthy();
  });

  it('should have bulb icon element', () => {
    const bulbIcon = document.getElementById('bulbIcon');
    expect(bulbIcon).toBeTruthy();
  });

  it('should have control buttons', () => {
    const btnOn = document.getElementById('btnOn');
    const btnOff = document.getElementById('btnOff');
    expect(btnOn).toBeTruthy();
    expect(btnOff).toBeTruthy();
  });
});
