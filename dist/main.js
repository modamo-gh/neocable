"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const ws_1 = __importDefault(require("ws"));
let mainWindow;
const wss = new ws_1.default.Server({ port: 8080 });
wss.on("connection", (ws) => {
    console.log("Client connected");
    ws.on("message", (message) => {
        const textMessage = message.toString();
        console.log("Message", message);
        if (textMessage === "play") {
            console.log("play");
        }
        else if (textMessage === "pause") {
            console.log("pause");
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
    mainWindow.loadFile("../index.html");
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
