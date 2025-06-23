import React, { useEffect, useState } from "react";
import Image from "next/image";
import { formatCurrency } from "../../lib/formatters";
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

  const [editedValues, setEditedValues] = useState<{
    costPrice: number;
    salesPrice: number;
    ebayFees: number;
    profit?: number;
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
        
        if (response.data?.data?.length > 0) {
          const fetchedProduct = response.data.data.find(
            (item: any) => item.sku === product.id
          );

          const costPrice = fetchedProduct
            ? parseFloat(fetchedProduct.cost_price ?? "0")
            : 0;
          const ebayFees = fetchedProduct?.ebay_fees != null
            ? parseFloat(fetchedProduct.ebay_fees)
            : calculateEbayFee(product.price);

          setEditedValues(prev => ({
            ...prev,
            costPrice,
            ebayFees,
            profit: prev.salesPrice - costPrice - ebayFees,
            roi: costPrice > 0 ? (prev.salesPrice - costPrice - ebayFees) / costPrice : 0,
          }));
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchProductData();
  }, [product.id, product.price]);

  return (
    <div
      className="bg-neutral-800 text-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick(product.id)}
    >
      {/* Product Image */}
      <div className="h-48 relative">
        <Image
          src={imgSrc}
          alt={product.title || "Product image"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => 
            setImgSrc(`https://placehold.co/400x300?text=${encodeURIComponent(product.title)}`)
          }
        />
      </div>

      {/* Product Details */}
      <div className="p-4">
        <h3 className="font-medium text-lg text-white line-clamp-2 mb-3">
          {product.title}
        </h3>

        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
          <div>
            <p className="text-gray-400 mb-1">Price</p>
            <p className="font-semibold text-white">
              {formatCurrency(product.price, product.currency)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Profit</p>
            <p className="font-semibold text-white">
              {editedValues.profit !== undefined
                ? formatCurrency(editedValues.profit, product.currency)
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">In Stock</p>
            <p className="font-semibold text-white">{product.quantity}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">ROI</p>
            <p className="font-semibold text-white">
              {editedValues.roi !== undefined
                ? `${Math.round(editedValues.roi * 100)}%`
                : "N/A"}
            </p>
          </div>
        </div>

        {/* Optimize Button */}
        <button
          className="w-full py-2.5 bg-primary-yellow text-black font-medium rounded-md hover:bg-primary-yellow/90 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onClick(product.id);
          }}
        >
          Optimize
        </button>
      </div>
    </div>
  );
};

export default ProductCard;