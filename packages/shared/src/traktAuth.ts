import axios from "axios";
import { configDotenv } from "dotenv";
import path from "path";

const envPath = path.resolve(process.cwd(), "../../.env");
console.log("Resolved .env path:", envPath);

const result = configDotenv({ path: envPath });

if (result.error) {
	console.error("Failed to load .env file:", result.error);
} else {
	console.log("Environment variables loaded successfully!");
}

export const generateTraktAuthURL = (): string => {
	return `https://trakt.tv/oauth/authorize?response_type=code&client_id=${process.env.TRAKT_CLIENT_ID}&redirect_uri=${process.env.TRAKT_REDIRECT_URI}`;
};

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
