'use client';
import Link from 'next/link'; // Ensure you're using Next.js
import React, { useState } from 'react';
import { Order, orderStatusColors } from '@/types/OrderTypes';
import Image from 'next/image';
import { OrderDetailModal } from '@/components/OrderDetailModal';

// Mock data for orders
const mockOrders: Order[] = [
  {
    id: 'ord-001',
    orderNumber: 'EB-23856',
    productId: 'prod001',
    productName: 'Vintage Polaroid Camera',
    productImage: 'https://placehold.co/400x300?text=Vintage+Camera',
    quantity: 1,
    price: 129.99,
    totalPrice: 142.98,
    status: 'delivered',
    customer: {
      name: 'John Smith',
      email: 'john.smith@example.com',
      address: '123 Main St, Anytown, CA 94583',
    },
    platform: 'eBay',
    paymentMethod: 'PayPal',
    shippingMethod: 'USPS Priority',
    trackingNumber: '9400123456789012345678',
    createdAt: '2023-07-18T10:23:45Z',
    updatedAt: '2023-07-20T14:35:12Z',
    costPrice: 65.00,
    ebayFees: 15.60,
    shipping: 12.99,
  },
  {
    id: 'ord-002',
    orderNumber: 'EB-23857',
    productId: 'prod002',
    productName: 'Mechanical Keyboard - Cherry MX Blue',
    productImage: 'https://placehold.co/400x300?text=Mechanical+Keyboard',
    quantity: 1,
    price: 89.99,
    totalPrice: 98.98,
    status: 'shipped',
    customer: {
      name: 'Emily Johnson',
      email: 'emily.j@example.com',
      address: '456 Oak Ave, Springfield, IL 62701',
    },
    platform: 'eBay',
    paymentMethod: 'Credit Card',
    shippingMethod: 'UPS Ground',
    trackingNumber: '1Z999AA10123456789',
    createdAt: '2023-07-19T15:12:33Z',
    updatedAt: '2023-07-19T18:45:22Z',
    costPrice: 42.50,
    ebayFees: 10.80,
    shipping: 8.99,
  },
  {
    id: 'ord-003',
    orderNumber: 'EB-23858',
    productId: 'prod003',
    productName: 'Vintage Leather Messenger Bag',
    productImage: 'https://placehold.co/400x300?text=Leather+Bag',
    quantity: 1,
    price: 149.99,
    totalPrice: 164.98,
    status: 'shipped',
    customer: {
      name: 'Michael Davis',
      email: 'mike.davis@example.com',
      address: '789 Elm St, Boston, MA 02115',
    },
    platform: 'eBay',
    paymentMethod: 'PayPal',
    shippingMethod: 'FedEx Home Delivery',
    createdAt: '2023-07-20T09:34:21Z',
    updatedAt: '2023-07-20T11:23:45Z',
  },
  {
    id: 'ord-004',
    orderNumber: 'EB-23859',
    productId: 'prod004',
    productName: 'Wireless Bluetooth Earbuds',
    productImage: 'https://placehold.co/400x300?text=Wireless+Earbuds',
    quantity: 2,
    price: 59.99,
    totalPrice: 127.97,
    status: 'pending',
    customer: {
      name: 'Sarah Wilson',
      email: 'sarah.w@example.com',
      address: '321 Pine St, Seattle, WA 98101',
    },
    platform: 'eBay',
    paymentMethod: 'Credit Card',
    shippingMethod: 'USPS First Class',
    createdAt: '2023-07-21T16:45:33Z',
    updatedAt: '2023-07-21T16:45:33Z',
  },
  {
    id: 'ord-005',
    orderNumber: 'EB-23860',
    productId: 'prod005',
    productName: 'Vintage Record Player',
    productImage: 'https://placehold.co/400x300?text=Record+Player',
    quantity: 1,
    price: 199.99,
    totalPrice: 224.98,
    status: 'cancelled',
    customer: {
      name: 'David Brown',
      email: 'david.b@example.com',
      address: '555 Maple Dr, Austin, TX 78701',
    },
    platform: 'eBay',
    paymentMethod: 'PayPal',
    shippingMethod: 'FedEx 2Day',
    notes: 'Customer cancelled due to finding a local alternative',
    createdAt: '2023-07-15T11:22:33Z',
    updatedAt: '2023-07-16T09:12:45Z',
  },
  {
    id: 'ord-006',
    orderNumber: 'EB-23861',
    productId: 'prod006',
    productName: 'Smart Home Hub',
    productImage: 'https://placehold.co/400x300?text=Smart+Home+Hub',
    quantity: 1,
    price: 79.99,
    totalPrice: 87.98,
    status: 'returned',
    customer: {
      name: 'Jessica Martinez',
      email: 'jessica.m@example.com',
      address: '222 Cherry Ln, Portland, OR 97201',
    },
    platform: 'eBay',
    paymentMethod: 'Credit Card',
    shippingMethod: 'USPS Priority',
    trackingNumber: '9400123456789023456789',
    notes: 'Customer returned due to compatibility issues',
    createdAt: '2023-07-10T14:23:44Z',
    updatedAt: '2023-07-18T15:34:21Z',
  },
  {
    id: 'ord-007',
    orderNumber: 'EB-23862',
    productId: 'prod001',
    productName: 'Vintage Polaroid Camera',
    productImage: 'https://placehold.co/400x300?text=Vintage+Camera',
    quantity: 1,
    price: 129.99,
    totalPrice: 142.98,
    status: 'delivered',
    customer: {
      name: 'Robert Lee',
      email: 'robert.l@example.com',
      address: '777 Ocean Ave, San Diego, CA 92101',
    },
    platform: 'eBay',
    paymentMethod: 'PayPal',
    shippingMethod: 'UPS Ground',
    trackingNumber: '1Z999AA10123456790',
    createdAt: '2023-07-16T10:11:22Z',
    updatedAt: '2023-07-19T13:14:15Z',
  },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [trackingNumbers, setTrackingNumbers] = useState<Record<string, string>>({});
  const [shippingModal, setShippingModal] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  // Sort orders by creation date (newest first)
  const sortedOrders = [...orders].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  // Filter orders based on search query and status filter
  const filteredOrders = sortedOrders.filter(order => {
    // Search filter logic
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter logic
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Find the selected order for the modal
  const selectedOrder = selectedOrderId 
    ? orders.find(order => order.id === selectedOrderId) 
    : null;

  const getStatusBadge = (status: Order['status']) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${orderStatusColors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleTrackingNumberChange = (orderId: string, value: string) => {
    setTrackingNumbers(prev => ({
      ...prev,
      [orderId]: value
    }));
  };

  const toggleShippingModal = (orderId: string | null) => {
    setShippingModal(orderId);
  };

  const markAsShipped = (orderId: string, withTracking: boolean = true) => {
    setOrders(prevOrders => 
      prevOrders.map(order => {
        if (order.id === orderId) {
          const trackingNumber = withTracking ? trackingNumbers[orderId] : undefined;
          return {
            ...order,
            status: 'shipped',
            trackingNumber: trackingNumber,
            updatedAt: new Date().toISOString()
          };
        }
        return order;
      })
    );

    // Clear tracking number input and close modal after shipping
    setTrackingNumbers(prev => {
      const newTrackingNumbers = { ...prev };
      delete newTrackingNumbers[orderId];
      return newTrackingNumbers;
    });
    setShippingModal(null);
  };

  const formatDateString = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
            {/* ✅ Breadcrumb Navigation */}
         
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Orders</h1>
      </div>
      
      {/* Filters */}
      <div className="bg-neutral-800 rounded-lg shadow-md p-4">
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-black text-gray-200 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-yellow focus:border-primary-yellow sm:text-sm"
              placeholder="Search by order #, product, or customer"
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
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-700 bg-black text-gray-200 focus:outline-none focus:ring-primary-yellow focus:border-primary-yellow sm:text-sm rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
            </div>
        </div>
      </div>
      
      {/* Results summary */}
      <div className="text-sm text-gray-500">
        Showing {filteredOrders.length} of {orders.length} orders
      </div>
      
      {/* Orders Table */}
      <div className="bg-black rounded-lg shadow-md overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Order</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Product</th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-200 uppercase tracking-wider">Total</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-200 uppercase tracking-wider">Shipping</th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-200 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-black divide-y divide-gray-700">
          {filteredOrders.map((order) => (
            <tr 
          key={order.id} 
          className="hover:bg-black hover:border-l-4 hover:border-primary-yellow transition-all duration-200"
            >
          <td className="px-4 py-3">
            <div className="text-sm font-medium text-gray-200">{order.orderNumber}</div>
            <div className="text-xs text-gray-400">{order.platform} • {formatDateString(order.createdAt)}</div>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center">
              <div className="h-10 w-10 flex-shrink-0 relative bg-gray-100 rounded-md">
            <Image
              src={order.productImage}
              alt={order.productName}
              fill
              className="object-cover rounded-md"
            />
              </div>
              <div className="ml-3">
            <div className="text-sm font-medium text-gray-200 truncate max-w-[180px]">{order.productName}</div>
            <div className="text-xs text-gray-400">Qty: {order.quantity}</div>
              </div>
            </div>
          </td>
          <td className="px-4 py-3 text-sm text-gray-200 text-right font-medium">
            ${order.totalPrice.toFixed(2)}
          </td>
          <td className="px-4 py-3">
            {getStatusBadge(order.status)}
          </td>
          <td className="px-4 py-3 text-center">
            {/* Show Ship button only for pending/processing orders */}
            {(order.status === 'pending' || order.status === 'processing') && (
              <>
            {shippingModal === order.id ? (
              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Tracking #"
                className="block w-28 px-2 py-1 text-sm border border-gray-300 rounded"
                value={trackingNumbers[order.id] || ''}
                onChange={(e) => handleTrackingNumberChange(order.id, e.target.value)}
              />
              <button
                onClick={() => markAsShipped(order.id, true)}
                disabled={!trackingNumbers[order.id]}
                className={`px-2 py-1 text-xs rounded ${trackingNumbers[order.id] ? 'bg-primary-yellow text-black hover:bg-yellow-500' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
              >
                Ship
              </button>
                </div>
                <div className="flex justify-between text-xs">
              <button
                onClick={() => markAsShipped(order.id, false)}
                className="text-gray-500 hover:text-primary-yellow"
              >
                Ship without tracking
              </button>
              <button 
                onClick={() => toggleShippingModal(null)}
                className="text-gray-500 hover:text-primary-yellow"
              >
                Cancel
              </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => toggleShippingModal(order.id)}
                className="px-3 py-1 rounded bg-primary-yellow text-black text-xs hover:bg-yellow-500"
              >
                Ship
              </button>
            )}
              </>
            )}
            
            {/* Show tracking information for shipped/delivered orders */}
            {(order.status === 'shipped' || order.status === 'delivered') && (
              <div className="flex flex-col items-center">
            {order.trackingNumber ? (
              <>
                <div className="text-xs font-medium text-gray-200">{order.trackingNumber}</div>
                <div className="w-full flex items-center justify-between text-xs mt-2">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-[10px] mt-1 text-gray-200">Shipped</span>
              </div>
              <div className="h-[2px] flex-1 bg-gray-300 mx-1"></div>
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-[10px] mt-1 text-gray-200">In Transit</span>
              </div>
              <div className="h-[2px] flex-1 bg-gray-300 mx-1"></div>
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'} rounded-full`}></div>
                <span className="text-[10px] mt-1 text-gray-200">Delivered</span>
              </div>
                </div>
              </>
            ) : (
              <span className="text-xs text-gray-400">Shipped without tracking</span>
            )}
              </div>
            )}
            
            {/* For returned orders */}
            {order.status === 'returned' && order.trackingNumber && (
              <div className="flex flex-col items-center">
            <div className="text-xs font-medium text-gray-200">{order.trackingNumber}</div>
            <span className="text-xs text-red-500 mt-1">Returned to sender</span>
              </div>
            )}
            
            {/* For cancelled orders */}
            {order.status === 'cancelled' && (
              <span className="text-xs text-gray-400">Order cancelled</span>
            )}
          </td>
          <td className="px-4 py-3 text-right text-sm font-medium">
            <button 
              className="text-primary-yellow hover:text-yellow-600"
              onClick={() => setSelectedOrderId(order.id)}
            >
              View
            </button>
          </td>
            </tr>
          ))}
        </tbody>
          </table>
        </div>
        
        {/* Empty state */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-10">
        <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-200">No orders found</h3>
        <p className="mt-1 text-sm text-gray-400">
  Try adjusting your search or filter to find what&apos;s looking for.
</p>

          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrderId(null)} 
        />
      )}
    </div>
  );
} 