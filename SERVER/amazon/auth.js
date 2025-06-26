/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config();
const axios = require("axios");
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000



const TOKEN_PATH = path.resolve("token.json");

// Fetch a new access token from Amazon
async function fetchNewAccessToken() {
  let refreshToken = process.env.REFRESH_TOKEN;
  if (fs.existsSync(TOKEN_PATH)) {
    try {
      const existing = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
      if (existing.refresh_token) {
        refreshToken = existing.refresh_token;
        console.log(`[Refresh Token] 🔄 Using refresh_token from token.json`);
      } else {
        console.log(
          `[Refresh Token] ⚠️ No refresh_token in token.json, using .env`
        );
      }
    } catch (e) {
      console.warn(
        `[Refresh Token] ⚠️ Failed reading token.json, using .env - ${e.message}`
      );
    }
  } else {
    console.log(`[Refresh Token] 🧪 token.json not found, using .env`);
  }

  const params = new URLSearchParams({
    grant_type: process.env.GRANT_TYPE || "refresh_token",
    refresh_token: refreshToken,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
  });

  const { data } = await axios.post(
    "https://api.amazon.com/auth/o2/token",
    params.toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  const expires_at = Math.floor(Date.now() / 1000) + data.expires_in - 60;
  const tokenData = { ...data, expires_at };
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokenData, null, 2));
  return tokenData;
}

// Get current valid access token, refresh if needed
async function getValidAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (fs.existsSync(TOKEN_PATH)) {
    const tokenData = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
    if (tokenData?.access_token && tokenData.expires_at > now)
      return tokenData.access_token;
    console.log(`[Token Check] ❌ Token expired or missing. Refreshing...`);
  } else {
    console.log(`[Token Check] 📂 token.json missing. Fetching token...`);
  }
  const newToken = await fetchNewAccessToken();
  return newToken.access_token;
}

// /auth/token endpoint (returns current valid token)
app.get("/auth/token", async (req, res) => {
  try {
    const access_token = await getValidAccessToken();
    res.json({ access_token });
  } catch (e) {
    res
      .status(e.response?.status || 500)
      .json({ error: e.response?.data || e.message });
  }
});

// /test endpoint — calls Amazon API using valid access token
app.get("/amazon_inventory", async (req, res) => {
  try {
    const access_token = await getValidAccessToken();
    const response = await axios.get(
      "https://sandbox.sellingpartnerapi-na.amazon.com/fba/inventory/v1/summaries?details=true&granularityType=Marketplace&granularityId=ATVPDKIKX0DER&marketplaceIds=ATVPDKIKX0DER",
      { headers: { "x-amz-access-token": access_token } }
    );

    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

// Background token status logger + refresh every 5 seconds
setInterval(async () => {
  try {
    let tokenData = fs.existsSync(TOKEN_PATH)
      ? JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"))
      : null;
    const now = Math.floor(Date.now() / 1000);
    if (tokenData?.access_token && tokenData.expires_at > now) {
      console.log(
        `[Token Status] ✅ VALID - Expires in ${tokenData.expires_at - now}s`
      );
    } else {
      console.log(
        `[Token Status] ❌ EXPIRED or missing access_token. Refreshing now...`
      );
      await fetchNewAccessToken();
    }
  } catch (e) {
    console.error(
      "[Token Status] ⚠️ Error reading token or refreshing:",
      e.message
    );
  }
}, 5000);

app.post("/add-item", async (req, res) => {
  try {
    const access_token = await getValidAccessToken();
    const { sellerSku, marketplaceId, productName } = req.body;

    if (!sellerSku || !marketplaceId || !productName) {
      return res.status(400).json({
        error: "Missing required fields: sellerSku, marketplaceId, productName",
      });
    }

    const response = await axios.post(
      "https://sandbox.sellingpartnerapi-na.amazon.com/fba/inventory/v1/items",
      {
        sellerSku,
        marketplaceId,
        productName,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "x-amz-access-token": access_token,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

app.delete("/delete-item/:sellerSku", async (req, res) => {
  try {
    const access_token = await getValidAccessToken();
    const { sellerSku } = req.params;
    const { marketplaceId } = req.query;

    if (!sellerSku || !marketplaceId) {
      return res.status(400).json({
        error:
          "Missing required fields: sellerSku (param), marketplaceId (query param)",
      });
    }

    const response = await axios.delete(
      `https://sandbox.sellingpartnerapi-na.amazon.com/fba/inventory/v1/items/${encodeURIComponent(
        sellerSku
      )}?marketplaceId=${encodeURIComponent(marketplaceId)}`,
      {
        headers: {
          "x-amz-access-token": access_token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    res.status(200).json({
      message: `Item with sellerSku '${sellerSku}' deleted successfully.`,
      response: response.data,
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

app.get("/get-inventory-feed", async (req, res) => {
  try {
    const access_token = await getValidAccessToken();

    // Step 1: Create feed document
    feedDocResponse = await axios.post(
      "https://sandbox.sellingpartnerapi-na.amazon.com/feeds/2021-06-30/documents",
      {
        contentType: "text/tab-separated-values; charset=UTF-8",
      },
      {
        headers: {
          "x-amz-access-token": access_token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (
      !feedDocResponse.data ||
      !feedDocResponse.data.feedDocumentId ||
      !feedDocResponse.data.url
    ) {
      return res.status(500).json({
        error: "Invalid feed document response",
        data: feedDocResponse.data,
      });
    }

    const { url, feedDocumentId } = feedDocResponse.data;

    // Return only feedDocumentId and pre-signed S3 URL
    res.status(200).json({
      message: "Feed document created successfully",
      feedDocumentId,
      uploadUrl: url,
    });
  } catch (error) {
    console.error("❌ Error creating feed document:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

app.post("/submit-inventory-feed", async (req, res) => {
  try {
    const access_token = await getValidAccessToken();

    const items = req.body.items;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Missing or invalid items array" });
    }

    // Step 1: Request a feed document to get the upload URL
    const feedDocResponse = await axios.post(
      "https://sandbox.sellingpartnerapi-na.amazon.com/feeds/2021-06-30/documents",
      { contentType: "text/tab-separated-values; charset=UTF-8" },
      {
        headers: {
          "x-amz-access-token": access_token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const feedDoc = feedDocResponse.data;
    const { url: uploadUrl, feedDocumentId } = feedDoc;

    if (!uploadUrl || !feedDocumentId) {
      return res.status(500).json({ error: "Missing uploadUrl or feedDocumentId" });
    }

    console.log("📤 Upload URL:", uploadUrl);

    // Step 2: Create TSV content
    let tsv = "sku\tquantity\n";
    for (const { sku, quantity } of items) {
      if (
        typeof sku !== "string" ||
        sku.trim() === "" ||
        !Number.isInteger(quantity) ||
        quantity < 0
      ) {
        return res.status(400).json({ error: `Invalid item: ${JSON.stringify({ sku, quantity })}` });
      }
      tsv += `${sku.trim()}\t${quantity}\n`;
    }

    // Step 3: Upload the TSV file to the pre-signed URL
    await axios.put(uploadUrl, tsv, {
      headers: {
        "Content-Type": "text/tab-separated-values; charset=UTF-8",
      },
      maxBodyLength: Infinity,
    });
    console.log("✅ TSV uploaded successfully.");

    // Step 4: Submit the feed referencing the uploaded file
    const feedSubmitResponse = await axios.post(
      "https://sandbox.sellingpartnerapi-na.amazon.com/feeds/2021-06-30/feeds",
      {
        feedType: "POST_INVENTORY_AVAILABILITY",
        marketplaceIds: ["ATVPDKIKX0DER"],
        inputFeedDocumentId: feedDocumentId,
      },
      {
        headers: {
          "x-amz-access-token": access_token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const result = feedSubmitResponse.data;

    return res.status(200).json({
      message: "✅ Inventory feed submitted successfully",
      feedId: result.feedId,
      feedDocumentId,
    });
  } catch (error) {
    console.error("❌ Error submitting feed:", error.message);
    if (error.response?.data) {
      console.error("Response data:", JSON.stringify(error.response.data, null, 2));
    }
    return res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

// Auto-refresh token every 55 minutes
const AUTO_REFRESH_INTERVAL = 55 * 60 * 1000;
setInterval(async () => {
  try {
    await fetchNewAccessToken();
    console.log("[Auto Refresh] Token refreshed successfully");
  } catch (e) {
    console.error("[Auto Refresh] Failed to refresh token:", e.message);
  }
}, AUTO_REFRESH_INTERVAL);

// Initial token fetch on server start
(async () => {
  try {
    await fetchNewAccessToken();
    console.log("[Auto Refresh] Token refreshed successfully on startup");
  } catch (e) {
    console.error(
      "[Auto Refresh] Failed to refresh token on startup:",
      e.message
    );
  }
})();






app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`↪ GET /auth/token → returns current access token`);
  console.log(`↪ GET /test → calls Amazon API with current access token`);
});
