import React, { useEffect, useState } from "react";
import Image from "next/image";
import { formatCurrency, formatPercentage } from "../../lib/formatters";
import { Product } from "@/types/ProductTypes";
import axios from "axios";

const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;

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

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
}) => {
  const getStatusColor = (status?: string | null) => {
    if (!status) return "bg-gray-900";
    const statusMap: Record<string, string> = {
      active: "bg-green-500",
      ended: "bg-red-500",
      draft: "bg-yellow-500",
      scheduled: "bg-blue-500",
    };
    return statusMap[status.toLowerCase()] || "bg-gray-500";
  };

  const calculateEbayFee = (price: number) => {
    const fixedFee = 0.3;
    let variableFee = 0;
    if (price <= 1000) {
      variableFee = price * 0.134;
    } else {
      variableFee = 1000 * 0.134 + (price - 1000) * 0.0275;
    }
    return parseFloat((fixedFee + variableFee).toFixed(2));
  };

  const [imgSrc, setImgSrc] = useState(
    product.imageUrl ||
      `https://placehold.co/400x300?text=${encodeURIComponent(
        product.title?.substring(0, 1) || product.title
      )}`
  );
  const [, setProductData] = useState<Record<string, unknown> | null>(null);
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

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_SERVER_URL}/api/ebay/products/productsdata`
        );
        if (setProductData) setProductData(response.data);

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

    fetchProductData();
  }, [product.id, product.price]);

  const sellThroughDisplay = product.sellThroughRate
    ? `${Math.round(product.sellThroughRate * 100)}%`
    : "N/A";

  return (
    <div
      className="bg-neutral-800 text-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick(product.id)}
    >
      <div className="h-48 overflow-hidden relative">
        <div className="relative w-full h-full">
          <Image
            src={imgSrc}
            alt={product.title || "No image available"}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() =>
              setImgSrc(
                `https://placehold.co/400x300?text=${encodeURIComponent(
                  product.title
                )}`
              )
            }
          />
        </div>
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
        {/* ✅ Title now white */}
        <h3 className="font-medium text-lg text-white line-clamp-2">
          {product.title}
        </h3>

        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-300">Price</p>
            <p className="font-semibold text-white">
              {formatCurrency(product.price, product.currency)}
            </p>
          </div>
          <div>
            <p className="text-gray-300">Profit</p>
            <p className="font-semibold text-white">
              {editedValues.profit !== undefined
                ? formatCurrency(editedValues.profit, product.currency)
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-gray-300">Profit Margin</p>
            <p className="font-semibold text-white">
              {formatPercentage((editedValues.profitMargin ?? 0) / 100)}
            </p>
          </div>
          <div>
            <p className="text-gray-300">Sell Through</p>
            <p className="font-semibold text-white">{sellThroughDisplay}</p>
          </div>
          <div>
            <p className="text-gray-300">Quantity</p>
            <p className="font-semibold text-white">{product.quantity}</p>
          </div>
        </div>

        <button
          className="w-full mt-3 py-2 bg-primary-yellow text-black font-medium rounded hover:bg-primary-yellow/90 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
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
