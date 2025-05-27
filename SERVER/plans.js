const express = require("express");

function plansRoutes(db) {
  const router = express.Router();
  // ✅ Get plans data
  router.get("/allplans", async (req, res) => {
    try {
      console.log("Fetching plans from the database...");
      
      // Query the plans table
      const [plans] = await db.query(
        "SELECT `id`, `plan_type`, `inventory`,`price`, `product_finder`, `platform`, `find_seller`, `product_optimization` FROM `plans` WHERE 1"
      );
  
      if (!plans || plans.length === 0) {
        console.log("No plans found in the database.");
        return res.status(404).json({ message: "No plans available" });
      }
  
      console.log("Plans fetched:", plans);
      res.json({ plans: plans });
  
    } catch (error) {
      console.error("❌ Error fetching plans:", error);
      res.status(500).json({ error: "Server error fetching plans" });
    }
  });
  
  
// ✅ Insert a new plan
router.patch("/editplan/:id", async (req, res) => {
  const { id } = req.params;
  const { plan_type, inventory, price, product_finder, platform, find_seller, product_optimization } = req.body;

  if (
    typeof id === "undefined" ||
    typeof price === "undefined" ||
    typeof plan_type === "undefined" ||
    typeof inventory === "undefined" ||
    typeof product_finder === "undefined" ||
    typeof platform === "undefined" ||
    typeof find_seller === "undefined" ||
    typeof product_optimization === "undefined"
  ) {
    return res.status(400).json({ error: "Missing or invalid parameters" });
  }

  try {
    const result = await db.query(
      "UPDATE plans SET plan_type = ?, inventory = ?, price = ?, product_finder = ?, platform = ?, find_seller = ?, product_optimization = ? WHERE id = ?",
      [plan_type, inventory, price, product_finder, JSON.stringify(platform), find_seller ? 1 : 0, product_optimization ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Plan not found" });
    }

    res.status(200).json({ message: "✅ Plan updated successfully" });
  } catch (error) {
    console.error("❌ Error updating plan:", error);
    res.status(500).json({ error: "Server error updating plan" });
  }
});


router.post("/addplans", async (req, res) => {
  const { plan_type,inventory, product_finder, platform, find_seller, product_optimization, price } = req.body;

  if ( typeof price=== "undefined" || typeof plan_type === 'undefined' ||  typeof inventory === 'undefined' || typeof product_finder === 'undefined' || typeof platform === 'undefined' || typeof find_seller === 'undefined' || typeof product_optimization === 'undefined') {
    return res.status(400).json({ error: "Missing or invalid parameters" });
  }

  try {
    // Insert new plan into the plans table
    const result = await db.query(
      "INSERT INTO plans (plan_type, inventory, price, product_finder, platform, find_seller, product_optimization) VALUES (?, ?, ?, ?, ?, ? , ?)",
      [plan_type, inventory, price, product_finder, JSON.stringify(platform), find_seller ? 1 : 0, product_optimization ? 1 : 0]
    );

    res.status(201).json({
      message: "✅ New plan has been created successfully",
      planId: result.insertId,
    });
  } catch (error) {
    console.error("❌ Error inserting plan:", error);
    res.status(500).json({ error: "Server error inserting plan" });
  }
});


// ✅ Delete a plan by ID
router.delete("/deleteplan/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Missing plan ID" });
  }

  try {
    const result = await db.query("DELETE FROM plans WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Plan not found" });
    }

    res.status(200).json({ message: "✅ Plan deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting plan:", error);
    res.status(500).json({ error: "Server error deleting plan" });
  }
});


return router;

}

module.exports = plansRoutes;
