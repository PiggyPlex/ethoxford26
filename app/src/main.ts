import { app, BrowserWindow, ipcMain, shell } from "electron";
import * as path from "path";
import { io, Socket } from "socket.io-client";

let mainWindow: BrowserWindow | null = null;
let socket: Socket | null = null;
let isConnected = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    x: 1200,
    y: 0,
    width: 400,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    fullscreenable: false,
  });

  // mainWindow.setIgnoreMouseEvents(true, { forward: true });

  mainWindow.loadFile(path.join(__dirname, "../index.html"));

  mainWindow.on("closed", () => {
    mainWindow = null;
    // Exit app
    app.quit();
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

function connectToSuggestionServer(serverUrl = "http://localhost:3001") {
  if (socket?.connected) {
    console.log("Already connected to suggestion server");
    return;
  }

  socket = io(serverUrl, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("🔌 Connected to suggestion server");
    isConnected = true;
    mainWindow?.webContents.send("connection-status", true);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Disconnected from suggestion server");
    isConnected = false;
    mainWindow?.webContents.send("connection-status", false);
  });

  // TODO: types
  socket.on("suggestion", (suggestion: SuggestionEvent) => {
    console.log("Received suggestion:", suggestion);
    mainWindow?.webContents.send("suggestion", suggestion);
  });

  // Chat events
  socket.on("chat:response", (message: unknown) => {
    console.log("Received chat response:", message);
    mainWindow?.webContents.send("chat:response", message);
  });

  socket.on("chat:thinking", (event: unknown) => {
    console.log("Received thinking:", event);
    mainWindow?.webContents.send("chat:thinking", event);
  });

  socket.on("chat:tool", (event: unknown) => {
    console.log("Received tool event:", event);
    mainWindow?.webContents.send("chat:tool", event);
  });

  socket.on("chat:typing", (event: unknown) => {
    mainWindow?.webContents.send("chat:typing", event);
  });

  socket.on("connect_error", (error) => {
    console.error("Connection error:", error.message);
  });
}

// IPC Handlers
ipcMain.on('expand-window', () => {
  if (mainWindow) {
    mainWindow.setSize(1200, 900);
    mainWindow.center();
    mainWindow.focus();
  }
});

ipcMain.on('reset-window', () => {
  console.log('reset window call')
  if (mainWindow) {
    mainWindow.setPosition(1050, 0);
    mainWindow.setSize(400, 400);
    // mainWindow.focus();
    console.log("Window reset to original size and position");
  }
});

// ipcMain.on("overlay:set-interactive", (_, interactive: boolean) => {
//   mainWindow.setIgnoreMouseEvents(!interactive, { forward: true });
//   if (interactive) mainWindow.focus();
// });

ipcMain.handle("get-connection-status", () => {
  return isConnected;
});

ipcMain.on("open-external", (_event, url: string) => {
  shell.openExternal(url);
});

ipcMain.on("dismiss-suggestion", (_event, timestamp: number) => {
  console.log("Dismissed suggestion:", timestamp);
});

// Chat IPC handler
ipcMain.on("chat:send", (_event, message: unknown) => {
  console.log("📤 Sending chat message:", message);
  if (socket?.connected) {
    socket.emit("chat:message", message);
  } else {
    console.error("❌ Cannot send message: not connected");
  }
});

app.whenReady().then(() => {
  createWindow();
  connectToSuggestionServer();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    socket?.disconnect();
    app.quit();
  }
});
