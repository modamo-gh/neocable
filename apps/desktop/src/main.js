"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const ws_1 = __importDefault(require("ws"));
const traktAuth_1 = require("../../../packages/shared/src/traktAuth");
const http_1 = __importDefault(require("http"));
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
    mainWindow.loadFile("../index.html");
    const TRAKT_AUTH_URL = (0, traktAuth_1.generateTraktAuthURL)();
    electron_1.shell.openExternal(TRAKT_AUTH_URL);
    const server = http_1.default.createServer(async (req, res) => {
        const url = new URL(req.url || "", `http://${req.headers.host}`);
        const authCode = url.searchParams.get("code");
        if (authCode) {
            console.log("Authorization Code received:", authCode);
            res.end("Authorization successful! You can close this window.");
            try {
                const tokenData = await (0, traktAuth_1.exchangeToken)(authCode);
                console.log("Token Data:", tokenData);
            }
            catch (error) {
                res.end("Token exchange failed.");
            }
        }
        else {
            res.end("Authorization failed.");
        }
    });
    server.listen(3000, () => {
        console.log("Listening for Trakt redirect on http://localhost:3000/callback");
    });
    mainWindow.webContents.on("dom-ready", () => {
        isDOMReady = true;
        console.log("DOM is ready");
    });
    mainWindow.on("closed", () => {
        mainWindow = null;
        server.close();
    });
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
