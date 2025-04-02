export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    quantity: number;
    quantitySold: number;
    sellThroughRate: number;
    timeToSell: number;
    costPrice: number;
    shipping: number;
    ebayFees: number;
    profit: number;
    profitMargin: number;
    roi: number;
    imageUrl: string;
    additionalImages?: string[]; // 🔹 Added this line
    listingStatus: string;
    createdAt: string; // Store as ISO string
    updatedAt: string;
    competitorData?: {
      id: string;
      avgPrice: number;
      avgShipping: number;
      lowestPrice: number;
      highestPrice: number;
      avgSellerFeedback: number;
      avgListingPosition: number;
      avgImageCount: number;
      competitorCount: number;
      lastUpdated: Date;
    };
  }
  