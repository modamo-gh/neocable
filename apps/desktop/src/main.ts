import { app, BrowserWindow } from "electron";
import WebSocket from "ws";

let mainWindow: BrowserWindow | null = null;
let isDOMReady = false;

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
	console.log("Client connected");

	ws.on("message", (message) => {
		if (!isDOMReady) {
			console.log("DOM is not ready");
			return;
		}

		const command = message.toString();

		console.log("Command", command);

		const videoPlayer = BrowserWindow.getAllWindows()[0].webContents;

		if (command === "play" || command === "pause") {
			videoPlayer
				.executeJavaScript(`controlVideo("${command}")`)
				.catch((error) =>
					console.error("Error executing video command", error)
				);
		}
	});

	ws.send("Connected");
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

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
