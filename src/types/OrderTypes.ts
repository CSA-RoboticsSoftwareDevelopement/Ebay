export interface Order {
  id: string;
  orderNumber: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  customer: {
    name: string;
    email: string;
    address?: string;
  };
  platform: 'eBay' | 'Amazon' | 'Etsy' | 'Other';
  paymentMethod: string;
  shippingMethod: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  costPrice?: number;
  ebayFees?: number;
  shipping?: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export const orderStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-600',
  cancelled: 'bg-red-100 text-red-800',
  returned: 'bg-gray-100 text-gray-800',
}; 

// types.ts
export interface Plugin {
  plugin_id: string;
  installedts: number;
  name: string;
  version: string;
  // Add other necessary properties
}
