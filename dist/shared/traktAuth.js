"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exchangeToken = exports.generateTraktAuthURL = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
const envPath = path_1.default.resolve(process.cwd(), "../../.env");
console.log("Resolved .env path:", envPath);
// Load the .env file
const result = (0, dotenv_1.configDotenv)({ path: envPath });
if (result.error) {
    console.error("Failed to load .env file:", result.error);
}
else {
    console.log("Environment variables loaded successfully!");
}
const generateTraktAuthURL = () => {
    console.log(process.env.TRAKT_CLIENT_ID);
    return `https://trakt.tv/oauth/authorize?response_type=code&client_id=${process.env.TRAKT_CLIENT_ID}&redirect_uri=${process.env.TRAKT_REDIRECT_URI}`;
};
exports.generateTraktAuthURL = generateTraktAuthURL;
const exchangeToken = async (authCode) => {
    try {
        const response = await axios_1.default.post("https://api.trakt.tv/oauth/token", {
            code: authCode,
            client_id: process.env.TRAKT_CLIENT_ID,
            client_secret: process.env.TRAKT_CLIENT_SECRET,
            redirect_uri: process.env.TRAKT_REDIRECT_URI,
            grant_type: "authorization_code"
        });
        console.log("Access Token Response:", response.data);
        return response.data;
    }
    catch (error) {
        console.error("Failed to exchange token:", error.response?.data || error.message);
        throw new Error("Token exchange failed");
    }
};
exports.exchangeToken = exchangeToken;
