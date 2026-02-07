import { app, BrowserWindow, ipcMain, shell } from "electron";
import * as path from "path";
import { io, Socket } from "socket.io-client";

let mainWindow: BrowserWindow | null = null;
let socket: Socket | null = null;
let isConnected = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "../index.html"));

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
}

function connectToSuggestionServer(serverUrl: string = "http://localhost:3001") {
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

  socket.on("suggestion", (suggestion: any) => {
    console.log("📥 Received suggestion:", suggestion);
    mainWindow?.webContents.send("suggestion", suggestion);
  });

  // Chat events
  socket.on("chat:response", (message: any) => {
    console.log("💬 Received chat response:", message);
    mainWindow?.webContents.send("chat:response", message);
  });

  socket.on("chat:thinking", (event: any) => {
    console.log("🧠 Received thinking:", event);
    mainWindow?.webContents.send("chat:thinking", event);
  });

  socket.on("chat:tool", (event: any) => {
    console.log("🔧 Received tool event:", event);
    mainWindow?.webContents.send("chat:tool", event);
  });

  socket.on("chat:typing", (event: any) => {
    mainWindow?.webContents.send("chat:typing", event);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Connection error:", error.message);
  });
}

// IPC Handlers
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
ipcMain.on("chat:send", (_event, message: any) => {
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
