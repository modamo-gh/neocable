import { app, BrowserWindow } from "electron";
import WebSocket from "ws";

let mainWindow: BrowserWindow;

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
	console.log("Client connected");

	ws.on("message", (message) => {
        const textMessage = message.toString()

		console.log("Message", message);

		if (textMessage === "play") {
			console.log("play");
		} else if (textMessage === "pause") {
			console.log("pause");
		}
	});

    ws.send("Connected")
});

app.on("ready", () => {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: `${__dirname}/preload.ts`,
			contextIsolation: true
		}
	});

	mainWindow.loadFile("../index.html");
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
