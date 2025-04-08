const express = require("express");

function pluginRoutes(db) {
  const router = express.Router();

  // ✅ Get installed plugins for a user
  router.get("/:user_id", async (req, res) => {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    try {
      const [rows] = await db.query("SELECT * FROM plugins WHERE user_id = ?", [
        user_id,
      ]);
      res.json({ plugins: rows });
    } catch (error) {
      console.error("❌ Error fetching plugins:", error);
      res.status(500).json({ error: "Server error fetching plugins" });
    }
  });

  // ✅ Install or uninstall a plugin
  router.post("/toggle", async (req, res) => {
    const { user_id, plugin_id, plugin_name, install } = req.body;

    if (!user_id || !plugin_id || typeof install !== "boolean") {
      return res.status(400).json({ error: "Missing or invalid parameters" });
    }

    try {
      // Check if the plugin already exists for the user
      const [existing] = await db.query(
        "SELECT * FROM plugins WHERE user_id = ? AND plugin_id = ?",
        [user_id, plugin_id]
      );

      if (existing.length > 0) {
        // Update installed status
        await db.query(
          "UPDATE plugins SET installed = ? WHERE user_id = ? AND plugin_id = ?",
          [install ? 1 : 0, user_id, plugin_id]
        );
      } else {
        // Insert new plugin record
        await db.query(
          "INSERT INTO plugins (user_id, plugin_id, plugin_name, installed) VALUES (?, ?, ?, ?)",
          [user_id, plugin_id, plugin_name || "Unknown", install ? 1 : 0]
        );
      }

      res.json({
        message: `✅ Plugin "${plugin_name || plugin_id}" has been ${
          install ? "installed" : "uninstalled"
        }`,
      });
    } catch (error) {
      console.error("❌ Error toggling plugin:", error);
      res.status(500).json({ error: "Server error toggling plugin" });
    }
  });



  return router;
}

module.exports = pluginRoutes;
