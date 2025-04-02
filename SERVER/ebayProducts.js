const express = require("express");
const axios = require("axios");
const qs = require("querystring");


require("dotenv").config(); // Load .env variables

const EBAY_API_URL = process.env.EBAY_API_URL || "https://api.sandbox.ebay.com";
const EBAY_CLIENT_ID = process.env.EBAY_CLIENT_ID;
const EBAY_CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET;

if (!EBAY_CLIENT_ID || !EBAY_CLIENT_SECRET) {
  console.error("❌ Missing eBay API credentials in environment variables!");
  process.exit(1); // Exit if credentials are missing
}

module.exports = (db) => {
  const router = express.Router();

  // ✅ Function to refresh an access token using refresh_token
  const refreshAccessToken = async (userId, refreshToken) => {
    try {
      if (!refreshToken) {
        console.log(`⚠️ No refresh token for User ${userId}. Skipping...`);
        return null;
      }

      console.log(`🔄 Refreshing Access Token for User ${userId}...`);

      const response = await axios.post(
        `${EBAY_API_URL}/identity/v1/oauth2/token`,
        qs.stringify({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          scope:
            "https://api.ebay.com/oauth/api_scope/sell.inventory " +
            "https://api.ebay.com/oauth/api_scope/sell.fulfillment",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(
              `${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`
            ).toString("base64")}`,
          },
        }
      );

      if (!response.data || !response.data.access_token) {
        throw new Error("Invalid response from eBay API");
      }

      const newAccessToken = response.data.access_token;
      const newExpiresAt = Date.now() + response.data.expires_in * 1000; // ✅ Dynamically set expiration time

      console.log(`✅ Token refreshed for User ${userId}, Expires at: ${new Date(newExpiresAt)}`);

      // ✅ Update the token in the database
      await db.query(
        "UPDATE `ebay_accounts` SET `access_token` = ?, `access_token_expires_at` = ? WHERE `user_id` = ?",
        [newAccessToken, newExpiresAt, userId]
      );

      return newAccessToken;
    } catch (error) {
      console.error(
        `❌ Error refreshing eBay token for User ${userId}:`,
        error.response?.data || error.message
      );
      return null;
    }
  };

  // ✅ Function to get a valid access token based on expiration time
  const getValidAccessToken = async (userId) => {
    try {
      const [rows] = await db.query(
        "SELECT `access_token`, `refresh_token`, `access_token_expires_at` FROM `ebay_accounts` WHERE `user_id` = ?",
        [userId]
      );

      if (rows.length === 0) {
        console.error(`❌ No eBay account found for User ${userId}`);
        return null;
      }

      const { access_token, refresh_token, access_token_expires_at } = rows[0];

      const currentTime = Date.now();
      const timeRemaining = Math.floor((access_token_expires_at - currentTime) / 1000); // Convert to seconds

      console.log(`🔍 User ${userId} Access Token Expires in: ${timeRemaining} seconds`);

      if (!access_token || currentTime >= access_token_expires_at) {
        console.log(`🔄 Access token expired for User ${userId}, refreshing...`);
        return await refreshAccessToken(userId, refresh_token);
      }

      return access_token;
    } catch (error) {
      console.error("❌ Database error fetching token:", error.message);
      return null;
    }
  };

  // 🔄 Function to refresh all tokens based on expiration
  const refreshAllTokens = async () => {
    try {
      console.log("🔄 Checking eBay tokens...");

      const [accounts] = await db.query(
        "SELECT `user_id`, `refresh_token`, `access_token_expires_at` FROM `ebay_accounts`"
      );

      const currentTime = Date.now();

      console.log(`🔍 Found ${accounts.length} eBay accounts.`);

      await Promise.all(
        accounts.map(({ user_id, refresh_token, access_token_expires_at }) => {
          const timeRemaining = Math.floor((access_token_expires_at - currentTime) / 1000); // Convert to seconds

          if (currentTime >= access_token_expires_at) {
            console.log(`🔄 Token expired for User ${user_id}, refreshing...`);
            return refreshAccessToken(user_id, refresh_token);
          } else {
            console.log(`✅ User ${user_id} token is still valid for ${timeRemaining} seconds`);
          }
        })
      );

      console.log("✅ Token refresh cycle complete.");
    } catch (error) {
      console.error("❌ Error in refreshAllTokens:", error.message);
    }
  };

  // ✅ Automatically refresh tokens every 10 seconds
  setInterval(async () => {
    await refreshAllTokens();
  }, 10000);

  console.log("🔄 eBay Token Auto-Refresh is enabled (Every 10s)");

  // ✅ Route to fetch inventory from eBay API for all users
  router.get("/inventory", async (req, res) => {
    try {
      // ✅ Fetch all users from database
      const [users] = await db.query("SELECT `user_id` FROM `ebay_accounts`");

      if (users.length === 0) {
        return res.status(404).json({ error: "No eBay accounts found" });
      }

      let allInventories = {};

      // ✅ Loop through all users and fetch their inventory
      for (const { user_id } of users) {
        const accessToken = await getValidAccessToken(user_id);
        if (!accessToken) {
          console.log(`❌ Skipping User ${user_id} due to invalid token.`);
          continue;
        }

        const inventoryUrl = `${EBAY_API_URL}/sell/inventory/v1/inventory_item`;

        console.log(`📦 Fetching eBay inventory for User ${user_id}:`, inventoryUrl);

        try {
          const response = await axios.get(inventoryUrl, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });

          allInventories[user_id] = response.data;
        } catch (inventoryError) {
          console.error(
            `❌ Error fetching inventory for User ${user_id}:`,
            inventoryError.response?.data || inventoryError.message
          );
          allInventories[user_id] = { error: "Failed to fetch inventory" };
        }
      }

      res.json(allInventories);
    } catch (error) {
      console.error("❌ Error fetching eBay inventory:", error.message);
      res.status(500).json({ error: "Failed to fetch inventory items" });
    }
  });

  router.post("/inventory/add", async (req, res) => {
    try {
      // Extract required fields from request body
      const { sku, title, quantity, price, currency, condition,mpn, description ,imageUrls } = req.body;
  
      if (!sku || !title || !quantity || !price || !currency || !condition ||!mpn ||!description ||!imageUrls) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      // Get user_id from database (assuming single eBay user for now)
      const [users] = await db.query("SELECT `user_id` FROM `ebay_accounts` LIMIT 1");
  
      if (users.length === 0) {
        return res.status(404).json({ error: "No eBay accounts found" });
      }
  
      const user_id = users[0].user_id;
      const accessToken = await getValidAccessToken(user_id);
  
      if (!accessToken) {
        return res.status(401).json({ error: "Access token is expired or missing" });
      }
  
      const inventoryUrl = `${EBAY_API_URL}/sell/inventory/v1/inventory_item/${sku}`;
  
      console.log(`🆕 Adding Inventory Item for User ${user_id}: ${sku}`);
  
      // eBay API request
      const response = await axios.put(
        inventoryUrl,
        {
          locale: "en-AU", // ✅ Set locale to Australia
          availability: {
            shipToLocationAvailability: {
              quantity: quantity,
            },
          },
          condition: condition,
          product: {
            title: title,
            aspects: {
              Brand: ["Bolt"],
            },
            description: description,
            imageUrls: imageUrls,  // ✅ Send user-provided image URL
            mpn: mpn,
          },
          price: {
            value: price,
            currency: currency,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "Content-Language": "en-US", // ✅ Add a valid language header
          },
        }
      );
  
      res.json({
        success: true,
        message: "Item added successfully",
        data: response.data,
      });
    } catch (error) {
      console.error(
        "❌ Error adding inventory item:",
        error.response?.data || error.message
      );
      res.status(500).json({ error: "Failed to add inventory item" });
    }
  });

  


  router.delete("/inventory/delete/:sku", async (req, res) => {
    try {
      const { sku } = req.params;
  
      if (!sku) {
        return res.status(400).json({ error: "SKU is required to delete an item" });
      }
  
      // ✅ Fetch `user_id` from the database
      const [users] = await db.query("SELECT `user_id` FROM `ebay_accounts` LIMIT 1");
  
      if (!users.length) {
        return res.status(404).json({ error: "No eBay accounts found" });
      }
  
      const user_id = users[0].user_id;
      const accessToken = await getValidAccessToken(user_id);
  
      if (!accessToken) {
        return res.status(401).json({ error: "Access token is expired or missing" });
      }
  
      const inventoryUrl = `${EBAY_API_URL}/sell/inventory/v1/inventory_item/${sku}`;
  
      console.log(`🗑️ Deleting Inventory Item for User ${user_id}: ${sku}`);
  
      // ✅ Send DELETE request to eBay API
      const response = await axios.delete(inventoryUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
  
      if (response.status === 204) {
        // ✅ eBay API returns 204 No Content when successful
        return res.json({
          success: true,
          message: `Item with SKU ${sku} deleted successfully`,
        });
      }
  
      res.status(response.status).json({
        success: false,
        error: "Unexpected response from eBay API",
      });
    } catch (error) {
      console.error("❌ Error deleting inventory item:", error.response?.data || error.message);
  
      res.status(error.response?.status || 500).json({
        error: error.response?.data?.message || "Failed to delete inventory item",
      });
    }
  });
  
  
  
  
  return router;
};