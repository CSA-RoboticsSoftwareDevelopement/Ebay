/* eslint-disable @typescript-eslint/no-require-imports */
// amazonRoutes.js
const express = require("express");
const router = express.Router();
const {
  getFbaInventory,
  simulateListing,
  addMockInventory,
  deleteMockInventory,
} = require("../amazonController/amazoncontroller");

router.get("/test", async (req, res) => {
  try {
    const data = await getFbaInventory();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/simulate-listing", async (req, res) => {
  try {
    const data = await simulateListing(req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/add-mock-inventory", (req, res) => {
  try {
    const result = addMockInventory(req.body);
    res.json({ message: "✅ Inventory added", data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/delete-mock-inventory", (req, res) => {
  try {
    const asin = req.query.asin ? req.query.asin.split(",") : [];
    const fnSku = req.query.fnSku ? req.query.fnSku.split(",") : [];
    const sellerSku = req.query.sellerSku ? req.query.sellerSku.split(",") : [];
    const result = deleteMockInventory({ asin, fnSku, sellerSku });
    res.json({ message: `🗑️ Deleted ${result.deleted} item(s).` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
