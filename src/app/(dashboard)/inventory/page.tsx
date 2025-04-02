"use client";

import React, { useState, useEffect } from "react";
import ProductCard from "../../../components/productsTemplate/InventoryProductCard";
import ProductDetailModal from "../../../components/productsTemplate/InventoryProductDetailModal";
import AddProductModal from "../../../components/productsTemplate/AddProductModal"; // ✅ Import AddProductModal
import { Product } from "../../../types/ProductTypes";
const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;
const EBAY_INVENTORY_API = `${BACKEND_SERVER_URL}/api/ebay/products/inventory`;

export default function Products() {
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch inventory data from API
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(EBAY_INVENTORY_API);
        if (!response.ok) {
          throw new Error(`Failed to fetch inventory: ${response.statusText}`);
        }
        const data = await response.json();
        const inventoryItems = data["1"]?.inventoryItems || [];

        // Transform API response to match previous structure
        interface InventoryItem {
          sku: string;
          product: {
            title: string;
            description: string;
            mpn: string;
            imageUrls?: string[];
          };
          availability: {
            shipToLocationAvailability: {
              quantity: number;
            };
          };
        }
        
        const formattedProducts = inventoryItems.map((item: InventoryItem) => ({
          id: item.sku,
          title: item.product.title,
          description: item.product.description,
          price: !isNaN(parseFloat(item.product.mpn)) ? parseFloat(item.product.mpn) : 0,
          currency: "USD",
          quantity: item.availability.shipToLocationAvailability.quantity,
          quantitySold: 0,
          sellThroughRate: 0,
          timeToSell: 0,
          costPrice: 0,
          shipping: 0,
          ebayFees: 0,
          profit: 0,
          profitMargin: 0,
          roi: 0,
          imageUrl: item.product.imageUrls?.[0] || `https://placehold.co/400x300?text=${encodeURIComponent(item.product.title)}`,
          listingStatus: "Active",
          createdAt: new Date(),
          updatedAt: new Date(),
          competitorData: {
            id: item.sku,
            avgPrice: 0,
            avgShipping: 0,
            lowestPrice: 0,
            highestPrice: 0,
            avgSellerFeedback: 0,
            avgListingPosition: 0,
            avgImageCount: item.product.imageUrls?.length || 0,
            competitorCount: 0,
            lastUpdated: new Date(),
          },
        }));

        setProductsData(formattedProducts);
        setLoading(false);
      } catch (err: Error | unknown) {
        const error = err as Error;
        setError(error.message);
        setLoading(false);
      }
    }

    fetchProducts();
  }, [refreshTrigger]);

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
  
    setRefreshTrigger((prev) => prev + 1); // 🔹 Forces re-fetch
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
    console.log("Updating product:", productId, updates);
    alert(`Product ${productId} updated (simulated)`);
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
          onClick={() => setIsAddProductModalOpen(true)} // ✅ Open modal on click
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
        {filteredProducts.map((product, index) => (
          <ProductCard
            key={product.id || `product-${index}`} // ✅ index is now defined
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
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No products found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter to find what you&apos;re looking
            for.
          </p>
        </div>
      )}
      {/* ✅ Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onAddProduct={handleAddProduct}
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => {
            setSelectedProductId(null);
            setRefreshTrigger((prev) => prev + 1); // 🔹 Trigger re-fetch on modal close
          }}
          onUpdateProduct={handleUpdateProduct}
        />
      )}
    </div>
  );
}
