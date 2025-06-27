import React, { useState, useRef } from "react";
import Swal from "sweetalert2";
import { FiX, FiUpload, FiTrash2 } from "react-icons/fi";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (newProduct: any) => void;
}

const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;
const API_URL = `${BACKEND_SERVER_URL}/api/ebay/products/optimizer/add`;

const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
}) => {
  const [formData, setFormData] = useState({
    product_title: "",
    category: "",
    price: "",
    image_url: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const imageUrl = URL.createObjectURL(e.target.files[0]);
      setImages([imageUrl]);
      setFormData({ ...formData, image_url: imageUrl });
    }
  };

  const removeImage = () => {
    setImages([]);
    setFormData({ ...formData, image_url: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.product_title || !formData.category || !formData.price || !formData.image_url) {
      setError("Please fill in all required fields and upload an image.");
      setLoading(false);
      return;
    }

    if (isNaN(parseFloat(formData.price))) {
      setError("Please enter a valid price.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.missingFields) {
          const missing = Object.entries(data.missingFields)
            .filter(([_, val]) => val)
            .map(([key]) => key.replace('_', ' '));
          throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }
        throw new Error(data.message || "Failed to add product");
      }

      // Enhanced product data structure
      const completeProduct = {
        ...data.product,
        id: data.product.sku || `new-${Date.now()}`,
        title: formData.product_title,
        description: "",
        currency: "USD",
        quantity: 1,
        quantitySold: 0,
        sellThroughRate: 0,
        timeToSell: 0,
        costPrice: 0,
        shipping: 0,
        ebayFees: calculateEbayFee(parseFloat(formData.price)),
        profit: parseFloat(formData.price),
        profitMargin: 100,
        roi: 0,
        imageUrl: formData.image_url,
        listingStatus: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        competitorData: {
          id: data.product.sku || `new-${Date.now()}`,
          avgPrice: 0,
          avgShipping: 0,
          lowestPrice: 0,
          highestPrice: 0,
          avgSellerFeedback: 0,
          avgListingPosition: 0,
          avgImageCount: 1,
          competitorCount: 0,
          lastUpdated: new Date(),
        },
        condition: "New",
        category: formData.category,
      };

      onAddProduct(completeProduct);
      
      await Swal.fire({
        title: "Success!",
        text: data.message || "Product added successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });

      setFormData({
        product_title: "",
        category: "",
        price: "",
        image_url: "",
      });
      setImages([]);
      onClose();
    } catch (err: unknown) {
      let errorMessage = "Failed to add product. Please try again.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateEbayFee = (price: number) => {
    if (!price || isNaN(price)) return 0;
    const fixedFee = 0.3;
    const variableFee = price <= 1000 ? price * 0.134 : 1000 * 0.134 + (price - 1000) * 0.0275;
    return parseFloat((fixedFee + variableFee).toFixed(2));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Add New Product</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="product_title"
                value={formData.product_title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white placeholder-gray-400"
                placeholder="Enter product name"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white"
                required
              >
                <option value="">Select a category</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Home">Home & Garden</option>
                <option value="Sports">Sports</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (USD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white placeholder-gray-400"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Image <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
                required
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center gap-2 text-gray-800 transition-colors"
              >
                <FiUpload className="text-gray-600" />
                {images.length > 0 ? "Change Image" : "Upload Image"}
              </button>
              <p className="text-xs text-gray-500 mt-1">JPEG, PNG up to 5MB</p>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="mt-4">
                  <div className="relative group w-24 h-24">
                    <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      <img
                        src={images[0]}
                        alt="Preview"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 border-t flex justify-end gap-3">
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
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;