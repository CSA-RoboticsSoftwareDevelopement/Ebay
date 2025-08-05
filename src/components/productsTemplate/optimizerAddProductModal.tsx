import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import Swal from "sweetalert2";
import { Product } from "@/types/ProductTypes";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (newProduct: Product) => void;
}

const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;
const API_URL = `${BACKEND_SERVER_URL}/api/ebay/products/optimizer/add`;

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onAddProduct }) => {

  const [formData, setFormData] = useState({
    product_title: "",
    category: "",
    price: "",
    image_url: "",
    user_id: " ", // ← replace with dynamic user ID
  });

  const [, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  const { product_title, category, price, image_url } = formData;
  if (!product_title || !category || !price || !image_url) {
    setError("All fields are required.");
    return;
  }

  const user_id = sessionStorage.getItem("userId"); // 🔑 Get from session storage

  if (!user_id) {
    setError("User ID not found in session.");
    return;
  }

  setLoading(true);

  try {
    const payload = { ...formData, user_id };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      onAddProduct(result.product);
      Swal.fire("Success", "Product added successfully!", "success");
      setFormData({
        product_title: "",
        category: "",
        price: "",
        image_url: "",
        user_id: "", // Clear manually (optional)
      });
      setImagePreview("");
      onClose();
    } else {
      setError(result.message || "Something went wrong.");
    }
  } catch (err) {
    console.error("Error adding product:", err);
    setError("Server error. Please try again.");
  } finally {
    setLoading(false);
  }
};




  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Add New Product</h2>
          <button onClick={onClose}>
            <FiX className="text-gray-600 hover:text-gray-900" size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Product Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="product_title"
                value={formData.product_title}
                onChange={(e) =>
                  setFormData({ ...formData, product_title: e.target.value })
                }
                placeholder="Enter product title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Category */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Enter product category"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Price */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (USD) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="Enter price"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Image URL */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Image URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="image_url"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                placeholder="Enter image URL"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste a valid image URL (JPEG, PNG, etc.)
              </p>
            </div>

          </div>

          {/* Error Message */}
          {error && (
            <div className="px-6 pb-3 text-red-600 text-sm">{error}</div>
          )}

          {/* Footer */}
          <div className="px-6 pt-4 pb-6 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
