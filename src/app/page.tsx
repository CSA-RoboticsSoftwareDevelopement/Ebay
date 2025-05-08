'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import VideoModal from '@/components/VideoModal';
import { Play } from 'lucide-react';
import BentoGrid from '@/components/BentoGrid';

// Chart Line Icon SVG component
const ChartLineIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 576 512"
    fill="currentColor"
    className={className}
  >
    <path d="M384 160c-17.7 0-32-14.3-32-32s14.3-32 32-32H544c17.7 0 32 14.3 32 32V288c0 17.7-14.3 32-32 32s-32-14.3-32-32V205.3L342.6 374.6c-12.5 12.5-32.8 12.5-45.3 0L192 269.3 54.6 406.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160c12.5-12.5 32.8-12.5 45.3 0L320 306.7 466.7 160H384z" />
  </svg>
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
        <div className="text-sm text-neutral-gray-600 mb-1">Today&apos;s Performance</div>
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

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

export default function Home() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-primary-black">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section with Video Thumbnail */}
      <section className="relative w-full min-h-screen">
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-primary-black/30 z-10"></div>

        {/* Video Thumbnail Image - Full screen background */}
        <div className="absolute inset-0">
          <div className="w-full h-full relative">
            {imageError ? (
              // Fallback gradient background if image fails to load
              <div className="absolute inset-0 bg-gradient-to-br from-primary-black via-neutral-gray-100 to-neutral-gray-200"></div>
            ) : (
              <Image 
                src="/assets/TezraDigitalBoard.jpg" 
                alt="Tezra Digital Billboard" 
                fill 
                priority
                quality={100}
                className="object-cover"
                onError={() => setImageError(true)}
              />
            )}
          </div>
        </div>

        {/* Content Overlay - Mobile-first approach with desktop original positioning */}
        <div className="absolute inset-0 z-20">
          {/* Mobile layout (flex layout for small screens) */}
          <div className="block md:hidden h-full flex flex-col justify-end pb-16">
            <div className="container mx-auto px-4">
              <div className="flex flex-col items-start justify-between">
                {/* Main headlines */}
                <div className="mb-8">
                  <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-none">
                    Sell more.
                  </h1>
                  <h1 className="text-5xl sm:text-6xl font-extrabold text-primary-yellow leading-none">
                    Work less.
                  </h1>
                </div>

                {/* Description and call to action */}
                <div className="max-w-xs">
                  <p className="text-white text-base sm:text-lg mb-5 font-medium">
                    Our app automates and grows your <span className="whitespace-nowrap">e-commerce business</span>
                  </p>
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 via-primary-yellow to-amber-500 rounded-full opacity-70 group-hover:opacity-100 blur group-hover:blur-md transition-all duration-500"></div>
                    <Link href="/signup" className="relative block">
                      <button className="relative w-full bg-primary-yellow text-primary-black rounded-full px-8 py-3 text-base font-semibold hover:bg-primary-yellow/90 transition-all duration-300 hover:shadow-lg">
                        Try us for free
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop layout (original absolute positioning for larger screens) */}
          <div className="hidden md:block">
            {/* Bottom-left section for the main headlines */}
            <div className="absolute bottom-28 left-16 lg:left-24">
              <h1 className="text-7xl lg:text-8xl xl:text-9xl font-extrabold text-white leading-none">
                Sell more.
              </h1>
              <h1 className="text-7xl lg:text-8xl xl:text-9xl font-extrabold text-primary-yellow leading-none">
                Work less.
              </h1>
            </div>

            {/* Bottom-right section for brief description and sign up button */}
            <div className="absolute bottom-28 right-16 lg:right-24 max-w-sm text-right">
              <p className="text-white text-lg md:text-xl mb-6 font-medium">
                Our app automates and grows your <span className="whitespace-nowrap">e-commerce business</span>
              </p>
              <div className="relative group inline-block">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 via-primary-yellow to-amber-500 rounded-full opacity-70 group-hover:opacity-100 blur group-hover:blur-md transition-all duration-500"></div>
                <Link href="/signup" className="relative block">
                  <button className="relative bg-primary-yellow text-primary-black rounded-full px-10 py-3.5 text-lg font-semibold hover:bg-primary-yellow/90 transition-all duration-300 hover:shadow-lg">
                    Try us for free
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Play button - positioned differently based on screen size */}
          <button 
            onClick={() => setVideoModalOpen(true)}
            className="absolute md:hidden top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group"
            aria-label="Play video"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary-yellow flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Play size={24} className="text-primary-black ml-1" />
            </div>
          </button>

          {/* Play button - original position for desktop */}
          <button 
            onClick={() => setVideoModalOpen(true)}
            className="hidden md:block absolute bottom-1/2 right-1/2 transform translate-x-16 translate-y-8 group"
            aria-label="Play video"
          >
            <div className="w-20 h-20 rounded-full bg-primary-yellow flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Play size={28} className="text-primary-black ml-1" />
            </div>
          </button>
        </div>
      </section>

      {/* Video Modal */}
      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ" // Replace with your actual video URL
      />

      {/* Dominate The Competition Section */}
      <section className="py-20 bg-primary-black text-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Title and Description */}
            <div className="mb-12 md:mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-primary-yellow mb-5">Dominate The Competition</h2>
              <p className="text-lg md:text-xl max-w-3xl font-light leading-relaxed">
                Tezra optimizes your listings based on your e-commerce platforms
                algorithm. Be the first result when searched, be featured on the home
                page, beat the competition by being the favorite.
              </p>
            </div>
            
            {/* Mobile Screenshot Showcase with glow effect */}
            <div className="relative mt-10">
              {/* Subtle glow behind the image */}
              <div className="absolute -inset-5 bg-primary-yellow/10 blur-3xl rounded-full opacity-30"></div>
              
              {/* Main image container with animated arrows */}
              <div className="relative">
                {/* Sparklines showing increasing metrics */}
                <div className="hidden md:block absolute top-[8%] left-[15%] z-20">
                  <div className="bg-neutral-gray-200/80 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                    <div className="text-xs font-semibold mb-1 text-white">Sales Growth</div>
                    <div className="h-10 flex items-end space-x-1">
                      <div className="h-[20%] w-2 bg-green-500 rounded-t"></div>
                      <div className="h-[30%] w-2 bg-green-500 rounded-t"></div>
                      <div className="h-[35%] w-2 bg-green-500 rounded-t"></div>
                      <div className="h-[55%] w-2 bg-green-500 rounded-t"></div>
                      <div className="h-[60%] w-2 bg-green-500 rounded-t"></div>
                      <div className="h-[80%] w-2 bg-green-500 rounded-t"></div>
                      <div className="h-[100%] w-2 bg-green-500 rounded-t"></div>
                    </div>
                    <div className="text-xs text-green-400 font-medium mt-1">↑ 43%</div>
                  </div>
                </div>
                
                <div className="hidden md:block absolute top-[8%] right-[18%] z-20">
                  <div className="bg-neutral-gray-200/80 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                    <div className="text-xs font-semibold mb-1 text-white">Conversion Rate</div>
                    <div className="h-8 w-32 relative">
                      <svg className="w-full h-full" viewBox="0 0 100 30">
                        <path
                          d="M0,25 L14,20 L28,22 L42,18 L56,15 L70,10 L84,5 L100,2"
                          fill="none"
                          stroke="#22C55E"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                    <div className="text-xs text-green-400 font-medium mt-1">↑ 2.8%</div>
                  </div>
                </div>
                
                <div className="hidden md:block absolute top-[40%] left-[35%] z-20">
                  <div className="bg-neutral-gray-200/80 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                    <div className="text-xs font-semibold mb-1 text-white">Monthly Revenue</div>
                    <div className="h-8 w-32 relative">
                      <svg className="w-full h-full" viewBox="0 0 100 30">
                        <path
                          d="M0,28 L20,25 L40,20 L60,15 L80,5 L100,2"
                          fill="none"
                          stroke="#22C55E"
                          strokeWidth="2"
                        />
                        <path
                          d="M0,28 L20,25 L40,20 L60,15 L80,5 L100,2"
                          fill="url(#gradient)"
                          opacity="0.3"
                        />
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#22C55E" />
                          <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                      </svg>
                    </div>
                    <div className="text-xs text-green-400 font-medium mt-1">$12.4k ↑</div>
                  </div>
                </div>
                
                <div className="hidden md:block absolute top-[25%] right-[25%] z-20">
                  <div className="bg-neutral-gray-200/80 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                    <div className="text-xs font-semibold mb-1 text-white">Click-Through</div>
                    <div className="flex items-center gap-1">
                      <div className="text-xl font-bold text-green-500">18.7%</div>
                      <div className="text-xs text-green-400">↑ 5.2%</div>
                    </div>
                  </div>
                </div>
                
                <div className="hidden md:block absolute bottom-[15%] right-[12%] z-20">
                  <div className="bg-neutral-gray-200/80 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                    <div className="text-xs font-semibold mb-1 text-white">Ranking Score</div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div className="w-2 h-3 rounded-full bg-green-500"></div>
                      <div className="w-2 h-4 rounded-full bg-green-500"></div>
                      <div className="w-2 h-5 rounded-full bg-green-500"></div>
                      <div className="w-2 h-6 rounded-full bg-green-500"></div>
                      <div className="w-2 h-7 rounded-full bg-green-500"></div>
                      <div className="w-2 h-8 rounded-full bg-green-500"></div>
                      <div className="w-2 h-10 rounded-full bg-green-500 animate-pulse"></div>
                    </div>
                    <div className="text-xs text-green-400 font-medium mt-1">Top 3% ↑</div>
                  </div>
                </div>
                
                {/* The main image */}
                <Image 
                  src="/assets/TezraOptimise.png" 
                  alt="E-commerce optimization showcase" 
                  width={1200}
                  height={500}
                  className="w-full h-auto relative z-10 rounded-lg shadow-2xl"
                  priority
                />
              </div>
            </div>
            
            {/* Bottom Caption */}
            <div className="mt-14 text-center">
              <p className="text-xl md:text-2xl font-medium">
                Everyone sponsors their listings. Sponsored or not, the best listings win.
              </p>
              <p className="text-xl md:text-2xl font-medium mt-2">
                <span className="text-primary-yellow">Ads get you clicks.</span> <span className="text-primary-yellow">Optimization gets you sales.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Choose Tezra Section (BentoGrid) */}
      <BentoGrid />

      {/* Our Mission Section */}
      <section id="our-mission" className="py-20 bg-black text-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          {/* Text Content */}
          <div className="flex-1 text-left">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-primary-yellow">Our Mission</h2>
            <p className="text-lg md:text-xl text-neutral-gray-200 max-w-xl">
              Empowering e-commerce sellers with powerful, streamlined tools to drive smarter decisions, accelerate growth, and dominate their market.
            </p>
          </div>
          {/* Image Content */}
          <div className="flex-1 flex justify-center">
            <Image
              src="/assets/resalecropped.png"
              alt="Tezra Dashboard Screenshot"
              width={600}
              height={350}
              className="rounded-lg shadow-2xl w-full max-w-xl h-auto object-contain"
              priority
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-neutral-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-gray-100">Why Sellers Choose Tezra</h2>
          <p className="text-neutral-gray-200 max-w-2xl mx-auto">
              Our platform provides the insights you need to make better decisions and maximize your profits.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-neutral-gray-700 rounded-lg p-6 border-t-4 border-primary-yellow hover:shadow-lg transition-all duration-300">
              <div className="mb-4 text-primary-yellow">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" className="h-10 w-10">
                  <path d="M384 160c-17.7 0-32-14.3-32-32s14.3-32 32-32H544c17.7 0 32 14.3 32 32V288c0 17.7-14.3 32-32 32s-32-14.3-32-32V205.3L342.6 374.6c-12.5 12.5-32.8 12.5-45.3 0L192 269.3 54.6 406.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160c12.5-12.5 32.8-12.5 45.3 0L320 306.7 466.7 160H384z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">AI-Driven Profit Analytics</h3>
              <p className="text-neutral-gray-200">
                Our AI-powered analytics give you a detailed breakdown of costs, fees, and margins to optimize your pricing strategy.
              </p>
            </div>
            <div className="bg-neutral-gray-700 rounded-lg p-6 border-t-4 border-primary-yellow hover:shadow-lg transition-all duration-300">
              <div className="mb-4 text-primary-yellow">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Real-Time Competitor Insights</h3>
              <p className="text-neutral-gray-200">
                Stay ahead of the competition by tracking competitor prices, trends, and sales strategies in real-time.
              </p>
            </div>
            <div className="bg-neutral-gray-700 rounded-lg p-6 border-t-4 border-primary-yellow hover:shadow-lg transition-all duration-300">
              <div className="mb-4 text-primary-yellow">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Advanced Inventory Management</h3>
              <p className="text-neutral-gray-200">
                Track your stock levels, predict demand, and automate restocking to avoid overselling or stock shortages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section id="analytics" className="py-20 bg-neutral-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl text-white font-bold mb-6">Analytics That Drive Growth</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-neutral-gray-300">
            Our platform delivers actionable insights that help you optimize your operations and maximize profitability.
          </p>
        </div>
      </section>

      {/* Forecasting Section */}
      <section id="forecasting" className="py-20 bg-neutral-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-200">Predictive Forecasting</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-neutral-gray-300">
            Anticipate market trends and customer demand with our AI-powered forecasting tools.
          </p>
        </div>
      </section>

      {/* Competitor Analysis Section */}
      <section id="competitor-analysis" className="py-20 bg-neutral-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-200">Comprehensive Competitor Analysis</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-neutral-gray-300">
            Gain valuable insights into your competitors' strategies and position your business for success.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-gray-100 text-neutral-gray-600 py-12 border-t border-neutral-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center">
                <div className="w-6 h-6 bg-primary-yellow rounded-full flex items-center justify-center mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" className="w-3 h-3 text-primary-black">
                    <path d="M384 160c-17.7 0-32-14.3-32-32s14.3-32 32-32H544c17.7 0 32 14.3 32 32V288c0 17.7-14.3 32-32 32s-32-14.3-32-32V205.3L342.6 374.6c-12.5 12.5-32.8 12.5-45.3 0L192 269.3 54.6 406.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160c12.5-12.5 32.8-12.5 45.3 0L320 306.7 466.7 160H384z" />
                  </svg>
                </div>
                Tezra
              </h3>
              <p className="mb-4">
                Advanced analytics for e-commerce sellers.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="hover:text-primary-yellow">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-primary-yellow">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#about" className="hover:text-primary-yellow">About Us</Link></li>
                <li><Link href="#contact" className="hover:text-primary-yellow">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#terms" className="hover:text-primary-yellow">Terms of Service</Link></li>
                <li><Link href="#privacy" className="hover:text-primary-yellow">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-gray-200 mt-12 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} Tezra. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
