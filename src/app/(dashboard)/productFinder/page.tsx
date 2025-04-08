'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiGrid, FiList, FiFilter, FiX, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { ProductFinderCard } from '@/components/ProductFinderCard';
import ProductFinderDetailModal, { RecommendedProduct } from '@/components/ProductFinderDetailModal';

// Categories for product filtering
const categories = [
  'All Categories',
  'Electronics',
  'Home & Garden',
  'Fashion',
  'Collectibles',
  'Sports',
  'Beauty',
  'Toys & Games',
  'Automotive'
];

// Mock data with enhanced fields for the product finder
const generateMockProducts = (): RecommendedProduct[] => {
  const categoryItems = categories.filter(c => c !== 'All Categories');
  
  return Array.from({ length: 24 }, (_, i) => ({
    id: `prod-${i + 1}`,
    title: [
      'Premium Wireless Earbuds with Noise Cancellation',
      'Vintage Leather Journal with Handcrafted Paper',
      'Smart Home Security Camera - 4K Ultra HD',
      'Ergonomic Office Chair with Lumbar Support',
      'Limited Edition Art Print - Hand Signed',
      'Portable Bluetooth Speaker - Waterproof',
      'Luxury Scented Candle Set - Natural Soy Wax',
      'Professional Chef Knife Set with Block',
      'Organic Skincare Gift Set - Vegan Formula',
      'Handmade Ceramic Coffee Mug Set of 4',
      'Ultra-Thin Wireless Charging Pad for Phones',
      'Fitness Tracker with Heart Rate Monitor'
    ][i % 12],
    description: "This product shows strong sales performance with high profit margins. Current market analysis indicates limited competition with steady demand.",
    price: (Math.random() * 150 + 20).toFixed(2),
    currency: 'USD',
    imageUrl: `https://placehold.co/600x600/f5f5f5/a3a3a3?text=Product+${i + 1}`,
    platform: '',
    category: categoryItems[Math.floor(Math.random() * categoryItems.length)],
    condition: Math.random() > 0.2 ? 'New' : 'Used - Like New',
    rating: Number((Math.random() * 2 + 3).toFixed(1)),
    opportunityScore: Math.floor(Math.random() * 10) + 1,
    competitorCount: Math.floor(Math.random() * 20) + 1,
    averagePrice: (Math.random() * 200 + 30).toFixed(2),
    averageMargin: (Math.random() * 30 + 15).toFixed(0) + '%',
    estimatedMonthlyVolume: Math.floor(Math.random() * 500) + 20,
    salesRank: Math.floor(Math.random() * 10000) + 1
  }));
};

const ProductFinder: React.FC = () => {
  const [productsData, setProductsData] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [opportunityFilter, setOpportunityFilter] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'opportunityScore' | 'price' | 'rating'>('opportunityScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Load mock data
  useEffect(() => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setProductsData(generateMockProducts());
      setLoading(false);
    }, 800);
  }, []);

  // Find selected product
  const selectedProduct = selectedProductId
    ? productsData.find(product => product.id === selectedProductId)
    : null;

  // Filter and sort products
  const filteredProducts = productsData.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || product.category === categoryFilter;
    const matchesOpportunity = opportunityFilter === null || 
      (typeof product.opportunityScore === 'number' && product.opportunityScore >= opportunityFilter);
    
    return matchesSearch && matchesCategory && matchesOpportunity;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue, bValue;
    
    if (sortBy === 'price') {
      aValue = parseFloat(a.price);
      bValue = parseFloat(b.price);
    } else if (sortBy === 'rating') {
      aValue = parseFloat(a.rating?.toString() || '0');
      bValue = parseFloat(b.rating?.toString() || '0');
    } else { // opportunityScore
      aValue = a.opportunityScore || 0;
      bValue = b.opportunityScore || 0;
    }
    
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  // Handler for toggling sort
  const handleSortChange = (sortField: 'opportunityScore' | 'price' | 'rating') => {
    if (sortBy === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(sortField);
      setSortDirection('desc');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header Section with Actions */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-neutral-gray-900">Product Finder</h1>
          
          <div className="flex items-center gap-2">
            <button
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary-yellow text-black' : 'bg-neutral-gray-100 text-neutral-gray-600 hover:bg-neutral-gray-200'}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid View"
            >
              <FiGrid />
            </button>
            <button
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary-yellow text-black' : 'bg-neutral-gray-100 text-neutral-gray-600 hover:bg-neutral-gray-200'}`}
              onClick={() => setViewMode('list')}
              aria-label="List View"
            >
              <FiList />
            </button>
            <button
              className="p-2 bg-neutral-gray-100 text-neutral-gray-600 rounded-lg hover:bg-neutral-gray-200 transition-colors sm:hidden"
              onClick={() => setIsFilterPanelOpen(true)}
              aria-label="Open Filters"
            >
              <FiFilter />
            </button>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="mb-6 overflow-x-auto pb-2 hide-scrollbar">
          <div className="flex gap-2 min-w-max">
            {categories.map(category => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  categoryFilter === category 
                    ? 'bg-primary-yellow text-black' 
                    : 'bg-neutral-gray-100 text-neutral-gray-700 hover:bg-neutral-gray-200'
                }`}
                onClick={() => setCategoryFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content and Filters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Panel - Desktop */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-neutral-gray-100 sticky top-4">
            <h2 className="font-semibold text-lg mb-4 text-neutral-gray-900">Filters</h2>
            
            {/* Search */}
            <div className="mb-5">
              <label htmlFor="search" className="block text-sm font-medium text-neutral-gray-700 mb-1">
                Search Products
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  className="block w-full rounded-lg border-neutral-gray-200 focus:ring-primary-yellow focus:border-primary-yellow px-3 py-2 text-sm"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Opportunity Score Filter */}
            <div className="mb-5">
              <label htmlFor="opportunity" className="block text-sm font-medium text-neutral-gray-700 mb-1">
                Minimum Opportunity Score
              </label>
              <select
                id="opportunity"
                className="block w-full rounded-lg border-neutral-gray-200 focus:ring-primary-yellow focus:border-primary-yellow px-3 py-2 text-sm"
                value={opportunityFilter === null ? '' : opportunityFilter}
                onChange={(e) => setOpportunityFilter(e.target.value === '' ? null : Number(e.target.value))}
              >
                <option value="">Any Score</option>
                {[8, 7, 6, 5, 4].map(score => (
                  <option key={score} value={score}>{score}+ Score</option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                Sort By
              </label>
              <div className="space-y-2">
                <button 
                  className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg ${
                    sortBy === 'opportunityScore' ? 'bg-neutral-gray-100' : 'hover:bg-neutral-gray-50'
                  }`}
                  onClick={() => handleSortChange('opportunityScore')}
                >
                  <span>Opportunity Score</span>
                  {sortBy === 'opportunityScore' && (
                    sortDirection === 'desc' ? <FiArrowDown /> : <FiArrowUp />
                  )}
                </button>
                <button 
                  className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg ${
                    sortBy === 'price' ? 'bg-neutral-gray-100' : 'hover:bg-neutral-gray-50'
                  }`}
                  onClick={() => handleSortChange('price')}
                >
                  <span>Price</span>
                  {sortBy === 'price' && (
                    sortDirection === 'desc' ? <FiArrowDown /> : <FiArrowUp />
                  )}
                </button>
                <button 
                  className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg ${
                    sortBy === 'rating' ? 'bg-neutral-gray-100' : 'hover:bg-neutral-gray-50'
                  }`}
                  onClick={() => handleSortChange('rating')}
                >
                  <span>Rating</span>
                  {sortBy === 'rating' && (
                    sortDirection === 'desc' ? <FiArrowDown /> : <FiArrowUp />
                  )}
                </button>
              </div>
            </div>

            {/* Clear Filters Button */}
            <button
              className="w-full py-2 text-sm text-neutral-gray-600 hover:text-neutral-gray-900 transition-colors"
              onClick={() => {
                setCategoryFilter('All Categories');
                setOpportunityFilter(null);
                setSearchQuery('');
              }}
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Mobile Filter Panel */}
        {isFilterPanelOpen && (
          <div className="fixed inset-0 z-50 bg-white p-5 overflow-y-auto lg:hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">Filters</h2>
              <button
                className="p-2 hover:bg-neutral-gray-100 rounded-full transition-colors"
                onClick={() => setIsFilterPanelOpen(false)}
              >
                <FiX />
              </button>
            </div>

            {/* Mobile Filter Content - same as desktop but styled for mobile */}
            <div className="space-y-5">
              {/* Search */}
              <div>
                <label htmlFor="mobile-search" className="block text-sm font-medium text-neutral-gray-700 mb-1">
                  Search Products
                </label>
                <input
                  type="text"
                  id="mobile-search"
                  className="block w-full rounded-lg border-neutral-gray-200 focus:ring-primary-yellow focus:border-primary-yellow px-3 py-2"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      className={`px-3 py-1 rounded-full text-sm ${
                        categoryFilter === category 
                          ? 'bg-primary-yellow text-black' 
                          : 'bg-neutral-gray-100 text-neutral-gray-700'
                      }`}
                      onClick={() => setCategoryFilter(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opportunity Score Filter */}
              <div>
                <label htmlFor="mobile-opportunity" className="block text-sm font-medium text-neutral-gray-700 mb-1">
                  Minimum Opportunity Score
                </label>
                <select
                  id="mobile-opportunity"
                  className="block w-full rounded-lg border-neutral-gray-200 focus:ring-primary-yellow focus:border-primary-yellow px-3 py-2"
                  value={opportunityFilter === null ? '' : opportunityFilter}
                  onChange={(e) => setOpportunityFilter(e.target.value === '' ? null : Number(e.target.value))}
                >
                  <option value="">Any Score</option>
                  {[8, 7, 6, 5, 4].map(score => (
                    <option key={score} value={score}>{score}+ Score</option>
                  ))}
                </select>
              </div>

              {/* Mobile Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 py-3 bg-neutral-gray-100 text-neutral-gray-700 font-medium rounded-lg"
                  onClick={() => {
                    setCategoryFilter('All Categories');
                    setOpportunityFilter(null);
                    setSearchQuery('');
                  }}
                >
                  Clear All
                </button>
                <button
                  className="flex-1 py-3 bg-primary-yellow text-black font-medium rounded-lg"
                  onClick={() => setIsFilterPanelOpen(false)}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Section */}
        <div className="lg:col-span-3">
          {/* Results Summary */}
          <div className="mb-5 flex justify-between items-center">
            <p className="text-sm text-neutral-gray-500">
              Showing {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2 lg:hidden">
              <label htmlFor="mobile-sort" className="text-sm text-neutral-gray-500">Sort:</label>
              <select
                id="mobile-sort"
                className="text-sm border-0 focus:ring-0 p-0 bg-transparent"
                value={`${sortBy}-${sortDirection}`}
                onChange={(e) => {
                  const [newSortBy, newSortDirection] = e.target.value.split('-') as [
                    'opportunityScore' | 'price' | 'rating',
                    'asc' | 'desc'
                  ];
                  setSortBy(newSortBy);
                  setSortDirection(newSortDirection);
                }}
              >
                <option value="opportunityScore-desc">Best Opportunity</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="rating-desc">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-neutral-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-neutral-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-neutral-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-neutral-gray-200 rounded mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sortedProducts.map((product) => (
                    <ProductFinderCard
                      key={product.id}
                      product={{
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        currency: product.currency,
                        imageUrl: product.imageUrl,
                        rating: typeof product.rating === 'string' ? parseFloat(product.rating) : product.rating,
                        category: product.category,
                        condition: product.condition
                      }}
                      onClick={(id) => setSelectedProductId(id)}
                    />
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-4">
                  {sortedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-gray-100 transition-all hover:shadow-md flex flex-col sm:flex-row cursor-pointer"
                      onClick={() => setSelectedProductId(product.id)}
                    >
                      <div className="sm:w-1/4 relative">
                        <div className="w-full aspect-video sm:h-full relative">
                          <Image
                            src={product.imageUrl || `https://placehold.co/300x300?text=${encodeURIComponent(product.title)}`}
                            alt={product.title}
                            className="object-cover"
                            fill
                            sizes="(max-width: 640px) 100vw, 25vw"
                          />
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {product.category && (
                              <span className="inline-block px-2 py-0.5 bg-neutral-gray-100 text-neutral-gray-800 text-xs rounded-full">
                                {product.category}
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-lg mb-1">{product.title}</h3>
                          <p className="text-neutral-gray-500 text-sm line-clamp-2 mb-2">{product.description}</p>
                        </div>
                        <div className="mt-auto flex flex-wrap justify-between items-center">
                          <div>
                            <p className="text-lg font-medium">
                              {product.currency} {product.price}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            {typeof product.opportunityScore === 'number' && (
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                product.opportunityScore >= 8 
                                  ? 'bg-success/10 text-success' 
                                  : product.opportunityScore >= 6 
                                  ? 'bg-primary-yellow/10 text-primary-yellow' 
                                  : 'bg-neutral-gray-100 text-neutral-gray-500'
                              }`}>
                                {product.opportunityScore}/10 Opportunity
                              </div>
                            )}
                            <button
                              className="px-4 py-2 bg-primary-yellow text-black text-sm font-medium rounded-lg hover:bg-primary-yellow/90 transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProductId(product.id);
                              }}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {sortedProducts.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-gray-100 mb-4">
                    <FiFilter className="w-8 h-8 text-neutral-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-neutral-gray-900 mb-1">No products found</h3>
                  <p className="text-neutral-gray-500 mb-4">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                  <button
                    className="text-primary-yellow hover:underline font-medium"
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('All Categories');
                      setOpportunityFilter(null);
                    }}
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductFinderDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProductId(null)}
          onSource={(id) => {
            // Handle sourcing logic here
            console.log(`Sourcing product ${id}`);
            setSelectedProductId(null);
          }}
        />
      )}
    </div>
  );
};

export default ProductFinder;
