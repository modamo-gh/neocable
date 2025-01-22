"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const ws_1 = __importDefault(require("ws"));
const ws = new ws_1.default("ws://localhost:8080");
ws.onopen = () => {
    console.log("Connection opened");
};
ws.onmessage = (event) => {
    console.log(`Message from server: ${event.data}`);
};
electron_1.contextBridge.exposeInMainWorld("websocket", {
    send: (message) => ws.send(message),
    onMessage: (callback) => {
        ws.onmessage = (event) => callback(event.data.toString());
    }
});
