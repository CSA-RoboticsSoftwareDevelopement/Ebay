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
  original_image_url: string;
  image_score: number;
  price: number;
  predicted_high_value: boolean;
};

const ProductDetailModal = forwardRef(({
  product,
  onClose,
  optimizationData
}: {
  product: {
    id: string;
    title: string;
    imageUrl?: string;
    price: number;
    description?: string;
  };
  onClose: () => void;
  optimizationData?: OptimizationData;
}, ref) => {
  const [optimizedData, setOptimizedData] = useState<OptimizationData | null>(null);

  useImperativeHandle(ref, () => ({
    triggerReoptimize: () => handleReoptimize()
  }));

  useEffect(() => {
    if (optimizationData) {
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
        high_value: 0
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
      console.log("✅ Optimization Response:", data);
    } catch (err) {
      console.error("❌ Reoptimize Error:", err);
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
              {/* Table Header */}
              <div className="grid grid-cols-2 bg-gray-900">
                <div className="p-3 font-medium text-white text-center border-r border-gray-700">
                  Current
                </div>
                <div className="p-3 font-medium text-white text-center">
                  Optimized
                </div>
              </div>

              {/* Name Row */}
              <div className="grid grid-cols-2 border-t border-gray-700">
                <div className="p-4 border-r border-gray-700">
                  <p className="font-medium text-gray-300 mb-2">Name</p>
                  <p className="text-white">{product.title}</p>
                </div>
                <div className="p-4">
                  <p className="font-medium text-gray-300 mb-2">Name</p>
                  <p className="text-primary-yellow">
                    {optimizedData?.enhanced_title || "Loading..."}
                  </p>

                </div>
              </div>

              {/* Price Row */}
              <div className="grid grid-cols-2 border-t border-gray-700">
                <div className="p-4 border-r border-gray-700">
                  <p className="font-medium text-gray-300 mb-2">Price</p>
                  <p className="text-white">${product.price.toFixed(2)}</p>
                </div>
                <div className="p-4">
                  <p className="font-medium text-gray-300 mb-2">Price</p>
                  <div className="flex items-center gap-2">
                    <span className="text-primary-yellow">
                      ${optimizedData ? optimizedData.price.toFixed(2) : "Loading..."}
                    </span>

                    <span className="text-green-500 text-sm font-medium">
                      (▲ 15%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Apply Button - Now perfectly matches Reoptimize button */}
            <div className="flex justify-end mt-6">
              <button className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-medium transition-colors">
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProductDetailModal;