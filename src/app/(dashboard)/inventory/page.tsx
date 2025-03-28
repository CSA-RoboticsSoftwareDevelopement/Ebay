'use client';

import React, { useState } from 'react';
import ProductCard from '../../../components/productsTemplate/InventoryProductCard';
import ProductDetailModal, { Product, CompetitorData } from '../../../components/productsTemplate/InventoryProductDetailModal';
import { formatCurrency, formatPercentage } from '../../../lib/formatters';

// Placeholder product data
// This would eventually be replaced with real data from the API
const productsData: Product[] = [
  {
    id: '1',
    title: 'Vintage Camera with Original Leather Case and Manual - Excellent Condition',
    price: 49.99,
    currency: 'USD',
    quantity: 15,
    quantitySold: 11,
    sellThroughRate: 0.73,
    timeToSell: 2.5,
    costPrice: 20,
    shipping: 5,
    ebayFees: 5.99,
    profit: 19,
    profitMargin: 0.38,
    roi: 0.95,
    imageUrl: 'https://placehold.co/400x400/e2e8f0/1e293b?text=Camera',
    listingStatus: 'Active',
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2023-05-15'),
    competitorData: {
      id: '101',
      avgPrice: 55.99,
      avgShipping: 6.75,
      lowestPrice: 42.99,
      highestPrice: 79.99,
      avgSellerFeedback: 98.5,
      avgListingPosition: 4.3,
      avgImageCount: 5.2,
      competitorCount: 8,
      lastUpdated: new Date('2023-05-14')
    }
  },
  {
    id: '2',
    title: 'Mechanical Keyboard - Cherry MX Brown Switches - RGB Lighting',
    price: 99.99,
    currency: 'USD',
    quantity: 8,
    quantitySold: 6,
    sellThroughRate: 0.75,
    timeToSell: 1.8,
    costPrice: 65,
    shipping: 8.5,
    ebayFees: 10.99,
    profit: 15.5,
    profitMargin: 0.155,
    roi: 0.24,
    imageUrl: 'https://placehold.co/400x400/e2e8f0/1e293b?text=Keyboard',
    listingStatus: 'Active',
    createdAt: new Date('2023-05-10'),
    updatedAt: new Date('2023-05-12'),
    competitorData: {
      id: '102',
      avgPrice: 109.99,
      avgShipping: 9.99,
      lowestPrice: 89.99,
      highestPrice: 129.99,
      avgSellerFeedback: 97.8,
      avgListingPosition: 3.1,
      avgImageCount: 6.5,
      competitorCount: 12,
      lastUpdated: new Date('2023-05-14')
    },
    additionalImages: [
      'https://placehold.co/400x400/cccccc/666666?text=KB+Side',
      'https://placehold.co/400x400/cccccc/666666?text=KB+Top',
      'https://placehold.co/400x400/cccccc/666666?text=KB+Bottom'
    ]
  },
  {
    id: '3',
    title: 'Wireless Headphones - Noise Cancelling - 30 Hour Battery',
    price: 49.99,
    currency: 'USD',
    quantity: 12,
    quantitySold: 9,
    sellThroughRate: 0.75,
    timeToSell: 3.1,
    costPrice: 25,
    shipping: 4.5,
    ebayFees: 5.49,
    profit: 15,
    profitMargin: 0.3,
    roi: 0.6,
    imageUrl: 'https://placehold.co/400x400/e2e8f0/1e293b?text=Headphones',
    listingStatus: 'Active',
    createdAt: new Date('2023-05-08'),
    updatedAt: new Date('2023-05-08'),
    competitorData: {
      id: '103',
      avgPrice: 52.99,
      avgShipping: 5.25,
      lowestPrice: 39.99,
      highestPrice: 69.99,
      avgSellerFeedback: 96.2,
      avgListingPosition: 5.6,
      avgImageCount: 4.8,
      competitorCount: 15,
      lastUpdated: new Date('2023-05-14')
    }
  },
  {
    id: '4',
    title: 'Leather Wallet - Handcrafted Genuine Leather - RFID Blocking',
    price: 29.99,
    currency: 'USD',
    quantity: 22,
    quantitySold: 13,
    sellThroughRate: 0.59,
    timeToSell: 4.2,
    costPrice: 12.5,
    shipping: 2.75,
    ebayFees: 3.99,
    profit: 10.75,
    profitMargin: 0.36,
    roi: 0.86,
    imageUrl: 'https://placehold.co/400x400/e2e8f0/1e293b?text=Wallet',
    listingStatus: 'Active',
    createdAt: new Date('2023-05-05'),
    updatedAt: new Date('2023-05-05'),
    competitorData: {
      id: '104',
      avgPrice: 34.99,
      avgShipping: 3.50,
      lowestPrice: 24.99,
      highestPrice: 49.99,
      avgSellerFeedback: 97.1,
      avgListingPosition: 7.2,
      avgImageCount: 5.5,
      competitorCount: 22,
      lastUpdated: new Date('2023-05-14')
    }
  },
  {
    id: '5',
    title: 'Smartphone Case - Rugged Protection - Multiple Colors',
    price: 19.99,
    currency: 'USD',
    quantity: 45,
    quantitySold: 17,
    sellThroughRate: 0.38,
    timeToSell: 5.4,
    costPrice: 5.75,
    shipping: 1.99,
    ebayFees: 2.49,
    profit: 9.76,
    profitMargin: 0.49,
    roi: 1.7,
    imageUrl: 'https://placehold.co/400x400/e2e8f0/1e293b?text=Phone+Case',
    listingStatus: 'Active',
    createdAt: new Date('2023-05-01'),
    updatedAt: new Date('2023-05-02'),
    competitorData: {
      id: '105',
      avgPrice: 22.99,
      avgShipping: 2.25,
      lowestPrice: 14.99,
      highestPrice: 34.99,
      avgSellerFeedback: 95.8,
      avgListingPosition: 8.4,
      avgImageCount: 4.2,
      competitorCount: 28,
      lastUpdated: new Date('2023-05-14')
    },
    additionalImages: [
      'https://placehold.co/400x400/cccccc/666666?text=Red',
      'https://placehold.co/400x400/cccccc/666666?text=Blue',
      'https://placehold.co/400x400/cccccc/666666?text=Black'
    ]
  },
  {
    id: '6',
    title: 'Fitness Tracker - Heart Rate Monitor - Sleep Tracking',
    price: 39.99,
    currency: 'USD',
    quantity: 18,
    quantitySold: 10,
    sellThroughRate: 0.56,
    timeToSell: 3.8,
    costPrice: 18.5,
    shipping: 3.25,
    ebayFees: 4.49,
    profit: 13.75,
    profitMargin: 0.34,
    roi: 0.74,
    imageUrl: 'https://placehold.co/400x400/e2e8f0/1e293b?text=Fitness+Tracker',
    listingStatus: 'Draft',
    createdAt: new Date('2023-05-03'),
    updatedAt: new Date('2023-05-03'),
    competitorData: {
      id: '106',
      avgPrice: 42.99,
      avgShipping: 3.99,
      lowestPrice: 32.99,
      highestPrice: 59.99,
      avgSellerFeedback: 96.5,
      avgListingPosition: 6.3,
      avgImageCount: 5.8,
      competitorCount: 18,
      lastUpdated: new Date('2023-05-14')
    }
  }
];

export default function Products() {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // String with empty default
  
  // Find the selected product
  const selectedProduct = selectedProductId
    ? productsData.find(product => product.id === selectedProductId)
    : null;
  
  // Filter products based on search query and status filter
  const filteredProducts = productsData.filter(product => {
    // Check if the product title includes the search query
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check if the product status matches the status filter (if one is selected)
    const matchesStatus = statusFilter === '' || 
      (product.listingStatus && product.listingStatus.toLowerCase() === statusFilter.toLowerCase());
    
    return matchesSearch && matchesStatus;
  });
  
  // Handler for updating product data (like cost, shipping, fees)
  const handleUpdateProduct = (productId: string, updates: Partial<Product>) => {
    console.log('Updating product:', productId, updates);
    // In a real app, this would call an API to update the product
    // For now we'll just log it
    alert(`Product ${productId} updated (simulated)`);
  };
  
  // Get available statuses for filtering
  const availableStatuses = Array.from(
    new Set(productsData.map(p => p.listingStatus).filter(Boolean) as string[])
  );

  return (
    <div className="">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <button className="btn btn-primary">Add Product</button>
      </div>
      
      {/* Filters */}
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-yellow focus:border-primary-yellow sm:text-sm"
                placeholder="Search products"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full md:w-48">
            <label htmlFor="status" className="sr-only">Status</label>
            <select
              id="status"
              name="status"
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-yellow focus:border-primary-yellow sm:text-sm rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {availableStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Results summary */}
        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredProducts.length} of {productsData.length} products
        </div>
      </div>
      
      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={(id) => setSelectedProductId(id)}
          />
        ))}
      </div>
      
      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      )}
      
      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProductId(null)}
          onUpdateProduct={handleUpdateProduct}
        />
      )}
    </div>
  );
} 