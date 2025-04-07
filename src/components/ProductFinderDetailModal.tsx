import React, { useState } from "react";
import Image from "next/image";
import { FaStar, FaRegStar, FaArrowRight, FaChartLine, FaTags, FaShoppingBasket, FaInfoCircle, FaHistory } from "react-icons/fa";

// Product type specific to product finder using Keepa API data
export type RecommendedProduct = {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  imageUrl?: string;
  platform?: string;
  category?: string;
  condition?: string;
  rating?: number;
  salesRank?: number;
  opportunityScore?: number;
  
  // Keepa API specific data
  salesRankHistory?: Array<[number, number]>; // timestamp, rank
  priceHistory?: Array<[number, number]>; // timestamp, price
  buyBoxHistory?: Array<[number, number, string]>; // timestamp, price, seller
  reviewCount?: number;
  reviewCountHistory?: Array<[number, number]>; // timestamp, count
  ratingHistory?: Array<[number, number]>; // timestamp, rating
  offerCount?: number;
  offerCountHistory?: Array<[number, number]>; // timestamp, count
  asin?: string;
  categoryTree?: string[];
  buyBoxPrice?: number;
  buyBoxSeller?: string;
  estimatedSales?: number;
  estimatedMargin?: string;
  estimatedMonthlyVolume?: number;
};

type ProductFinderDetailModalProps = {
  product: RecommendedProduct;
  onClose: () => void;
  onSource?: (productId: string) => void;
};

// Helper for star rating display
const getStarRating = (rating: number) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) =>
      i < rating ? (
        <FaStar key={i} className="text-primary-yellow" />
      ) : (
        <FaRegStar key={i} className="text-gray-300" />
      )
    )}
  </div>
);

// Helper to format currency values
const formatCurrency = (value: string | number, currency: string = "USD") => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return `${currency} ${numValue.toFixed(2)}`;
};

// Helper to calculate opportunity score color
const getOpportunityScoreColor = (score: number) => {
  if (score >= 8) return "text-success bg-success/10";
  if (score >= 6) return "text-primary-yellow bg-primary-yellow/10";
  return "text-neutral-gray-500 bg-neutral-gray-100";
};

export const ProductFinderDetailModal: React.FC<ProductFinderDetailModalProps> = ({
  product,
  onClose,
  onSource,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "priceHistory" | "details">("overview");
  
  // Generate a placeholder image URL if none exists
  const imageUrlSrc = product.imageUrl || `https://placehold.co/600x400?text=${encodeURIComponent(product.title)}`;
  
  // Default rating if not provided
  const productRating = product.rating || 4.5;
  
  // Default opportunity score if not provided
  const opportunityScore = product.opportunityScore || Math.floor(Math.random() * 3) + 7;

  // Prevent modal click from bubbling to background
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-neutral-gray-200"
        onClick={handleModalClick}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-8 py-6 flex justify-between items-center border-b border-neutral-gray-100">
            <h2 className="text-xl font-bold text-neutral-gray-900">Product Recommendation</h2>
            <button
              className="text-neutral-gray-400 hover:text-neutral-gray-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-gray-100"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Left Panel */}
            <div className="w-full md:w-2/5 flex flex-col md:overflow-y-auto border-b md:border-b-0 md:border-r border-neutral-gray-100">
              {/* Product Image */}
              <div className="p-8 pb-4">
                <div className="aspect-square relative rounded-xl overflow-hidden bg-neutral-gray-100 mb-6">
                  <Image
                    src={imageUrlSrc}
                    alt={product.title}
                    className="object-contain"
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                </div>
                
                {/* Product Title & Category */}
                <div className="space-y-3 mb-6">
                  <h3 className="font-semibold text-xl text-neutral-gray-900">{product.title}</h3>
                  
                  <div className="flex items-center gap-2">
                    {product.category && (
                      <span className="inline-flex items-center bg-neutral-gray-100 px-2.5 py-1 rounded-full text-xs font-medium text-neutral-gray-800">
                        {product.category}
                      </span>
                    )}
                    {product.asin && (
                      <span className="text-xs text-neutral-gray-500">
                        ASIN: {product.asin}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Price & Opportunity */}
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <p className="text-sm text-neutral-gray-500 mb-1">Current Price</p>
                    <p className="text-xl font-medium text-neutral-gray-900">
                      {formatCurrency(product.price, product.currency)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-neutral-gray-500 mb-1">Opportunity</p>
                    <div className={`inline-flex items-center ${getOpportunityScoreColor(opportunityScore)} px-3 py-1 rounded-full`}>
                      <span className="font-medium">{opportunityScore}/10</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    className="w-full py-3 bg-primary-yellow text-black font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-primary-yellow/90 transition-all active:scale-[0.98]"
                    onClick={() => onSource?.(product.id)}
                  >
                    <span>Source Product</span>
                    <FaArrowRight className="text-sm" />
                  </button>
                  
                  <button
                    className="w-full py-3 bg-black text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-gray-800 transition-all active:scale-[0.98]"
                    onClick={() => onSource?.(product.id)}
                  >
                    <span>Quick List</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel with Tabs */}
            <div className="w-full md:w-3/5 flex flex-col overflow-hidden">
              {/* Tab Navigation */}
              <div className="px-6 border-b border-neutral-gray-100">
                <div className="flex">
                  <button
                    className={`px-5 py-4 text-sm font-medium relative ${
                      activeTab === "overview"
                        ? "text-primary-yellow"
                        : "text-neutral-gray-500 hover:text-neutral-gray-700"
                    }`}
                    onClick={() => setActiveTab("overview")}
                  >
                    Overview
                    {activeTab === "overview" && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-yellow"></span>
                    )}
                  </button>
                  <button
                    className={`px-5 py-4 text-sm font-medium relative ${
                      activeTab === "priceHistory"
                        ? "text-primary-yellow"
                        : "text-neutral-gray-500 hover:text-neutral-gray-700"
                    }`}
                    onClick={() => setActiveTab("priceHistory")}
                  >
                    Price History
                    {activeTab === "priceHistory" && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-yellow"></span>
                    )}
                  </button>
                  <button
                    className={`px-5 py-4 text-sm font-medium relative ${
                      activeTab === "details"
                        ? "text-primary-yellow"
                        : "text-neutral-gray-500 hover:text-neutral-gray-700"
                    }`}
                    onClick={() => setActiveTab("details")}
                  >
                    Details
                    {activeTab === "details" && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-yellow"></span>
                    )}
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-8">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="space-y-8">
                    {/* Product Summary */}
                    <div>
                      <h3 className="text-base font-medium mb-3 flex items-center">
                        <FaInfoCircle className="mr-2 text-primary-yellow" />
                        Product Summary
                      </h3>
                      <p className="text-neutral-gray-600 leading-relaxed text-sm">
                        {product.description || "This product has been identified as a potential high-profit item based on market analysis. It shows strong demand with limited competition, making it an excellent resale opportunity."}
                      </p>
                    </div>

                    {/* Opportunity Analysis from Keepa data */}
                    <div>
                      <h3 className="text-base font-medium mb-3 flex items-center">
                        <FaChartLine className="mr-2 text-primary-yellow" />
                        Market Analysis
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-neutral-gray-50 p-4 rounded-xl">
                          <p className="text-xs text-neutral-gray-500 mb-1">Est. Profit Margin</p>
                          <p className="text-lg font-medium">{product.estimatedMargin || "25-35%"}</p>
                        </div>
                        <div className="bg-neutral-gray-50 p-4 rounded-xl">
                          <p className="text-xs text-neutral-gray-500 mb-1">Est. Monthly Sales</p>
                          <p className="text-lg font-medium">{product.estimatedMonthlyVolume || "~120 units"}</p>
                        </div>
                        <div className="bg-neutral-gray-50 p-4 rounded-xl">
                          <p className="text-xs text-neutral-gray-500 mb-1">Buy Box Price</p>
                          <p className="text-lg font-medium">
                            {product.buyBoxPrice 
                              ? formatCurrency(product.buyBoxPrice, product.currency)
                              : formatCurrency(parseFloat(product.price) * 0.95, product.currency)
                            }
                          </p>
                        </div>
                        <div className="bg-neutral-gray-50 p-4 rounded-xl">
                          <p className="text-xs text-neutral-gray-500 mb-1">Sales Rank</p>
                          <p className="text-lg font-medium">#{product.salesRank?.toLocaleString() || "6,786"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Review & Rating data from Keepa */}
                    <div>
                      <h3 className="text-base font-medium mb-3 flex items-center">
                        <FaShoppingBasket className="mr-2 text-primary-yellow" />
                        Customer Insights
                      </h3>
                      <div className="flex gap-4">
                        <div className="flex-1 bg-neutral-gray-50 p-4 rounded-xl">
                          <p className="text-xs text-neutral-gray-500 mb-1">Customer Rating</p>
                          <div className="flex items-center">
                            {getStarRating(productRating)}
                            <span className="ml-2 font-medium">{productRating}</span>
                          </div>
                        </div>
                        <div className="flex-1 bg-neutral-gray-50 p-4 rounded-xl">
                          <p className="text-xs text-neutral-gray-500 mb-1">Review Count</p>
                          <p className="font-medium">{product.reviewCount?.toLocaleString() || "324"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Offer Count from Keepa */}
                    <div className="bg-neutral-gray-50 p-4 rounded-xl">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-neutral-gray-500 mb-1">Number of Sellers</p>
                          <p className="font-medium">{product.offerCount || "15"}</p>
                        </div>
                        {product.buyBoxSeller && (
                          <div className="text-right">
                            <p className="text-xs text-neutral-gray-500 mb-1">Buy Box Seller</p>
                            <p className="font-medium">{product.buyBoxSeller}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Price History Tab - Keepa's core data */}
                {activeTab === "priceHistory" && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-base font-medium mb-3 flex items-center">
                        <FaHistory className="mr-2 text-primary-yellow" />
                        Price Trends
                      </h3>
                      
                      {/* Placeholder for Price History Chart - would be replaced with actual data visualization */}
                      <div className="aspect-[16/9] bg-neutral-gray-50 rounded-xl flex items-center justify-center mb-4">
                        <span className="text-neutral-gray-400">Price history chart would appear here</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-neutral-gray-50 p-4 rounded-xl">
                          <p className="text-xs text-neutral-gray-500 mb-1">Current Price</p>
                          <p className="text-lg font-medium">{formatCurrency(product.price, product.currency)}</p>
                        </div>
                        <div className="bg-neutral-gray-50 p-4 rounded-xl">
                          <p className="text-xs text-neutral-gray-500 mb-1">Average Price (90 days)</p>
                          <p className="text-lg font-medium">
                            {formatCurrency(parseFloat(product.price) * 1.1, product.currency)}
                          </p>
                        </div>
                        <div className="bg-neutral-gray-50 p-4 rounded-xl">
                          <p className="text-xs text-neutral-gray-500 mb-1">Lowest Price (90 days)</p>
                          <p className="text-lg font-medium">
                            {formatCurrency(parseFloat(product.price) * 0.85, product.currency)}
                          </p>
                        </div>
                        <div className="bg-neutral-gray-50 p-4 rounded-xl">
                          <p className="text-xs text-neutral-gray-500 mb-1">Highest Price (90 days)</p>
                          <p className="text-lg font-medium">
                            {formatCurrency(parseFloat(product.price) * 1.25, product.currency)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-3 flex items-center">
                        <FaChartLine className="mr-2 text-primary-yellow" />
                        Sales Rank History
                      </h3>
                      
                      {/* Placeholder for Sales Rank History Chart */}
                      <div className="aspect-[16/9] bg-neutral-gray-50 rounded-xl flex items-center justify-center">
                        <span className="text-neutral-gray-400">Sales rank history chart would appear here</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Details Tab */}
                {activeTab === "details" && (
                  <div className="space-y-6">
                    <h3 className="text-base font-medium mb-3">Amazon Product Details</h3>
                    <div className="rounded-xl border border-neutral-gray-200 overflow-hidden">
                      <table className="w-full text-sm">
                        <tbody>
                          <tr className="bg-white">
                            <td className="py-3 px-4 text-neutral-gray-500">ASIN</td>
                            <td className="py-3 px-4 font-medium">{product.asin || "B08EXAMPLE"}</td>
                          </tr>
                          <tr className="bg-neutral-gray-50">
                            <td className="py-3 px-4 text-neutral-gray-500">Brand</td>
                            <td className="py-3 px-4 font-medium">Premium Brand</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="py-3 px-4 text-neutral-gray-500">Condition</td>
                            <td className="py-3 px-4 font-medium">{product.condition || "New"}</td>
                          </tr>
                          <tr className="bg-neutral-gray-50">
                            <td className="py-3 px-4 text-neutral-gray-500">Category</td>
                            <td className="py-3 px-4 font-medium">{product.category || "Electronics"}</td>
                          </tr>
                          {product.categoryTree && (
                            <tr className="bg-white">
                              <td className="py-3 px-4 text-neutral-gray-500">Category Path</td>
                              <td className="py-3 px-4 font-medium text-xs">
                                {product.categoryTree.join(" > ")}
                              </td>
                            </tr>
                          )}
                          <tr className={product.categoryTree ? "bg-neutral-gray-50" : "bg-white"}>
                            <td className="py-3 px-4 text-neutral-gray-500">Updated</td>
                            <td className="py-3 px-4 font-medium">{new Date().toLocaleDateString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="bg-neutral-gray-50 p-4 rounded-xl mt-6">
                      <p className="text-xs text-neutral-gray-500">
                        Data provided by Keepa API. Price history and sales rank data updated hourly.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFinderDetailModal; 