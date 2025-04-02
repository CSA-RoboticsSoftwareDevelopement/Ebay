import React, { useState } from "react";
import Image from "next/image";
import Swal from "sweetalert2"; // ✅ Import SweetAlert2
import { Product } from "@/types/ProductTypes"; // ✅ Import Product type
import {
  formatCurrency,
  formatPercentage,
  formatDate,
  formatDays,
} from "../../lib/formatters";
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
  onUpdateProduct,
}) => {
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "performance"
    | "competitors"
    | "images"
    | "settings"
    | "description"
  >("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState({
    costPrice: product.costPrice,
    shipping: product.shipping,
    ebayFees: product.ebayFees,
  });

  // Generate a placeholder image URL if none exists
  const imageUrlSrc =
    product.imageUrl ||
    `https://placehold.co/400x300?text=${encodeURIComponent(
      product.title
    )}`;

  const handleTabChange = (
    tab:
      | "overview"
      | "performance"
      | "competitors"
      | "images"
      | "settings"
      | "description"
  ) => {
    setActiveTab(tab);
  };

  const handleSaveChanges = () => {
    if (onUpdateProduct) {
      onUpdateProduct(product.id, editedValues);
    }
    setIsEditing(false);
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
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={handleModalClick}
      >
        <div className="flex flex-col h-full">
          {/* Modal Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold truncate">{product.title}</h2>
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
                  <p className="font-semibold">
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
                    {formatPercentage(product.roi)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Margin</p>
                  <p className="font-semibold">
                    {formatPercentage(product.profitMargin)}
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
                    activeTab === "description"
                      ? "text-primary-yellow border-b-2 border-primary-yellow"
                      : "text-gray-500"
                  }`}
                  onClick={() => handleTabChange("description")}
                >
                  Description
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === "competitors"
                      ? "text-primary-yellow border-b-2 border-primary-yellow"
                      : "text-gray-500"
                  }`}
                  onClick={() => handleTabChange("competitors")}
                >
                  Competitors
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
                      <h3 className="text-lg font-medium">
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
                          className="text-sm bg-primary-yellow text-black px-3 py-1 rounded"
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
                              className="border rounded w-full p-2"
                              step="0.01"
                            />
                          ) : (
                            <p>
                              {formatCurrency(
                                product.costPrice,
                                product.currency
                              )}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Shipping Cost
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              name="shipping"
                              value={editedValues.shipping || ""}
                              onChange={handleInputChange}
                              className="border rounded w-full p-2"
                              step="0.01"
                            />
                          ) : (
                            <p>
                              {formatCurrency(
                                product.shipping,
                                product.currency
                              )}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            eBay Fees
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              name="ebayFees"
                              value={editedValues.ebayFees || ""}
                              onChange={handleInputChange}
                              className="border rounded w-full p-2"
                              step="0.01"
                            />
                          ) : (
                            <p>
                              {formatCurrency(
                                product.ebayFees,
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
                              {formatCurrency(product.profit, product.currency)}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              ROI
                            </label>
                            <p className="font-semibold">
                              {formatPercentage(product.roi)}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Profit Margin
                            </label>
                            <p className="font-semibold">
                              {formatPercentage(product.profitMargin)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Listing Details</h4>
                        <p>
                          <span className="text-gray-600">Listed on:</span>{" "}
                          {formatDate(product.createdAt)}
                        </p>
                        <p>
                          <span className="text-gray-600">Last updated:</span>{" "}
                          {formatDate(product.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance Tab */}
                {activeTab === "performance" && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Performance Metrics
                    </h3>

                    <div className="space-y-4">
                      <div className="bg-gray-100 p-4 rounded">
                        <h4 className="font-medium mb-2">Sell-Through Rate</h4>
                        <p className="text-2xl font-bold">
                          {formatPercentage(product.sellThroughRate)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {product.quantitySold} sold out of {product.quantity}{" "}
                          total
                        </p>
                      </div>

                      <div className="bg-gray-100 p-4 rounded">
                        <h4 className="font-medium mb-2">Time to Sell</h4>
                        <p className="text-2xl font-bold">
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
                            <p className="font-bold">
                              {formatCurrency(product.profit, product.currency)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">ROI</p>
                            <p className="font-bold">
                              {formatPercentage(product.roi)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Margin</p>
                            <p className="font-bold">
                              {formatPercentage(product.profitMargin)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description Tab */}
                {activeTab === "description" && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Product Description
                    </h3>
                    <p className="max-h-64 overflow-y-auto overflow-x-hidden">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Competitors Tab */}
                {activeTab === "competitors" && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Competitor Analysis
                    </h3>

                    {product.competitorData ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-100 p-4 rounded">
                            <h4 className="font-medium mb-2">
                              Price Comparison
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Your Price:
                                </span>
                                <span className="font-semibold">
                                  {formatCurrency(
                                    product.price,
                                    product.currency
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Avg. Competitor Price:
                                </span>
                                <span className="font-semibold">
                                  {formatCurrency(
                                    product.competitorData.avgPrice,
                                    product.currency
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Lowest Price:
                                </span>
                                <span className="font-semibold">
                                  {formatCurrency(
                                    product.competitorData.lowestPrice,
                                    product.currency
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Highest Price:
                                </span>
                                <span className="font-semibold">
                                  {formatCurrency(
                                    product.competitorData.highestPrice,
                                    product.currency
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Avg. Shipping:
                                </span>
                                <span className="font-semibold">
                                  {formatCurrency(
                                    product.competitorData.avgShipping,
                                    product.currency
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-100 p-4 rounded">
                            <h4 className="font-medium mb-2">
                              Listing Quality
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Avg. Listing Position:
                                </span>
                                <span className="font-semibold">
                                  {product.competitorData.avgListingPosition?.toFixed(
                                    1
                                  ) || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Avg. Image Count:
                                </span>
                                <span className="font-semibold">
                                  {product.competitorData.avgImageCount?.toFixed(
                                    1
                                  ) || "N/A"}{" "}
                                  images
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Avg. Seller Feedback:
                                </span>
                                <span className="font-semibold">
                                  {product.competitorData.avgSellerFeedback?.toFixed(
                                    1
                                  ) || "N/A"}
                                  %
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Competitors Analyzed:
                                </span>
                                <span className="font-semibold">
                                  {product.competitorData.competitorCount || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 italic">
                          Last updated:{" "}
                          {formatDate(product.competitorData.lastUpdated)}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-100 p-4 rounded text-center">
                        <p>No competitor data available for this product.</p>
                        <button className="mt-2 bg-primary-yellow text-black px-4 py-2 rounded text-sm">
                          Analyze Competitors
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Images Tab */}
                {activeTab === "images" && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Product Images</h3>

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
                    <h3 className="text-lg font-medium mb-4">
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
