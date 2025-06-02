const express = require("express");
const axios = require("axios");

function dashboardService(db) {
  const router = express.Router();

  // Get dashboard metrics from all platforms
  router.get("/metrics", async (req, res) => {
    try {
      const { userId, timeframe = 'last30' } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // 1. Get user's connected platforms
      const platforms = await getConnectedPlatforms(userId);
      
      // 2. Collect metrics from each platform
      const allPlatformMetrics = await collectAllPlatformMetrics(userId, timeframe, platforms);
      
      // 3. Get product costs from our database for profit calculations
      const costData = await getProductCosts(userId);
      
      // 4. Calculate the aggregated metrics
      const metrics = calculateAggregatedMetrics(allPlatformMetrics, costData, timeframe);

      return res.json({ metrics });
    } catch (error) {
      console.error("❌ Error fetching dashboard metrics:", error);
      return res.status(500).json({ 
        error: "Server error fetching metrics", 
        message: error.message 
      });
    }
  });

  // Get user's connected platforms
  const getConnectedPlatforms = async (userId) => {
    try {
      // Check for connected eBay account with valid tokens
      const [ebayAccounts] = await db.query(
        "SELECT access_token, refresh_token, access_token_expires_at FROM ebay_accounts WHERE user_id = ?",
        [userId]
      );
      
      const platforms = [];
      
      if (ebayAccounts.length > 0) {
        // Check if the token is still valid or close to expiring
        const account = ebayAccounts[0];
        const currentTime = Date.now();
        const tokenValid = account.access_token && account.access_token_expires_at > currentTime;
        
        if (tokenValid) {
          platforms.push("ebay");
        } else {
          console.log(`eBay account found for user ${userId} but token is expired or invalid`);
        }
      }
      
      // Future: Check for connected Amazon account
      // const [amazonAccounts] = await db.query(
      //   "SELECT 1 FROM amazon_accounts WHERE user_id = ?",
      //   [userId]
      // );
      // 
      // if (amazonAccounts.length > 0) {
      //   platforms.push("amazon");
      // }
      
      return platforms;
    } catch (error) {
      console.error("❌ Error fetching connected platforms:", error);
      return []; // Return empty array if query fails
    }
  };

  // Get product costs from database
  const getProductCosts = async (userId) => {
    try {
      const [products] = await db.query(
        "SELECT SUM(cost_price) as total_cost, COUNT(*) as product_count FROM products WHERE user_id = ?",
        [userId]
      );
      
      return products[0] || { total_cost: 0, product_count: 0 };
    } catch (error) {
      console.error("❌ Error fetching product costs:", error);
      return { total_cost: 0, product_count: 0 };
    }
  };

  // Collect metrics from all connected platforms
  const collectAllPlatformMetrics = async (userId, timeframe, platforms) => {
    const metrics = {};
    
    // Get metrics from each platform in parallel
    const promises = platforms.map(platform => {
      return getPlatformMetrics(platform, userId, timeframe)
        .then(data => {
          metrics[platform] = data;
        })
        .catch(error => {
          console.error(`❌ Error fetching ${platform} metrics:`, error);
          metrics[platform] = null;
        });
    });
    
    await Promise.all(promises);
    return metrics;
  };

  // Get metrics from a specific platform
  const getPlatformMetrics = async (platform, userId, timeframe) => {
    // Import platform-specific metric gathering functions
    switch (platform) {
      case "ebay":
        try {
          // Create a proper instance of the eBay analytics service
          const ebayAnalyticsService = require('./ebayAnalytics')(db);
          
          // Make proper HTTP requests to our eBay analytics endpoints
          const response = await axios.get(`http://localhost:${process.env.PORT || 5000}/api/ebay/analytics/dashboard-metrics`, {
            params: {
              userId,
              timeframe
            }
          }).catch(error => {
            console.error("Error making internal request to eBay analytics:", error.message);
            return { data: { metrics: null } };
          });
          
          return response.data.metrics || null;
        } catch (error) {
          console.error("❌ Error fetching eBay metrics:", error);
          return null;
        }
      
      case "amazon":
        // Future implementation for Amazon
        return null;
        
      default:
        return null;
    }
  };

  // Calculate aggregated metrics from all platforms
  const calculateAggregatedMetrics = (allPlatformMetrics, costData, timeframe) => {
    // If no real data available, return empty metrics with zeros
    if (!hasValidMetrics(allPlatformMetrics)) {
      return generateEmptyMetrics();
    }
    
    try {
      // Extract metrics for calculation
      const platformsData = Object.entries(allPlatformMetrics)
        .filter(([_, data]) => data !== null);
      
      if (platformsData.length === 0) {
        return generateEmptyMetrics();
      }
      
      // Calculate aggregated metrics
      let totalOrders = 0;
      let totalRevenue = 0;
      let totalPlatformFees = 0;
      const chartDataByPlatform = {};
      
      // Process metrics from each platform
      platformsData.forEach(([platform, data]) => {
        const metrics = processPlatformData(platform, data, timeframe);
        totalOrders += metrics.orders;
        totalRevenue += metrics.revenue;
        totalPlatformFees += metrics.fees;
        chartDataByPlatform[platform] = metrics.chartData;
      });
      
      // Get cost data
      const totalCost = parseFloat(costData.total_cost) || 0;
      const productCount = parseInt(costData.product_count) || 0;
      
      // Calculate profit and margin
      const totalProfit = totalRevenue - totalPlatformFees - totalCost;
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
      
      // Merge chart data from all platforms
      const mergedChartData = mergeChartData(chartDataByPlatform);
      
      // Calculate actual change percentage (would be compared with previous period in real implementation)
      // For now, we'll use fixed values if positive, otherwise default to 0%
      const profitChange = totalProfit > 0 ? '+12.3%' : '0%';
      const marginChange = profitMargin > 0 ? '+2.1%' : '0%';
      const orderChange = totalOrders > 0 ? '+18.5%' : '0%';
      const productChange = productCount > 0 ? '+5.8%' : '0%';
      
      // Create metrics array in the expected format
      return [
        {
          name: 'Total Profit',
          value: `$${totalProfit.toFixed(2)}`,
          change: profitChange,
          isPositive: totalProfit >= 0,
          tooltip: 'Net profit across all platforms after expenses',
          chartData: mergedChartData.profit || generateEmptyChartData(),
        },
        {
          name: 'Average Profit Margin',
          value: `${profitMargin.toFixed(1)}%`,
          change: marginChange,
          isPositive: profitMargin >= 0,
          tooltip: 'Average profit margin across all products',
          chartData: mergedChartData.margin || generateEmptyChartData(),
        },
        {
          name: '# of Orders',
          value: `${Math.round(totalOrders)}`,
          change: orderChange,
          isPositive: totalOrders >= 0,
          tooltip: 'Total number of orders processed',
          chartData: mergedChartData.orders || generateEmptyChartData(),
        },
        {
          name: '# of Products',
          value: `${productCount}`,
          change: productChange,
          isPositive: productCount >= 0,
          tooltip: 'Total number of products in inventory',
          chartData: mergedChartData.products || generateEmptyChartData(),
        },
      ];
    } catch (error) {
      console.error("Error calculating aggregated metrics:", error);
      return generateEmptyMetrics();
    }
  };

  // Check if we have valid metrics data
  const hasValidMetrics = (allPlatformMetrics) => {
    return Object.values(allPlatformMetrics).some(data => data !== null);
  };

  // Process platform-specific data
  const processPlatformData = (platform, data, timeframe) => {
    switch (platform) {
      case "ebay":
        return processEbayData(data, timeframe);
      case "amazon":
        // Future implementation
        return { orders: 0, revenue: 0, fees: 0, chartData: {} };
      default:
        return { orders: 0, revenue: 0, fees: 0, chartData: {} };
    }
  };

  // Process eBay-specific data
  const processEbayData = (data, timeframe) => {
    // If we received formatted metrics directly from eBay analytics service
    if (Array.isArray(data) && data.length === 4) {
      // The eBay analytics service already returns properly formatted metrics
      // We just need to extract the values we need
      
      // Find metrics by name
      const profitMetric = data.find(m => m.name === 'Total Profit');
      const marginMetric = data.find(m => m.name === 'Average Profit Margin');
      const ordersMetric = data.find(m => m.name === '# of Orders');
      const productsMetric = data.find(m => m.name === '# of Products');
      
      // Extract numeric values
      const profit = parseFloat(profitMetric?.value?.replace('$', '') || '0');
      const margin = parseFloat(marginMetric?.value?.replace('%', '') || '0');
      const orders = parseInt(ordersMetric?.value || '0');
      const productCount = parseInt(productsMetric?.value || '0');
      
      // Calculate revenue based on profit and margin
      const revenue = margin > 0 ? profit / (margin / 100) : 0;
      const fees = revenue * 0.1; // Estimate 10% fees
      
      return {
        orders,
        revenue,
        fees,
        chartData: {
          orders: ordersMetric?.chartData || [],
          profit: profitMetric?.chartData || [],
          margin: marginMetric?.chartData || [],
          products: productsMetric?.chartData || []
        }
      };
    }
    
    // Original implementation as fallback for old format
    if (!data || !data.trafficData || !data.trafficData.records) {
      return { orders: 0, revenue: 0, fees: 0, chartData: {} };
    }
    
    const records = data.trafficData.records;
    let totalOrders = 0;
    
    // Chart data arrays
    const orderChartData = [];
    const profitChartData = [];
    const marginChartData = [];
    
    // Process records
    records.forEach(record => {
      const date = record.date;
      const shortDate = date.substring(5); // Format: MM-DD
      
      // Get transaction count
      const transactionValue = parseFloat(
        record.metricData.find(m => m.metadata.name === "TRANSACTION")?.value || 0
      );
      totalOrders += transactionValue;
      
      // Store in chart data
      orderChartData.push({
        name: shortDate,
        value: transactionValue
      });
      
      // Calculate estimated revenue and profit
      const estimatedAvgPrice = 50; // Placeholder
      const dailyRevenue = transactionValue * estimatedAvgPrice;
      const dailyFees = dailyRevenue * 0.1; // Assume 10% fees
      const dailyCost = dailyRevenue * 0.5; // Assume 50% cost
      const dailyProfit = dailyRevenue - dailyFees - dailyCost;
      const dailyMargin = dailyRevenue > 0 ? (dailyProfit / dailyRevenue) * 100 : 0;
      
      profitChartData.push({
        name: shortDate,
        value: dailyProfit
      });
      
      marginChartData.push({
        name: shortDate,
        value: dailyMargin
      });
    });
    
    // Calculate totals
    const estimatedAvgPrice = 50; // Placeholder
    const totalRevenue = totalOrders * estimatedAvgPrice;
    const totalFees = totalRevenue * 0.1; // Assume 10% fees
    
    return {
      orders: totalOrders,
      revenue: totalRevenue,
      fees: totalFees,
      chartData: {
        orders: orderChartData,
        profit: profitChartData,
        margin: marginChartData,
        // Products chart data will be generated separately
      }
    };
  };

  // Merge chart data from different platforms
  const mergeChartData = (chartDataByPlatform) => {
    // Initialize merged data structure
    const mergedData = {
      profit: [],
      margin: [],
      orders: [],
      products: []
    };
    
    // If no platforms have data, return empty
    if (Object.keys(chartDataByPlatform).length === 0) {
      return mergedData;
    }
    
    // Use the first platform's data to establish the date points
    const firstPlatform = Object.keys(chartDataByPlatform)[0];
    const firstPlatformData = chartDataByPlatform[firstPlatform];
    
    if (!firstPlatformData.orders || firstPlatformData.orders.length === 0) {
      return mergedData;
    }
    
    // Extract the dates from the first platform
    const dates = firstPlatformData.orders.map(point => point.name);
    
    // For each date, sum up the values from all platforms
    dates.forEach((date, index) => {
      let totalProfit = 0;
      let totalOrders = 0;
      let platformCount = 0;
      
      // Sum values across platforms
      Object.values(chartDataByPlatform).forEach(platformData => {
        if (platformData.profit && platformData.profit[index]) {
          totalProfit += platformData.profit[index].value;
        }
        
        if (platformData.orders && platformData.orders[index]) {
          totalOrders += platformData.orders[index].value;
        }
        
        platformCount++;
      });
      
      // Calculate average margin across platforms
      const avgMargin = totalProfit > 0 
        ? (totalProfit / (totalOrders * 50)) * 100 // Using same avg price as in processing
        : 0;
      
      // Add to merged data
      mergedData.profit.push({ name: date, value: totalProfit });
      mergedData.orders.push({ name: date, value: totalOrders });
      mergedData.margin.push({ name: date, value: avgMargin });
      
      // Products chart will be handled separately since it comes from our database
    });
    
    // Generate products data based on orders data structure
    // In a real implementation, this would come from historical product data
    const productCount = 120; // Placeholder
    mergedData.products = mergedData.orders.map(point => ({
      name: point.name,
      value: productCount
    }));
    
    return mergedData;
  };

  // Generate empty metrics when no data is available
  const generateEmptyMetrics = () => {
    return [
      {
        name: 'Total Profit',
        value: '$0.00',
        change: '0%',
        isPositive: true,
        tooltip: 'Net profit across all platforms after expenses',
        chartData: generateEmptyChartData(),
      },
      {
        name: 'Average Profit Margin',
        value: '0%',
        change: '0%',
        isPositive: true,
        tooltip: 'Average profit margin across all products',
        chartData: generateEmptyChartData(),
      },
      {
        name: '# of Orders',
        value: '0',
        change: '0%',
        isPositive: true,
        tooltip: 'Total number of orders processed',
        chartData: generateEmptyChartData(),
      },
      {
        name: '# of Products',
        value: '0',
        change: '0%',
        isPositive: true,
        tooltip: 'Total number of products in inventory',
        chartData: generateEmptyChartData(),
      },
    ];
  };

  // Generate empty chart data for consistent display
  const generateEmptyChartData = () => {
    // Create empty chart data with at least 7 points for visualization
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    return months.map(month => ({ name: month, value: 0 }));
  };

  return router;
}

module.exports = dashboardService; 