import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement audio playback; the voice-prompt hook calls
// HTMLMediaElement.play(), which needs a stub in the test environment.
if (typeof window !== 'undefined') {
  window.HTMLMediaElement.prototype.play = () => Promise.resolve();
}
