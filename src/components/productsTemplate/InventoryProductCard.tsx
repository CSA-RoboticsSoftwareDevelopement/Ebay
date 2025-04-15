import React, { useEffect } from "react";
import { useState } from "react";
import Image from "next/image";
import { formatCurrency, formatPercentage } from "../../lib/formatters";
import { Product } from "@/types/ProductTypes";
import axios from "axios"; // Ensure you import axios
const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;

// Define the ProductCard props type
export type ProductCardProps = {
  product: Pick<
    Product,
    | "id"
    | "title"
    | "description"
    | "price"
    | "currency"
    | "quantity"
    | "quantitySold"
    | "sellThroughRate"
    | "profit"
    | "profitMargin"
    | "roi"
    | "imageUrl"
    | "listingStatus"
    | "costPrice"
  >;
  onClick: (productId: string) => void;
};

/**
 * A card component for displaying product information in the products grid
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
}) => {
  // Status color mapping
  const getStatusColor = (status?: string | null) => {
    if (!status) return "bg-gray-500"; // Default gray for unknown status

    const statusMap: Record<string, string> = {
      active: "bg-green-500",
      ended: "bg-red-500",
      draft: "bg-yellow-500",
      scheduled: "bg-blue-500",
    };

    return statusMap[status.toLowerCase()] || "bg-gray-500";
  };

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

  // Generate a placeholder image URL if none exists
  // Generate placeholder image URL if needed in the useState below

  const [imgSrc, setImgSrc] = useState(
    product.imageUrl ||
      `https://placehold.co/400x300?text=${encodeURIComponent(
        product.title?.substring(0, 1) || product.title
      )}`
  );
  const [productData, setProductData] = useState(null); // State to store fetched product data
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

  const fetchProductData = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_SERVER_URL}/api/ebay/products/productsdata`
      );
      console.log("Fetched Product Data:", response.data); // Print to console
      setProductData(response.data); // Store in the state

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
    } catch (error) {}
  };
  useEffect(() => {
    fetchProductData(); // Call the function to fetch data on component mount
  }, []); // Empty dependency array to run once when component mounts

  // Calculate sell-through percentage for display
  const sellThroughDisplay = product.sellThroughRate
    ? `${Math.round(product.sellThroughRate * 100)}%`
    : "N/A";

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick(product.id)}
    >
      <div className="h-48 overflow-hidden relative">
        {/* Image with placeholder fallback */}
        <div className="relative w-full h-full">
          <Image
            src={imgSrc}
            alt={product.title || "No image available"} // ✅ Fallback alt text
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() =>
              setImgSrc(
                `https://placehold.co/400x300?text=${encodeURIComponent(
                  product.title
                )}`
              )
            } // ✅ Fallback to placeholder
          />
        </div>

        {/* Status badge */}
        {product.listingStatus && (
          <div
            className={`absolute top-2 right-2 ${getStatusColor(
              product.listingStatus
            )} text-white px-2 py-1 rounded-full text-xs`}
          >
            {product.listingStatus}
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Title with truncation */}
        <h3 className="font-medium text-lg line-clamp-2 ">{product.title}</h3>

        {/* Key metrics grid */}
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-600">Price</p>
            <p className="font-semibold">
              {formatCurrency(product.price, product.currency)}
            </p>
          </div>
          <div>
            <div>
              <p className="text-gray-600">Profit</p>
              <p className="font-semibold">
                {editedValues.profit !== undefined
                  ? formatCurrency(editedValues.profit, product.currency)
                  : "N/A"}
              </p>
            </div>
          </div>
          <div>
            <p className="text-gray-600">profit Margin</p>
            <p className="font-semibold">
              {formatPercentage((editedValues.profitMargin ?? 0) / 100)}
              {/* Use editedValues.profitMargin */}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Sell Through</p>
            <p className="font-semibold">{sellThroughDisplay}</p>
          </div>
          <div>
            <p className="text-gray-600">Quantity</p>
            <p className="font-semibold">{product.quantity}</p>
          </div>
        </div>

        {/* View Details button */}
        <button
          className="w-full mt-3 py-2 bg-primary-yellow text-black font-medium rounded hover:bg-primary-yellow/90 transition-colors"
          onClick={(e) => {
            e.stopPropagation(); // Prevent duplicate click events
            onClick(product.id);
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
