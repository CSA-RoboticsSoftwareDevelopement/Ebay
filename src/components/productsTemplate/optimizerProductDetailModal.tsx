import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import Image from "next/image";
const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;


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

export type ProductDetailModalHandle = {
  triggerReoptimize: () => void;
};

const ProductDetailModal = forwardRef(({
  product,
  onClose,
  optimizationData,
  onSaveChanges
}: {
  product: Product;
  onClose: () => void;
  optimizationData?: OptimizationData;
  onSaveChanges: (selectedTitle: string) => void;
}, ref) => {
  const [optimizedData, setOptimizedData] = useState<OptimizationData | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState(product.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useImperativeHandle(ref, () => ({
    triggerReoptimize: () => handleReoptimize()
  }));

  useEffect(() => {
    if (optimizationData) {
      setOptimizedData(optimizationData);
      setSelectedTitle(optimizationData.enhanced_title);
      console.log("🧠 Received Optimization Data in Modal:", optimizationData);
    }
  }, [optimizationData]);

  useEffect(() => {
    if (product?.title) {
      setCurrentTitle(product.title);
      setIsEditingTitle(false);
    }
  }, [product]);

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
      setSelectedTitle(data.enhanced_title);
      console.log("✅ Optimization Response:", data);
    } catch (err) {
      console.error("❌ Reoptimize Error:", err);
    }
  };

  const handleTitleSelect = (title: string) => {
    setSelectedTitle(title);
  };

  const handleApplyChanges = async () => {
    if (!product?.id) return;

    const finalTitle = selectedTitle !== null ? selectedTitle : currentTitle;

    try {
      const payload = {
        product_title: finalTitle,
        original_title: product.title,
        used_optimized: !!selectedTitle
      };

      const response = await fetch(`${BACKEND_SERVER_URL}/api/ebay/products/optimizer/update/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("❌ Update failed:", result.message);
        return;
      }

      console.log("✅ Product title updated:", result);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        onSaveChanges(finalTitle);
        onClose();
      }, 1500);
    } catch (error) {
      console.error("❌ Error updating product:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
   <div
  className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg z-50 bg-green-600 text-white transition-all duration-500 ease-in-out
    ${showSuccess ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}
>
  ✅ Successfully updated!
</div>


      <div
        className="bg-neutral-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={handleModalClick}
      >
        <div className="overflow-y-auto max-h-[calc(90vh-72px)]">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-white text-xl font-bold">Product Optimization</h2>
            <button className="text-gray-400 hover:text-white text-2xl" onClick={onClose}>
              &times;
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Left - Image + Score */}
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

              <div className="bg-gray-900/50 p-4 rounded-lg mb-4 text-center">
                <p className="font-semibold text-lg text-white">
                  Image Score:{" "}
                  <span className="text-primary-yellow">
                    {optimizedData ? optimizedData.image_score.toFixed(1) : "—"}
                  </span>
                  /10
                </p>
                <p className="text-sm text-gray-400 mt-1">(Industry Average: 7.5)</p>
              </div>
            </div>

            {/* Right - Current + Optimized */}
            <div className="w-full md:w-2/3 p-6 flex flex-col">
              <div className="border border-gray-700 rounded-lg overflow-hidden flex-1">
                {/* Current */}
                <div className="p-4 bg-gray-900 space-y-3">
                  <h3 className="text-white font-bold mb-3">CURRENT</h3>
                  <div>
                    <p className="text-gray-400 text-sm">ID</p>
                    <p className="text-white">{product.id}</p>
                  </div>

                  <p className="text-gray-400 text-sm">Name</p>
                  {isEditingTitle ? (
                    <input
                      type="text"
                      value={currentTitle}
                      onChange={(e) => setCurrentTitle(e.target.value)}
                      onBlur={() => setIsEditingTitle(false)}
                      autoFocus
                      className="text-white bg-transparent border-b border-yellow-500 focus:outline-none w-full"
                    />
                  ) : (
                    <div
                      className="flex items-center justify-between cursor-pointer group"
                      onClick={() => setIsEditingTitle(true)}
                    >
                      <p className="text-white group-hover:underline">{currentTitle}</p>
                      <span className="text-gray-400 ml-2 group-hover:text-yellow-500">✏️</span>
                    </div>
                  )}

                  {product.category && (
                    <>
                      <p className="text-gray-400 text-sm">Category</p>
                      <p className="text-white">{product.category}</p>
                    </>
                  )}
                  {product.subcategory && (
                    <>
                      <p className="text-gray-400 text-sm">Subcategory</p>
                      <p className="text-white">{product.subcategory}</p>
                    </>
                  )}

                  <p className="text-gray-400 text-sm">Price</p>
                  <p className="text-white">${product.price.toFixed(2)}</p>
                </div>
              </div>

              {/* Optimized */}
              <div className="p-4 border-t border-gray-700 space-y-4">
                <h3 className="text-white font-bold mb-3">OPTIMIZED</h3>
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
                    <span className="text-green-500 text-sm font-medium">(▲ 15%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-700 bg-neutral-800">
          <button
            onClick={handleApplyChanges}
            disabled={!currentTitle.trim() && !selectedTitle}
            className={`px-6 py-2 ${currentTitle.trim() || selectedTitle
              ? 'bg-yellow-500 hover:bg-yellow-600'
              : 'bg-gray-500 cursor-not-allowed'
              } text-black rounded-lg font-medium transition-colors`}
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
});

ProductDetailModal.displayName = "ProductDetailModal";
export default ProductDetailModal;
