"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const ws_1 = __importDefault(require("ws"));
let mainWindow = null;
let isDOMReady = false;
const wss = new ws_1.default.Server({ port: 8080 });
wss.on("connection", (ws) => {
    console.log("Client connected");
    ws.on("message", (message) => {
        if (!isDOMReady) {
            console.log("DOM is not ready");
            return;
        }
        const command = message.toString();
        console.log("Command", command);
        const videoPlayer = electron_1.BrowserWindow.getAllWindows()[0].webContents;
        if (command === "play" || command === "pause") {
            videoPlayer
                .executeJavaScript(`controlVideo("${command}")`)
                .catch((error) => console.error("Error executing video command", error));
        }
    });
    ws.send("Connected");
});
electron_1.app.on("ready", () => {
    mainWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: `${__dirname}/preload.ts`,
            contextIsolation: true
        }
    });
    mainWindow.webContents.openDevTools();
    mainWindow.loadFile("../index.html");
    mainWindow.webContents.on("dom-ready", () => {
        isDOMReady = true;
        console.log("DOM is ready");
    });
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
