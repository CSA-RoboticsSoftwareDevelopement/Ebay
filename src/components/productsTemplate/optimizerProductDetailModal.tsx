// optimizerProductDetailModal.tsx
import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import Image from "next/image";

type OptimizationData = {
  original_title: string;
  enhanced_title: string;
  alternative_title?: string;
  short_title?: string;
  original_image_url: string;
  image_score: number;
  price: number;
  predicted_high_value: boolean;
  category?: string;
  subcategory?: string;
};

type Product = {
  id: string;
  title: string;
  imageUrl?: string;
  price: number;
  description?: string;
  category?: string;
  subcategory?: string;
};

const ProductDetailModal = forwardRef(({
  product,
  onClose,
  optimizationData,
  onSaveChanges // Add this prop
}: {
  product: Product;
  onClose: () => void;
  optimizationData?: OptimizationData;
  onSaveChanges: (selectedTitle: string) => void; // Function to save changes
}, ref) => {
  const [optimizedData, setOptimizedData] = useState<OptimizationData | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    triggerReoptimize: () => handleReoptimize()
  }));

  useEffect(() => {
    if (optimizationData) {
      setOptimizedData(optimizationData);
      // Set the first optimized title as default selection
      setSelectedTitle(optimizationData.enhanced_title);
      console.log("🧠 Received Optimization Data in Modal:", optimizationData);
    }
  }, [optimizationData]);

  const imageUrlSrc =
    product.imageUrl ||
    `https://placehold.co/400x300?text=${encodeURIComponent(product.title)}`;

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleReoptimize = async () => {
    try {
      const payload = {
        title: product.title,
        price: product.price,
        image_url: product.imageUrl || "",
        order_count: 40,
        return_rate: 3.4,
        avg_review_score: 4.1,
        high_value: 0,
        category: product.category,
        subcategory: product.subcategory
      };

      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Prediction failed");
      const data = await response.json();
      setOptimizedData(data);
      setSelectedTitle(data.enhanced_title); // Reset selection to first option
      console.log("✅ Optimization Response:", data);
    } catch (err) {
      console.error("❌ Reoptimize Error:", err);
    }
  };

  const handleTitleSelect = (title: string) => {
    setSelectedTitle(title);
  };

const handleApplyChanges = async () => {
  if (!selectedTitle || !product?.id) return;

  try {
    const response = await fetch(`http://localhost:5000/api/ebay/products/optimizer/update/${product.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        product_title: selectedTitle
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ Update failed:", result.message);
      return;
    }

    console.log("✅ Product title updated:", result);
    onSaveChanges(selectedTitle); // Optional: callback to parent
    onClose(); // Close modal
  } catch (error) {
    console.error("❌ Error updating product:", error);
  }
};


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-neutral-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={handleModalClick}>
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-white text-xl font-bold">Product Optimization</h2>
          <button className="text-gray-400 hover:text-white text-2xl" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Side - Image with Score and Reoptimize Button */}
          <div className="w-full md:w-1/3 p-6 flex flex-col">
            <div className="relative aspect-square w-full mb-6">
              <Image
                src={imageUrlSrc}
                alt={product.title}
                className="object-contain rounded-lg"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
            </div>

            <div className="bg-gray-900/50 p-4 rounded-lg mb-4">
              <p className="font-semibold text-lg text-white text-center">
                Image Score:{" "}
                <span className="text-primary-yellow">
                  {optimizedData ? optimizedData.image_score.toFixed(1) : "—"}
                </span>
                /10
              </p>

              <p className="text-sm text-gray-400 mt-1 text-center">
                (Industry Average: 7.5)
              </p>
            </div>

            <button
              onClick={handleReoptimize}
              className="flex items-center justify-center gap-2 mt-auto px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-medium transition-colors"
            >
              <span className="text-lg">🔄</span> Reoptimize
            </button>
          </div>

          {/* Right Side - Comparison Table */}
          <div className="w-full md:w-2/3 p-6 flex flex-col">
            <div className="border border-gray-700 rounded-lg overflow-hidden flex-1">
              {/* Current Section */}
              <div className="p-4 bg-gray-900">
                <h3 className="text-white font-bold mb-3">CURRENT</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">ID</p>
                    <p className="text-white">{product.id}</p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm">Name</p>
                    <p className="text-white">{product.title}</p>
                  </div>
                  {product.category && (
                    <div>
                      <p className="text-gray-400 text-sm">Category</p>
                      <p className="text-white">{product.category}</p>
                    </div>
                  )}
                  {product.subcategory && (
                    <div>
                      <p className="text-gray-400 text-sm">Subcategory</p>
                      <p className="text-white">{product.subcategory}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-400 text-sm">Price</p>
                    <p className="text-white">${product.price.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Optimized Section */}
              <div className="p-4 border-t border-gray-700">
                <h3 className="text-white font-bold mb-3">OPTIMIZED</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Select optimized title:</p>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleTitleSelect(optimizedData?.enhanced_title || '')}
                        className={`px-3 py-2 text-left rounded-md ${selectedTitle === optimizedData?.enhanced_title ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                      >
                        {optimizedData?.enhanced_title || "Option 1 loading..."}
                      </button>
                      <button
                        onClick={() => handleTitleSelect(optimizedData?.alternative_title || '')}
                        className={`px-3 py-2 text-left rounded-md ${selectedTitle === optimizedData?.alternative_title ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                      >
                        {optimizedData?.alternative_title || "Option 2 loading..."}
                      </button>
                      <button
                        onClick={() => handleTitleSelect(optimizedData?.short_title || '')}
                        className={`px-3 py-2 text-left rounded-md ${selectedTitle === optimizedData?.short_title ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                      >
                        {optimizedData?.short_title || "Option 3 loading..."}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Price</p>
                    <div className="flex items-center gap-2">
                      <span className="text-primary-yellow">
                        ${optimizedData ? optimizedData.price.toFixed(2) : "—"}
                      </span>
                      <span className="text-green-500 text-sm font-medium">
                        (▲ 15%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={handleApplyChanges}
                disabled={!selectedTitle}
                className={`px-6 py-2 ${selectedTitle ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-500 cursor-not-allowed'} text-black rounded-lg font-medium transition-colors`}
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ProductDetailModal.displayName = "ProductDetailModal";

export default ProductDetailModal;