require("dotenv").config();
const express = require("express");
const axios = require("axios");
const qs = require("qs");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const EBAY_CLIENT_ID = process.env.EBAY_CLIENT_ID;
const EBAY_CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET;
const EBAY_REDIRECT_URI = process.env.EBAY_REDIRECT_URI;
const EBAY_AUTH_URL = process.env.EBAY_AUTH_URL;
const EBAY_API_URL = process.env.EBAY_API_URL;

// ✅ Function to Save Access Token to token.json
const saveToken = (tokenData) => {
    fs.writeFileSync("token.json", JSON.stringify(tokenData, null, 2));
};

// ✅ Function to Read Access Token from token.json
const getAccessToken = () => {
    try {
        if (!fs.existsSync("token.json")) return null;

        const tokenData = fs.readFileSync("token.json", "utf-8");
        const tokenJson = JSON.parse(tokenData);

        if (Date.now() >= tokenJson.expires_in * 1000) {
            console.log("🔴 Token expired!");
            return null;
        }
        return tokenJson.access_token;
    } catch (error) {
        console.error("⚠️ Error reading token.json:", error.message);
        return null;
    }
};

// ✅ Step 1: Redirect User to eBay Authorization URL
app.get("/api/ebay/auth", (req, res) => {
    const scopes = encodeURIComponent(
        "https://api.ebay.com/oauth/api_scope " +
        "https://api.ebay.com/oauth/api_scope/sell.inventory " +
        "https://api.ebay.com/oauth/api_scope/sell.fulfillment"
    );

    const authUrl = `${EBAY_AUTH_URL}/oauth2/authorize?client_id=${EBAY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(EBAY_REDIRECT_URI)}&scope=${scopes}`;

    console.log("Redirecting to eBay Auth URL:", authUrl);
    res.redirect(authUrl);
});

// ✅ Step 2: Handle eBay Callback & Exchange Authorization Code for Access Token
app.get("/api/ebay/auth/callback", async (req, res) => {
    const authCode = req.query.code;
    console.log("Received Authorization Code:", authCode);

    if (!authCode) {
        return res.status(400).json({ error: "Authorization code is missing" });
    }

    try {
        console.log("🔄 Requesting Access Token from eBay...");

        const tokenResponse = await axios.post(
            `${EBAY_API_URL}/identity/v1/oauth2/token`,
            qs.stringify({
                grant_type: "authorization_code",
                code: decodeURIComponent(authCode),
                redirect_uri: EBAY_REDIRECT_URI,
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Basic ${Buffer.from(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`).toString("base64")}`,
                },
            }
        );

        saveToken(tokenResponse.data); // Save token to token.json

        console.log("✅ Access Token Saved:", tokenResponse.data);
        res.json(tokenResponse.data);
    } catch (error) {
        console.error("❌ Error fetching eBay token:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to get access token" });
    }
});

// ✅ Validate Access Token
app.get("/api/ebay/token/validate", async (req, res) => {
    const accessToken = getAccessToken();

    if (!accessToken) {
        return res.status(401).json({ error: "Access token is expired or missing" });
    }

    try {
        const response = await axios.get(`${EBAY_API_URL}/identity/v1/user/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        res.json({ valid: true, user: response.data });
    } catch (error) {
        console.error("❌ Error validating token:", error.response?.data || error.message);
        res.status(401).json({ error: "Access token is invalid or expired" });
    }
});

app.get("/api/ebay/products", async (req, res) => {
    const { limit, query } = req.query;

    // Set default query to 'all' if none is provided
    const searchQuery = query || "all";

    // Set default limit to 20 if not provided
    const pageSize = limit || 20;

    // Get the access token
    const accessToken = getAccessToken();
    if (!accessToken) {
        return res.status(401).json({ error: "Access token is expired or missing" });
    }

    try {
        // Construct the eBay URL with the desired query and limit
        const ebayUrl = `https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(searchQuery)}&limit=${pageSize}&fieldgroups=ASPECT_REFINEMENTS,CATEGORY_REFINEMENTS,CONDITION_REFINEMENTS,BUYING_OPTION_REFINEMENTS`;

        console.log("🔍 Fetching eBay products:", ebayUrl);

        // Make the API request to eBay
        const response = await axios.get(ebayUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        // Return the eBay response
        res.json(response.data);
    } catch (error) {
        console.error("❌ Error fetching items:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch items" });
    }
});







// ✅ Start the Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
