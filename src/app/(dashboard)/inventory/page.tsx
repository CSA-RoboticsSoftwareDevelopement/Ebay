"use client";

import React, { useState } from "react";
import ProductCard from "../../../components/productsTemplate/InventoryProductCard";
import ProductDetailModal from "../../../components/productsTemplate/InventoryProductDetailModal";
import AddProductModal from "../../../components/productsTemplate/AddProductModal";
import { Product } from "../../../types/ProductTypes";

// Mock data for prototype testing
const mockProducts: Product[] = [
  {
    id: "prod001",
    title: "Vintage Polaroid Camera",
    description: "Original Polaroid camera from the 1970s in excellent condition",
    price: 129.99,
    currency: "USD",
    quantity: 5,
    quantitySold: 3,
    sellThroughRate: 37.5,
    timeToSell: 4.2,
    costPrice: 65.00,
    shipping: 12.99,
    ebayFees: 15.49,
    profit: 37.51,
    profitMargin: 28.9,
    roi: 57.7,
    imageUrl: "https://placehold.co/400x300?text=Vintage+Camera",
    listingStatus: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    competitorData: {
      id: "comp001",
      avgPrice: 145.50,
      avgShipping: 14.99,
      lowestPrice: 115.00,
      highestPrice: 199.99,
      avgSellerFeedback: 4.7,
      avgListingPosition: 3.2,
      avgImageCount: 6,
      competitorCount: 12,
      lastUpdated: new Date(),
    },
  },
  {
    id: "prod002",
    title: "Mechanical Keyboard - Cherry MX Blue",
    description: "RGB backlit mechanical keyboard with Cherry MX Blue switches",
    price: 89.99,
    currency: "USD",
    quantity: 12,
    quantitySold: 8,
    sellThroughRate: 40,
    timeToSell: 3.5,
    costPrice: 45.00,
    shipping: 8.99,
    ebayFees: 10.79,
    profit: 25.21,
    profitMargin: 28.0,
    roi: 56.0,
    imageUrl: "https://placehold.co/400x300?text=Mechanical+Keyboard",
    listingStatus: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    competitorData: {
      id: "comp002",
      avgPrice: 94.99,
      avgShipping: 9.99,
      lowestPrice: 79.99,
      highestPrice: 129.99,
      avgSellerFeedback: 4.5,
      avgListingPosition: 5.1,
      avgImageCount: 5,
      competitorCount: 25,
      lastUpdated: new Date(),
    },
  },
  {
    id: "prod003",
    title: "Vintage Leather Messenger Bag",
    description: "Handcrafted genuine leather messenger bag with brass hardware",
    price: 149.99,
    currency: "USD",
    quantity: 3,
    quantitySold: 7,
    sellThroughRate: 70,
    timeToSell: 2.1,
    costPrice: 75.00,
    shipping: 0,
    ebayFees: 18.00,
    profit: 56.99,
    profitMargin: 38.0,
    roi: 76.0,
    imageUrl: "https://placehold.co/400x300?text=Leather+Bag",
    listingStatus: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    competitorData: {
      id: "comp003",
      avgPrice: 165.00,
      avgShipping: 0,
      lowestPrice: 129.99,
      highestPrice: 199.99,
      avgSellerFeedback: 4.9,
      avgListingPosition: 2.4,
      avgImageCount: 8,
      competitorCount: 9,
      lastUpdated: new Date(),
    },
  },
  {
    id: "prod004",
    title: "Wireless Bluetooth Earbuds",
    description: "True wireless earbuds with noise cancellation and 20-hour battery life",
    price: 59.99,
    currency: "USD",
    quantity: 25,
    quantitySold: 18,
    sellThroughRate: 41.9,
    timeToSell: 1.8,
    costPrice: 28.00,
    shipping: 3.99,
    ebayFees: 7.20,
    profit: 20.80,
    profitMargin: 34.7,
    roi: 74.3,
    imageUrl: "https://placehold.co/400x300?text=Wireless+Earbuds",
    listingStatus: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    competitorData: {
      id: "comp004",
      avgPrice: 64.99,
      avgShipping: 4.99,
      lowestPrice: 49.99,
      highestPrice: 89.99,
      avgSellerFeedback: 4.3,
      avgListingPosition: 6.7,
      avgImageCount: 4,
      competitorCount: 32,
      lastUpdated: new Date(),
    },
  },
  {
    id: "prod005",
    title: "Vintage Record Player",
    description: "Restored 1960s record player with built-in speakers",
    price: 199.99,
    currency: "USD",
    quantity: 2,
    quantitySold: 4,
    sellThroughRate: 66.7,
    timeToSell: 5.3,
    costPrice: 90.00,
    shipping: 24.99,
    ebayFees: 24.00,
    profit: 61.00,
    profitMargin: 30.5,
    roi: 67.8,
    imageUrl: "https://placehold.co/400x300?text=Record+Player",
    listingStatus: "Out of Stock",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    competitorData: {
      id: "comp005",
      avgPrice: 215.00,
      avgShipping: 29.99,
      lowestPrice: 175.00,
      highestPrice: 299.99,
      avgSellerFeedback: 4.8,
      avgListingPosition: 1.9,
      avgImageCount: 9,
      competitorCount: 7,
      lastUpdated: new Date(),
    },
  },
  {
    id: "prod006",
    title: "Smart Home Hub",
    description: "Voice-controlled smart home hub compatible with major platforms",
    price: 79.99,
    currency: "USD",
    quantity: 0,
    quantitySold: 15,
    sellThroughRate: 100,
    timeToSell: 1.2,
    costPrice: 42.00,
    shipping: 7.99,
    ebayFees: 9.60,
    profit: 20.40,
    profitMargin: 25.5,
    roi: 48.6,
    imageUrl: "https://placehold.co/400x300?text=Smart+Home+Hub",
    listingStatus: "Out of Stock",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    competitorData: {
      id: "comp006",
      avgPrice: 84.99,
      avgShipping: 8.99,
      lowestPrice: 69.99,
      highestPrice: 99.99,
      avgSellerFeedback: 4.4,
      avgListingPosition: 4.2,
      avgImageCount: 5,
      competitorCount: 19,
      lastUpdated: new Date(),
    },
  },
];

export default function Products() {
  const [productsData, setProductsData] = useState<Product[]>(mockProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  const handleAddProduct = (newProduct: Product) => {
    setProductsData((prevProducts) => {
      // Check for duplicates before adding
      if (prevProducts.some((product) => product.id === newProduct.id)) {
        return prevProducts;
      }
  
      const updatedProduct: Product = {
        ...newProduct,
        currency: newProduct.currency || "USD",
        quantitySold: newProduct.quantitySold || 0,
        createdAt: newProduct.createdAt || new Date().toISOString(),
        updatedAt: newProduct.updatedAt || new Date().toISOString(),
      };
  
      return [...prevProducts, updatedProduct];
    });
  };

  // Find the selected product
  const selectedProduct = selectedProductId
    ? productsData.find((product) => product.id === selectedProductId)
    : null;

  // Filter products based on search query and status filter
  const filteredProducts = productsData.filter((product) => {
    const matchesSearch = (product.title || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "" ||
      (product.listingStatus || "").toLowerCase() ===
        statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Handler for updating product data
  const handleUpdateProduct = (
    productId: string,
    updates: Partial<Product>
  ) => {
    setProductsData(prevProducts => 
      prevProducts.map(product => 
        product.id === productId ? {...product, ...updates} : product
      )
    );
    console.log("Updated product:", productId, updates);
  };

  // Get available statuses for filtering
  const availableStatuses = Array.from(
    new Set(
      productsData.map((p) => p.listingStatus).filter(Boolean) as string[]
    )
  );

  if (loading) return <p>Loading products...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <button
          className="btn btn-primary"
          onClick={() => setIsAddProductModalOpen(true)}
        >
          Add Product
        </button>{" "}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-12 mt-5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                id="search"
                name="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-yellow focus:border-primary-yellow sm:text-sm"
                placeholder="Search products"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full md:w-48">
            <label htmlFor="status" className="sr-only">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-yellow focus:border-primary-yellow sm:text-sm rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results summary */}
        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredProducts.length} of {productsData.length} products
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={(id) => setSelectedProductId(id)}
          />
        ))}
      </div>

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProductId(null)}
          onUpdateProduct={handleUpdateProduct}
        />
      )}

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onAddProduct={handleAddProduct}
      />
    </div>
  );
}
