const express = require("express");
const bcrypt = require("bcryptjs");

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
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
  
      // ✅ Fetch eBay profile
      const ebayProfile = await getEbayProfile(userId);
      
      // ✅ Fetch user details from users table
      const [userRows] = await db.query(
        "SELECT id, username, email, is_admin, created_at, updated_at FROM users WHERE id = ?",
        [userId]
      );
  
      if (!ebayProfile && userRows.length === 0) {
        return res.status(404).json({ error: "No eBay account or user found" });
      }
  
      // ✅ Prepare response
      const userProfile = userRows.length > 0 ? userRows[0] : null;
  
      return res.json({ 
        ebayProfile, 
        userProfile 
      });
  
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
      return res.status(500).json({ error: "Server error fetching profile" });
    }
  });
  // ✅ API: Partially Update Username & Email
  router.patch("/update-profile/:user_id", async (req, res) => {
    try {
      const { user_id } = req.params; // Get user_id from URL
      let updates = req.body; // Get dynamic fields to update
  
      if (!user_id) {
        return res.status(400).json({ error: "User ID is required" });
      }
  
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "At least one valid field is required to update" });
      }
  
      let query = "UPDATE users SET ";
      let values = [];
      let updatedFields = []; // ✅ Track updated fields
  
      // ✅ Check if password needs hashing
      if (updates.password) {
        const hashedPassword = await bcrypt.hash(updates.password, 10);
        updates.password = hashedPassword;
        updatedFields.push("password"); // ✅ Mark password as updated
      }
  
      // ✅ Dynamically build query and track fields
      for (const [key, value] of Object.entries(updates)) {
        query += `${key} = ?, `;
        values.push(value);
        updatedFields.push(key);
      }
  
      // Remove last comma and space, then add WHERE condition
      query = query.slice(0, -2) + " WHERE id = ?";
      values.push(user_id);
  
      // Execute the update query
      const [result] = await db.query(query, values);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found or no changes made" });
      }
  
      console.log("✅ Profile updated successfully:", updatedFields);
  
      return res.json({
        message: "✅ Profile updated successfully",
        updatedFields, // ✅ Return updated fields
      });
  
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      return res.status(500).json({ error: "Server error updating profile" });
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
