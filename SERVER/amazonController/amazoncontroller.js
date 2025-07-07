/* eslint-disable @typescript-eslint/no-require-imports */
// amazonController.js
require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const INVENTORY_FILE = path.join(__dirname, "mockInventory.json");

function loadInventory() {
  try {
    const data = fs.readFileSync(INVENTORY_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveInventory(data) {
  fs.writeFileSync(INVENTORY_FILE, JSON.stringify(data, null, 2));
}

let mockInventoryList = loadInventory();

async function getAccessToken() {
  const response = await axios.post("https://api.amazon.com/auth/o2/token", {
    grant_type: "refresh_token",
    refresh_token: process.env.REFRESH_TOKEN,
    client_id: process.env.LWA_CLIENT_ID,
    client_secret: process.env.LWA_CLIENT_SECRET,
  });
  return response.data.access_token;
}

async function getFbaInventory() {
  const accessToken = await getAccessToken();
  const host = process.env.SPAPI_HOST;
  const path = `/fba/inventory/v1/summaries?granularityType=Marketplace&granularityId=${process.env.MARKETPLACE_ID}&marketplaceIds=${process.env.MARKETPLACE_ID}&details=true`;

  const requestUrl = `https://${host}${path}`;
  const response = await axios.get(requestUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "x-amz-access-token": accessToken,
      "content-type": "application/json",
      "user-agent": "fba-app-node (Language=Node.js)",
    },
  });

  if (mockInventoryList.length > 0) {
    response.data.payload.inventorySummaries.push(...mockInventoryList);
  }

  return response.data;
}

async function simulateListing({ sku, item_name, brand, manufacturer, asin, condition }) {
  const accessToken = await getAccessToken();
  const host = process.env.SPAPI_HOST;
  const sellerId = process.env.SELLER_ID;
  const path = `/listings/2021-08-01/items/${sellerId}/${sku}`;
  const requestUrl = `https://${host}${path}`;

  const body = {
    productType: "PRODUCT",
    attributes: {
      item_name: [{ value: item_name }],
      brand: [{ value: brand }],
      manufacturer: [{ value: manufacturer }],
      standard_product_id: [{ value: asin, type: "ASIN" }],
      item_sku: [{ value: sku }],
      condition_type: [{ value: condition || "new_new" }],
    },
  };

  const response = await axios.put(requestUrl, body, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "x-amz-access-token": accessToken,
      "content-type": "application/json",
      "user-agent": "fba-app-node (Language=Node.js)",
    },
  });

  return response.data;
}

function addMockInventory(data) {
  mockInventoryList.push(data);
  saveInventory(mockInventoryList);
  return data;
}

function deleteMockInventory({ asin = [], fnSku = [], sellerSku = [] }) {
  const before = mockInventoryList.length;
  mockInventoryList = mockInventoryList.filter((item) => {
    if (asin.includes(item.asin)) return false;
    if (fnSku.includes(item.fnSku)) return false;
    if (sellerSku.includes(item.sellerSku)) return false;
    return true;
  });
  saveInventory(mockInventoryList);
  return { deleted: before - mockInventoryList.length };
}

module.exports = {
  getFbaInventory,
  simulateListing,
  addMockInventory,
  deleteMockInventory,
};
