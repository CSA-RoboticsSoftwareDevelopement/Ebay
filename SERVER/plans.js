const express = require("express");

function plansRoutes(db) {
  const router = express.Router();
  // ✅ Get plans data
  router.get("/allplans", async (req, res) => {
    try {
      console.log("Fetching plans from the database...");
      
      // Query the plans table
      const [plans] = await db.query(
        "SELECT `id`, `plan_type`, `inventory`, `product_finder`, `platform`, `find_seller`, `product_optimization` FROM `plans` WHERE 1"
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
router.post("/addplans", async (req, res) => {
  const { plan_type,inventory, product_finder, platform, find_seller, product_optimization } = req.body;

  if ( typeof plan_type === 'undefined' ||  typeof inventory === 'undefined' || typeof product_finder === 'undefined' || typeof platform === 'undefined' || typeof find_seller === 'undefined' || typeof product_optimization === 'undefined') {
    return res.status(400).json({ error: "Missing or invalid parameters" });
  }

  try {
    // Insert new plan into the plans table
    const result = await db.query(
      "INSERT INTO plans (plan_type, inventory, product_finder, platform, find_seller, product_optimization) VALUES (?, ?, ?, ?, ?, ?)",
      [plan_type, inventory, product_finder, platform, find_seller ? 1 : 0, product_optimization ? 1 : 0]
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


return router;

}

module.exports = plansRoutes;
