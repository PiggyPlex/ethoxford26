declare global {
  // Minimal overlay API used in renderer.ts
  interface OverlayAPI {
    setInteractive(interactive: boolean): void;
    expandWindow(): void;
    resetWindow(): void;
  }

  interface Window {
    overlay: OverlayAPI;
  }
}

export {};
