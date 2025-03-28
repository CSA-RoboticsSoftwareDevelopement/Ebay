'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FaStar, FaRegStar } from 'react-icons/fa';

export type ProductCardProps = {
  product: {
    id: string;
    title: string;
    price: string;
    currency: string;
    imageUrl: string;
    platform: string;
  };
  onClick: (productId: string) => void;
};

const getStarRating = (rating: number) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) =>
      i < rating ? <FaStar key={i} className="text-yellow-500" /> : <FaRegStar key={i} className="text-gray-400" />
    )}
  </div>
);

const platforms = ['Amazon', 'eBay', 'Catch', 'Kogan'];
const productsData: ProductCardProps['product'][] = Array.from({ length: 20 }, (_, i) => ({
  id: `prod-${i + 1}`,
  title: `Product ${i + 1}`,
  price: (Math.random() * 100 + 10).toFixed(2),
  currency: 'USD',
  imageUrl: `https://placehold.co/300x300/e5e7eb/a1a1aa?text=P${i + 1}`,
  platform: platforms[i % platforms.length], // Assigning platforms dynamically
}));

export const ProductFinderCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const imageUrlSrc = product.imageUrl || `https://placehold.co/300x300/e5e7eb/a1a1aa?text=${encodeURIComponent(product.title.substring(0, 1))}`;
  const randomRating = Math.floor(Math.random() * 5) + 1;

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick(product.id)}
    >
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
          {getStarRating(randomRating)}
        </div>
      </div>
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
        <button
          className="w-full mt-3 py-2 bg-primary-yellow text-black font-medium rounded hover:bg-primary-yellow/90 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onClick(product.id);
          }}
        >
          View Source
        </button>
      </div>
    </div>
  );
};

const ProductList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const itemsPerPage = 10;

  const filteredProducts = productsData.filter((product) => {
    return (
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (platformFilter === '' || product.platform === platformFilter)
    );
  });

  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (

    <div className="">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Product Finder</h1>
      </div>

      <div>
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow p-4 mb-12 mt-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-yellow focus:border-primary-yellow sm:text-sm"
                  placeholder="Search products"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <label htmlFor="platform" className="sr-only">Platform</label>
              <select
                id="platform"
                name="platform"
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-yellow focus:border-primary-yellow sm:text-sm rounded-md"
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
              >
                <option value="">All Platforms</option>
                {platforms.map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 text-sm text-gray-500">
            Showing {totalProducts} of {productsData.length} products
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedProducts.map((product) => (
            <ProductFinderCard key={product.id} product={product} onClick={() => { }} />
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <button
              className="px-4 py-2 bg-gray-200 rounded mr-2 disabled:opacity-50"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="px-4 py-2">Page {currentPage} of {totalPages}</span>
            <button
              className="px-4 py-2 bg-gray-200 rounded ml-2 disabled:opacity-50"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
