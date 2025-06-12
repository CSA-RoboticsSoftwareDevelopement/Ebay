'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip as RechartsTooltip, TooltipProps } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext'; // Make sure this path is correct
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Info, Loader2, ChevronDown, Calendar, Sparkles, Clock, Zap, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from 'next/navigation'; // Import useRouter

// Define types for metric data (Keeping your original types)
type MetricDataPoint = {
  name: string;
  value: number;
};

type Metric = {
  name: string;
  value: string;
  change: string;
  isPositive: boolean;
  tooltip: string;
  chartData: MetricDataPoint[];
};

// Timeframe options for the dropdown
const timeframeOptions = [
  { value: 'last7', label: 'Last 7 days', icon: Calendar },
  { value: 'last30', label: 'Last 30 days', icon: Calendar },
  { value: 'last90', label: 'Last 90 days', icon: Calendar },
  { value: 'thisYear', label: 'This year', icon: Calendar },
];

// Initial placeholder data - using zeros instead of mock data
const initialMetrics: Metric[] = [
  {
    name: 'Total Profit',
    value: '$0.00',
    change: '0%',
    isPositive: true,
    tooltip: 'Net profit across all platforms after expenses',
    chartData: Array(7).fill({ name: '', value: 0 }),
  },
  {
    name: 'Average Profit Margin',
    value: '0%',
    change: '0%',
    isPositive: true,
    tooltip: 'Average profit margin across all products',
    chartData: Array(7).fill({ name: '', value: 0 }),
  },
  {
    name: '# of Orders',
    value: '0',
    change: '0%',
    isPositive: true,
    tooltip: 'Total number of orders processed',
    chartData: Array(7).fill({ name: '', value: 0 }),
  },
  {
    name: '# of Products',
    value: '0',
    change: '0%',
    isPositive: true,
    tooltip: 'Total number of products in inventory',
    chartData: Array(7).fill({ name: '', value: 0 }),
  },
];

// Coming soon features
const comingSoonFeatures = [
  {
    title: 'AI Listing Optimization',
    description: 'Automatically adjust prices and improve listing quality based on competitor analysis',
    icon: TrendingUp,
    estimatedRelease: 'Q2 2025',
    category: 'Automation'
  },
  {
    title: 'Advanced Analytics',
    description: 'Deep insights into customer behavior, product performance, and market trends',
    icon: Zap,
    estimatedRelease: 'Q3 2025',
    category: 'Analytics'
  },
  {
    title: 'Amazon Integration',
    description: 'Seamlessly sync inventory and orders across Amazon',
    icon: Sparkles,
    estimatedRelease: 'Q3 2025',
    category: 'Integration'
  }
];

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900/95 backdrop-blur-sm p-3 border border-zinc-700 rounded-lg text-xs shadow-xl">
        <p className="text-gray-300 mb-1">{`${label}`}</p>
        <p className="text-primary-yellow font-semibold">{`Value: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

// Custom Animated Dropdown Component
const AnimatedTimeframeDropdown = ({ timeframe, onTimeframeChange, loading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = timeframeOptions.find(option => option.value === timeframe) || timeframeOptions[1]; // Default to 'Last 30 days'

  const handleOptionSelect = (value: string) => {
    onTimeframeChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2.5 rounded-lg border border-zinc-700 hover:border-primary-yellow/50 transition-all duration-200 disabled:opacity-50 min-w-[140px]"
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
      >
        <selectedOption.icon className="h-4 w-4 text-primary-yellow" />
        <span className="text-sm font-medium flex-1 text-left">{selectedOption.label}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute top-full left-0 mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-20 overflow-hidden"
            >
              {timeframeOptions.map((option, index) => (
                <motion.button
                  key={option.value}
                  onClick={() => handleOptionSelect(option.value)}
                  className="flex items-center gap-2 w-full px-4 py-3 text-left hover:bg-zinc-800 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: "rgba(255, 195, 0, 0.1)" }}
                >
                  <option.icon className="h-4 w-4 text-primary-yellow" />
                  <span className={`text-sm ${option.value === timeframe ? 'text-primary-yellow font-semibold' : 'text-white'}`}>
                    {option.label}
                  </span>
                  {option.value === timeframe && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto w-2 h-2 bg-primary-yellow rounded-full"
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Enhanced MetricCard Component
const MetricCard = ({ metric, index }) => {
  const hasData = metric.chartData.some(point => point.value > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative bg-gradient-to-br from-zinc-900 to-zinc-900/50 rounded-xl p-6 shadow-lg overflow-hidden border border-zinc-800/50 backdrop-blur-sm"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Header */}
      <div className="relative flex justify-between items-center mb-4">
        <h3 className="text-gray-400 font-medium text-sm tracking-wide">{metric.name}</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-gray-400 hover:text-primary-yellow transition-colors duration-200">
                <Info className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-900 text-white border-zinc-700 p-3 text-xs max-w-[200px] rounded-lg">
              {metric.tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Value and Change */}
      <div className="relative flex justify-between items-baseline mb-6">
        <motion.p 
          className="text-3xl font-bold text-white"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.2 }}
        >
          {metric.value}
        </motion.p>
        <motion.span
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 + 0.3 }}
          className={`text-sm font-semibold px-2.5 py-1 rounded-full border ${
            metric.isPositive 
              ? 'text-green-400 bg-green-500/10 border-green-500/20' 
              : 'text-red-400 bg-red-500/10 border-red-500/20'
          }`}
        >
          {metric.change}
        </motion.span>
      </div>

      {/* Chart */}
      <div className="relative h-16 -mx-2 -mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={metric.chartData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={hasData ? "#FFC300" : "#444"}
              strokeWidth={2.5}
              dot={false}
              activeDot={hasData ? { 
                r: 5, 
                fill: "#FFC300", 
                stroke: "#FFC300",
                strokeWidth: 2
              } : false}
            />
            {hasData && (
              <RechartsTooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: '#ffffff10', strokeWidth: 1 }} 
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

// Coming Soon Section Component
const ComingSoonSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-yellow/20">
          <Clock className="h-4 w-4 text-primary-yellow" />
        </div>
        <h2 className="text-xl font-bold text-white">Coming Soon</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-zinc-800 to-transparent"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {comingSoonFeatures.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            className="group relative bg-gradient-to-br from-zinc-900/50 to-zinc-800/30 rounded-xl p-6 border border-zinc-800/50 hover:border-primary-yellow/30 transition-all duration-300"
          >
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            
            <div className="relative">
              {/* Icon and category */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-yellow/10 group-hover:bg-primary-yellow/20 transition-colors duration-300">
                  <feature.icon className="h-5 w-5 text-primary-yellow" />
                </div>
                <span className="text-xs font-medium text-primary-yellow bg-primary-yellow/10 px-2 py-1 rounded-full">
                  {feature.category}
                </span>
              </div>

              {/* Content */}
              <h3 className="font-semibold text-white mb-2 group-hover:text-primary-yellow transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                {feature.description}
              </p>
              
              {/* Estimated release */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-primary-yellow/50 rounded-full animate-pulse"></div>
                <span>Est. {feature.estimatedRelease}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState('last30');
  const [metrics, setMetrics] = useState<Metric[]>(initialMetrics);
  // Keep the loading state for metrics separate from overall auth loading if needed
  const [metricsLoading, setMetricsLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  
  // Destructure what you need from useAuth
  const { user, authToken, loading: authLoading, setAuthTokenAndUser } = useAuth();
  const router = useRouter();

  const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;

  // Effect to handle auth_token from URL hash after Cognito redirect
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('auth_token=')) {
      const token = hash.split('auth_token=')[1].split('&')[0]; // Extract only the token part

      const fetchUserDataAndSetContext = async () => {
        try {
          // Use the captured token to fetch full user details from your backend's session endpoint
          const response = await axios.get(`${BACKEND_SERVER_URL}/api/auth/session`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data.user) {
            // Use the centralized function from AuthContext to set token and user data
            setAuthTokenAndUser(token, response.data.user);
            toast.success("Logged in successfully via Cognito!");
          } else {
            console.error("No user data returned from /api/auth/session after Cognito callback.");
            toast.error("Failed to retrieve user data after login.");
            // If user data is missing, it's safer to redirect to login
            router.push('/login'); 
          }
        } catch (err) {
          console.error("Error fetching user data from /api/auth/session after Cognito callback:", err);
          toast.error("Error during Cognito login process. Please try again.");
          // Redirect to login on error
          router.push('/login'); 
        } finally {
          // Always clean the URL hash after processing, regardless of success or failure
          // This prevents the token from lingering in the URL history
          if (history.replaceState) {
            history.replaceState(null, '', window.location.href.split('#')[0]);
          } else {
            window.location.hash = ''; // Fallback for older browsers
          }
        }
      };

      fetchUserDataAndSetContext();
    }
    // Clean up the #_=_ hash if it appears from some OAuth providers
    else if (hash === '#_=_') {
      if (history.replaceState) {
        history.replaceState(null, '', window.location.href.split('#')[0]);
      } else {
        window.location.hash = '';
      }
    }
    // No need to call checkAuth() explicitly here, as AuthProvider's useEffect will handle initial check
  }, [setAuthTokenAndUser, router, BACKEND_SERVER_URL]); // Add dependencies

  // Function to fetch metrics data based on timeframe
  const fetchMetricsData = async () => {
    // Ensure user and authToken are available from the context before fetching data
    if (!user || !authToken) {
      console.warn("User or AuthToken not available, skipping metrics fetch.");
      setMetricsLoading(false); // Set metrics loading to false if pre-conditions not met
      return; 
    }

    setMetricsLoading(true); // Set loading for metrics
    setError(null); // Clear previous errors
    try {
      const response = await axios.get(`${BACKEND_SERVER_URL}/api/dashboard/metrics`, {
        params: { timeframe, userId: user.id }, // Use user.id from context
        headers: { Authorization: `Bearer ${authToken}` } // Use authToken from context
      });

      if (response.data && response.data.metrics) {
        setMetrics(response.data.metrics);

        // Example logic for 'no data available' message
        const allZeros = response.data.metrics.every(metric => 
          metric.chartData.every(dataPoint => dataPoint.value === 0) &&
          metric.value === '$0.00' && metric.change === '0%'
        ); 

        if (allZeros) {
          setError('No data available. Connect a platform like eBay to see your metrics.');
        } else {
            setError(null); // Clear error if data is present
        }

      } else {
        throw new Error("Invalid response format from metrics API");
      }
    } catch (err) {
      console.error("Error fetching metrics:", err);
      toast.error("Failed to load dashboard metrics.");
      setError("Failed to load metrics. Please try again.");
    } finally {
      setMetricsLoading(false); // Always stop loading for metrics
    }
  };

  // Effect to fetch metrics when timeframe changes or user/authToken changes
  // Only fetch data if user and authToken are populated (meaning user is logged in)
  useEffect(() => {
    if (user && authToken) {
      fetchMetricsData();
    }
  }, [timeframe, user, authToken]); // Depend on user and authToken from context

  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
  };

  // Overall loading check for UI (e.g., show a full page spinner)
  // Combine auth loading with metrics loading
  const overallLoading = authLoading || metricsLoading;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-white"
        >
          Dashboard Overview
        </motion.h1>
        <div className="flex items-center gap-4">
          {overallLoading && ( // Use overallLoading for this indicator
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center text-gray-400 text-sm"
            >
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Updating...
            </motion.div>
          )}
          <AnimatedTimeframeDropdown 
            timeframe={timeframe}
            onTimeframeChange={handleTimeframeChange}
            loading={overallLoading} // Pass overallLoading to dropdown
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/30 text-amber-500 px-4 py-3 rounded-lg text-sm flex items-center"
        >
          <Info className="h-4 w-4 mr-2 flex-shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Metrics Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${overallLoading ? 'opacity-70' : ''}`}>
        {metrics.map((metric, index) => (
          <MetricCard key={metric.name} metric={metric} index={index} />
        ))}
      </div>

      {/* Coming Soon Section */}
      <ComingSoonSection />
    </div>
  );
}