declare global {
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
