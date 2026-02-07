import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  openExternal: (url: string) => ipcRenderer.send("open-external", url),
  dismissSuggestion: (timestamp: number) => ipcRenderer.send("dismiss-suggestion", timestamp),
  onSuggestion: (callback: (suggestion: any) => void) => {
    ipcRenderer.on("suggestion", (_event, suggestion) => callback(suggestion));
  },
  onConnectionStatus: (callback: (connected: boolean) => void) => {
    ipcRenderer.on("connection-status", (_event, connected) => callback(connected));
  },
  getConnectionStatus: () => ipcRenderer.invoke("get-connection-status"),
  // Chat API
  sendChatMessage: (message: any) => ipcRenderer.send("chat:send", message),
  onChatResponse: (callback: (message: any) => void) => {
    ipcRenderer.on("chat:response", (_event, message) => callback(message));
  },
  onChatThinking: (callback: (event: any) => void) => {
    ipcRenderer.on("chat:thinking", (_event, event) => callback(event));
  },
  onChatTool: (callback: (event: any) => void) => {
    ipcRenderer.on("chat:tool", (_event, event) => callback(event));
  },
  onChatTyping: (callback: (event: any) => void) => {
    ipcRenderer.on("chat:typing", (_event, event) => callback(event));
  },
});

// Type declaration for the exposed API
// declare global {
//   interface Window {
//     electronAPI: {
//       onSuggestion: (callback: (suggestion: any) => void) => void;
//       onConnectionStatus: (callback: (connected: boolean) => void) => void;
//       openExternal: (url: string) => void;
//       dismissSuggestion: (timestamp: number) => void;
//       getConnectionStatus: () => Promise<boolean>;
//     };
//   }
// }
