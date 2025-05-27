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
  viewMode?: 'grid' | 'list';
};

const getStarRating = (rating: number) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) =>
      i < rating ? (
        <FaStar key={i} className="text-primary-yellow" />
      ) : (
        <FaRegStar key={i} className="text-gray-500" />
      )
    )}
  </div>
);

export const ProductFinderCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
  viewMode = 'grid',
}) => {
  const imageName = product.imagecsv?.split(',')[0]?.trim();
  const imageUrl = imageName
    ? `https://images-na.ssl-images-amazon.com/images/I/${imageName}`
    : 'https://placehold.co/300x300/e5e7eb/a1a1aa?text=No+Image';

  const productRating =
    typeof product.rating === 'number'
      ? product.rating
      : Math.floor(Math.random() * 5) + 1;

  const handleAlibabaClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const query = encodeURIComponent(product.title);
    const alibabaUrl = `https://www.alibaba.com/trade/search?fsb=y&IndexArea=product_en&CatId=&SearchText=${query}`;
    window.open(alibabaUrl, '_blank');
  };

  const handleAliExpressClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const query = encodeURIComponent(product.title.trim().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-'));
    const aliExpressUrl = `https://www.aliexpress.com/w/wholesale-${query}.html`;
    window.open(aliExpressUrl, '_blank');
  };

  if (viewMode === 'list') {
    return (
      <div
        className="flex flex-col sm:flex-row bg-neutral-800 text-white rounded-xl overflow-hidden border border-neutral-700 shadow-sm hover:shadow-md transition-all cursor-pointer"
        onClick={() => onClick?.(product.id)}
      >
        {/* Image */}
        <div className="relative w-full sm:w-60 h-60 sm:h-auto sm:min-h-[200px] flex-shrink-0">
          <Image
            src={imageUrl}
            alt={product.title}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 250px, 250px"
          />
        </div>

        {/* Right Content */}
        <div className="flex flex-col p-4 flex-1">
          {/* Title & Category */}
          <div>
            <h3 className="font-semibold text-lg mb-1 line-clamp-2 text-white">
              {product.title}
            </h3>
            {product.category && (
              <span className="text-xs font-medium text-white bg-neutral-700 px-2 py-1 rounded-full">
                {product.category}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="mt-2">{getStarRating(productRating)}</div>

          {/* Buttons */}
          <div className="mt-auto flex gap-3 pt-4">
            <button
              className="flex-1 h-10 bg-[#FF6A00] text-white font-medium rounded-lg hover:bg-[#e55d00] transition-all text-sm"
              onClick={handleAlibabaClick}
            >
              Alibaba
            </button>
            <button
              className="flex-1 h-10 bg-[#FFAE00] text-white font-medium rounded-lg hover:bg-[#e69c00] transition-all text-sm"
              onClick={handleAliExpressClick}
            >
              AliExpress
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid Layout
  return (
    <div
      className="bg-neutral-800 text-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.02] border border-neutral-700 cursor-pointer"
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
          />
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3">
          <div className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs flex items-center shadow-sm">
            {getStarRating(productRating)}
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4">
        <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-white mb-2">
          {product.title}
        </h3>

        <div className="mt-2 flex justify-between items-center">
          {product.category && (
            <span className="text-xs font-medium text-white bg-neutral-700 px-2 py-1 rounded-full">
              {product.category}
            </span>
          )}
        </div>

        <div className="flex gap-3 mt-4">
          <button
            className="flex-1 h-10 bg-[#FF6A00] text-white font-medium rounded-lg hover:bg-[#e55d00] transition-all active:scale-[0.98] text-sm"
            onClick={handleAlibabaClick}
          >
            Alibaba
          </button>

          <button
            className="flex-1 h-10 bg-[#FFAE00] text-white font-medium rounded-lg hover:bg-[#e69c00] transition-all active:scale-[0.98] text-sm"
            onClick={handleAliExpressClick}
          >
            AliExpress
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFinderCard;
