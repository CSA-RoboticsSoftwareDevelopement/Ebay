import { PrismaClient } from '@prisma/client';

// Create a singleton instance of PrismaClient
export const prisma = new PrismaClient();

// User-related database operations
export const userDb = {
  // Get user by ID
  getUserById: (id: string) => {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  // Get user by email
  getUserByEmail: (email: string) => {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  // Update user profile
  updateUserProfile: (id: string, data: { name?: string; email?: string }) => {
    return prisma.user.update({
      where: { id },
      data,
    });
  },
};

// Product-related database operations
export const productDb = {
  // Get all products for a user
  getUserProducts: (userId: string) => {
    return prisma.product.findMany({
      where: {
        ebayAccount: {
          userId,
          isActive: true,
        },
      },
      include: {
        competitorData: true,
      },
    });
  },

  // Get product by ID
  getProductById: (id: string) => {
    return prisma.product.findUnique({
      where: { id },
      include: {
        competitorData: true,
      },
    });
  },

  // Update product cost and fees
  updateProductCostAndFees: (id: string, data: { costPrice?: number; shipping?: number; ebayFees?: number }) => {
    return prisma.product.update({
      where: { id },
      data: {
        ...data,
        // Recalculate profit if all cost data is available
        ...(data.costPrice !== undefined && data.shipping !== undefined && data.ebayFees !== undefined && {
          profit: prisma.product.findUnique({
            where: { id },
            select: { price: true },
          }).then(product => {
            if (!product) return undefined;
            const totalCost = (data.costPrice || 0) + (data.shipping || 0) + (data.ebayFees || 0);
            const profit = product.price - totalCost;
            const profitMargin = (profit / product.price) * 100;
            const roi = (profit / (data.costPrice || 1)) * 100;
            
            return prisma.product.update({
              where: { id },
              data: {
                profit,
                profitMargin,
                roi,
              },
            });
          }),
        }),
      },
    });
  },
};

// Competitor data operations
export const competitorDb = {
  // Save competitor data for a product
  saveCompetitorData: (productId: string, data: {
    avgPrice?: number;
    avgShipping?: number;
    lowestPrice?: number;
    highestPrice?: number;
    avgSellerFeedback?: number;
    avgListingPosition?: number;
    avgImageCount?: number;
    competitorCount?: number;
  }) => {
    return prisma.competitorData.upsert({
      where: { productId },
      update: {
        ...data,
        lastUpdated: new Date(),
      },
      create: {
        productId,
        ...data,
        lastUpdated: new Date(),
      },
    });
  },
};

// Analytics data operations
export const analyticsDb = {
  // Get sales metrics for dashboard
  getSalesMetrics: async (userId: string, startDate: Date, endDate: Date) => {
    const products = await prisma.product.findMany({
      where: {
        ebayAccount: {
          userId,
          isActive: true,
        },
        updatedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        price: true,
        quantitySold: true,
        profit: true,
        costPrice: true,
      },
    });
    
    const totalRevenue = products.reduce((sum, product) => sum + (product.price * product.quantitySold), 0);
    const totalProfit = products.reduce((sum, product) => sum + ((product.profit || 0) * product.quantitySold), 0);
    const totalCost = products.reduce((sum, product) => sum + ((product.costPrice || 0) * product.quantitySold), 0);
    
    return {
      totalRevenue,
      totalProfit,
      profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
      roi: totalCost > 0 ? (totalProfit / totalCost) * 100 : 0,
    };
  },
  
  // Get top selling products
  getTopSellingProducts: (userId: string, limit = 5) => {
    return prisma.product.findMany({
      where: {
        ebayAccount: {
          userId,
          isActive: true,
        },
        quantitySold: {
          gt: 0,
        },
      },
      orderBy: {
        quantitySold: 'desc',
      },
      take: limit,
      select: {
        id: true,
        title: true,
        quantitySold: true,
        price: true,
        profit: true,
      },
    });
  },
}; 