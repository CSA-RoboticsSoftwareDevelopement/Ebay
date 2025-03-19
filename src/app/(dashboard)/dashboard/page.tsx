import React from 'react';

// These are placeholder metrics for now
const metrics = [
  {
    name: 'Total Revenue',
    value: '$12,345.67',
    change: '+12.3%',
    isPositive: true,
  },
  {
    name: 'True Profit',
    value: '$4,567.89',
    change: '+8.7%',
    isPositive: true,
  },
  {
    name: 'Profit Margin',
    value: '37%',
    change: '-2.1%',
    isPositive: false,
  },
  {
    name: 'Sell-Through Rate',
    value: '65%',
    change: '+5.2%',
    isPositive: true,
  },
];

// Placeholder top selling products
const topProducts = [
  {
    id: '1',
    name: 'Vintage Camera',
    sold: 42,
    revenue: '$2,100',
    profit: '$840',
  },
  {
    id: '2',
    name: 'Mechanical Keyboard',
    sold: 38,
    revenue: '$3,800',
    profit: '$1,140',
  },
  {
    id: '3',
    name: 'Wireless Headphones',
    sold: 35,
    revenue: '$1,750',
    profit: '$612.50',
  },
  {
    id: '4',
    name: 'Leather Wallet',
    sold: 30,
    revenue: '$900',
    profit: '$450',
  },
  {
    id: '5',
    name: 'Smartphone Case',
    sold: 28,
    revenue: '$560',
    profit: '$280',
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <div>
          <select className="input py-1 text-sm">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.name} className="card">
            <h3 className="text-neutral-gray-500 font-medium text-sm mb-1">{metric.name}</h3>
            <div className="flex justify-between items-baseline">
              <p className="text-2xl font-bold">{metric.value}</p>
              <span
                className={`text-sm font-medium ${
                  metric.isPositive ? 'text-success' : 'text-error'
                }`}
              >
                {metric.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Top Selling Products */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Top Selling Products</h2>
          <button className="text-primary-yellow hover:underline text-sm">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-gray-200">
                <th className="py-3 px-4 text-left text-sm font-medium text-neutral-gray-500">Product</th>
                <th className="py-3 px-4 text-right text-sm font-medium text-neutral-gray-500">Units Sold</th>
                <th className="py-3 px-4 text-right text-sm font-medium text-neutral-gray-500">Revenue</th>
                <th className="py-3 px-4 text-right text-sm font-medium text-neutral-gray-500">Profit</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product) => (
                <tr key={product.id} className="border-b border-neutral-gray-200 hover:bg-neutral-gray-50">
                  <td className="py-3 px-4 text-sm">{product.name}</td>
                  <td className="py-3 px-4 text-sm text-right">{product.sold}</td>
                  <td className="py-3 px-4 text-sm text-right">{product.revenue}</td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-success">{product.profit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* eBay Connection Status */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">eBay Connection</h2>
          <span className="py-1 px-3 bg-success/10 text-success text-xs font-medium rounded-full">Connected</span>
        </div>
        <p className="text-neutral-gray-600 text-sm mb-4">Your eBay account is connected and data is syncing properly.</p>
        <div className="flex space-x-3">
          <button className="btn btn-primary text-sm py-1">Sync Now</button>
          <button className="btn btn-outline text-sm py-1">View Settings</button>
        </div>
      </div>
    </div>
  );
} 