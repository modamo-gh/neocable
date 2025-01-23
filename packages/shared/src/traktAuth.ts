import axios from "axios";
import { configDotenv } from "dotenv";
import * as fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), "../../.env");
const result = configDotenv({ path: envPath });

if (result.error) {
	console.error("Failed to load .env file:", result.error);
} else {
	console.log("Environment variables loaded successfully!");
}

const tokenPath = path.resolve(process.cwd(), "traktToken.json");

export const exchangeToken = async (authCode: string) => {
	try {
		const response = await axios.post("https://api.trakt.tv/oauth/token", {
			code: authCode,
			client_id: process.env.TRAKT_CLIENT_ID,
			client_secret: process.env.TRAKT_CLIENT_SECRET,
			redirect_uri: process.env.TRAKT_REDIRECT_URI,
			grant_type: "authorization_code"
		});

		console.log("Access Token Response:", response.data);
		return response.data;
	} catch (error: any) {
		console.error(
			"Failed to exchange token:",
			error.response?.data || error.message
		);
		throw new Error("Token exchange failed");
	}
};

export const fetchMovieRecommendations = async () => {
	const accessToken = await getValidToken();
	console.log("Using Access Token:", accessToken);

	try {
		const response = await axios.get(
			"https://api.trakt.tv/recommendations/movies",
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
					"trakt-api-version": "2",
					"trakt-api-key": process.env.TRAKT_CLIENT_ID
				}
			}
		);

		console.log("Movie Recommendations:", response.data);
		return response.data;
	} catch (error: any) {
		console.error(
			"Failed to fetch movie recommendations:",
			error.response?.data || error.message
		);
		throw error;
	}
};

export const fetchUserProfile = async () => {
	const accessToken = await getValidToken();
	console.log("Using Access Token:", accessToken);

	try {
		const response = await axios.get("https://api.trakt.tv/users/me", {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
				"trakt-api-version": "2",
				"trakt-api-key": process.env.TRAKT_CLIENT_ID
			}
		});
		console.log("User Profile:", response.data);
		return response.data;
	} catch (error: any) {
		console.error(
			"Failed to fetch user profile:",
			error.response?.data || error.message
		);
		throw error;
	}
};

export const generateTraktAuthURL = (): string => {
	return `https://trakt.tv/oauth/authorize?response_type=code&client_id=${process.env.TRAKT_CLIENT_ID}&redirect_uri=${process.env.TRAKT_REDIRECT_URI}`;
};

export const getValidToken = async (): Promise<string> => {
	const tokenData = loadToken();

	if (!tokenData) {
		throw new Error("No token found. Please authenticate first.");
	}

	const now = Math.floor(Date.now() / 1000);
	const expiresAt = tokenData.created_at + tokenData.expires_in;

	if (now >= expiresAt) {
		console.log("Token expired. Refreshing...");

		const newTokenData = await refreshAccessToken(tokenData.refresh_token);

		return newTokenData.access_token;
	}

	console.log("Token is still valid");

	return tokenData.access_token;
};

export const loadToken = (): any => {
	try {
		if (fs.existsSync(tokenPath)) {
			const tokenData = JSON.parse(fs.readFileSync(tokenPath, "utf-8"));

			console.log("Token loaded", tokenData);

			return tokenData;
		}
	} catch (error) {
		console.error("Failed to load token:", error);
	}

	return null;
};

export const refreshAccessToken = async (refreshToken: string) => {
	try {
		const response = await axios.post("https://api.trakt.tv/oauth/token", {
			refresh_token: refreshToken,
			client_id: process.env.TRAKT_CLIENT_ID,
			client_secret: process.env.TRAKT_CLIENT_SECRET,
			redirect_uri: process.env.TRAKT_REDIRECT_URI,
			grant_type: "authorization_code"
		});

		console.log("Refreshed Token Data", response.data);

		saveToken(response.data);
		return response.data;
	} catch (error: any) {
		console.error(
			"Failed to refresh token:",
			error.response?.data || error.message
		);
		throw new Error("Token refresh failed");
	}
};

export const saveToken = (tokenData: any) => {
	try {
		fs.writeFileSync(
			tokenPath,
			JSON.stringify(tokenData, null, 2),
			"utf-8"
		);

		console.log("Token saved successfully!");
	} catch (error: any) {
		console.error("Failed to save token:", error);
	}
};
