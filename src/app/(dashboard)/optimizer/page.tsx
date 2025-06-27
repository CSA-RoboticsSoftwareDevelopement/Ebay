"use client";

import React, { useState, useEffect } from "react";
// import Link from "next/link"; // Ensure you're using Next.js
import ProductCard from "../../../components/productsTemplate/optimizerProductCard";
import ProductDetailModal from "../../../components/productsTemplate/optimizerProductDetailModal";

import AddProductModal from "../../../components/productsTemplate/optimizerAddProductModal"; // ✅ Import AddProductModal
// import { Product } from "../../../types/ProductTypes";
import { useAuth } from "@/context/AuthContext";
const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;
import { useRef } from "react";

export default function Products() {
  const { user } = useAuth();
  const EBAY_INVENTORY_API = `${BACKEND_SERVER_URL}/api/ebay/products/inventory?user_id=${user?.id}`;
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
  const modalRef = useRef<any>(null);

  const dummyProducts: Product[] = [
    {
      id: "dummy-1",
      title: "Wireless Headphones",
      description: "High-quality wireless headphones with noise cancellation.",
      price: 89.99,
      currency: "USD",
      quantity: 10,
      quantitySold: 4,
      sellThroughRate: 0,
      timeToSell: 0,
      costPrice: 50,
      shipping: 5,
      ebayFees: 5,
      profit: 30,
      profitMargin: 33.7,
      roi: 60,
      imageUrl: "https://placehold.co/400x300?text=Headphones",
      listingStatus: "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      competitorData: {
        id: "dummy-1",
        avgPrice: 85,
        avgShipping: 6,
        lowestPrice: 79,
        highestPrice: 99,
        avgSellerFeedback: 4.8,
        avgListingPosition: 1,
        avgImageCount: 3,
        competitorCount: 10,
        lastUpdated: new Date(),
      },
      condition: "New", // <-- Add this line
      category: "Electronics", // <-- Add this line
    },
    {
      id: "dummy-2",
      title: "Smartwatch",
      description: "Fitness tracking smartwatch with heart rate monitor.",
      price: 129.99,
      currency: "USD",
      quantity: 20,
      quantitySold: 7,
      sellThroughRate: 0,
      timeToSell: 0,
      costPrice: 70,
      shipping: 5,
      ebayFees: 8,
      profit: 46,
      profitMargin: 35.4,
      roi: 65,
      imageUrl: "https://placehold.co/400x300?text=Smartwatch",
      listingStatus: "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      competitorData: {
        id: "dummy-2",
        avgPrice: 125,
        avgShipping: 6,
        lowestPrice: 110,
        highestPrice: 150,
        avgSellerFeedback: 4.5,
        avgListingPosition: 2,
        avgImageCount: 4,
        competitorCount: 15,
        lastUpdated: new Date(),
      },
      condition: "New", // <-- Add this line
      category: "Electronics", // <-- Add this line
    },
    {
      id: "dummy-3",
      title: "Charger",
      description: "Charger C type .",
      price: 110.99,
      currency: "USD",
      quantity: 10,
      quantitySold: 7,
      sellThroughRate: 0,
      timeToSell: 0,
      costPrice: 70,
      shipping: 5,
      ebayFees: 8,
      profit: 46,
      profitMargin: 35.4,
      roi: 65,
      imageUrl: "https://placehold.co/400x300?text=Charger",
      listingStatus: "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      competitorData: {
        id: "dummy-4",
        avgPrice: 125,
        avgShipping: 6,
        lowestPrice: 110,
        highestPrice: 150,
        avgSellerFeedback: 4.5,
        avgListingPosition: 2,
        avgImageCount: 4,
        competitorCount: 15,
        lastUpdated: new Date(),
      },
      condition: "New", // <-- Add this line
      category: "Electronics", // <-- Add this line
    },
    {
      id: "dummy-4",
      title: "Extension",
      description: "One Extension for all your charging .",
      price: 110.99,
      currency: "USD",
      quantity: 10,
      quantitySold: 7,
      sellThroughRate: 0,
      timeToSell: 0,
      costPrice: 70,
      shipping: 5,
      ebayFees: 8,
      profit: 46,
      profitMargin: 35.4,
      roi: 65,
      imageUrl: "https://placehold.co/400x300?text=Extension",
      listingStatus: "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      competitorData: {
        id: "dummy-5",
        avgPrice: 125,
        avgShipping: 6,
        lowestPrice: 110,
        highestPrice: 150,
        avgSellerFeedback: 4.5,
        avgListingPosition: 2,
        avgImageCount: 4,
        competitorCount: 15,
        lastUpdated: new Date(),
      },
      condition: "New", // <-- Add this line
      category: "Electronics", // <-- Add this line
    },
  ];

  interface Product {
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
    listingStatus: string;
    createdAt: string;
    updatedAt: string;

    competitorData: {
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
    optimizedData?: {
      optimized_title?: string;
      optimized_description?: string;
      optimized_price?: number;
    };

    condition: string; // <-- Add this line
    category: string; // <-- Add this line
  }
  const [optimizationDataMap, setOptimizationDataMap] = useState<Record<string, OptimizationData>>({});
  interface OptimizationData {
    original_title: string;
    enhanced_title: string;
    original_image_url: string;
    image_score: number;
    price: number;
    predicted_high_value: boolean;
  }
  // interface User {
  //   id?: string | null;
  //   name?: string;
  // }

  // Props or fetched user
  // interface InventoryProps {
  //   user: User | null;
  //   dummyProducts: Product[];
  //   fetchProducts: () => Promise<Product[]>; // function to fetch real products
  //   availableStatuses: string[];
  // }

  if (user?.id) {
    console.log("API URL:", EBAY_INVENTORY_API);
  }
  // Fetch inventory data from API
  useEffect(() => {
    if (!user?.id) return; // ⛔ Don't fetch until user is ready

    const EBAY_INVENTORY_API = `${BACKEND_SERVER_URL}/api/ebay/products/inventory?user_id=${user.id}`;
    console.log("Fetching inventory from:", EBAY_INVENTORY_API);
    interface InventoryItem {
      sku: string;
      product: {
        title: string;
        description: string;
        mpn: string;
        imageUrls: string[];
      };
      availability: {
        shipToLocationAvailability: {
          quantity: number;
        };
      };
    }

    async function fetchProducts() {
      try {
        const response1 = await fetch(
          `${BACKEND_SERVER_URL}/api/ebay/products/inventory?user_id=${user.id}`
        );
        const response2 = await fetch(
          `${BACKEND_SERVER_URL}/api/ebay/products/optimizer?user_id=${user.id}`
        );

        if (!response1.ok && !response2.ok) {
          throw new Error(`Failed to fetch inventory`);
        }

        const data1 = response1.ok ? await response1.json() : { inventory: { inventoryItems: [] } };
        const data2 = response2.ok ? await response2.json() : { products: [] };

        const inventoryItems = data1.inventory?.inventoryItems || [];
        const optimizerItems = data2.products || [];

        // Map first API (inventory)
        const formattedInventory = inventoryItems.map((item: any) => ({
          id: item.sku,
          title: item.product?.title || "Untitled",
          description: item.product?.description || "No description available",
          price: parseFloat(item.product?.mpn || "0") || 0,
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
          imageUrl:
            item.product?.imageUrls?.[0] ||
            `https://placehold.co/400x300?text=${encodeURIComponent(
              item.product?.title || "Untitled"
            )}`,
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
            avgImageCount: item.product?.imageUrls?.length || 0,
            competitorCount: 0,
            lastUpdated: new Date(),
          },
          condition: "New",
          category: "General",
        }));

        // Map second API (optimizer)
        const formattedOptimizer = await Promise.all(
          optimizerItems.map(async (item: any) => {
            const baseProduct = {
              id: item.id || item.sku,
              title: item.product_title,
              description: item.description || "No description available",
              price: item.price || 0,
              currency: "USD",
              quantity: item.quantity || 0,
              quantitySold: item.quantitySold || 0,
              sellThroughRate: 0,
              timeToSell: 0,
              costPrice: item.costPrice || 0,
              shipping: item.shipping || 0,
              ebayFees: item.ebayFees || 0,
              profit: item.profit || 0,
              profitMargin: item.profitMargin || 0,
              roi: item.roi || 0,
              imageUrl:
                item.image_url ||
                `https://placehold.co/400x300?text=${encodeURIComponent(
                  item.product_title || "Product"
                )}`,
              listingStatus: item.listingStatus || "Active",
              createdAt: item.createdAt || new Date().toISOString(),
              updatedAt: item.updatedAt || new Date().toISOString(),
              competitorData: {
                id: item.id || item.sku,
                avgPrice: 0,
                avgShipping: 0,
                lowestPrice: 0,
                highestPrice: 0,
                avgSellerFeedback: 0,
                avgListingPosition: 0,
                avgImageCount: 0,
                competitorCount: 0,
                lastUpdated: new Date(),
              },
              condition: item.condition || "New",
              category: item.category || "General",
            };

            // 🔁 Call the prediction API for optimization
            try {
              const predictResponse = await fetch("http://127.0.0.1:8000/predict", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  title: baseProduct.title,
                  description: baseProduct.description,
                  price: baseProduct.price,
                }),
              });

              const predictResult = predictResponse.ok
                ? await predictResponse.json()
                : null;

              return {
                ...baseProduct,
                optimizedData: predictResult || {}, // merge the prediction result
              };
            } catch (err) {
              console.error("Prediction error:", err);
              return baseProduct; // fallback without optimization
            }
          })
        );

        // ✅ Combine both product sources
        const combinedProducts = [...formattedInventory, ...formattedOptimizer];

        if (combinedProducts.length > 0) {
          setProductsData(combinedProducts);
        } else {
          setError("No inventory found. Showing demo data.");
          setProductsData(dummyProducts);
        }
        setLoading(false);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred.");
        }
        setLoading(false);
      }
    }


    fetchProducts();
  }, [refreshTrigger, user]);

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

  if (!user?.id) {
    return (
      <div>
        <div className="text-center text-white py-6">
          <h2 className="text-2xl text-white font-semibold">
            Guest Inventory Preview
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            You&apos;re viewing a demo inventory. Log in to manage your own
            products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
          {dummyProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => setSelectedProductId(product.id)}
              triggerReoptimize={() => modalRef.current?.triggerReoptimize()} // 👈 Add this
            />
          ))}
        </div>

        // Update your modal rendering:
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            optimizationData={optimizationDataMap[selectedProduct.id] || null}
            onClose={() => {
              setSelectedProductId(null);
              setRefreshTrigger(prev => prev + 1);
            }}
            onUpdateProduct={handleUpdateProduct}
          />
        )}
      </div>
    );
  }

  // Render loading and error states
  if (loading) return <p>Loading products...</p>;
  if (error) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-md text-yellow-800">
        <h2 className="text-lg font-semibold mb-2">Heads up</h2>
        <p>{error}</p>
        {error.includes("integration") && (
          <p className="mt-2 text-sm text-gray-600">
            Go to your <strong>Account Settings</strong> to connect your eBay
            account.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Optimizer</h1>
        <button
          className="btn btn-primary"
          onClick={() => setIsAddProductModalOpen(true)} // ✅ Open modal on click
        >
          Custom Work
        </button>{" "}
      </div>

      {/* Filters */}
      <div className="bg-neutral-800 rounded-lg shadow p-4 mb-12 mt-5">
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-neutral-800 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-yellow focus:border-primary-yellow sm:text-sm"
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
              className="block w-full pl-3 pr-10 py-2 text-base border bg-neutral-800 focus:outline-none focus:ring-primary-yellow focus:border-primary-yellow sm:text-sm rounded-md"
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
        <div className="mt-4 text-sm text-white-400">
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
            triggerReoptimize={() => modalRef.current?.triggerReoptimize()} // ✅ ADD THIS LINE
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
          ref={modalRef}
          product={selectedProduct}
          optimizationData={optimizationDataMap[selectedProduct.id] || null} // ✅ Add this

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
