'use client';

import React from 'react';
import Image from 'next/image';
import { FaStar, FaRegStar } from 'react-icons/fa';

export type ProductCardProps = {
  product: {
    id: string;
    title: string;
    price: string;
    currency: string;
    imagecsv?: string;
    rating?: number;
    category?: string;
    condition?: string;
    opportunityScore?: number;
  };
  onClick?: (productId: string) => void;
};

const getStarRating = (rating: number) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) =>
      i < rating ? (
        <FaStar key={i} className="text-primary-yellow" />
      ) : (
        <FaRegStar key={i} className="text-gray-300" />
      )
    )}
  </div>
);

export const ProductFinderCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
}) => {
  const imageName = product.imagecsv?.split(',')[0]?.trim();
  const imageUrl = imageName
    ? `https://images-na.ssl-images-amazon.com/images/I/${imageName}`
    : 'https://placehold.co/300x300/e5e7eb/a1a1aa?text=No+Image';

  const productRating =
    typeof product.rating === 'number'
      ? product.rating
      : Math.floor(Math.random() * 5) + 1;

  const isPriceAvailable =
    product.price !== '0.00' && !isNaN(parseFloat(product.price));

  return (
    <div
      className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.02] border border-neutral-gray-100 cursor-pointer"
      onClick={() => onClick?.(product.id)}
    >
      {/* Image Section */}
      <div className="aspect-[4/3] overflow-hidden relative">
        <div className="relative w-full h-full bg-neutral-gray-100">
          <Image
            src={imageUrl}
            alt={product.title}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.src =
                'https://placehold.co/300x300/e5e7eb/a1a1aa?text=No+Image';
            }}
          />
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3">
          <div className="px-2 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs flex items-center shadow-sm">
            {getStarRating(productRating)}
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4">
        <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-neutral-gray-900 mb-2">
          {product.title}
        </h3>

        <div className="mt-2 flex justify-between items-center">
          {/* <p className="text-lg font-medium text-neutral-gray-900">
            {isPriceAvailable
              ? `${product.currency} ${product.price}`
              : 'Price Not Available'}
          </p> */}

          {product.category && (
            <span className="text-xs font-medium text-neutral-gray-500 bg-neutral-gray-100 px-2 py-1 rounded-full">
              {product.category}
            </span>
          )}
        </div>

        <div className="flex gap-3 mt-4">
  <button
    className="flex-1 h-10 bg-[#FF6A00] text-white font-medium rounded-lg hover:bg-[#e55d00] transition-all active:scale-[0.98] text-sm"
    onClick={(e) => {
      e.stopPropagation();
      const query = encodeURIComponent(product.title);
      const alibabaUrl = `https://www.alibaba.com/trade/search?fsb=y&IndexArea=product_en&CatId=&SearchText=${query}`;
      window.open(alibabaUrl, '_blank');
    }}
  >
    Alibaba
  </button>

  <button
  className="flex-1 h-10 bg-[#FFAE00] text-black font-medium rounded-lg hover:bg-[#e69c00] transition-all active:scale-[0.98] text-sm"
  onClick={(e) => {
    e.stopPropagation();
    const query = encodeURIComponent(product.title);
    const testRedirect = `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(product.title)}`;
    window.open(testRedirect, '_blank');
    
    
    
  }}
>
  Ali Express
</button>


</div>




      </div>
    </div>
  );
};

export default ProductFinderCard;
