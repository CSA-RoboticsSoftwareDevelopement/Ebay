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
    // Cross-listing specific fields
    condition: string;
    category: string;
    variations?: ProductVariation[];
    platformData?: {
      ebay?: EbaySpecificData;
      amazon?: AmazonSpecificData;
      etsy?: EtsySpecificData;
    };
  }
  
export interface ProductVariation {
  id: string;
  name: string;
  options: VariationOption[];
}

export interface VariationOption {
  name: string;
  quantity: number;
  price?: number; // Optional price override
}

// Platform-specific types
export interface EbaySpecificData {
  conditionId: number;
  itemSpecifics: Record<string, string>;
  fulfillmentPolicyId?: string;
  paymentPolicyId?: string;
  returnPolicyId?: string;
  listingFormat: 'FIXED_PRICE' | 'AUCTION';
  subtitle?: string;
  bestOffer: boolean;
  secondaryCategory?: string;
}

export interface AmazonSpecificData {
  asin?: string;
  upc?: string;
  ean?: string;
  gtin?: string;
  brand?: string;
  manufacturer?: string;
  mpn?: string;
  bulletPoints?: string[];
  searchKeywords?: string[];
  fulfillmentChoice: 'FBA' | 'FBM';
  shippingTemplateId?: string;
}

export interface EtsySpecificData {
  whoMade: string;
  whenMade: string;
  isSupply: boolean;
  shippingProfileId?: string;
  tags?: string[];
  materials?: string[];
  shopSection?: string;
  isPersonalizable: boolean;
  sku?: string;
}
  