import React, { useState } from "react";
import Swal from "sweetalert2"; // ✅ Import SweetAlert2

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (newProduct: any) => void;
}

const API_URL = "http://localhost:5000/api/ebay/products/inventory/add"; // ✅ API Endpoint

const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    quantity: "",
    description: "",
    imageUrl: "",
  });

  const [loading, setLoading] = useState(false); // ✅ Track submission state
  const [error, setError] = useState<string | null>(null); // ✅ Track API errors

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Ensure required fields are filled
    if (!formData.title || !formData.price || !formData.quantity) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    // ✅ Prepare data in API format
    const productData = {
      sku: `SKU-${Date.now()}`, // Generate unique SKU
      title: formData.title,
      quantity: parseInt(formData.quantity),
      price: formData.price,
      currency: "USD",
      condition: "NEW",
      mpn: formData.price, // Assuming MPN is same as price
      description: formData.description, // ✅ Include description
      imageUrls: [
        formData.imageUrl ||
        `https://placehold.co/400x300?text=${encodeURIComponent(formData.title)}`
      ],
       // ✅ Include image URL
    };

    try {
      // ✅ Send POST request to API
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorText = await response.text(); // Read response error
        console.error("API Error:", errorText); // ✅ Log the full API response
        throw new Error(`Failed to add product: ${errorText}`);
      }

      // ✅ Convert response to JSON
      const newProduct = await response.json();

      // ✅ Pass new product to parent component
      onAddProduct(newProduct);
      await Swal.fire({
        title: "Success!",
        text: "Product added successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });

      // ✅ Reset form after successful submission
      setFormData({
        title: "",
        price: "",
        quantity: "",
        description: "",
        imageUrl: "",
      });

      // ✅ Close modal after successful submission
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Add New Product</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}{" "}
        {/* ✅ Show error */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              name="title"
              placeholder="Product Name"
              className="w-full border px-3 py-2 rounded-lg"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Enter product description"
              className="w-full border px-3 py-2 rounded-lg"
              value={formData.description}
              onChange={handleChange} // ✅ Allow user to enter description
              required
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Price ($)
            </label>
            <input
              type="number"
              name="price"
              placeholder="Price"
              className="w-full border px-3 py-2 rounded-lg"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              className="w-full border px-3 py-2 rounded-lg"
              value={formData.quantity}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Image URL
            </label>
            <input
              type="text"
              name="imageUrl"
              placeholder="Enter image URL"
              className="w-full border px-3 py-2 rounded-lg"
              value={formData.imageUrl}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-lg"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-500 text-black rounded-lg"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Product"}{" "}
              {/* ✅ Show loading text */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
