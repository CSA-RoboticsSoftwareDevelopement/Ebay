'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

// Chart Line Icon SVG component
const ChartLineIcon = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 576 512" 
    fill="currentColor" 
    className={className}
  >
    <path d="M384 160c-17.7 0-32-14.3-32-32s14.3-32 32-32H544c17.7 0 32 14.3 32 32V288c0 17.7-14.3 32-32 32s-32-14.3-32-32V205.3L342.6 374.6c-12.5 12.5-32.8 12.5-45.3 0L192 269.3 54.6 406.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160c12.5-12.5 32.8-12.5 45.3 0L320 306.7 466.7 160H384z"/>
  </svg>
);

// 3D Geometric Shapes Components
const Cube = ({ className = "", style = {} }) => (
  <div className={`absolute ${className}`} style={style}>
    <div className="relative w-full h-full transform-style-3d">
      <div className="absolute inset-0 transform translate-z-[25px] bg-primary-yellow/20 border border-primary-yellow/30"></div>
      <div className="absolute inset-0 transform translate-z-[-25px] bg-primary-yellow/10 border border-primary-yellow/20"></div>
      <div className="absolute inset-0 h-[50px] top-0 transform rotateX-90 translate-z-[25px] origin-top bg-primary-yellow/15 border border-primary-yellow/20"></div>
      <div className="absolute inset-0 h-[50px] bottom-0 transform rotateX-90 translate-z-[25px] origin-bottom bg-primary-yellow/15 border border-primary-yellow/20"></div>
      <div className="absolute inset-0 w-[50px] left-0 transform rotateY-90 translate-z-[25px] origin-left bg-primary-yellow/15 border border-primary-yellow/20"></div>
      <div className="absolute inset-0 w-[50px] right-0 transform rotateY-90 translate-z-[25px] origin-right bg-primary-yellow/15 border border-primary-yellow/20"></div>
    </div>
  </div>
);

const Sphere = ({ className = "", size = 80, opacity = 0.2, color = "bg-primary-yellow" }) => (
  <div 
    className={`absolute rounded-full ${color}/${opacity} backdrop-blur-sm ${className}`}
    style={{ width: `${size}px`, height: `${size}px` }}
  ></div>
);

const Triangle = ({ className = "", size = 80, opacity = 0.2 }) => (
  <div 
    className={`absolute ${className}`}
    style={{ width: `${size}px`, height: `${size}px` }}
  >
    <div 
      className={`w-full h-full bg-primary-yellow/${opacity} transform rotate-45`}
      style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
    ></div>
  </div>
);

// Device illustration for the hero section with interactive screens
const DeviceIllustration = () => {
  // Animation and screen state
  const [isVisible, setIsVisible] = useState(false);
  const [currentScreen, setCurrentScreen] = useState(0);
  
  // Define the different screens to show in the phone
  const screens = [
    // Dashboard Screen
    <>
      {/* App header */}
      <div className="flex items-center mb-5">
        <div className="w-10 h-10 rounded-full bg-primary-yellow flex items-center justify-center">
          <ChartLineIcon className="w-5 h-5 text-primary-black" />
        </div>
        <div className="ml-3 text-primary-black text-sm font-semibold">Resale Dashboard</div>
      </div>
      
      {/* App metrics */}
      <div className="bg-white rounded-lg p-4 shadow-md mb-4">
        <div className="text-sm text-neutral-gray-600 mb-1">Today's Performance</div>
        <div className="text-lg text-primary-black font-bold mb-1">$2,458.32</div>
        <div className="flex items-center">
          <span className="text-sm text-green-500">↑ 12.5%</span>
          <span className="text-sm text-neutral-gray-500 ml-1">from yesterday</span>
        </div>
      </div>
      
      {/* Marketplace logos */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-neutral-gray-600 font-medium">Connected Marketplaces</div>
          <div className="text-xs text-primary-yellow">View All</div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {/* eBay logo */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-neutral-gray-100 rounded-full flex items-center justify-center mb-1 border border-neutral-gray-200">
              <div className="w-6 h-6 bg-primary-yellow rounded-full flex items-center justify-center">
                <span className="text-[10px] text-primary-black font-bold">eB</span>
              </div>
            </div>
            <span className="text-xs text-neutral-gray-600">eBay</span>
          </div>
          
          {/* Amazon logo */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-neutral-gray-100 rounded-full flex items-center justify-center mb-1 border border-neutral-gray-200">
              <div className="w-6 h-6 bg-neutral-gray-300 rounded-full flex items-center justify-center">
                <span className="text-[10px] text-primary-black font-bold">Am</span>
              </div>
            </div>
            <span className="text-xs text-neutral-gray-600">Amazon</span>
          </div>
          
          {/* Etsy logo */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-neutral-gray-100 rounded-full flex items-center justify-center mb-1 border border-neutral-gray-200">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">E</span>
              </div>
            </div>
            <span className="text-xs text-neutral-gray-600">Etsy</span>
          </div>
        </div>
      </div>
      
      {/* Actionable insight */}
      <div className="bg-primary-yellow/10 rounded-lg p-4 border border-primary-yellow/30">
        <div className="text-sm text-primary-black font-semibold mb-1">Insight</div>
        <div className="text-sm text-neutral-gray-700">
          Adjust pricing on 3 items to increase profit by 24%
        </div>
      </div>
    </>,
    
    // Analytics Screen
    <>
      {/* App header */}
      <div className="flex items-center mb-5">
        <div className="w-10 h-10 rounded-full bg-primary-yellow flex items-center justify-center">
          <ChartLineIcon className="w-5 h-5 text-primary-black" />
        </div>
        <div className="ml-3 text-primary-black text-sm font-semibold">Analytics</div>
      </div>
      
      {/* Chart */}
      <div className="bg-white rounded-lg p-4 shadow-md mb-4">
        <div className="text-sm text-neutral-gray-600 mb-3">Revenue Trends</div>
        <div className="h-32 flex items-end space-x-2">
          <div className="h-[40%] w-6 bg-neutral-gray-200 rounded-t"></div>
          <div className="h-[60%] w-6 bg-neutral-gray-200 rounded-t"></div>
          <div className="h-[45%] w-6 bg-neutral-gray-200 rounded-t"></div>
          <div className="h-[80%] w-6 bg-primary-yellow rounded-t"></div>
          <div className="h-[65%] w-6 bg-neutral-gray-200 rounded-t"></div>
          <div className="h-[90%] w-6 bg-primary-yellow rounded-t"></div>
          <div className="h-[100%] w-6 bg-primary-yellow rounded-t"></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-neutral-gray-500">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </div>
      
      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-lg p-3 shadow-md">
          <div className="text-xs text-neutral-gray-600">Conversion Rate</div>
          <div className="text-base font-bold text-primary-black">4.8%</div>
          <div className="text-xs text-green-500">↑ 0.5%</div>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-md">
          <div className="text-xs text-neutral-gray-600">Avg. Order</div>
          <div className="text-base font-bold text-primary-black">$82.39</div>
          <div className="text-xs text-green-500">↑ $3.41</div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-4 shadow-md">
        <div className="text-sm text-neutral-gray-600 mb-2">Top Performing Item</div>
        <div className="flex items-center">
          <div className="w-12 h-12 bg-neutral-gray-100 rounded-md mr-3"></div>
          <div>
            <div className="text-sm font-medium text-primary-black">Vintage Camera</div>
            <div className="text-xs text-neutral-gray-600">$249.99 • 23 sold</div>
          </div>
        </div>
      </div>
    </>,
    
    // Inventory Screen
    <>
      {/* App header */}
      <div className="flex items-center mb-5">
        <div className="w-10 h-10 rounded-full bg-primary-yellow flex items-center justify-center">
          <ChartLineIcon className="w-5 h-5 text-primary-black" />
        </div>
        <div className="ml-3 text-primary-black text-sm font-semibold">Inventory</div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium text-primary-black">43 Active Listings</div>
        <div className="text-xs text-primary-yellow font-medium">Filter</div>
      </div>
      
      {/* Inventory items */}
      <div className="space-y-3 mb-2">
        <div className="bg-white rounded-lg p-3 shadow-md flex items-center">
          <div className="w-12 h-12 bg-neutral-gray-100 rounded-md mr-3"></div>
          <div className="flex-1">
            <div className="text-sm font-medium text-primary-black">Vintage Camera</div>
            <div className="text-xs text-neutral-gray-600">$249.99 • In stock: 2</div>
          </div>
          <div className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">Hot</div>
        </div>
        
        <div className="bg-white rounded-lg p-3 shadow-md flex items-center">
          <div className="w-12 h-12 bg-neutral-gray-100 rounded-md mr-3"></div>
          <div className="flex-1">
            <div className="text-sm font-medium text-primary-black">Antique Watch</div>
            <div className="text-xs text-neutral-gray-600">$189.50 • In stock: 1</div>
          </div>
          <div className="text-xs font-medium px-2 py-1 bg-primary-yellow/20 text-primary-yellow rounded-full">New</div>
        </div>
        
        <div className="bg-white rounded-lg p-3 shadow-md flex items-center">
          <div className="w-12 h-12 bg-neutral-gray-100 rounded-md mr-3"></div>
          <div className="flex-1">
            <div className="text-sm font-medium text-primary-black">Collectible Coins</div>
            <div className="text-xs text-neutral-gray-600">$124.99 • In stock: 8</div>
          </div>
        </div>
      </div>
      
      <div className="text-center py-2">
        <span className="text-xs text-primary-yellow">View All Items</span>
      </div>
    </>
  ];
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Improved shadow for the phone - more realistic and mobile-friendly */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[180px] h-[20px] bg-black/15 blur-xl rounded-full"></div>
      
      {/* Phone illustration */}
      <div className="relative w-full h-full z-10">
        {/* Phone frame with app mockup - now interactive */}
        <div 
          className={`relative mx-auto w-[300px] h-[600px] bg-white rounded-[40px] border-[12px] border-neutral-gray-800 shadow-lg transform rotate-0 overflow-hidden transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} cursor-pointer`}
          onClick={() => setCurrentScreen((currentScreen + 1) % screens.length)}
        >
          {/* Hint text for clicking */}
          <div className="absolute top-0 left-0 right-0 text-center p-1 bg-primary-yellow/80 text-xs text-primary-black font-medium">
            Tap to see more screens
          </div>
          
          {/* App screen content with transition between screens */}
          <div className="absolute inset-0 bg-neutral-gray-100 p-4">
            <div className="transition-opacity duration-300 ease-in-out">
              {screens[currentScreen]}
            </div>
            
            {/* Navigation dots to show which screen we're on */}
            <div className="absolute bottom-0 inset-x-0 bg-white p-3 flex justify-center space-x-2">
              {screens.map((_, index) => (
                <div 
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${index === currentScreen ? 'bg-primary-yellow' : 'bg-neutral-gray-200'}`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Floating data point animation
interface FloatingMetricProps {
  value: string;
  label: string;
  color?: string;
  animationClass?: string;
  delay?: string;
}

const FloatingMetric = ({ 
  value, 
  label, 
  color = "text-primary-yellow", 
  animationClass = "animate-float1", 
  delay = "0s" 
}: FloatingMetricProps) => {
  return (
    <div className={`text-center ${animationClass}`} style={{ animationDelay: delay }}>
      <span className={`block text-2xl font-bold ${color}`}>{value}</span>
      <span className="text-xs text-neutral-gray-400">{label}</span>
    </div>
  );
};

export default function Home() {
  // Animation states
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-neutral-gray-100 text-primary-black">
      {/* Navigation - Pill Style Navbar */}
      <div className="w-full pt-6 pb-4 px-4 sm:px-6 lg:px-8 fixed top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-full shadow-md px-6 py-4 flex items-center justify-between transition-all duration-300">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <div className="w-10 h-10 bg-primary-black rounded-full flex items-center justify-center">
                <ChartLineIcon className="w-6 h-6 text-primary-yellow" />
              </div>
            </div>
            
            {/* Center navigation */}
            <nav className="hidden md:flex items-center justify-center space-x-8">
              <Link href="#works" className="text-neutral-gray-800 hover:text-primary-yellow transition-colors font-medium px-3 py-2">
                Works
              </Link>
              <Link href="#benefits" className="text-neutral-gray-800 hover:text-primary-yellow transition-colors font-medium px-3 py-2">
                Benefits
              </Link>
              <Link href="#about" className="text-neutral-gray-800 hover:text-primary-yellow transition-colors font-medium px-3 py-2">
                About
              </Link>
              <Link href="#process" className="text-neutral-gray-800 hover:text-primary-yellow transition-colors font-medium px-3 py-2">
                Process
              </Link>
              <Link href="#pricing" className="text-neutral-gray-800 hover:text-primary-yellow transition-colors font-medium px-3 py-2">
                Pricing
              </Link>
              <Link href="#contact" className="text-neutral-gray-800 hover:text-primary-yellow transition-colors font-medium px-3 py-2">
                Contact
              </Link>
              <Link href="#faq" className="text-neutral-gray-800 hover:text-primary-yellow transition-colors font-medium px-3 py-2">
                FAQ
              </Link>
            </nav>
            
            {/* Call to action */}
            <div className="flex-shrink-0">
              <Link href="/demo" className="bg-primary-black text-white py-2 px-6 rounded-full font-medium hover:bg-primary-black/90 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed navbar */}
      <div className="h-24"></div>

      {/* Hero Section with 3D geometric elements */}
      <section className="py-20 bg-neutral-gray-100 relative overflow-hidden">
        {/* 3D Geometric Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none perspective-1000">
          <Sphere 
            className="top-[15%] right-[10%] animate-float-slow"
            size={100}
            opacity={0.15}
          />
          <Sphere 
            className="bottom-[20%] left-[5%] animate-float-medium" 
            size={60}
            opacity={0.1}
          />
          <Sphere 
            className="top-[40%] left-[15%] animate-float-fast" 
            size={40}
            opacity={0.2}
          />
          <Triangle 
            className="bottom-[30%] right-[20%] animate-float-medium" 
            size={80}
            opacity={0.1}
          />
          <Triangle 
            className="top-[60%] right-[35%] animate-float-slow rotate-45" 
            size={40}
            opacity={0.15}
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-center">
            {/* Text content */}
            <div className="md:w-1/2 mb-12 md:mb-0 z-10">
              <p 
                className={`text-neutral-gray-600 text-lg mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              >
                The One-Stop Platform to Skyrocket Your Profits
              </p>
              
              <h1 
                className={`text-7xl md:text-9xl font-extrabold tracking-tighter leading-none mb-10 text-primary-black transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: '200ms' }}
              >
                Profit.<br />
                <span className="text-primary-yellow">Growth.</span>
              </h1>
              
              <p 
                className={`text-neutral-gray-600 max-w-md mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: '400ms' }}
              >
                Save time and money. Automated e-commerce analytics that help you make data-driven decisions.
              </p>
              
              <div 
                className={`flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: '600ms' }}
              >
                <Link href="/signup" className="bg-primary-yellow text-primary-black py-3 px-8 rounded-md font-medium hover:bg-primary-yellow/90 transition-colors text-center">
                  Get Started Free
                </Link>
              </div>
            </div>
            
            {/* Device illustration */}
            <div className="md:w-1/2 flex justify-center z-10 relative">
              <DeviceIllustration />
            </div>
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-yellow/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-yellow/5 rounded-full blur-3xl"></div>
      </section>

      {/* Feature Highlights Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-primary-black">Why Sellers Choose Resale</h2>
            <p className="text-neutral-gray-600 max-w-2xl mx-auto">
              Our platform provides the insights you need to make better decisions and maximize your profits.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-neutral-gray-100 rounded-lg p-6 border-t-4 border-primary-yellow hover:shadow-lg transition-all duration-300">
              <div className="mb-4 text-primary-black">
                <ChartLineIcon className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary-black">True Profit Analytics</h3>
              <p className="text-neutral-gray-600">
                See beyond basic sales data with calculations that include fees, shipping costs, and other expenses.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-neutral-gray-100 rounded-lg p-6 border-t-4 border-primary-yellow hover:shadow-lg transition-all duration-300">
              <div className="mb-4 text-primary-black">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary-black">Competitor Analysis</h3>
              <p className="text-neutral-gray-600">
                Compare your listings with competitors on price, shipping, feedback scores, and listing quality.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-neutral-gray-100 rounded-lg p-6 border-t-4 border-primary-yellow hover:shadow-lg transition-all duration-300">
              <div className="mb-4 text-primary-black">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary-black">Sell-Through Rate</h3>
              <p className="text-neutral-gray-600">
                Track how quickly your inventory sells and identify opportunities to optimize pricing and listings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-black text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to grow your e-commerce business?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-neutral-gray-300">
            Join thousands of sellers who are making data-driven decisions with Resale.
          </p>
          <Link href="/signup" className="bg-primary-yellow text-primary-black py-3 px-8 rounded-md font-medium hover:bg-primary-yellow/90 transition-colors inline-block">
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-gray-100 text-neutral-gray-600 py-12 border-t border-neutral-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-primary-black font-bold text-lg mb-4 flex items-center">
                <ChartLineIcon className="w-5 h-5 text-primary-yellow mr-2" />
                Resale
              </h3>
              <p className="mb-4">
                Advanced analytics for e-commerce sellers.
              </p>
            </div>
            <div>
              <h4 className="text-primary-black font-bold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="hover:text-primary-yellow">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-primary-yellow">Pricing</Link></li>
                <li><Link href="#demo" className="hover:text-primary-yellow">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-primary-black font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#about" className="hover:text-primary-yellow">About Us</Link></li>
                <li><Link href="#contact" className="hover:text-primary-yellow">Contact</Link></li>
                <li><Link href="#careers" className="hover:text-primary-yellow">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-primary-black font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#terms" className="hover:text-primary-yellow">Terms of Service</Link></li>
                <li><Link href="#privacy" className="hover:text-primary-yellow">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-gray-200 mt-12 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} Resale. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
