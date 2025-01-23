import { configDotenv } from "dotenv";
import { app, BrowserWindow, shell } from "electron";
import http from "http";
import WebSocket from "ws";
import {
	exchangeToken,
	fetchUserProfile,
	generateTraktAuthURL,
	loadToken,
	saveToken
} from "../../../dist/shared/traktAuth";

configDotenv({ path: "../../../.env" });

let mainWindow: BrowserWindow | null = null;
let isDOMReady = false;

const server = http.createServer(async (req, res) => {
	const url = new URL(req.url || "", `http://${req.headers.host}`);
	const authCode = url.searchParams.get("code");

	if (authCode) {
		console.log("Authorization Code received:", authCode);
		res.end("Authorization successful! You can close this window.");

		try {
			const tokenData = await exchangeToken(authCode);
			console.log("Token Data:", tokenData);

			saveToken(tokenData);

			console.log("Fetching user profile...");
			const userProfile = await fetchUserProfile();
			console.log("User Profile Data:", userProfile);
		} catch (error) {
			console.error(
				"Error during token exchange or profile fetch:",
				error
			);
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

app.on("ready", async () => {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: `${__dirname}/preload.ts`,
			contextIsolation: true
		}
	});

	mainWindow.loadFile("../index.html");

	const savedToken = loadToken();
	if (savedToken) {
		console.log("Token found. Fetching user profile...");
		try {
			const userProfile = await fetchUserProfile();
			console.log("User Profile Data:", userProfile);
		} catch (error) {
			console.error("Failed to fetch user profile:", error);
		}
	} else {
		console.log("No token found. Starting OAuth flow...");
		const TRAKT_AUTH_URL = generateTraktAuthURL();
		shell.openExternal(TRAKT_AUTH_URL);
	}

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
