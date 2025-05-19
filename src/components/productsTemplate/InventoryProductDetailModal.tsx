import React, { useEffect, useState } from "react";
import Image from "next/image";
import Swal from "sweetalert2"; // ✅ Import SweetAlert2
import { Product } from "@/types/ProductTypes"; // ✅ Import Product type
import {
  formatCurrency,
  formatPercentage,
  formatDate,
  formatDays,
} from "../../lib/formatters";
import axios from "axios"; // Ensure you import axios
const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;

// Type definitions based on the Prisma schema
export type CompetitorData = {
  id: string;
  avgPrice?: number | null;
  avgShipping?: number | null;
  lowestPrice?: number | null;
  highestPrice?: number | null;
  avgSellerFeedback?: number | null;
  avgListingPosition?: number | null;
  avgImageCount?: number | null;
  competitorCount?: number | null;
  lastUpdated: Date;
};

// Example of the formatPercentage function

// Function to calculate eBay fee
const calculateEbayFee = (price) => {
  const fixedFee = 0.3; // $0.30 fixed fee
  let variableFee = 0;

  // Ensure valid price
  if (price <= 1000) {
    variableFee = price * 0.134; // 13.4% for items <= $1,000
  } else {
    // 13.4% for the first $1,000
    variableFee = 1000 * 0.134 + (price - 1000) * 0.0275; // 2.75% for the amount above $1,000
  }

  // Total eBay fee calculation
  const ebayFee = fixedFee + variableFee;

  // Round the total fee to 2 decimal places
  return parseFloat(ebayFee.toFixed(2));
};

type ProductDetailModalProps = {
  product: Product;
  onClose: () => void;
  onUpdateProduct?: (productId: string, updates: Partial<Product>) => void;
};

/**
 * A modal component that displays detailed product information with tabs
 */
export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "performance" | "images" | "settings"
  >("overview");

  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState<{
    costPrice: number;
    salesPrice: number;
    ebayFees: number;
    profit?: number;
    profitMargin?: number;
    roi?: number;
  }>({
    costPrice: product.costPrice,
    salesPrice: product.price,
    ebayFees: calculateEbayFee(product.price),
  });

  // Generate a placeholder image URL if none exists
  const imageUrlSrc =
    product.imageUrl ||
    `https://placehold.co/400x300?text=${encodeURIComponent(product.title)}`;

  const [, setProductData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_SERVER_URL}/api/ebay/products/productsdata`
        );
        console.log("Fetched Product Data:", response.data); // Print to console
        if (setProductData) {
          setProductData(response.data);
        }  
        // Assuming the response contains an array of products and each product has 'costPrice'
        // Update the edited values with the fetched 'costPrice' for the first product
        if (
          response.data &&
          Array.isArray(response.data.data) &&
          response.data.data.length > 0
        ) {
          const fetchedProduct = response.data.data.find(
            (item) => item.sku === product.id
          );
  
          const costPrice = fetchedProduct
            ? parseFloat(fetchedProduct.cost_price ?? "0")
            : 0;
          const ebayFees =
            fetchedProduct && fetchedProduct.ebay_fees != null
              ? parseFloat(fetchedProduct.ebay_fees)
              : calculateEbayFee(product.price);
  
          console.log("Resolved Cost Price:", costPrice);
          console.log("Resolved eBay Fee:", ebayFees);
  
          setEditedValues((prevState) => {
            const profit = prevState.salesPrice - costPrice - ebayFees;
  
            const profitMargin =
              prevState.salesPrice > 0
                ? (profit / prevState.salesPrice) * 100
                : 0;
  
            const roi = costPrice > 0 ? profit / costPrice : 0;
  
            return {
              ...prevState,
              costPrice,
              ebayFees,
              profit,
              profitMargin,
              roi,
            };
          });
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };
  
    fetchProductData(); // Call the function to fetch data on component mount
  }, [product.id, product.price,setProductData]); // Dependencies now include product.id and product.price
  

  const handleTabChange = (
    tab: "overview" | "performance" | "images" | "settings"
  ) => {
    setActiveTab(tab);
  };
  const handleSaveChanges = async () => {
    // Recalculate the eBay fee based on the sales price

    // Prepare the data to be saved
    const productData = {
      sku: product.id, // Ensure SKU is sent
      cost_price: editedValues.costPrice, // Ensure costPrice is sent
      ebay_fees: editedValues.ebayFees, // Send calculated ebay fee
      salesPrice: editedValues.salesPrice, // Send salesPrice
      updated_at: new Date().toISOString(), // Add updated_at timestamp
    };

    // Log the product data for debugging
    console.log("Product Data being sent:", productData);

    try {
      // Check if we are updating an existing product
      const isUpdate = product.id != null;

      // Send the data to the server using fetch
      const response = await fetch(
        `${BACKEND_SERVER_URL}/api/ebay/products/products/insert`,
        {
          method: isUpdate ? "POST" : "POST", // POST for both insert and update (you could make this conditional if using PUT or PATCH)
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        }
      );

      // If the response is not OK, throw an error
      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Error response from server:", errorResponse);
        throw new Error("Failed to save product");
      }

      // Parse the response if it's successful
      const responseData = await response.json();

      // If the save was successful, show a success message
      if (responseData.success) {
        await Swal.fire(
          "Success",
          "Product details saved successfully!",
          "success"
        );

        // Close the edit mode
        setIsEditing(false);
      } else {
        throw new Error("Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product details:", error);
      Swal.fire(
        "Error",
        "Failed to save product details. Please try again.",
        "error"
      );
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedValues({
      ...editedValues,
      [name]: value === "" ? null : parseFloat(value),
    });
  };

  // Prevent modal click from bubbling to background
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleDeleteProduct = async (
    productId: string,
    onProductDeleted?: () => void
  ) => {
    if (!productId) {
      Swal.fire("Error", "Product ID is missing!", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to undo this action!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#FFC300",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      customClass: {
        cancelButton: "swal-cancel-button", // Custom class for cancel button
      },
    });

    // Add this CSS in your global styles or component styles
    const swalStyles = document.createElement("style");
    swalStyles.innerHTML = `
      .swal-cancel-button {
        color: black !important;  /* Make text black */
      }
    `;
    document.head.appendChild(swalStyles);

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `${BACKEND_SERVER_URL}/api/ebay/products/inventory/delete/${productId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      await Swal.fire("Deleted!", "Product has been deleted.", "success");

      // Instead of reloading the page, trigger state update if a callback is provided
      if (onProductDeleted) onProductDeleted();
      // Close the modal after successful deletion
      onClose();
    } catch (error) {
      console.error("Error deleting product:", error);
      Swal.fire("Error", "Failed to delete product.", "error");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-neutral-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={handleModalClick}
      >
        <div className="flex flex-col h-full">
          {/* Modal Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-white text-xl font-bold truncate">{product.title}</h2>
            <button
              className="text-gray-500 hover:text-gray-700 text-xl"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Left Side - Image and Quick Stats */}
            <div className="w-full md:w-1/3 p-4 border-r md:overflow-y-auto">
              <div className="relative aspect-square mb-4">
                <Image
                  src={imageUrlSrc}
                  alt={product.title}
                  className="object-contain rounded"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="col-span-2 bg-gray-100 p-2 rounded">
                  <p className="text-gray-600">Status</p>
                  <p className="text-black 7font-semibold">
                    {product.listingStatus || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Price</p>
                  <p className="font-semibold">
                    {formatCurrency(product.price, product.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Quantity</p>
                  <p className="font-semibold">
                    {product.quantitySold} / {product.quantity}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Sell Through</p>
                  <p className="font-semibold">
                    {formatPercentage(product.sellThroughRate)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Time to Sell</p>
                  <p className="font-semibold">
                    {formatDays(product.timeToSell)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">ROI</p>
                  <p className="font-semibold">
                    {editedValues.roi != null
                      ? `${(editedValues.roi / 10).toFixed(2)}%`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Profit Margin</p>
                  <p className="font-semibold">
                    {formatPercentage((editedValues.profitMargin ?? 0) / 100)}
                    {/* Use editedValues.profitMargin */}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Tabbed Content */}
            <div className="w-full md:w-2/3 flex flex-col overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b">
                <button
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === "overview"
                      ? "text-primary-yellow border-b-2 border-primary-yellow"
                      : "text-gray-500"
                  }`}
                  onClick={() => handleTabChange("overview")}
                >
                  Overview
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === "performance"
                      ? "text-primary-yellow border-b-2 border-primary-yellow"
                      : "text-gray-500"
                  }`}
                  onClick={() => handleTabChange("performance")}
                >
                  Performance
                </button>

                <button
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === "images"
                      ? "text-primary-yellow border-b-2 border-primary-yellow"
                      : "text-gray-500"
                  }`}
                  onClick={() => handleTabChange("images")}
                >
                  Images
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === "settings"
                      ? "text-primary-yellow border-b-2 border-primary-yellow"
                      : "text-gray-500"
                  }`}
                  onClick={() => handleTabChange("settings")}
                >
                  Settings
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 p-4 overflow-y-auto">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-white text-lg font-medium">
                        Cost & Profit Details
                      </h3>
                      {!isEditing ? (
                        <button
                          className="text-sm bg-primary-yellow text-black px-3 py-1 rounded"
                          onClick={() => setIsEditing(true)}
                        >
                          Edit
                        </button>
                      ) : (
                        <button
                          className="text-black text-sm bg-primary-yellow text-black px-3 py-1 rounded"
                          onClick={handleSaveChanges}
                        >
                          Save
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Cost Price
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              name="costPrice"
                              value={editedValues.costPrice || ""}
                              onChange={handleInputChange}
                              className="border rounded w-full p-2 text-black caret-black"
                              step="0.01"
                            />
                          ) : (
                            <p>{formatCurrency(editedValues.costPrice)}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            eBay Fees
                          </label>
                          {isEditing ? (
                            // When editing, show the input field for eBay fees
                            <input
                              type="number"
                              name="ebayFees"
                              value={editedValues.ebayFees || ""} // Bind to edited value
                              onChange={handleInputChange} // Update on change
                              className="border rounded w-full p-2 text-black caret-black"
                              step="0.01"
                            />
                          ) : (
                            // When not editing, show the formatted eBay fee as currency
                            <p>
                              {formatCurrency(
                                editedValues.ebayFees || product.ebayFees,
                                product.currency
                              )}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Sale Price
                          </label>
                          <p>
                            {formatCurrency(product.price, product.currency)}
                          </p>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Profit
                            </label>
                            <p className="font-semibold">
                              {formatCurrency(
                                editedValues.profit,
                                product.currency
                              )}{" "}
                              {/* Use editedValues.profit */}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              ROI
                            </label>
                            <p className="font-semibold">
                              {editedValues.roi != null
                                ? `${(editedValues.roi / 10).toFixed(2)}%`
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Profit Margin
                            </label>
                            <p className="font-semibold">
                              {formatPercentage(
                                (editedValues.profitMargin ?? 0) / 100
                              )}

                              {/* Use editedValues.profitMargin */}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance Tab */}
                {activeTab === "performance" && (
                  <div>
                    <h3 className="text-white text-lg font-medium mb-4">
                      Performance Metrics
                    </h3>

                    <div className="space-y-4">
                      <div className="bg-gray-100 p-4 rounded">
                        <h4 className="font-medium mb-2">Sell-Through Rate</h4>
                        <p className="text-black text-2xl font-bold">
                          {formatPercentage(product.sellThroughRate)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {product.quantitySold} sold out of {product.quantity}{" "}
                          total
                        </p>
                      </div>

                      <div className="bg-gray-100 p-4 rounded">
                        <h4 className="font-medium mb-2">Time to Sell</h4>
                        <p className="text-black text-2xl font-bold">
                          {formatDays(product.timeToSell)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Average time from listing to sale
                        </p>
                      </div>

                      <div className="bg-gray-100 p-4 rounded">
                        <h4 className="font-medium mb-2">Profitability</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <p className="text-sm text-gray-600">
                              Total Profit
                            </p>
                            <p className="text-black font-bold">
                              {formatCurrency(
                                editedValues.profit ?? 0,
                                product.currency
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600">ROI</p>
                            <p className="text-black font-semibold">
                              {editedValues.roi != null
                                ? `${(editedValues.roi / 10).toFixed(2)}%`
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              Profit Margin
                            </p>
                            <p className="text-black font-semibold">
                              {formatPercentage(
                                (editedValues.profitMargin ?? 0) / 100
                              )}

                              {/* Use editedValues.profitMargin */}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Images Tab */}
                {activeTab === "images" && (
                  <div>
                    <h3 className="text-white text-lg font-medium mb-4">Product Images</h3>

                    {product.additionalImages &&
                    product.additionalImages.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="relative aspect-square">
                          <Image
                            src={imageUrlSrc}
                            alt={`${product.title} - Main Image`}
                            className="object-cover rounded"
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                          />
                        </div>

                        {product.additionalImages.map((imgUrl, index) => (
                          <div key={index} className="relative aspect-square">
                            <Image
                              src={imgUrl}
                              alt={`${product.title} - Image ${index + 2}`}
                              className="object-cover rounded"
                              fill
                              sizes="(max-width: 768px) 50vw, 33vw"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-4 bg-gray-100 rounded">
                        <div className="relative aspect-square w-1/2 mx-auto mb-4">
                          <Image
                            src={imageUrlSrc}
                            alt={product.title}
                            className="object-cover rounded"
                            fill
                            sizes="33vw"
                          />
                        </div>
                        <p>Only one product image available.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "settings" && (
                  <div>
                    <h3 className="text-white text-lg font-medium mb-4">
                      Product Settings
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Product ID
                        </label>
                        <p className="font-semibold">
                          {product.id || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Listing Status
                        </label>
                        <p className="font-semibold">
                          {product.listingStatus || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Created At
                        </label>
                        <p className="font-semibold">
                          {formatDate(product.createdAt)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Last Updated
                        </label>
                        <p className="font-semibold">
                          {formatDate(product.updatedAt)}
                        </p>
                      </div>

                      {/* DELETE BUTTON */}
                      <div className="border-t pt-4">
                        <button
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Delete Product
                        </button>
                      </div>
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

export default ProductDetailModal;
