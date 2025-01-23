import { app, BrowserWindow, shell } from "electron";
import WebSocket from "ws";
import {
	exchangeToken,
	generateTraktAuthURL
} from "../../../dist/shared/traktAuth";
import http from "http";
import { configDotenv } from "dotenv";

configDotenv({path: "../../../.env"});

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

	mainWindow.loadFile("../index.html");

	const TRAKT_AUTH_URL = generateTraktAuthURL();
	shell.openExternal(TRAKT_AUTH_URL);

	const server = http.createServer(async (req, res) => {
		const url = new URL(req.url || "", `http://${req.headers.host}`);
		const authCode = url.searchParams.get("code");

		if (authCode) {
			console.log("Authorization Code received:", authCode);
			res.end("Authorization successful! You can close this window.");

			try {
				const tokenData = await exchangeToken(authCode);
				console.log("Token Data:", tokenData);
			} catch (error: any) {
				res.end("Token exchange failed.");
			}
		} else {
			res.end("Authorization failed.");
		}
	});

	server.listen(3000, () => {
		console.log(
			"Listening for Trakt redirect on http://localhost:3000/callback"
		);
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

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
