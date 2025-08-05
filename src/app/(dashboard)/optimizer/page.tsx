"use client";

import React, { useState, useEffect } from "react";
import ProductCard from "../../../components/productsTemplate/optimizerProductCard";
import AddProductModal from "../../../components/productsTemplate/optimizerAddProductModal";
import { useAuth } from "@/context/AuthContext";
const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;
import { useRef } from "react";
import axios from "axios";
import ProductDetailModal, { ProductDetailModalHandle } from "../../../components/productsTemplate/optimizerProductDetailModal";
import { Product } from "@/types/ProductTypes";


interface OptimizationData {
  original_title: string;
  enhanced_title: string;
  alternative_title: string;
  short_title: string;
  original_image_url: string;
  image_score: number;
  price: number;
  predicted_high_value: boolean;
}

export default function Products() {
  const { user } = useAuth();
  // const EBAY_INVENTORY_API = `${BACKEND_SERVER_URL}/api/ebay/products/inventory?user_id=${user?.id}`;
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const modalRef = useRef<ProductDetailModalHandle>(null);
  const [optimizationDataMap, setOptimizationDataMap] = useState<Record<string, OptimizationData>>({});

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
      condition: "New",
      category: "Electronics",
      sku: "",
      product_id: "",
      product_title: ""
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
      condition: "New",
      category: "Electronics",
      sku: "",
      product_id: "",
      product_title: ""
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
      condition: "New",
      category: "Electronics",
      sku: "",
      product_id: "",
      product_title: ""
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
      condition: "New",
      category: "Electronics",
      sku: "",
      product_id: "",
      product_title: ""
    },
  ];

  const handleOptimizeProduct = async (productId: string) => {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;

    try {
      const response = await axios.post(`http://127.0.0.1:5000/get_best_titles`, {
        title: product.title,
        category: product.category,
        subcategory: product.subcategory || "",
        attributes: ""
      });

      const bestTitles = response.data.best_seller_titles || [];

      const optimizationData = {
        original_title: response.data.input_title,
        enhanced_title: bestTitles[0] || product.title,
        alternative_title: bestTitles[1] || "",
        short_title: bestTitles[2] || "",
        original_image_url: product.imageUrl || "",
        image_score: 0,
        price: product.price,
        predicted_high_value: false
      };

      setOptimizationDataMap(prev => ({
        ...prev,
        [productId]: optimizationData
      }));
    } catch (error) {
      console.error("Error optimizing product:", error);
    }
  };

  const handleSaveChanges = (productId: string, newTitle: string) => {
    setProductsData(prevProducts =>
      prevProducts.map(product =>
        product.id === productId
          ? { ...product, title: newTitle }
          : product
      )
    );
    console.log("Saved new title:", newTitle);
  };

  useEffect(() => {
    if (!user?.id) return;

    const EBAY_INVENTORY_API = `${BACKEND_SERVER_URL}/api/ebay/products/inventory?user_id=${user.id}`;
    console.log("Fetching inventory from:", EBAY_INVENTORY_API);

    // interface InventoryItem {
    //   sku: string;
    //   product: {
    //     title: string;
    //     description: string;
    //     mpn: string;
    //     imageUrls: string[];
    //   };
    //   availability: {
    //     shipToLocationAvailability: {
    //       quantity: number;
    //     };
    //   };
    // }

    async function fetchProducts() {
      if (!user?.id) {
        console.warn("User is not available yet.");
        return;
      }
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
        const formattedInventory = inventoryItems.map((item: {
          sku: string;
          product?: {
            title?: string;
            description?: string;
            mpn?: string;
            imageUrls?: string[];
          };
          availability: {
            shipToLocationAvailability: {
              quantity: number;
            };
          };
        }) => ({
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
          optimizerItems.map(async (item: {
            id?: string;
            sku?: string;
            product_title: string;
            description?: string;
            price?: number;
            quantity?: number;
            quantitySold?: number;
            costPrice?: number;
            shipping?: number;
            ebayFees?: number;
            profit?: number;
            profitMargin?: number;
            roi?: number;
            image_url?: string;
            listingStatus?: string;
            createdAt?: string;
            updatedAt?: string;
            condition?: string;
            category?: string;
          }) => {
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
                optimizedData: predictResult || {},
              };
            } catch (err) {
              console.error("Prediction error:", err);
              return baseProduct;
            }
          })
        );

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
      if (prevProducts.some((product) => product.id === newProduct.id)) {
        return prevProducts;
      }

      // Ensure competitorData exists (fallback to default if missing)
      const productWithCompetitorData: Product = {
        ...newProduct,
        competitorData: newProduct.competitorData || {
          id: newProduct.id,
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
        currency: newProduct.currency || "USD",
        quantitySold: newProduct.quantitySold || 0,
        sellThroughRate: newProduct.sellThroughRate || 0,
        timeToSell: newProduct.timeToSell || 0,
        ebayFees: newProduct.ebayFees || 0,
        profit: newProduct.profit || 0,
        profitMargin: newProduct.profitMargin || 0,
        roi: newProduct.roi || 0,
        createdAt: newProduct.createdAt || new Date().toISOString(),
        updatedAt: newProduct.updatedAt || new Date().toISOString(),
      };

      return [...prevProducts, productWithCompetitorData];
    });

    setRefreshTrigger((prev) => prev + 1);
  };

  const selectedProduct = selectedProductId
    ? productsData.find((product) => product.id === selectedProductId)
    : null;

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

  // const handleUpdateProduct = (
  //   productId: string,
  //   updates: Partial<Product>
  // ) => {
  //   console.log("Updating product:", productId, updates);
  //   alert(`Product ${productId} updated (simulated)`);
  // };

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
              onOptimizeClick={async () => {
                // You can leave this empty or add a console log for dev testing
                console.log(`Optimize clicked for product: ${product.id}`);
              }}
            />
          ))}

        </div>

        {selectedProduct && (
          <ProductDetailModal
            ref={modalRef}
            product={selectedProduct}
            optimizationData={optimizationDataMap[selectedProduct.id] || null}
            onClose={() => {
              setSelectedProductId(null);
              setRefreshTrigger(prev => prev + 1);
            }}
            onSaveChanges={(newTitle) => {
              setProductsData(prevProducts =>
                prevProducts.map(product =>
                  product.id === selectedProduct.id
                    ? { ...product, title: newTitle }
                    : product
                )
              );
              console.log("Saved new title:", newTitle);
            }}
          />
        )}
      </div>
    );
  }

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
          onClick={() => setIsAddProductModalOpen(true)}
        >
          Custom Work
        </button>
      </div>

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

        <div className="mt-4 text-sm text-white-400">
          Showing {filteredProducts.length} of {productsData.length} products
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={(id) => setSelectedProductId(id)}
            onOptimizeClick={handleOptimizeProduct}
          />
        ))}
      </div>

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

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onAddProduct={handleAddProduct}
      />

      {selectedProduct && (
        <ProductDetailModal
          ref={modalRef}
          product={selectedProduct}
          optimizationData={optimizationDataMap[selectedProduct.id] || null}
          onClose={() => setSelectedProductId(null)}
          onSaveChanges={(newTitle) => handleSaveChanges(selectedProduct.id, newTitle)}
        />
      )}
    </div>
  );
}
