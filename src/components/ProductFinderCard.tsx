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
    rating?: number;
    category?: string;
    condition?: string;
  };
  onClick?: (productId: string) => void;
};

const getStarRating = (rating: number) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) =>
      i < rating ? <FaStar key={i} className="text-primary-yellow" /> : <FaRegStar key={i} className="text-gray-300" />
    )}
  </div>
);

export const ProductFinderCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const imageUrlSrc = product.imageUrl || 'https://placehold.co/300x300/e5e7eb/a1a1aa?text=No+Image';
  const productRating = product.rating || Math.floor(Math.random() * 5) + 1;

  return (
    <div
      className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.02] border border-neutral-gray-100"
      onClick={() => onClick?.(product.id)}
    >
      {/* Image Container with better ratio control */}
      <div className="aspect-[4/3] overflow-hidden relative">
        <div className="relative w-full h-full bg-neutral-gray-100">
          <Image
            src={imageUrlSrc}
            alt={product.title}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3">
          <div className="px-2 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs flex items-center shadow-sm">
            {getStarRating(productRating)}
          </div>
        </div>
      </div>

      {/* Product Details with refined spacing and typography */}
      <div className="p-4">
        <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-neutral-gray-900 mb-2">{product.title}</h3>
        
        <div className="mt-2 flex justify-between items-center">
          <p className="text-lg font-medium text-neutral-gray-900">
            {product.currency} {product.price}
          </p>
          
          {product.category && (
            <span className="text-xs font-medium text-neutral-gray-500 bg-neutral-gray-100 px-2 py-1 rounded-full">
              {product.category}
            </span>
          )}
        </div>

        {/* View Product Button - Apple-inspired styling */}
        <button
          className="w-full mt-4 py-2.5 bg-primary-yellow text-black font-medium rounded-lg hover:bg-primary-yellow/90 transition-all active:scale-[0.98] text-sm"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(product.id);
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ProductFinderCard;
