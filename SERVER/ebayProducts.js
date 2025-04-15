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

      console.log(
        `✅ Token refreshed for User ${userId}, Expires at: ${new Date(
          newExpiresAt
        )}`
      );

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
      const timeRemaining = Math.floor(
        (access_token_expires_at - currentTime) / 1000
      ); // Convert to seconds

      console.log(
        `🔍 User ${userId} Access Token Expires in: ${timeRemaining} seconds`
      );

      if (!access_token || currentTime >= access_token_expires_at) {
        console.log(
          `🔄 Access token expired for User ${userId}, refreshing...`
        );
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
          const timeRemaining = Math.floor(
            (access_token_expires_at - currentTime) / 1000
          ); // Convert to seconds

          if (currentTime >= access_token_expires_at) {
            console.log(`🔄 Token expired for User ${user_id}, refreshing...`);
            return refreshAccessToken(user_id, refresh_token);
          } else {
            console.log(
              `✅ User ${user_id} token is still valid for ${timeRemaining} seconds`
            );
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
      const { user_id } = req.query;

      if (!user_id) {
        return res
          .status(400)
          .json({ error: "Missing user_id in query parameters" });
      }

      // ✅ Fetch user's token info
      const [rows] = await db.query(
        "SELECT `user_id` FROM `ebay_accounts` WHERE `user_id` = ?",
        [user_id]
      );

      if (rows.length === 0) {
        return res
          .status(404)
          .json({ error: `No eBay account found for user_id ${user_id}` });
      }

      const accessToken = await getValidAccessToken(user_id);
      if (!accessToken) {
        return res
          .status(401)
          .json({ error: "Access token is expired or missing" });
      }

      const inventoryUrl = `${EBAY_API_URL}/sell/inventory/v1/inventory_item`;

      console.log(
        `📦 Fetching eBay inventory for User ${user_id}:`,
        inventoryUrl
      );

      const response = await axios.get(inventoryUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      res.json({
        user_id,
        inventory: response.data,
      });
    } catch (error) {
      console.error(
        "❌ Error fetching eBay inventory:",
        error.response?.data || error.message
      );
      res.status(500).json({ error: "Failed to fetch inventory items" });
    }
  });

  // ✅ Get full inventory item details by SKU
  router.get("/inventory/item/:sku", async (req, res) => {
    try {
      const { sku } = req.params;
  
      if (!sku) {
        return res
          .status(400)
          .json({ error: "SKU is required in the URL path" });
      }
  
      // Fetch the first available user (you can adjust this per project need)
      const [users] = await db.query(
        "SELECT `user_id` FROM `ebay_accounts` LIMIT 1"
      );
  
      if (!users.length) {
        return res.status(404).json({ error: "No eBay accounts found" });
      }
  
      const user_id = users[0].user_id;
      const accessToken = await getValidAccessToken(user_id);
  
      if (!accessToken) {
        return res
          .status(401)
          .json({ error: "Access token is expired or missing" });
      }
  
      const itemUrl = `${EBAY_API_URL}/sell/inventory/v1/inventory_item/${sku}`;
  
      console.log(`🔍 Fetching full inventory item: ${sku}`);
  
      const response = await axios.get(itemUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
  
      // Ensure availability fields exist in the response
      const { availability } = response.data;
  
      const pickupAtLocationAvailability = 
        availability?.pickupAtLocationAvailability || []; // Default to an empty array
      const shipToLocationAvailability =
        availability?.shipToLocationAvailability || {}; // Default to an empty object
  
      // Construct the response
      const data = {
        sku,
        product: response.data.product,
        condition: response.data.condition,
        availability: {
          pickupAtLocationAvailability,
          shipToLocationAvailability,
        },
      };
  
      // Send the full response with default availability if no data
      res.json(data);
    } catch (error) {
      console.error(
        "❌ Error fetching inventory item:",
        error.response?.data || error.message
      );
  
      res.status(error.response?.status || 500).json({
        error:
          error.response?.data?.message || "Failed to fetch inventory item",
      });
    }
  });
  
  router.put("/inventory/stock/:sku", async (req, res) => {
    try {
      const { sku } = req.params;
  
      if (!sku) {
        return res.status(400).json({ error: "SKU is required in the path" });
      }
  
      // Extract full request body
      const {
        quantity = 0,
        condition,
        conditionDescription,
        pickupAtLocationAvailability = [],
        shipToLocationAvailability,
        product = {},
        packageWeightAndSize = {},
        price, // ✅ New: extract price
      } = req.body;
  
      // Get eBay user
      const [users] = await db.query(
        "SELECT `user_id` FROM `ebay_accounts` LIMIT 1"
      );
      if (!users.length)
        return res.status(404).json({ error: "No eBay account found" });
  
      const user_id = users[0].user_id;
      const accessToken = await getValidAccessToken(user_id);
      if (!accessToken)
        return res
          .status(401)
          .json({ error: "Access token expired or missing" });
  
      const url = `${EBAY_API_URL}/sell/inventory/v1/inventory_item/${sku}`;
  
      console.log(`⚙️ Updating inventory item for SKU ${sku}`);
  
      // Prepare headers
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Content-Language": "en-US",
      };
  
      // Prepare inventory item body
      const requestBody = {
        availability: {
          pickupAtLocationAvailability,
          shipToLocationAvailability: shipToLocationAvailability || {
            quantity: quantity,
          },
        },
        condition: condition || "NEW",
        conditionDescription: conditionDescription || "",
        product,
        packageWeightAndSize,
        locale: "en-US",
      };
  
      console.log("🔍 Inventory Item Body:", requestBody);
  
      // Update inventory item first
      const inventoryResponse = await axios.put(url, requestBody, {
        headers,
      });
  
      // Optionally: handle price here (if applicable)
      if (price && price.value && price.currency) {
        console.log(
          `💰 Received price info for SKU ${sku}: ${price.value} ${price.currency}`
        );
        // You would typically use this to create/update an offer later
        // You could even store this in your DB or queue it for async processing
      }
  
      res.json({
        success: true,
        message: `Inventory for SKU ${sku} updated successfully`,
        data: inventoryResponse.data,
      });
    } catch (error) {
      console.error(
        "❌ Error updating inventory item:",
        error.response?.data || error.message
      );
      res.status(error.response?.status || 500).json({
        error:
          error.response?.data?.message || "Failed to update inventory item",
      });
    }
  });
  
  

  router.post("/inventory/add", async (req, res) => {
    try {
      // Extract required fields from request body
      const {
        sku,
        title,
        quantity,
        price,
        currency,
        condition,
        mpn,
        description,
        imageUrls,
      } = req.body;

      if (
        !sku ||
        !title ||
        !quantity ||
        !price ||
        !currency ||
        !condition ||
        !mpn ||
        !description ||
        !imageUrls
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Get user_id from database (assuming single eBay user for now)
      const [users] = await db.query(
        "SELECT `user_id` FROM `ebay_accounts` LIMIT 1"
      );

      if (users.length === 0) {
        return res.status(404).json({ error: "No eBay accounts found" });
      }

      const user_id = users[0].user_id;
      const accessToken = await getValidAccessToken(user_id);

      if (!accessToken) {
        return res
          .status(401)
          .json({ error: "Access token is expired or missing" });
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
            imageUrls: imageUrls, // ✅ Send user-provided image URL
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
        return res
          .status(400)
          .json({ error: "SKU is required to delete an item" });
      }

      // ✅ Fetch `user_id` from the database
      const [users] = await db.query(
        "SELECT `user_id` FROM `ebay_accounts` LIMIT 1"
      );

      if (!users.length) {
        return res.status(404).json({ error: "No eBay accounts found" });
      }

      const user_id = users[0].user_id;
      const accessToken = await getValidAccessToken(user_id);

      if (!accessToken) {
        return res
          .status(401)
          .json({ error: "Access token is expired or missing" });
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
      console.error(
        "❌ Error deleting inventory item:",
        error.response?.data || error.message
      );

      res.status(error.response?.status || 500).json({
        error:
          error.response?.data?.message || "Failed to delete inventory item",
      });
    }
  });
  router.post("/products/insert", async (req, res) => {
    try {
      // Extract details from the request body
      const { id, sku, cost_price, ebay_fees } = req.body;
  
      // Check if required fields are provided
      if (!sku || !cost_price || !ebay_fees) {
        return res.status(400).json({ error: "Missing required fields: sku, cost_price, ebay_fees" });
      }
  
      // Get the current time for created_at and updated_at
      const currentTime = new Date();
  
      // Check if the product with the given SKU already exists
      const [existingProduct] = await db.query("SELECT * FROM `products` WHERE `sku` = ?", [sku]);
  
      // If the product exists, perform an update
      if (existingProduct.length > 0) {
        // Update the existing product with new values
        const updateResult = await db.query(
          "UPDATE `products` SET `sku` = ?, `cost_price` = ?, `ebay_fees` = ?, `updated_at` = ? WHERE `sku` = ?",
          [sku, cost_price, ebay_fees, currentTime, sku]
        );
  
        if (updateResult[0].affectedRows > 0) {
          return res.json({
            success: true,
            message: "Product updated successfully",
            data: {
              id: existingProduct[0].id, // Use the existing product ID
              sku,
              cost_price,
              ebay_fees,
              updated_at: currentTime,
            },
          });
        } else {
          return res.status(400).json({ error: "Product update failed or no changes detected." });
        }
      }
  
      // If the product does not exist, insert a new product
      const [insertResult] = await db.query(
        "INSERT INTO `products` (`sku`, `cost_price`, `ebay_fees`, `created_at`, `updated_at`) VALUES (?, ?, ?, ?, ?)",
        [sku, cost_price, ebay_fees, currentTime, currentTime]
      );
  
      // Return success response with the inserted product's ID
      res.json({
        success: true,
        message: "Product inserted successfully",
        data: {
          id: insertResult.insertId, // The ID of the newly inserted product
          sku,
          cost_price,
          ebay_fees,
          created_at: currentTime,
          updated_at: currentTime,
        },
      });
    } catch (error) {
      console.error("❌ Error processing product:", error.message);
      res.status(500).json({ error: "Failed to process product" });
    }
  });
  
// Endpoint to get all product details from the database
router.get("/productsdata", async (req, res) => {
  try {
    // Query the database to get all products
    const [products] = await db.query("SELECT * FROM `products`");

    // Check if products are found
    if (products.length > 0) {
      res.json({
        success: true,
        message: "Products retrieved successfully",
        data: products,
      });
    } else {
      res.status(404).json({ error: "No products found" });
    }
  } catch (error) {
    console.error("❌ Error fetching products:", error.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});




  return router;
};
