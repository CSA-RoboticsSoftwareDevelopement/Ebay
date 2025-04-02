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
    imageUrl?: string;
    platform: string;
    rating?: number;
  };
  onClick?: (productId: string) => void;
};

const getStarRating = (rating: number) => (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) =>
        i < rating ? <FaStar key={i} className="text-yellow-500" /> : <FaRegStar key={i} className="text-gray-400" />
      )}
    </div>
  );

export const ProductFinderCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const imageUrlSrc = product.imageUrl || 'https://placehold.co/300x300/e5e7eb/a1a1aa?text=No+Image';
  const productRating = product.rating || Math.floor(Math.random() * 5) + 1; // Keep a fallback if rating isn't provided

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick?.(product.id)}
    >
      {/* Image Section */}
      <div className="h-48 overflow-hidden relative">
        <div className="relative w-full h-full">
          <Image
            src={imageUrlSrc}
            alt={product.title}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs flex items-center shadow">
          {getStarRating(productRating)}
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4">
        <h3 className="font-medium text-lg line-clamp-2 min-h-[56px]">{product.title}</h3>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-600">Platform</p>
            <p className="font-semibold">{product.platform}</p>
          </div>
          <div>
            <p className="text-gray-600">Price</p>
            <p className="font-semibold">{`${product.currency} ${product.price}`}</p>
          </div>
        </div>

        {/* View Source Button */}
        <button
          className="w-full mt-3 py-2 bg-primary-yellow text-black font-medium rounded hover:bg-primary-yellow/90 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(product.id);
          }}
        >
          View Source
        </button>
      </div>
    </div>
  );
};

export default ProductFinderCard;
