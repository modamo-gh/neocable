"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveToken = exports.refreshAccessToken = exports.loadToken = exports.getValidToken = exports.generateTraktAuthURL = exports.fetchUserProfile = exports.exchangeToken = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = require("dotenv");
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const envPath = path_1.default.resolve(process.cwd(), "../../.env");
const result = (0, dotenv_1.configDotenv)({ path: envPath });
if (result.error) {
    console.error("Failed to load .env file:", result.error);
}
else {
    console.log("Environment variables loaded successfully!");
}
const tokenPath = path_1.default.resolve(process.cwd(), "traktToken.json");
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
const fetchUserProfile = async () => {
    const accessToken = await (0, exports.getValidToken)();
    console.log("Using Access Token:", accessToken); // Debug log
    try {
        const response = await axios_1.default.get("https://api.trakt.tv/users/me", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                "trakt-api-version": "2",
                "trakt-api-key": process.env.TRAKT_CLIENT_ID,
            },
        });
        console.log("User Profile:", response.data);
        return response.data;
    }
    catch (error) {
        console.error("Failed to fetch user profile:", error.response?.data || error.message);
        throw error;
    }
};
exports.fetchUserProfile = fetchUserProfile;
const generateTraktAuthURL = () => {
    return `https://trakt.tv/oauth/authorize?response_type=code&client_id=${process.env.TRAKT_CLIENT_ID}&redirect_uri=${process.env.TRAKT_REDIRECT_URI}`;
};
exports.generateTraktAuthURL = generateTraktAuthURL;
const getValidToken = async () => {
    const tokenData = (0, exports.loadToken)();
    if (!tokenData) {
        throw new Error("No token found. Please authenticate first.");
    }
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = tokenData.created_at + tokenData.expires_in;
    if (now >= expiresAt) {
        console.log("Token expired. Refreshing...");
        const newTokenData = await (0, exports.refreshAccessToken)(tokenData.refresh_token);
        return newTokenData.access_token;
    }
    console.log("Token is still valid");
    return tokenData.access_token;
};
exports.getValidToken = getValidToken;
const loadToken = () => {
    try {
        if (fs.existsSync(tokenPath)) {
            const tokenData = JSON.parse(fs.readFileSync(tokenPath, "utf-8"));
            console.log("Token loaded", tokenData);
            return tokenData;
        }
    }
    catch (error) {
        console.error("Failed to load token:", error);
    }
    return null;
};
exports.loadToken = loadToken;
const refreshAccessToken = async (refreshToken) => {
    try {
        const response = await axios_1.default.post("https://api.trakt.tv/oauth/token", {
            refresh_token: refreshToken,
            client_id: process.env.TRAKT_CLIENT_ID,
            client_secret: process.env.TRAKT_CLIENT_SECRET,
            redirect_uri: process.env.TRAKT_REDIRECT_URI,
            grant_type: "authorization_code"
        });
        console.log("Refreshed Token Data", response.data);
        (0, exports.saveToken)(response.data);
        return response.data;
    }
    catch (error) {
        console.error("Failed to refresh token:", error.response?.data || error.message);
        throw new Error("Token refresh failed");
    }
};
exports.refreshAccessToken = refreshAccessToken;
const saveToken = (tokenData) => {
    try {
        fs.writeFileSync(tokenPath, JSON.stringify(tokenData, null, 2), "utf-8");
        console.log("Token saved successfully!");
    }
    catch (error) {
        console.error("Failed to save token:", error);
    }
};
exports.saveToken = saveToken;
