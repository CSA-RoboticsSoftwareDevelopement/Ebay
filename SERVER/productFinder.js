const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Add delay utility function
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const API_KEY = "a1lh0bmst67bkavo2ea4v6us0g11ohjjircb8pf9j0ndf4t6t62a2goe0q2jk20f";
const DOMAIN_ID = 1; // Amazon US

// 🗂 Category map
const categories = {
    "Electronics": 172282,
    "Books": 283155,
      "Clothing, Shoes & Jewelry": 7141123011,
      "Home & Kitchen": 1055398,
      "Beauty & Personal Care": 11091801,
      "Health & Household": 3760901,
      "Toys & Games": 165793011,
      "Sports & Outdoors": 3375251,
      "Automotive": 15684181,
      "Industrial & Scientific": 16310091
};

// 📁 Ensure productfinder folder exists
const outputDir = path.join(__dirname, "productfinder");
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
    console.log("📁 Created 'productfinder' folder.");
}

// 📁 Ensure metadata file exists or initialize
const metaFilePath = path.join(outputDir, "fetch_metadata.json");
let metadata = [];

if (fs.existsSync(metaFilePath)) {
    const rawMeta = fs.readFileSync(metaFilePath);
    try {
        metadata = JSON.parse(rawMeta);
    } catch (err) {
        console.warn("⚠️ Couldn't parse metadata file. Starting fresh.");
        metadata = [];
    }
}

// 🧠 Function to fetch product details by ASIN
async function fetchProductDetails(categoryName, categoryId, asin) {
    await checkAndWaitForTokens(1); // Product API costs 1 token
    if (!asin) {
        console.warn(`⚠️ Skipping fetch for undefined ASIN in category: ${categoryName}`);
        return null; // Skip fetch if ASIN is invalid
    }

    const url = `https://api.keepa.com/product?key=${API_KEY}&domain=${DOMAIN_ID}&asin=${asin}`;

    try {
        const response = await axios.get(url);
        const product = response.data.products?.[0];

        if (!product) {
            console.warn(`⚠️ No product data found for ASIN ${asin}`);
            return null;
        }

        return {
            title: product.title || "N/A",
            imagesCSV: product.imagesCSV || "N/A",
            manufacturer: product.manufacturer || "N/A",
            asin: product.asin || "N/A",
            brand: product.brand || "N/A",
            features: product.features || [],
            description: product.description || "N/A",
            parentTitle: product.parentTitle || "N/A",
            starRating: product.reviewRating || "N/A",
            category: categoryName,
            categoryId: categoryId
        };
    } catch (error) {
        if (error.response?.data?.tokensLeft < 0) {
            const refillIn = error.response.data.refillIn || 0;
            console.log(`⏳ Rate limit reached. Waiting ${Math.ceil(refillIn/1000)} seconds for token refill...`);
            await delay(refillIn + 1000); // Add 1 second buffer
            await checkAndWaitForTokens(1); // Ensure we have tokens before retrying
            return fetchProductDetails(categoryName, categoryId, asin);
        }
        console.error(`❌ Error for ASIN ${asin}:`, error.response?.data || error.message);
        return null;
    }
}

// 💾 Save ASIN list to file in category-specific subfolders
function saveAsinsToFile(categoryName, categoryId, asinList) {
    const categoryFolder = path.join(outputDir, categoryName.replace(/ & /g, "_").replace(/\s+/g, "_"));
    if (!fs.existsSync(categoryFolder)) {
        fs.mkdirSync(categoryFolder);
        console.log(`📁 Created subfolder for category: ${categoryName}`);
    }

    const fileName = `${categoryName.replace(/ & /g, "_").replace(/\s+/g, "_")}_${categoryId}_asins.json`;
    const filePath = path.join(categoryFolder, fileName);

    fs.writeFileSync(filePath, JSON.stringify({ categoryName, categoryId, asinList }, null, 2));
    console.log(`💾 Saved ASIN list to ${filePath}`);
}

// 🧠 Get last fetched timestamp for a category from metadata
function getLastFetchTimestamp(categoryName) {
    const entry = metadata.find(item => item.categoryName === categoryName);
    return entry ? new Date(entry.timestamp) : null;
}

// 💾 Save progress during product details fetching
function saveProgress(filePath, productDetailsList, startTime, totalItems, processedCount) {
    try {
        // Save product details to file
        fs.writeFileSync(filePath, JSON.stringify({ productDetails: productDetailsList }, null, 2));

        // Calculate progress percentage and elapsed time
        const progress = ((processedCount / totalItems) * 100).toFixed(2);
        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);

        // Log progress
        console.log(`📊 Progress: ${progress}% (${processedCount}/${totalItems}) - Time elapsed: ${elapsedTime}s`);
    } catch (error) {
        console.error('❌ Error saving progress:', error);
    }
}

// 🧠 Check if ASIN exists and skip if identical
async function checkAndUpdateAsinData(categoryName, categoryId, asin) {
    const categoryFolder = path.join(outputDir, categoryName.replace(/ & /g, "_").replace(/\s+/g, "_"));
    const fileName = `${categoryName.replace(/ & /g, "_").replace(/\s+/g, "_")}_${categoryId}_product_details.json`;
    const filePath = path.join(categoryFolder, fileName);

    if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        const existingAsins = data.asinList || [];

        const existingAsin = existingAsins.find(item => item.asin === asin);
        if (existingAsin) {
            console.log(`⏩ Skipping ASIN ${asin} as it's already in the file.`);
            return true;
        }
    }

    return false;
}

// 🧠 Fetch Best Sellers for categories
// Add these constants at the top of the file after the existing ones
const TOKENS_PER_MINUTE = 20;
const TOKEN_REFRESH_INTERVAL = 60000; // 1 minute in milliseconds
let availableTokens = 20;
let lastTokenRefresh = Date.now();

// Add this token management function
// Token management queue
let tokenQueue = [];
let isProcessingQueue = false;

async function processTokenQueue() {
    if (isProcessingQueue) return;
    isProcessingQueue = true;

    while (tokenQueue.length > 0) {
        const { resolve, reject, tokensNeeded } = tokenQueue[0];
        
        try {
            const now = Date.now();
            const timeSinceRefresh = now - lastTokenRefresh;
            
            if (timeSinceRefresh >= TOKEN_REFRESH_INTERVAL) {
                availableTokens = TOKENS_PER_MINUTE;
                lastTokenRefresh = now;
            }

            if (availableTokens >= tokensNeeded) {
                availableTokens -= tokensNeeded;
                tokenQueue.shift();
                resolve(availableTokens);
            } else {
                const waitTime = TOKEN_REFRESH_INTERVAL - timeSinceRefresh + 1000; // Add 1s buffer
                console.log(`⏳ Waiting ${Math.ceil(waitTime/1000)}s for token refresh (${availableTokens} tokens left)`);
                await delay(waitTime);
            }
        } catch (error) {
            tokenQueue.shift();
            reject(error);
        }
    }

    isProcessingQueue = false;
}

async function checkAndWaitForTokens(tokensNeeded = 1) {
    return new Promise((resolve, reject) => {
        tokenQueue.push({ resolve, reject, tokensNeeded });
        processTokenQueue().catch(reject);
    });
}

// Modify fetchBestSellers function
async function fetchBestSellers(categoryName, categoryId) {
    await checkAndWaitForTokens(1); // Bestsellers API costs 1 token
    const url = `https://api.keepa.com/bestsellers?key=${API_KEY}&domain=${DOMAIN_ID}&category=${categoryId}&range=0`;

    console.log(`🛒 Fetching best sellers for ${categoryName} (${categoryId})`);

    try {
        const response = await axios.get(url);
        const asinList = response.data?.bestSellersList?.asinList;

        if (asinList?.length > 0) {
            console.log(`✅ Fetched ${asinList.length} ASINs for ${categoryName}`);
            return asinList;
        } else {
            console.warn(`⚠️ No ASINs found for ${categoryName}`);
            return [];
        }
    } catch (error) {
        if (error.response?.data?.tokensLeft < 0) {
            const refillIn = error.response.data.refillIn || 0;
            console.log(`⏳ Rate limit reached for ${categoryName}. Waiting ${Math.ceil(refillIn/1000)} seconds...`);
            await delay(refillIn + 1000); // Add 1 second buffer
            // Retry after waiting
            return fetchBestSellers(categoryName, categoryId);
        }
        console.error(`❌ Error fetching ${categoryName}:`, error.response?.data || error.message);
        return [];
    }
}

// Modify the main function to process categories sequentially
async function main() {
    const REFRESH_DAYS = 180;
    const now = new Date();
    const allAsins = new Map();

    // Phase 1: Fetch ASINs for each category sequentially
    console.log("📦 Phase 1: Fetching ASINs for all categories...");
    for (const [categoryName, categoryId] of Object.entries(categories)) {
        const lastFetch = getLastFetchTimestamp(categoryName);
        if (lastFetch) {
            const diffDays = Math.floor((now - lastFetch) / (1000 * 60 * 60 * 24));
            if (diffDays < REFRESH_DAYS) {
                console.log(`⏩ Skipping ${categoryName} - last fetched ${diffDays} days ago.`);
                continue;
            }
        }

        // Add delay between category requests
        await delay(3000);
        const asinList = await fetchBestSellers(categoryName, categoryId);
        if (asinList.length > 0) {
            allAsins.set(categoryName, { categoryId, asinList });
            saveAsinsToFile(categoryName, categoryId, asinList);
        }
    }

    // Phase 2: Process product details for all fetched ASINs concurrently
    console.log("\n📦 Phase 2: Fetching product details...");
    const categoryDetailsPromises = Array.from(allAsins.entries()).map(async ([categoryName, { categoryId, asinList }]) => {
        console.log(`\n🔍 Processing ${asinList.length} products for ${categoryName}...`);

        const categoryFolder = path.join(outputDir, categoryName.replace(/ & /g, "_").replace(/\s+/g, "_"));
        const fileName = `${categoryName.replace(/ & /g, "_").replace(/\s+/g, "_")}_${categoryId}_product_details.json`;
        const filePath = path.join(categoryFolder, fileName);

        let productDetailsList = [];
        if (fs.existsSync(filePath)) {
            const existingData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
            productDetailsList = existingData.productDetails || [];
        }

        let processedCount = 0;
        const startTime = Date.now();
        const totalItems = asinList.length;

        // Process ASINs in chunks to maintain rate limits
        const chunkSize = 2; // Process 2 ASINs at a time instead of 3

        for (let i = 0; i < asinList.length; i += chunkSize) {
            const chunk = asinList.slice(i, i + chunkSize);
            const chunkPromises = chunk.map(async (asin) => {
                if (!asin || await checkAndUpdateAsinData(categoryName, categoryId, asin)) {
                    return null;
                }
                return fetchProductDetails(categoryName, categoryId, asin);
            });

            const chunkResults = await Promise.all(chunkPromises);
            for (const productDetails of chunkResults) {
                if (productDetails) {
                    productDetailsList.push(productDetails);
                }
                processedCount++;
                saveProgress(filePath, productDetailsList, startTime, totalItems, processedCount);
            }

            // Removed the fixed delay and rely on token management
        }

        // Apply rate limit between chunks
        await delay(3000);

        // Final save for this category
        fs.writeFileSync(filePath, JSON.stringify({ productDetails: productDetailsList }, null, 2));
        console.log(`✅ Completed ${categoryName} - ${productDetailsList.length} products saved to ${filePath}`);
    });

    // Wait for all category processing to complete
    await Promise.all(categoryDetailsPromises);
}

// Export the categories
function getCategories() {
    return Object.keys(categories).map(category => ({
        name: category,
        id: categories[category]
    }));
}

// Remove the automatic execution
// main();

// Export the functions
module.exports = {
    main,
    getCategories
};

