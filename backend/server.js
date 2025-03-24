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

// eBay API Config
const {
    EBAY_CLIENT_ID,
    EBAY_CLIENT_SECRET,
    EBAY_REDIRECT_URI,
    EBAY_AUTH_URL,
    EBAY_API_URL,
} = process.env;

// ✅ Step 1: Redirect User to eBay Authorization URL
app.get("/api/ebay/auth", (req, res) => {
    const scopes = encodeURIComponent(
        "https://api.ebay.com/oauth/api_scope " +
        "https://api.ebay.com/oauth/api_scope/buy.browse"
    );

    const authUrl = `${EBAY_AUTH_URL}/oauth2/authorize?client_id=${EBAY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(EBAY_REDIRECT_URI)}&scope=${scopes}`;

    console.log("🔄 Redirecting to eBay Auth URL:", authUrl);
    res.redirect(authUrl);
});

// ✅ Step 2: Handle eBay Callback and Get Access Token
app.get("/api/ebay/auth/callback", async (req, res) => {
    const authCode = req.query.code;
    
    if (!authCode) {
        console.error("❌ Error: Authorization code is missing");
        return res.status(400).json({ error: "Authorization code is missing" });
    }

    try {
        console.log("🔄 Requesting Access Token from eBay...");

        const response = await axios.post(
            `${EBAY_API_URL}/identity/v1/oauth2/token`,
            qs.stringify({
                grant_type: "authorization_code",
                code: authCode,
                redirect_uri: EBAY_REDIRECT_URI,
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Basic ${Buffer.from(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`).toString("base64")}`,
                },
            }
        );

        console.log("✅ eBay Token Response:", response.data);
        saveToken(response.data);

        res.json(response.data);
    } catch (error) {
        console.error("❌ Error fetching eBay token:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to get access token" });
    }
});

// ✅ Step 3: Fetch eBay Products
app.get("/api/ebay/products", async (req, res) => {
    const query = req.query.q || "laptop"; // Default search term
    const limit = req.query.limit || 10;

    const accessToken = getToken();
    if (!accessToken) {
        return res.status(401).json({ error: "Access token is missing or expired" });
    }

    try {
        console.log(`🔍 Searching for eBay products: ${query}...`);

        const response = await axios.get(
            `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query)}&limit=${limit}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("✅ Products Retrieved:", response.data);
        res.json(response.data);
    } catch (error) {
        console.error("❌ Error fetching eBay products:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch eBay products" });
    }
});

// ✅ Utility: Save token to file
const saveToken = (tokenData) => {
    try {
        fs.writeFileSync("token.json", JSON.stringify(tokenData, null, 2));
        console.log("💾 Token saved to token.json");
    } catch (error) {
        console.error("❌ Error saving token:", error.message);
    }
};

// ✅ Utility: Retrieve token from file
const getToken = () => {
    try {
        const data = fs.readFileSync("token.json");
        return JSON.parse(data).access_token || JSON.parse(data).token;
    } catch (error) {
        console.error("❌ Error reading token file:", error.message);
        return null;
    }
};

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
