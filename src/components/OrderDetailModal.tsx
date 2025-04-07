import React, { useState } from 'react';
import Image from 'next/image';
import { Order, orderStatusColors } from '@/types/OrderTypes';

type OrderDetailModalProps = {
  order: Order;
  onClose: () => void;
};

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'shipping' | 'notes'>('overview');

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Prevent modal click from bubbling to background
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Get status badge
  const getStatusBadge = (status: Order['status']) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${orderStatusColors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Calculate estimated profits
  const calculateProfit = () => {
    // Estimate cost price as 50% of selling price if not available
    const costPrice = order.costPrice || order.price * 0.5;
    
    // Estimate platform fees (eBay typically charges ~10-12%)
    const platformFee = order.ebayFees || order.price * 0.12;
    
    // Shipping cost (use order.shipping or estimate as 10% of price)
    const shippingCost = order.shipping || order.price * 0.1;
    
    // Calculate total costs
    const totalCosts = costPrice + platformFee + shippingCost;
    
    // Calculate profit
    const profit = order.totalPrice - totalCosts;
    
    // Calculate profit margin percentage
    const profitMargin = (profit / order.totalPrice) * 100;
    
    // Calculate ROI
    const roi = (profit / costPrice) * 100;
    
    return {
      costPrice,
      platformFee,
      shippingCost,
      totalCosts,
      profit,
      profitMargin,
      roi
    };
  };

  const profitDetails = calculateProfit();

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={handleModalClick}
      >
        <div className="flex flex-col h-full">
          {/* Modal Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{order.orderNumber}</h2>
              <div className="text-sm text-gray-500">{order.platform} • {formatDate(order.createdAt)}</div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(order.status)}
              <button
                className="text-gray-500 hover:text-gray-700 text-xl"
                onClick={onClose}
              >
                ×
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Left Side - Image and Quick Stats */}
            <div className="w-full md:w-1/3 p-4 border-r md:overflow-y-auto">
              <div className="relative aspect-square mb-4 bg-white rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={order.productImage}
                  alt={order.productName}
                  className="object-contain"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              <div className="space-y-4">
                {/* Profit Calculation Card */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3">Profit Calculation</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Sale Price:</span>
                      <span className="font-medium">${order.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Quantity:</span>
                      <span>{order.quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Cost Price:</span>
                      <span className="text-red-600">-${profitDetails.costPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Platform Fee:</span>
                      <span className="text-red-600">-${profitDetails.platformFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping Cost:</span>
                      <span className="text-red-600">-${profitDetails.shippingCost.toFixed(2)}</span>
                    </div>
                    
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <div className="flex justify-between font-medium">
                        <span>True Profit:</span>
                        <span className="text-green-600">${profitDetails.profit.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-500">Profit Margin:</span>
                        <span>{profitDetails.profitMargin.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">ROI:</span>
                        <span>{profitDetails.roi.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Order Date:</span>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Last Updated:</span>
                      <span>{formatDate(order.updatedAt)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Payment Method:</span>
                      <span>{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Price:</span>
                      <span className="font-medium">${order.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Tabbed Content */}
            <div className="w-full md:w-2/3 flex flex-col overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b">
                <button
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'overview'
                      ? 'text-primary-yellow border-b-2 border-primary-yellow'
                      : 'text-gray-500'
                  }`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'shipping'
                      ? 'text-primary-yellow border-b-2 border-primary-yellow'
                      : 'text-gray-500'
                  }`}
                  onClick={() => setActiveTab('shipping')}
                >
                  Shipping
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'notes'
                      ? 'text-primary-yellow border-b-2 border-primary-yellow'
                      : 'text-gray-500'
                  }`}
                  onClick={() => setActiveTab('notes')}
                >
                  Notes
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Product Details */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Product Details</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{order.productName}</h4>
                            <p className="text-sm text-gray-500 mt-1">Quantity: {order.quantity}</p>
                            <p className="text-sm text-gray-500">SKU: {order.productId}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">${order.price.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">per unit</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Customer Details */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Customer Details</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium text-gray-900">{order.customer.name}</p>
                        <p className="text-sm text-gray-500">{order.customer.email}</p>
                        {order.customer.address && (
                          <p className="text-sm text-gray-500 mt-2">{order.customer.address}</p>
                        )}
                      </div>
                    </div>

                    {/* Order Timeline */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Order Timeline</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-4">
                          <div className="flex">
                            <div className="mr-3">
                              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Order Created</p>
                              <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                            </div>
                          </div>

                          {order.status !== 'pending' && (
                            <div className="flex">
                              <div className="mr-3">
                                <div className={`h-8 w-8 rounded-full ${order.status !== 'cancelled' ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center`}>
                                  {order.status !== 'cancelled' ? (
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                  ) : (
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                  )}
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Status Updated to {order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
                                <p className="text-xs text-gray-500">{formatDate(order.updatedAt)}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Shipping Tab */}
                {activeTab === 'shipping' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Shipping Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium">Shipping Method</p>
                        <p className="text-sm text-gray-700 mb-4">{order.shippingMethod}</p>
                        
                        <p className="font-medium">Shipping Address</p>
                        <p className="text-sm text-gray-700">{order.customer.address || 'No address provided'}</p>
                      </div>
                    </div>

                    {order.trackingNumber && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">Tracking Information</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="font-medium">Tracking Number</p>
                          <p className="text-sm text-gray-700 font-mono mb-4">{order.trackingNumber}</p>
                          
                          <div className="w-full flex items-center justify-between mt-4">
                            <div className="flex flex-col items-center">
                              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                              <span className="text-xs mt-1">Shipped</span>
                            </div>
                            <div className="h-[2px] flex-1 bg-gray-300 mx-1"></div>
                            <div className="flex flex-col items-center">
                              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                              <span className="text-xs mt-1">In Transit</span>
                            </div>
                            <div className="h-[2px] flex-1 bg-gray-300 mx-1"></div>
                            <div className="flex flex-col items-center">
                              <div className={`w-4 h-4 ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'} rounded-full`}></div>
                              <span className="text-xs mt-1">Delivered</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Order Notes</h3>
                      <div className="bg-gray-50 p-4 rounded-lg min-h-[150px]">
                        {order.notes ? (
                          <p className="text-sm text-gray-700">{order.notes}</p>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No notes for this order.</p>
                        )}
                      </div>
                    </div>

                    {/* Add note functionality could be added here */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">Add a Note</h3>
                      <textarea 
                        className="w-full border border-gray-300 rounded-md p-2 h-24"
                        placeholder="Add a note about this order..."
                      ></textarea>
                      <button className="mt-2 px-4 py-2 bg-primary-yellow text-black rounded hover:bg-yellow-500 text-sm font-medium">
                        Save Note
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 