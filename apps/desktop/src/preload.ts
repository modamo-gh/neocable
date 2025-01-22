import { contextBridge } from "electron";
import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:8080");

ws.onopen = () => {
	console.log("Connection opened");
};

ws.onmessage = (event) => {
	console.log(`Message from server: ${event.data}`);
};

contextBridge.exposeInMainWorld("websocket", {
	send: (message: string) => ws.send(message),
	onMessage: (callback: (message: string) => void) => {
		ws.onmessage = (event) => callback(event.data.toString());
	}
});
