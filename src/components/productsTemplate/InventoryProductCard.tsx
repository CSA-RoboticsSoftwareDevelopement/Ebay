import React from 'react';
import Image from 'next/image';
import { formatCurrency } from '../../lib/formatters';
import { Product } from './InventoryProductDetailModal';

// Define the ProductCard props type
export type ProductCardProps = {
  product: Pick<Product, 'id' | 'title' | 'price' | 'currency' | 'quantity' | 'quantitySold' | 'sellThroughRate' | 'profit' | 'profitMargin' | 'roi' | 'imageUrl' | 'listingStatus'>;
  onClick: (productId: string) => void;
};

/**
 * A card component for displaying product information in the products grid
 */
export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  // Status color mapping
  const getStatusColor = (status?: string | null) => {
    if (!status) return 'bg-gray-500'; // Default gray for unknown status
    
    const statusMap: Record<string, string> = {
      'active': 'bg-green-500',
      'ended': 'bg-red-500',
      'draft': 'bg-yellow-500',
      'scheduled': 'bg-blue-500'
    };
    
    return statusMap[status.toLowerCase()] || 'bg-gray-500';
  };

  // Generate a placeholder image URL if none exists
  const imageUrlSrc = product.imageUrl || 
    `https://placehold.co/300x300/e5e7eb/a1a1aa?text=${encodeURIComponent(product.title.substring(0, 1))}`;

  // Calculate sell-through percentage for display
  const sellThroughDisplay = product.sellThroughRate 
    ? `${Math.round(product.sellThroughRate * 100)}%` 
    : 'N/A';

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick(product.id)}
    >
      <div className="h-48 overflow-hidden relative">
        {/* Image with placeholder fallback */}
        <div className="relative w-full h-full">
          <Image 
            src={imageUrlSrc}
            alt={product.title}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        
        {/* Status badge */}
        {product.listingStatus && (
          <div className={`absolute top-2 right-2 ${getStatusColor(product.listingStatus)} text-white px-2 py-1 rounded-full text-xs`}>
            {product.listingStatus}
          </div>
        )}
      </div>
      
      <div className="p-4">
        {/* Title with truncation */}
        <h3 className="font-medium text-lg line-clamp-2 min-h-[56px]">{product.title}</h3>
        
        {/* Key metrics grid */}
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-600">Price</p>
            <p className="font-semibold">{formatCurrency(product.price, product.currency)}</p>
          </div>
          <div>
            <p className="text-gray-600">Profit</p>
            <p className="font-semibold">
              {product.profit ? formatCurrency(product.profit, product.currency) : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Margin</p>
            <p className="font-semibold">
              {product.profitMargin ? `${Math.round(product.profitMargin * 100)}%` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Sell Through</p>
            <p className="font-semibold">{sellThroughDisplay}</p>
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