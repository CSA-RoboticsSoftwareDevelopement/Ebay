const express = require("express");

function ebayRoutes(db) {
  const router = express.Router(); // ✅ Create a router instance

  // ✅ Function to fetch eBay profile
  async function getEbayProfile(userId) {
    try {
      if (!userId) throw new Error("User ID is required");

      const [rows] = await db.query("SELECT * FROM ebay_accounts WHERE user_id = ?", [userId]);

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("❌ Error fetching eBay profile:", error);
      throw new Error("Database error fetching eBay profile");
    }
  }

  // ✅ Function to delete eBay profile
  async function deleteEbayProfile(userId) {
    try {
      if (!userId) throw new Error("User ID is required");

      const [result] = await db.query("DELETE FROM ebay_accounts WHERE user_id = ?", [userId]);

      return result.affectedRows > 0;
    } catch (error) {
      console.error("❌ Error deleting eBay profile:", error);
      throw new Error("Database error deleting eBay profile");
    }
  }

  // ✅ API: GET eBay profile
  router.get("/profile", async (req, res) => {
    try {
      const userId = req.query.user_id;
      if (!userId) return res.status(400).json({ error: "User ID is required" });

      const ebayProfile = await getEbayProfile(userId);

      if (!ebayProfile) {
        return res.status(404).json({ error: "No eBay account found" });
      }

      res.json({ ebayProfile });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

 // ✅ API: DELETE eBay profile (Disconnect)
router.delete("/disconnect", async (req, res) => {
    try {
      const { user_id: userId } = req.body; // ✅ Extract user_id safely
  
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
  
      const success = await deleteEbayProfile(userId);
  
      if (!success) {
        return res.status(404).json({ error: "No eBay account found to delete" });
      }
  
      res.json({ message: "✅ eBay account disconnected successfully" });
    } catch (error) {
      console.error("❌ Error disconnecting eBay account:", error);
      res.status(500).json({ error: "Server error disconnecting eBay account" });
    }
  });
  

  return router; // ✅ Return the router
}

module.exports = ebayRoutes;
