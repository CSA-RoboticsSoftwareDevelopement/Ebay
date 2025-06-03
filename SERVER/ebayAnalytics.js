const express = require("express");
const axios = require("axios");
require("dotenv").config();

const EBAY_API_URL = process.env.EBAY_API_URL || "https://api.ebay.com";

function ebayAnalyticsService(db) {
  const router = express.Router();

  // Helper function to get valid access token
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

      if (!access_token || currentTime >= access_token_expires_at) {
        // Token refresh logic would go here (imported from ebayProducts.js)
        console.log(`Access token expired for User ${userId}`);
        return null;
      }

      return access_token;
    } catch (error) {
      console.error("❌ Error fetching eBay token:", error);
      return null;
    }
  };

  // Get traffic report for dashboard metrics
  const getTrafficReport = async (userId, timeframe) => {
    try {
      const accessToken = await getValidAccessToken(userId);
      if (!accessToken) {
        throw new Error("Unable to obtain valid access token");
      }

      const { startDate, endDate } = getDateRangeFromTimeframe(timeframe);

      // Log dates and filter for debugging
      console.log("🗓️ Fetching eBay traffic report with dates:", {
        startDate,
        endDate,
      });
      console.log(
        `🔎 Filter param: marketplace_ids:{"EBAY_AU"},date_range:[${startDate}..${endDate}]`
      );

      const filter = `marketplace_ids:{EBAY_AU},date_range:[${startDate}..${endDate}]`;

      const response = await axios.get(
        `${EBAY_API_URL}/sell/analytics/v1/traffic_report`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          params: {
            dimension: "DAY",
            metric:
              "CLICK_THROUGH_RATE,LISTING_IMPRESSION_STORE,LISTING_IMPRESSION_TOTAL,LISTING_IMPRESSION_SEARCH_RESULTS_PAGE,TRANSACTION",
            filter: filter, // Pass the unencoded filter string
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "❌ Error fetching eBay traffic report:",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  // Get seller standards profile
  const getSellerStandardsProfile = async (userId) => {
    try {
      const accessToken = await getValidAccessToken(userId);
      if (!accessToken) {
        throw new Error("Unable to obtain valid access token");
      }

      const response = await axios.get(
        `${EBAY_API_URL}/sell/analytics/v1/seller_standards_profile`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "❌ Error fetching seller standards profile:",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  // Helper function to convert timeframe to date range
  const getDateRangeFromTimeframe = (timeframe) => {
    const now = new Date();
    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );

    let startDate = new Date(today);

    switch (timeframe) {
      case "last7":
        startDate.setUTCDate(startDate.getUTCDate() - 7);
        break;
      case "last90":
        startDate.setUTCDate(startDate.getUTCDate() - 90);
        break;
      case "thisYear":
        startDate = new Date(Date.UTC(today.getUTCFullYear(), 0, 1));
        break;
      case "last30":
      default:
        startDate.setUTCDate(startDate.getUTCDate() - 30);
        break;
    }

    // Subtract 1 day from today to avoid "future" date errors
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    const formatDate = (date) => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      return `${year}${month}${day}`; // yyyymmdd
    };

    console.log("🕒 Current UTC today date:", today.toISOString());
    console.log(
      "🕒 Using yesterday as endDate to avoid future dates:",
      yesterday.toISOString()
    );

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(yesterday), // Use yesterday instead of today
    };
  };

  // API Route: Get Dashboard Metrics
  router.get("/dashboard-metrics", async (req, res) => {
    try {
      const { userId, timeframe = "last30" } = req.query;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // 1. Get traffic report from eBay
      const trafficData = await getTrafficReport(userId, timeframe).catch(
        () => null
      );

      // 2. Get seller standards profile
      const sellerProfile = await getSellerStandardsProfile(userId).catch(
        () => null
      );

      // 3. Get product costs from our database
      const [products] = await db
        .query(
          "SELECT SUM(cost_price) as total_cost, COUNT(*) as product_count FROM products WHERE user_id = ?",
          [userId]
        )
        .catch(() => [{ total_cost: 0, product_count: 0 }]);

      const productData = products[0] || { total_cost: 0, product_count: 0 };

      // 4. Calculate metrics based on available data
      const metrics = calculateMetrics(
        trafficData,
        sellerProfile,
        productData,
        timeframe
      );

      return res.json({ metrics });
    } catch (error) {
      console.error("❌ Error fetching dashboard metrics:", error);
      return res.status(500).json({
        error: "Server error fetching metrics",
        message: error.message,
      });
    }
  });

  // Calculate metrics from eBay data and our cost data
  const calculateMetrics = (
    trafficData,
    sellerProfile,
    productData,
    timeframe
  ) => {
    // Default to zeros if APIs fail
    const useRealData =
      trafficData && trafficData.records && trafficData.records.length > 0;

    if (useRealData) {
      // Process real data from eBay
      return processRealMetrics(
        trafficData,
        sellerProfile,
        productData,
        timeframe
      );
    } else {
      // Use zeros data generation
      return generateEmptyMetrics();
    }
  };

  // Process real metrics from API data
  const processRealMetrics = (
    trafficData,
    sellerProfile,
    productData,
    timeframe
  ) => {
    try {
      // Extract daily records from traffic data
      const records = trafficData.records || [];

      // Calculate total transactions (orders)
      let totalTransactions = 0;
      const transactionData = [];

      // Calculate total impressions
      let totalImpressions = 0;
      const impressionData = [];

      // Process records for chart data
      records.forEach((record) => {
        const date = record.date;
        const shortDate = record.date ? record.date.substring(5) : "unknown";

        // Process transactions (orders)
        const transactionValue = Array.isArray(record.metricData)
          ? record.metricData.find((m) => m.metadata.name === "TRANSACTION")
              ?.value || 0
          : 0;

        totalTransactions += parseFloat(transactionValue);
        transactionData.push({
          name: shortDate,
          value: parseFloat(transactionValue),
        });

        // Process impressions
        const storeImpressions = parseFloat(
          Array.isArray(record.metricData)
            ? record.metricData.find(
                (m) => m.metadata.name === "LISTING_IMPRESSION_STORE"
              )?.value || 0
            : 0
        );
        const searchImpressions = parseFloat(
          Array.isArray(record.metricData)
            ? record.metricData.find(
                (m) =>
                  m.metadata.name === "LISTING_IMPRESSION_SEARCH_RESULTS_PAGE"
              )?.value || 0
            : 0
        );

        const dayImpressions = storeImpressions + searchImpressions;
        totalImpressions += dayImpressions;
        impressionData.push({
          name: shortDate,
          value: dayImpressions,
        });
      });

      // Estimate revenue and profit (in a real implementation, would fetch actual transaction values)
      const estimatedAveragePrice = 50; // Placeholder, would be calculated from actual order data
      const estimatedRevenue = totalTransactions * estimatedAveragePrice;
      const estimatedPlatformFees = estimatedRevenue * 0.1; // Assuming 10% eBay fees
      const totalCost = parseFloat(productData.total_cost) || 0;
      const estimatedProfit =
        estimatedRevenue - estimatedPlatformFees - totalCost;
      const profitMargin =
        totalCost > 0 ? (estimatedProfit / estimatedRevenue) * 100 : 30;

      // Use actual product count if available
      const productCount = parseInt(productData.product_count) || 100;

      // Create metrics data structure
      return [
        {
          name: "Total Profit",
          value: `$${estimatedProfit.toFixed(2)}`,
          change: estimatedProfit > 0 ? "+0%" : "0%", // Would calculate actual change based on previous period
          isPositive: estimatedProfit >= 0,
          tooltip: "Net profit across all platforms after expenses",
          chartData: generateProfitChartData(
            transactionData,
            estimatedAveragePrice
          ),
        },
        {
          name: "Average Profit Margin",
          value: `${profitMargin.toFixed(1)}%`,
          change: profitMargin > 0 ? "+0%" : "0%", // Would calculate actual change
          isPositive: profitMargin >= 0,
          tooltip: "Average profit margin across all products",
          chartData: Array(transactionData.length)
            .fill()
            .map((_, i) => ({
              name: transactionData[i].name,
              value: profitMargin,
            })),
        },
        {
          name: "# of Orders",
          value: `${Math.round(totalTransactions)}`,
          change: totalTransactions > 0 ? "+0%" : "0%", // Would calculate actual change
          isPositive: totalTransactions >= 0,
          tooltip: "Total number of orders processed",
          chartData: transactionData,
        },
        {
          name: "# of Products",
          value: `${productCount}`,
          change: productCount > 0 ? "+0%" : "0%", // Would calculate actual change
          isPositive: productCount >= 0,
          tooltip: "Total number of products in inventory",
          chartData: Array(transactionData.length)
            .fill()
            .map((_, i) => ({
              name: transactionData[i].name,
              value: productCount,
            })),
        },
      ];
    } catch (error) {
      console.error("Error processing real metrics:", error);
      return generateEmptyMetrics();
    }
  };

  // Generate profit chart data from transaction data
  const generateProfitChartData = (transactionData, avgPrice) => {
    return transactionData.map((item) => {
      const revenue = item.value * avgPrice;
      const cost = revenue * 0.6; // Assuming 60% cost including fees
      const profit = revenue - cost;
      return {
        name: item.name,
        value: profit,
      };
    });
  };

  // Generate empty metrics when API data is unavailable
  const generateEmptyMetrics = () => {
    const emptyChartData = generateEmptyChartData();

    return [
      {
        name: "Total Profit",
        value: "$0.00",
        change: "0%",
        isPositive: true,
        tooltip: "Net profit across all platforms after expenses",
        chartData: emptyChartData,
      },
      {
        name: "Average Profit Margin",
        value: "0%",
        change: "0%",
        isPositive: true,
        tooltip: "Average profit margin across all products",
        chartData: emptyChartData,
      },
      {
        name: "# of Orders",
        value: "0",
        change: "0%",
        isPositive: true,
        tooltip: "Total number of orders processed",
        chartData: emptyChartData,
      },
      {
        name: "# of Products",
        value: "0",
        change: "0%",
        isPositive: true,
        tooltip: "Total number of products in inventory",
        chartData: emptyChartData,
      },
    ];
  };

  // Generate empty chart data for consistent display
  const generateEmptyChartData = () => {
    // Create empty chart data with at least 7 points for visualization
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    return months.map((month) => ({ name: month, value: 0 }));
  };

  return router;
}

module.exports = ebayAnalyticsService;
