'use client';

import React, { useState } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

// Updated metrics data for the requested metrics
const metrics = [
  {
    name: 'Total Profit',
    value: '$5,874.21',
    change: '+12.3%',
    isPositive: true,
    tooltip: 'Net profit across all platforms after expenses',
    chartData: [
      { name: 'Jan', value: 4000 },
      { name: 'Feb', value: 3500 },
      { name: 'Mar', value: 4200 },
      { name: 'Apr', value: 3800 },
      { name: 'May', value: 4800 },
      { name: 'Jun', value: 5100 },
      { name: 'Jul', value: 5874 },
    ]
  },
  {
    name: 'Average Profit Margin',
    value: '34.7%',
    change: '+2.1%',
    isPositive: true,
    tooltip: 'Average profit margin across all products',
    chartData: [
      { name: 'Jan', value: 30 },
      { name: 'Feb', value: 32 },
      { name: 'Mar', value: 31 },
      { name: 'Apr', value: 29 },
      { name: 'May', value: 33 },
      { name: 'Jun', value: 35 },
      { name: 'Jul', value: 34.7 },
    ]
  },
  {
    name: '# of Orders',
    value: '83',
    change: '+18.5%',
    isPositive: true,
    tooltip: 'Total number of orders processed',
    chartData: [
      { name: 'Jan', value: 45 },
      { name: 'Feb', value: 52 },
      { name: 'Mar', value: 49 },
      { name: 'Apr', value: 62 },
      { name: 'May', value: 70 },
      { name: 'Jun', value: 75 },
      { name: 'Jul', value: 83 },
    ]
  },
  {
    name: '# of Products',
    value: '127',
    change: '+5.8%',
    isPositive: true,
    tooltip: 'Total number of products in inventory',
    chartData: [
      { name: 'Jan', value: 98 },
      { name: 'Feb', value: 105 },
      { name: 'Mar', value: 110 },
      { name: 'Apr', value: 114 },
      { name: 'May', value: 118 },
      { name: 'Jun', value: 120 },
      { name: 'Jul', value: 127 },
    ]
  },
];

// Enhanced product data with comprehensive stats
const topProducts = [
  {
    id: '1',
    name: 'Vintage Polaroid Camera',
    sold: 12,
    revenue: '$1,560',
    profit: '$624',
    margin: '40%',
    platform: 'eBay',
    daysListed: 18,
  },
  {
    id: '2',
    name: 'Mechanical Keyboard - Cherry MX Blue',
    sold: 23,
    revenue: '$2,070',
    profit: '$621',
    margin: '30%',
    platform: 'eBay',
    daysListed: 24,
  },
  {
    id: '3',
    name: 'Vintage Leather Messenger Bag',
    sold: 7,
    revenue: '$1,050',
    profit: '$420',
    margin: '40%',
    platform: 'eBay',
    daysListed: 14,
  },
  {
    id: '4',
    name: 'Wireless Bluetooth Earbuds',
    sold: 18,
    revenue: '$1,080',
    profit: '$378',
    margin: '35%',
    platform: 'eBay',
    daysListed: 21,
  },
  {
    id: '5',
    name: 'Smart Home Hub',
    sold: 8,
    revenue: '$640',
    profit: '$160',
    margin: '25%',
    platform: 'eBay',
    daysListed: 15,
  },
];

// Enhanced marketplace data
const marketplaceData = [
  { name: 'eBay', revenue: '$5,987.45', profit: '$2,275.23', items: 45 },
  { name: 'Amazon', revenue: '$1,893.68', profit: '$682.72', items: 12 },
  { name: 'Etsy', revenue: '$594.10', profit: '$261.87', items: 6 },
];

// Improved ShadCN-inspired metric card component
const MetricCard = ({ metric }) => {
  return (
    <div className="bg-black rounded-lg p-4 shadow-lg overflow-hidden border border-zinc-800 hover:border-primary-yellow/50 transition-all">
      <h3 className="text-gray-400 font-medium text-sm mb-1">{metric.name}</h3>
      <div className="flex justify-between items-baseline mb-3">
        <p className="text-2xl font-bold text-white">{metric.value}</p>
        <span
          className={`text-sm font-medium px-2 py-0.5 rounded-full ${
            metric.isPositive ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'
          }`}
        >
          {metric.change}
        </span>
      </div>
      <div className="h-16 mt-2 -mx-1 -mb-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={metric.chartData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="#FFC300"
              strokeWidth={2}
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState('last30');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <div>
          <select 
            className="input py-1 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="last7">Last 7 days</option>
            <option value="last30">Last 30 days</option>
            <option value="last90">Last 90 days</option>
            <option value="thisYear">This year</option>
          </select>
        </div>
      </div>

      {/* Updated Metrics Grid with improved styling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.name} metric={metric} />
        ))}
      </div>

      {/* Top Selling Products */}
      <div className="card bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Top Selling Products</h2>
          <button className="text-primary-yellow hover:underline text-sm">View All</button>
        </div>
        <div className="overflow-x-auto -mx-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-gray-200">
                <th className="py-3 px-6 text-left text-sm font-medium text-neutral-gray-500">Product</th>
                <th className="py-3 px-6 text-right text-sm font-medium text-neutral-gray-500">Units Sold</th>
                <th className="py-3 px-6 text-right text-sm font-medium text-neutral-gray-500">Revenue</th>
                <th className="py-3 px-6 text-right text-sm font-medium text-neutral-gray-500">Profit</th>
                <th className="py-3 px-6 text-right text-sm font-medium text-neutral-gray-500">Margin</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product) => (
                <tr key={product.id} className="border-b border-neutral-gray-200 hover:bg-neutral-gray-50">
                  <td className="py-4 px-6 text-sm">{product.name}</td>
                  <td className="py-4 px-6 text-sm text-right">{product.sold}</td>
                  <td className="py-4 px-6 text-sm text-right">{product.revenue}</td>
                  <td className="py-4 px-6 text-sm text-right font-medium text-green-600">{product.profit}</td>
                  <td className="py-4 px-6 text-sm text-right">{product.margin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Marketplace Performance */}
      <div className="card bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Marketplace Performance</h2>
        </div>
        <div className="overflow-x-auto -mx-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-gray-200">
                <th className="py-3 px-6 text-left text-sm font-medium text-neutral-gray-500">Marketplace</th>
                <th className="py-3 px-6 text-right text-sm font-medium text-neutral-gray-500">Revenue</th>
                <th className="py-3 px-6 text-right text-sm font-medium text-neutral-gray-500">Profit</th>
                <th className="py-3 px-6 text-right text-sm font-medium text-neutral-gray-500">Active Items</th>
                <th className="py-3 px-6 text-center text-sm font-medium text-neutral-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {marketplaceData.map((marketplace) => (
                <tr key={marketplace.name} className="border-b border-neutral-gray-200 hover:bg-neutral-gray-50">
                  <td className="py-4 px-6 text-sm font-medium">{marketplace.name}</td>
                  <td className="py-4 px-6 text-sm text-right">{marketplace.revenue}</td>
                  <td className="py-4 px-6 text-sm text-right font-medium text-green-600">{marketplace.profit}</td>
                  <td className="py-4 px-6 text-sm text-right">{marketplace.items}</td>
                  <td className="py-4 px-6 text-sm text-center">
                    <span className={`py-1 px-2 rounded-full text-xs font-medium ${
                      marketplace.name === 'eBay' ? 'bg-green-100 text-green-600' : 'bg-neutral-gray-100 text-neutral-gray-500'
                    }`}>
                      {marketplace.name === 'eBay' ? 'Connected' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 