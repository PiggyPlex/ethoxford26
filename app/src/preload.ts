import { contextBridge, ipcRenderer } from "electron";
import type { SuggestionEvent } from "./types/suggestion";

contextBridge.exposeInMainWorld("overlay", {
  setInteractive: (value: boolean) =>
    ipcRenderer.send("overlay:set-interactive", value),
  expandWindow: () => ipcRenderer.send("expand-window"),
  resetWindow: () => ipcRenderer.send("reset-window"),
});

contextBridge.exposeInMainWorld("electronAPI", {
  openExternal: (url: string) => ipcRenderer.send("open-external", url),
  dismissSuggestion: (timestamp: number) => ipcRenderer.send("dismiss-suggestion", timestamp),
  onSuggestion: (callback: (suggestion: SuggestionEvent) => void) => {
    ipcRenderer.on("suggestion", (_event, suggestion) => callback(suggestion));
  },
  onConnectionStatus: (callback: (connected: boolean) => void) => {
    ipcRenderer.on("connection-status", (_event, connected) => callback(connected));
  },
  getConnectionStatus: () => ipcRenderer.invoke("get-connection-status"),
  // TODO: types
  sendChatMessage: (message: unknown) => ipcRenderer.send("chat:send", message),
  onChatResponse: (callback: (message: unknown) => void) => {
    ipcRenderer.on("chat:response", (_event, message) => callback(message));
  },
  onChatThinking: (callback: (event: unknown) => void) => {
    ipcRenderer.on("chat:thinking", (_event, event) => callback(event));
  },
  onChatTool: (callback: (event: unknown) => void) => {
    ipcRenderer.on("chat:tool", (_event, event) => callback(event));
  },
  onChatTyping: (callback: (event: unknown) => void) => {
    ipcRenderer.on("chat:typing", (_event, event) => callback(event));
  },
});

