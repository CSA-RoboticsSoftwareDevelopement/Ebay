"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import VideoModal from "@/components/VideoModal";
import { Play } from "lucide-react";
import BentoGrid from "@/components/BentoGrid";
import LogoCarousel from "@/components/LogoCarousel";

// Chart Line Icon SVG component
// const ChartLineIcon = ({ className = "w-6 h-6" }) => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     viewBox="0 0 576 512"
//     fill="currentColor"
//     className={className}
//   >
//     <path d="M384 160c-17.7 0-32-14.3-32-32s14.3-32 32-32H544c17.7 0 32 14.3 32 32V288c0 17.7-14.3 32-32 32s-32-14.3-32-32V205.3L342.6 374.6c-12.5 12.5-32.8 12.5-45.3 0L192 269.3 54.6 406.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160c12.5-12.5 32.8-12.5 45.3 0L320 306.7 466.7 160H384z" />
//   </svg>
// );

// Device illustration for the hero section with interactive screens

export default function Home() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [selectedTestimonialVideo, setSelectedTestimonialVideo] = useState<
    string | null
  >(null);

  // Sample video URLs - replace with actual testimonial videos
  const testimonialVideos = {
    sarah: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Replace with Sarah's actual video
    mike: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Replace with Mike's actual video
    lisa: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Replace with Lisa's actual video
  };

  const handleTestimonialClick = (videoKey: string) => {
    setSelectedTestimonialVideo(
      testimonialVideos[videoKey as keyof typeof testimonialVideos]
    );
    setVideoModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-primary-black scroll-smooth">
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
          <div className="block md:hidden h-full flex flex-col justify-end pb-28">
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
                  <p className="text-white text-base sm:text-lg mb-5 font-medium leading-relaxed">
                    Optimize, predict best sellers, and grow your{" "}
                    <span className="whitespace-nowrap">
                      e-commerce business
                    </span>{" "}
                    in one place.
                  </p>
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 via-primary-yellow to-amber-500 rounded-full opacity-70 group-hover:opacity-100 blur group-hover:blur-md transition-all duration-500"></div>
                    <a
                      href="https://tally.so/r/m69ErJ"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative block"
                    >
                      <button className="relative w-full bg-primary-yellow text-primary-black rounded-full px-8 py-3 text-base font-semibold hover:bg-primary-yellow/90 transition-all duration-300 hover:shadow-lg">
                        Try us for free
                      </button>
                    </a>
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
              <p className="text-white text-lg md:text-xl mb-6 font-medium leading-relaxed">
                Optimize, predict best sellers, and grow your{" "}
                <span className="whitespace-nowrap">e-commerce business</span>{" "}
                in one place.
              </p>
              <div className="relative group inline-block">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 via-primary-yellow to-amber-500 rounded-full opacity-70 group-hover:opacity-100 blur group-hover:blur-md transition-all duration-500"></div>
                <a
                  href="https://tally.so/r/m69ErJ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block"
                >
                  <button className="relative bg-primary-yellow text-primary-black rounded-full px-10 py-3.5 text-lg font-semibold hover:bg-primary-yellow/90 transition-all duration-300 hover:shadow-lg">
                    Try us for free
                  </button>
                </a>
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

        {/* Trust Indicators / Logo Cloud - Mobile Optimized */}
        <div className="absolute bottom-8 sm:bottom-10 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-[calc(100vw-2rem)] px-4 sm:px-0">
          <div className="text-center">
            <p className="text-white/80 text-xs sm:text-sm md:text-base mb-3 sm:mb-4 font-medium">
              Trusted by sellers from
            </p>

            {/* Desktop - Show all logos */}
            <div className="hidden md:flex items-center justify-center space-x-8 lg:space-x-12">
              {/* Amazon Logo */}
              <div className="flex items-center justify-center h-10 lg:h-12 group cursor-pointer">
                <Image
                  src="/assets/Amazon-Logo-500x281.png"
                  alt="Amazon"
                  width={70}
                  height={40}
                  className="h-full w-auto object-contain filter brightness-0 invert opacity-70 group-hover:filter-none group-hover:opacity-100 transition-all duration-300"
                />
              </div>

              {/* eBay Logo */}
              <div className="flex items-center justify-center h-10 lg:h-12 group cursor-pointer">
                <Image
                  src="/assets/EBay_logo.svg"
                  alt="eBay"
                  width={60}
                  height={24}
                  className="h-full w-auto object-contain filter brightness-0 invert opacity-70 group-hover:filter-none group-hover:opacity-100 transition-all duration-300"
                />
              </div>

              {/* Etsy Logo */}
              <div className="flex items-center justify-center h-10 lg:h-12 group cursor-pointer">
                <Image
                  src="/assets/Etsy_logo.svg.png"
                  alt="Etsy"
                  width={60}
                  height={24}
                  className="h-full w-auto object-contain filter brightness-0 invert opacity-70 group-hover:filter-none group-hover:opacity-100 transition-all duration-300"
                />
              </div>
            </div>

            {/* Mobile - Responsive logo display with safe spacing */}
            <div className="md:hidden">
              {/* Small mobile screens - Single logo with rotation */}
              <div className="block xs:hidden">
                <LogoCarousel />
              </div>

              {/* Larger mobile screens - Show 2-3 logos inline */}
              <div className="hidden xs:flex sm:hidden items-center justify-center gap-4 max-w-xs mx-auto">
                <div className="flex items-center justify-center h-6 group cursor-pointer">
                  <Image
                    src="/assets/Amazon-Logo-500x281.png"
                    alt="Amazon"
                    width={35}
                    height={20}
                    className="h-full w-auto object-contain filter brightness-0 invert opacity-70 group-hover:filter-none group-hover:opacity-100 transition-all duration-300"
                  />
                </div>
                <div className="flex items-center justify-center h-6 group cursor-pointer">
                  <Image
                    src="/assets/EBay_logo.svg"
                    alt="eBay"
                    width={30}
                    height={12}
                    className="h-full w-auto object-contain filter brightness-0 invert opacity-70 group-hover:filter-none group-hover:opacity-100 transition-all duration-300"
                  />
                </div>
                <div className="flex items-center justify-center h-6 group cursor-pointer">
                  <Image
                    src="/assets/Etsy_logo.svg.png"
                    alt="Etsy"
                    width={30}
                    height={12}
                    className="h-full w-auto object-contain filter brightness-0 invert opacity-70 group-hover:filter-none group-hover:opacity-100 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Small tablet - Show all 3 logos inline */}
              <div className="hidden sm:flex md:hidden items-center justify-center gap-6 max-w-sm mx-auto">
                <div className="flex items-center justify-center h-8 group cursor-pointer">
                  <Image
                    src="/assets/Amazon-Logo-500x281.png"
                    alt="Amazon"
                    width={50}
                    height={30}
                    className="h-full w-auto object-contain filter brightness-0 invert opacity-70 group-hover:filter-none group-hover:opacity-100 transition-all duration-300"
                  />
                </div>
                <div className="flex items-center justify-center h-8 group cursor-pointer">
                  <Image
                    src="/assets/EBay_logo.svg"
                    alt="eBay"
                    width={40}
                    height={16}
                    className="h-full w-auto object-contain filter brightness-0 invert opacity-70 group-hover:filter-none group-hover:opacity-100 transition-all duration-300"
                  />
                </div>
                <div className="flex items-center justify-center h-8 group cursor-pointer">
                  <Image
                    src="/assets/Etsy_logo.svg.png"
                    alt="Etsy"
                    width={40}
                    height={16}
                    className="h-full w-auto object-contain filter brightness-0 invert opacity-70 group-hover:filter-none group-hover:opacity-100 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        videoUrl={
          selectedTestimonialVideo ||
          "https://www.youtube.com/embed/dQw4w9WgXcQ"
        } // Use selected video or default
      />

      {/* Value Proposition Section - Interactive */}
      <section
        id="value-proposition"
        className="py-20 bg-gradient-to-b from-primary-black to-neutral-gray-900 text-white relative overflow-hidden transition-all duration-1000"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,195,0,0.05),transparent_40%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,195,0,0.03),transparent_40%)]"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Main Headline */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-extrabold leading-tight">
                <span className="text-primary-yellow">
                  The innovative platform
                </span>
                <br />
                <span className="text-white">that:</span>
              </h2>
            </div>

            {/* Interactive Value Props */}
            <div className="space-y-12">
              {/* Value Prop 1 - Search Ranking */}
              <div
                className="group cursor-pointer transform transition-all duration-500 hover:scale-[1.02]"
                onClick={() => {
                  document
                    .getElementById("dominate-competition")
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                }}
              >
                <div className="bg-gradient-to-r from-neutral-gray-800/50 to-neutral-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-neutral-gray-700/30 group-hover:border-primary-yellow/30 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-primary-yellow/10">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-yellow/10 rounded-xl flex items-center justify-center group-hover:bg-primary-yellow/20 transition-colors duration-300">
                      <svg
                        className="w-6 h-6 text-primary-yellow"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-primary-yellow transition-colors duration-300">
                        Helps your product be the first search result
                      </h3>
                      <p className="text-lg text-neutral-gray-300 leading-relaxed group-hover:text-white transition-colors duration-300">
                        So you can decrease your ad spend and convert more
                        customers
                      </p>
                      <div className="mt-4 flex items-center text-primary-yellow opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                        <span className="text-sm font-medium">Learn more</span>
                        <svg
                          className="w-4 h-4 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary-yellow/10 flex items-center justify-center group-hover:bg-primary-yellow group-hover:text-primary-black transition-all duration-300 transform group-hover:scale-110">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Value Prop 2 - Predictive Analytics */}
              <div
                className="group cursor-pointer transform transition-all duration-500 hover:scale-[1.02]"
                onClick={() => {
                  document
                    .getElementById("dominate-competition-even-more")
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                }}
              >
                <div className="bg-gradient-to-r from-neutral-gray-800/50 to-neutral-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-neutral-gray-700/30 group-hover:border-primary-yellow/30 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-primary-yellow/10">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-yellow/10 rounded-xl flex items-center justify-center group-hover:bg-primary-yellow/20 transition-colors duration-300">
                      <svg
                        className="w-6 h-6 text-primary-yellow"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-primary-yellow transition-colors duration-300">
                        Helps you know what sells before it sells
                      </h3>
                      <p className="text-lg text-neutral-gray-300 leading-relaxed group-hover:text-white transition-colors duration-300">
                        So you can save time and stop guessing
                      </p>
                      <div className="mt-4 flex items-center text-primary-yellow opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                        <span className="text-sm font-medium">
                          Discover insights
                        </span>
                        <svg
                          className="w-4 h-4 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary-yellow/10 flex items-center justify-center group-hover:bg-primary-yellow group-hover:text-primary-black transition-all duration-300 transform group-hover:scale-110">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Value Prop 3 - Unified Management */}
              <div
                className="group cursor-pointer transform transition-all duration-500 hover:scale-[1.02]"
                onClick={() => {
                  document
                    .getElementById("leave-competition-in-dust")
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                }}
              >
                <div className="bg-gradient-to-r from-neutral-gray-800/50 to-neutral-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-neutral-gray-700/30 group-hover:border-primary-yellow/30 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-primary-yellow/10">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-yellow/10 rounded-xl flex items-center justify-center group-hover:bg-primary-yellow/20 transition-colors duration-300">
                      <svg
                        className="w-6 h-6 text-primary-yellow"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-primary-yellow transition-colors duration-300">
                        Helps you manage your e-commerce orders on one platform
                      </h3>
                      <p className="text-lg text-neutral-gray-300 leading-relaxed group-hover:text-white transition-colors duration-300">
                        So you can stop juggling Amazon&apos;s, eBay&apos;s, and
                        other e-commerce dashboards and stay updated across
                        everything
                      </p>
                      <div className="mt-4 flex items-center text-primary-yellow opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                        <span className="text-sm font-medium">
                          See unified dashboard
                        </span>
                        <svg
                          className="w-4 h-4 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary-yellow/10 flex items-center justify-center group-hover:bg-primary-yellow group-hover:text-primary-black transition-all duration-300 transform group-hover:scale-110">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-16">
              <div className="inline-flex items-center gap-2 text-primary-yellow font-medium text-lg animate-pulse">
                <span>Scroll down to explore each benefit</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>

              {/* Strategic CTA after value props */}
              <div className="mt-8">
                <div className="relative group inline-block">
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 via-primary-yellow to-amber-500 rounded-full opacity-70 group-hover:opacity-100 blur group-hover:blur-md transition-all duration-500"></div>
                  <a
                    href="https://tally.so/r/m69ErJ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block"
                  >
                    <button className="relative bg-primary-yellow text-primary-black rounded-full px-8 py-3 text-base font-semibold hover:bg-primary-yellow/90 transition-all duration-300 hover:shadow-lg">
                      Start your free trial
                    </button>
                  </a>
                </div>
                <p className="text-neutral-gray-400 text-sm mt-2">
                  Early access! No credit card required
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Testimonials Section - Social Proof */}
      <section
        id="testimonials"
        className="py-20 bg-gradient-to-b from-neutral-gray-900 via-primary-black to-neutral-gray-900 text-white relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,195,0,0.03),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,195,0,0.02),transparent_40%)]"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-primary-yellow/10 backdrop-blur-sm border border-primary-yellow/20 rounded-full px-4 py-2 mb-6">
                <div className="w-2 h-2 bg-primary-yellow rounded-full animate-pulse"></div>
                <span className="text-primary-yellow text-sm font-medium">
                  REAL RESULTS
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                See How Sellers Are{" "}
                <span className="text-primary-yellow">Winning</span> With Tezra
              </h2>
              <p className="text-lg md:text-xl text-neutral-gray-300 max-w-3xl mx-auto leading-relaxed">
                Real sellers, real results. Watch how Tezra transformed their
                e-commerce businesses from struggling to thriving.
              </p>
            </div>

            {/* Video Testimonials Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {/* Testimonial 1 - Sarah's Story */}
              <div
                className="group cursor-pointer"
                onClick={() => handleTestimonialClick("sarah")}
              >
                <div className="bg-gradient-to-br from-neutral-gray-800/60 to-neutral-gray-900/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-neutral-gray-700/30 hover:border-primary-yellow/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-yellow/10 hover:scale-[1.02]">
                  {/* Video Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-blue-900/30 to-purple-900/30 overflow-hidden">
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors duration-300">
                      <div className="w-16 h-16 bg-primary-yellow rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <svg
                          className="w-6 h-6 text-primary-black ml-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>

                    {/* Video Duration */}
                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium">
                      2:45
                    </div>

                    {/* Seller Avatar - Positioned in corner */}
                    <div className="absolute top-3 left-3 w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      S
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-primary-yellow transition-colors duration-300">
                          Sarah Martinez
                        </h3>
                        <p className="text-sm text-neutral-gray-400">
                          Former Teacher → $12K/month
                        </p>
                      </div>
                      <div className="flex text-primary-yellow">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className="w-4 h-4 fill-current"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>

                    <blockquote className="text-neutral-gray-300 italic leading-relaxed text-sm mb-4">
                      &quot;Tezra&#39;s predictions helped me find a viral
                      product before anyone else. I went from $800/month to
                      $12,000/month in 4 months.&quot;
                    </blockquote>

                    <div className="flex items-center justify-between text-xs text-neutral-gray-400">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Amazon & eBay Seller
                      </span>
                      <span className="bg-primary-yellow/20 text-primary-yellow px-2 py-1 rounded-full font-medium">
                        1,400% Growth
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 - Mike's Story */}
              <div
                className="group cursor-pointer"
                onClick={() => handleTestimonialClick("mike")}
              >
                <div className="bg-gradient-to-br from-neutral-gray-800/60 to-neutral-gray-900/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-neutral-gray-700/30 hover:border-primary-yellow/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-yellow/10 hover:scale-[1.02]">
                  <div className="relative aspect-video bg-gradient-to-br from-green-900/30 to-blue-900/30 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors duration-300">
                      <div className="w-16 h-16 bg-primary-yellow rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <svg
                          className="w-6 h-6 text-primary-black ml-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium">
                      3:12
                    </div>

                    <div className="absolute top-3 left-3 w-12 h-12 bg-gradient-to-br from-blue-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      M
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-primary-yellow transition-colors duration-300">
                          Mike Chen
                        </h3>
                        <p className="text-sm text-neutral-gray-400">
                          College Student → $8K/month
                        </p>
                      </div>
                      <div className="flex text-primary-yellow">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className="w-4 h-4 fill-current"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>

                    <blockquote className="text-neutral-gray-300 italic leading-relaxed text-sm mb-4">
                      &quot;The unified dashboard saved me 20+ hours a week. Now
                      I can focus on scaling instead of managing
                      spreadsheets.&quot;
                    </blockquote>

                    <div className="flex items-center justify-between text-xs text-neutral-gray-400">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Multi-Platform Seller
                      </span>
                      <span className="bg-primary-yellow/20 text-primary-yellow px-2 py-1 rounded-full font-medium">
                        20hrs/week Saved
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 - Lisa's Story */}
              <div
                className="group cursor-pointer md:col-span-2 lg:col-span-1"
                onClick={() => handleTestimonialClick("lisa")}
              >
                <div className="bg-gradient-to-br from-neutral-gray-800/60 to-neutral-gray-900/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-neutral-gray-700/30 hover:border-primary-yellow/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-yellow/10 hover:scale-[1.02]">
                  <div className="relative aspect-video bg-gradient-to-br from-purple-900/30 to-pink-900/30 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors duration-300">
                      <div className="w-16 h-16 bg-primary-yellow rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <svg
                          className="w-6 h-6 text-primary-black ml-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium">
                      4:01
                    </div>

                    <div className="absolute top-3 left-3 w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      L
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-primary-yellow transition-colors duration-300">
                          Lisa Thompson
                        </h3>
                        <p className="text-sm text-neutral-gray-400">
                          Retiree → $5K/month Passive
                        </p>
                      </div>
                      <div className="flex text-primary-yellow">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className="w-4 h-4 fill-current"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>

                    <blockquote className="text-neutral-gray-300 italic leading-relaxed text-sm mb-4">
                      &quot;I started with crafts on Etsy. Tezra&#39;s
                      optimization got me to page 1 on Amazon. Now it runs
                      itself!&quot;
                    </blockquote>

                    <div className="flex items-center justify-between text-xs text-neutral-gray-400">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Etsy → Amazon Success
                      </span>
                      <span className="bg-primary-yellow/20 text-primary-yellow px-2 py-1 rounded-full font-medium">
                        Page 1 Rankings
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Aggregate Stats */}
            <div className="bg-gradient-to-r from-neutral-gray-800/50 to-neutral-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-neutral-gray-700/30">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-primary-yellow mb-2">
                    1
                  </div>
                  <div className="text-sm text-neutral-gray-400">
                    Successful Sellers
                  </div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-primary-yellow mb-2">
                    100%
                  </div>
                  <div className="text-sm text-neutral-gray-400">
                    Avg Revenue Increase
                  </div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-primary-yellow mb-2">
                    $2.5K
                  </div>
                  <div className="text-sm text-neutral-gray-400">
                    Additional Revenue Generated
                  </div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-primary-yellow mb-2">
                    1K+
                  </div>
                  <div className="text-sm text-neutral-gray-400">
                    Hours Saved Monthly
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-12">
              <p className="text-lg text-neutral-gray-300 mb-6">
                Ready to become our next success story?
              </p>
              <div className="relative group inline-block">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 via-primary-yellow to-amber-500 rounded-full opacity-70 group-hover:opacity-100 blur group-hover:blur-md transition-all duration-500"></div>
                <a
                  href="https://tally.so/r/m69ErJ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block"
                >
                  <button className="relative bg-primary-yellow text-primary-black rounded-full px-8 py-3.5 text-lg font-semibold hover:bg-primary-yellow/90 transition-all duration-300 hover:shadow-lg">
                    Join these winners today
                  </button>
                </a>
              </div>
              <p className="text-neutral-gray-400 text-sm mt-3">
                Start your transformation story now
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dominate The Competition Section */}
      <section
        id="dominate-competition"
        className="py-24 bg-primary-black text-white overflow-hidden transition-all duration-1000"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Title and Description */}
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-primary-yellow mb-5">
                Dominate The Competition
              </h2>
              <p className="text-lg md:text-xl max-w-3xl mx-auto font-light leading-relaxed text-neutral-gray-300">
                Tezra optimizes your listings based on your e-commerce platforms
                algorithm. Be the first result when searched, be featured on the
                home page, beat the competition by being the favorite.
              </p>
            </div>

            {/* Mobile Screenshot Showcase with glow effect */}
            <div className="relative mt-10">
              {/* Subtle glow behind the image */}
              <div className="absolute -inset-5 bg-primary-yellow/10 blur-3xl rounded-full opacity-30"></div>

              {/* Main image container */}
              <div className="relative">
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
            <div className="mt-8 text-center">
              <p className="text-xl md:text-2xl text-white max-w-4xl mx-auto leading-relaxed mb-2">
                Everyone sponsors their listings
              </p>
              <p className="text-xl md:text-2xl text-white max-w-4xl mx-auto leading-relaxed mb-4">
                Sponsored or not, the best listings win.
              </p>
              <p className="text-xl md:text-2xl font-bold text-white max-w-4xl mx-auto leading-relaxed mb-8">
                <span className="text-white">Ads get you clicks.</span>{" "}
                <span className="text-primary-yellow">
                  Optimization gets you sales.
                </span>
              </p>

              {/* Strategic CTA after dominate competition */}
              <div className="mt-8">
                <div className="relative group inline-block">
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 via-primary-yellow to-amber-500 rounded-full opacity-70 group-hover:opacity-100 blur group-hover:blur-md transition-all duration-500"></div>
                  <a
                    href="https://tally.so/r/m69ErJ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block"
                  >
                    <button className="relative bg-primary-yellow text-primary-black rounded-full px-8 py-3.5 text-lg font-semibold hover:bg-primary-yellow/90 transition-all duration-300 hover:shadow-lg">
                      Start optimizing for free
                    </button>
                  </a>
                </div>
                <p className="text-neutral-gray-400 text-sm mt-3">
                  Rank higher = sell more = more $$$
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dominate The Competition Even More Section */}
      <section
        id="dominate-competition-even-more"
        className="py-24 bg-gradient-to-b from-primary-black via-neutral-gray-900 to-primary-black text-white relative overflow-hidden transition-all duration-1000"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,195,0,0.03),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,195,0,0.05),transparent_40%)]"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-primary-yellow mb-6">
                Dominate The Competition Even More
              </h2>
              <p className="text-lg md:text-xl max-w-4xl mx-auto font-light leading-relaxed text-neutral-gray-300">
                Tezra&apos;s market analysis engine knows what sells before it
                starts selling so you have a competitive edge.
                <span className="block mt-2">
                  Focus on your customers and we&apos;ll focus on the market.
                </span>
              </p>
            </div>

            {/* Enhanced Product Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {/* Card 1 - Trending Tech Product */}
              <div className="group cursor-pointer">
                <div className="bg-gradient-to-br from-neutral-gray-800/80 to-neutral-gray-900/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-neutral-gray-700/50 hover:border-primary-yellow/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-yellow/10 hover:scale-[1.02]">
                  {/* Image Section with Overlays */}
                  <div className="relative aspect-[5/3] overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-600/20">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>

                    {/* Trend Indicator */}
                    <div className="absolute top-3 left-3 z-20">
                      <div className="bg-green-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        TRENDING
                      </div>
                    </div>

                    {/* Opportunity Score */}
                    <div className="absolute top-3 right-3 z-20">
                      <div className="bg-primary-yellow/90 backdrop-blur-sm text-primary-black px-2 py-1 rounded-lg font-bold text-sm">
                        97% Score
                      </div>
                    </div>

                    {/* Mock Product Image */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-40 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg shadow-lg flex items-center justify-center">
                        <div className="text-center text-gray-600">
                          <div className="w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-1 flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4 4 4 0 004-4V5z"
                              />
                            </svg>
                          </div>
                          <span className="text-xs font-medium">
                            Wireless Earbuds
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Market Prediction Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 z-20">
                      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-green-400 font-medium">
                            Predicted Growth
                          </span>
                          <span className="text-primary-yellow text-sm font-bold">
                            +284%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div className="bg-gradient-to-r from-green-500 to-primary-yellow h-1.5 rounded-full w-[85%] animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-white group-hover:text-primary-yellow transition-colors duration-300">
                        Premium Wireless Earbuds Pro
                      </h3>
                      <div className="flex items-center gap-1 text-primary-yellow">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className="w-3 h-3 fill-current"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                        Electronics
                      </span>
                      <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                        High Demand
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-gray-400">
                          Market Interest
                        </span>
                        <span className="text-green-400 font-medium text-sm">
                          ↑ 340% this month
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-gray-400">
                          Competition Level
                        </span>
                        <span className="text-yellow-400 font-medium text-sm">
                          Medium
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-gray-400">
                          Profit Margin
                        </span>
                        <span className="text-primary-yellow font-bold text-sm">
                          68%
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button className="flex-1 bg-primary-yellow text-primary-black font-bold py-2 px-3 rounded-xl hover:bg-primary-yellow/90 transition-all duration-300 group-hover:shadow-lg text-sm">
                        View Analysis
                      </button>
                      <button className="px-3 py-2 border border-primary-yellow/30 text-primary-yellow rounded-xl hover:bg-primary-yellow/10 transition-all duration-300 text-sm">
                        Track
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 - Fashion Product */}
              <div className="group cursor-pointer">
                <div className="bg-gradient-to-br from-neutral-gray-800/80 to-neutral-gray-900/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-neutral-gray-700/50 hover:border-primary-yellow/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-yellow/10 hover:scale-[1.02]">
                  <div className="relative aspect-[5/3] overflow-hidden bg-gradient-to-br from-pink-500/20 to-rose-600/20">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>

                    <div className="absolute top-3 left-3 z-20">
                      <div className="bg-purple-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        VIRAL
                      </div>
                    </div>

                    <div className="absolute top-3 right-3 z-20">
                      <div className="bg-primary-yellow/90 backdrop-blur-sm text-primary-black px-2 py-1 rounded-lg font-bold text-sm">
                        94% Score
                      </div>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-40 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg shadow-lg flex items-center justify-center">
                        <div className="text-center text-gray-600">
                          <div className="w-12 h-12 bg-pink-500 rounded-lg mx-auto mb-1 flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4 4 4 0 004-4V5z"
                              />
                            </svg>
                          </div>
                          <span className="text-xs font-medium">
                            Smart Watch
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 z-20">
                      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-green-400 font-medium">
                            Social Buzz
                          </span>
                          <span className="text-primary-yellow text-sm font-bold">
                            +412%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div className="bg-gradient-to-r from-purple-500 to-primary-yellow h-1.5 rounded-full w-[90%] animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-white group-hover:text-primary-yellow transition-colors duration-300">
                        Ultra-Slim Fitness Tracker
                      </h3>
                      <div className="flex items-center gap-1 text-primary-yellow">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className="w-3 h-3 fill-current"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded-full text-xs font-medium">
                        Wearables
                      </span>
                      <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs font-medium">
                        Viral
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-gray-400">
                          Market Interest
                        </span>
                        <span className="text-green-400 font-medium text-sm">
                          ↑ 412% this month
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-gray-400">
                          Competition Level
                        </span>
                        <span className="text-red-400 font-medium text-sm">
                          High
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-gray-400">
                          Profit Margin
                        </span>
                        <span className="text-primary-yellow font-bold text-sm">
                          45%
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button className="flex-1 bg-primary-yellow text-primary-black font-bold py-2 px-3 rounded-xl hover:bg-primary-yellow/90 transition-all duration-300 group-hover:shadow-lg text-sm">
                        View Analysis
                      </button>
                      <button className="px-3 py-2 border border-primary-yellow/30 text-primary-yellow rounded-xl hover:bg-primary-yellow/10 transition-all duration-300 text-sm">
                        Track
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Message */}
            <div className="text-center">
              <p className="text-xl md:text-2xl text-white max-w-4xl mx-auto leading-relaxed mb-4">
                Winning isn&apos;t about luck; it&apos;s about spotting signals
                first. Tezra runs 24/7 to find what&apos;s next before the rest.
              </p>
              <p className="text-xl md:text-2xl font-bold">
                <span className="text-white">Don&apos;t chase trends.</span>{" "}
                <span className="text-primary-yellow">Predict them.</span>
              </p>

              {/* Strategic CTA after prediction section */}
              <div className="mt-8">
                <div className="relative group inline-block">
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 via-primary-yellow to-amber-500 rounded-full opacity-70 group-hover:opacity-100 blur group-hover:blur-md transition-all duration-500"></div>
                  <a
                    href="https://tally.so/r/m69ErJ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block"
                  >
                    <button className="relative bg-primary-yellow text-primary-black rounded-full px-8 py-3.5 text-lg font-semibold hover:bg-primary-yellow/90 transition-all duration-300 hover:shadow-lg">
                      Predict the next bestseller
                    </button>
                  </a>
                </div>
                <p className="text-neutral-gray-400 text-sm mt-3">
                  Get early access to market predictions
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leave The Competition In The Dust Section */}
      <section
        id="leave-competition-in-dust"
        className="py-20 bg-gradient-to-b from-primary-black via-neutral-gray-900 to-primary-black text-white relative overflow-hidden transition-all duration-1000"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,195,0,0.04),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,195,0,0.02),transparent_40%)]"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-primary-yellow mb-6">
                Leave The Competition In The Dust
              </h2>
              <p className="text-lg md:text-xl max-w-4xl mx-auto font-light leading-relaxed text-neutral-gray-300">
                Tezra allows you to easily manage orders and inventory across
                multiple e-commerce channels so you can automate and streamline
                processes.
                <span className="block mt-2">
                  Get insightful analytics across channels so you can make
                  smarter decisions.
                </span>
              </p>
            </div>

            {/* Interactive Dashboard Demo */}
            <div className="bg-gradient-to-br from-neutral-gray-800/80 to-neutral-gray-900/80 backdrop-blur-sm rounded-2xl border border-neutral-gray-700/50 p-4 md:p-6 shadow-2xl">
              {/* Dashboard Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-4 border-b border-neutral-gray-700/50">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    Unified E-commerce Dashboard
                  </h3>
                  <p className="text-sm text-neutral-gray-400">
                    Real-time insights across all your platforms
                  </p>
                </div>

                {/* Platform Indicators */}
                <div className="flex items-center gap-2 mt-3 md:mt-0">
                  <div className="flex items-center gap-1.5 bg-neutral-gray-800/80 px-2.5 py-1.5 rounded-lg border border-neutral-gray-600/30">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-white">
                      Amazon
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-neutral-gray-800/80 px-2.5 py-1.5 rounded-lg border border-neutral-gray-600/30">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-white">eBay</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-neutral-gray-800/80 px-2.5 py-1.5 rounded-lg border border-neutral-gray-600/30">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-white">Etsy</span>
                  </div>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                <div className="bg-gradient-to-br from-neutral-gray-700/50 to-neutral-gray-800/50 rounded-lg p-3 border border-neutral-gray-600/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-neutral-gray-400 uppercase tracking-wide">
                      Revenue
                    </span>
                    <svg
                      className="w-3 h-3 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <div className="text-lg md:text-xl font-bold text-white mb-0.5">
                    $24,847
                  </div>
                  <div className="text-xs text-green-400 font-medium">
                    ↑ 12.3%
                  </div>
                </div>

                <div className="bg-gradient-to-br from-neutral-gray-700/50 to-neutral-gray-800/50 rounded-lg p-3 border border-neutral-gray-600/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-neutral-gray-400 uppercase tracking-wide">
                      Orders
                    </span>
                    <svg
                      className="w-3 h-3 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <div className="text-lg md:text-xl font-bold text-white mb-0.5">
                    1,247
                  </div>
                  <div className="text-xs text-green-400 font-medium">
                    ↑ 8.1%
                  </div>
                </div>

                <div className="bg-gradient-to-br from-neutral-gray-700/50 to-neutral-gray-800/50 rounded-lg p-3 border border-neutral-gray-600/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-neutral-gray-400 uppercase tracking-wide">
                      Margin
                    </span>
                    <svg
                      className="w-3 h-3 text-primary-yellow"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div className="text-lg md:text-xl font-bold text-white mb-0.5">
                    34.2%
                  </div>
                  <div className="text-xs text-green-400 font-medium">
                    ↑ 2.1%
                  </div>
                </div>

                <div className="bg-gradient-to-br from-neutral-gray-700/50 to-neutral-gray-800/50 rounded-lg p-3 border border-neutral-gray-600/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-neutral-gray-400 uppercase tracking-wide">
                      Stock
                    </span>
                    <svg
                      className="w-3 h-3 text-purple-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <div className="text-lg md:text-xl font-bold text-white mb-0.5">
                    847
                  </div>
                  <div className="text-xs text-yellow-400 font-medium">
                    23 alerts
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6">
                {/* Revenue Chart */}
                <div className="bg-gradient-to-br from-neutral-gray-700/30 to-neutral-gray-800/30 rounded-lg p-4 border border-neutral-gray-600/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base font-semibold text-white">
                      Revenue Trends
                    </h4>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-primary-yellow rounded-full"></div>
                      <span className="text-xs text-neutral-gray-400">
                        30 days
                      </span>
                    </div>
                  </div>
                  <div className="h-24 md:h-32 w-full">
                    <svg
                      className="w-full h-full"
                      viewBox="0 0 280 80"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <defs>
                        <linearGradient
                          id="revenueGradient"
                          x1="0%"
                          y1="0%"
                          x2="0%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            stopColor="#FFC300"
                            stopOpacity="0.3"
                          />
                          <stop
                            offset="100%"
                            stopColor="#FFC300"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>
                      <path
                        d="M10,60 L35,50 L60,55 L85,40 L110,35 L135,25 L160,30 L185,18 L210,15 L235,10 L260,8"
                        fill="none"
                        stroke="#FFC300"
                        strokeWidth="2"
                        className="drop-shadow-sm"
                      />
                      <path
                        d="M10,60 L35,50 L60,55 L85,40 L110,35 L135,25 L160,30 L185,18 L210,15 L235,10 L260,8 L260,80 L10,80 Z"
                        fill="url(#revenueGradient)"
                      />
                      {/* Data points */}
                      <circle cx="35" cy="50" r="1.5" fill="#FFC300" />
                      <circle cx="85" cy="40" r="1.5" fill="#FFC300" />
                      <circle cx="135" cy="25" r="1.5" fill="#FFC300" />
                      <circle cx="185" cy="18" r="1.5" fill="#FFC300" />
                      <circle cx="235" cy="10" r="1.5" fill="#FFC300" />
                      <circle cx="260" cy="8" r="1.5" fill="#FFC300" />
                    </svg>
                  </div>
                </div>

                {/* Platform Distribution */}
                <div className="bg-gradient-to-br from-neutral-gray-700/30 to-neutral-gray-800/30 rounded-lg p-4 border border-neutral-gray-600/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base font-semibold text-white">
                      Platform Split
                    </h4>
                    <span className="text-xs text-neutral-gray-400">
                      This month
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-white font-medium">
                          Amazon
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-neutral-gray-700 rounded-full overflow-hidden">
                          <div className="w-[60%] h-full bg-blue-500 rounded-full"></div>
                        </div>
                        <span className="text-sm text-white font-medium w-8">
                          60%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-white font-medium">
                          eBay
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-neutral-gray-700 rounded-full overflow-hidden">
                          <div className="w-[25%] h-full bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm text-white font-medium w-8">
                          25%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm text-white font-medium">
                          Etsy
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-neutral-gray-700 rounded-full overflow-hidden">
                          <div className="w-[15%] h-full bg-orange-500 rounded-full"></div>
                        </div>
                        <span className="text-sm text-white font-medium w-8">
                          15%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Stream */}
              <div className="bg-gradient-to-br from-neutral-gray-700/30 to-neutral-gray-800/30 rounded-lg p-4 border border-neutral-gray-600/20">
                <h4 className="text-base font-semibold text-white mb-3">
                  Live Activity
                </h4>
                <div className="space-y-2 max-h-28 overflow-y-auto">
                  <div className="flex items-center gap-2.5 p-2.5 bg-neutral-gray-800/50 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-medium">
                          New order #1247
                        </span>
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                          Amazon
                        </span>
                      </div>
                      <p className="text-xs text-neutral-gray-400 truncate">
                        Premium Wireless Earbuds - $89.99
                      </p>
                    </div>
                    <span className="text-xs text-neutral-gray-500">2m</span>
                  </div>

                  <div className="flex items-center gap-2.5 p-2.5 bg-neutral-gray-800/50 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-medium">
                          Low stock alert
                        </span>
                        <span className="text-xs bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded">
                          eBay
                        </span>
                      </div>
                      <p className="text-xs text-neutral-gray-400 truncate">
                        Fitness Tracker - Only 5 left
                      </p>
                    </div>
                    <span className="text-xs text-neutral-gray-500">5m</span>
                  </div>

                  <div className="flex items-center gap-2.5 p-2.5 bg-neutral-gray-800/50 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-primary-yellow rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-medium">
                          Price optimized
                        </span>
                        <span className="text-xs bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded">
                          Etsy
                        </span>
                      </div>
                      <p className="text-xs text-neutral-gray-400 truncate">
                        Smart Watch → $124.99
                      </p>
                    </div>
                    <span className="text-xs text-neutral-gray-500">8m</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Message */}
            <div className="text-center mt-12">
              <p className="text-lg md:text-xl font-medium text-white max-w-3xl mx-auto leading-relaxed mb-3">
                Stay ahead of orders, inventory, and your competition – all in
                one live dashboard.
              </p>
              <p className="text-lg md:text-xl font-bold">
                <span className="text-white">E-commerce moves fast.</span>{" "}
                <span className="text-primary-yellow">So does Tezra.</span>
              </p>

              {/* Strategic CTA after dashboard section */}
              <div className="mt-8">
                <div className="relative group inline-block">
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 via-primary-yellow to-amber-500 rounded-full opacity-70 group-hover:opacity-100 blur group-hover:blur-md transition-all duration-500"></div>
                  <a
                    href="https://tally.so/r/m69ErJ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block"
                  >
                    <button className="relative bg-primary-yellow text-primary-black rounded-full px-8 py-3.5 text-lg font-semibold hover:bg-primary-yellow/90 transition-all duration-300 hover:shadow-lg">
                      Get your unified dashboard
                    </button>
                  </a>
                </div>
                <p className="text-neutral-gray-400 text-sm mt-3">
                  Connect all your platforms in minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Choose Tezra Section (BentoGrid) */}
      <BentoGrid />

      {/* Final CTA Section - Above Footer */}
      <section className="py-20 bg-gradient-to-r from-primary-black via-neutral-gray-900 to-primary-black text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,195,0,0.05),transparent_60%)]"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              Ready to <span className="text-primary-yellow">dominate</span>{" "}
              your competition?
            </h2>
            <p className="text-lg md:text-xl text-neutral-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              {
                "Join the sellers who are already selling more and working less with Tezra's AI-powered platform."
              }
            </p>

            {/* Main CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 via-primary-yellow to-amber-500 rounded-full opacity-70 group-hover:opacity-100 blur group-hover:blur-md transition-all duration-500"></div>
                <a
                  href="https://tally.so/r/m69ErJ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block"
                >
                  <button className="relative bg-primary-yellow text-primary-black rounded-full px-10 py-4 text-lg font-bold hover:bg-primary-yellow/90 transition-all duration-300 hover:shadow-lg">
                    Try Tezra for free
                  </button>
                </a>
              </div>

              <div className="flex items-center text-neutral-gray-400 text-sm">
                <svg
                  className="w-4 h-4 mr-2 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                No credit card required
              </div>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-neutral-gray-400">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-primary-yellow"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Discounted pricing for release
              </div>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-primary-yellow"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                In person/online onboarding in 5 minutes
              </div>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-primary-yellow"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Help build a next-gen ecommerce platform
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-black py-16 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,195,0,0.03),transparent_50%)]"></div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Main Footer Content */}
          <div className="max-w-4xl mx-auto">
            {/* Top Section - Brand and Social */}
            <div className="text-center mb-12">
              {/* Logo and Brand */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-12 h-12 bg-primary-yellow rounded-full flex items-center justify-center mr-3 group hover:scale-110 transition-transform duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 576 512"
                    fill="currentColor"
                    className="w-6 h-6 text-primary-black"
                  >
                    <path d="M384 160c-17.7 0-32-14.3-32-32s14.3-32 32-32H544c17.7 0 32 14.3 32 32V288c0 17.7-14.3 32-32 32s-32-14.3-32-32V205.3L342.6 374.6c-12.5 12.5-32.8 12.5-45.3 0L192 269.3 54.6 406.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160c12.5-12.5 32.8-12.5 45.3 0L320 306.7 466.7 160H384z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">Tezra</h3>
              </div>

              <p className="text-neutral-gray-400 text-lg max-w-md mx-auto leading-relaxed">
                The AI-powered platform that automates and grows your e-commerce
                business
              </p>
            </div>

            {/* Navigation Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
              {/* Product Pills */}
              <div className="bg-neutral-gray-800/50 backdrop-blur-sm rounded-full px-6 py-3 border border-neutral-gray-700/30 hover:border-primary-yellow/30 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <Link
                    href="#features"
                    className="text-neutral-gray-300 hover:text-primary-yellow transition-colors text-sm font-medium"
                  >
                    Features
                  </Link>
                  <div className="w-px h-4 bg-neutral-gray-600"></div>
                  <Link
                    href="/pricing"
                    className="text-neutral-gray-300 hover:text-primary-yellow transition-colors text-sm font-medium"
                  >
                    Pricing
                  </Link>
                </div>
              </div>

              {/* Company Pills */}
              <div className="bg-neutral-gray-800/50 backdrop-blur-sm rounded-full px-6 py-3 border border-neutral-gray-700/30 hover:border-primary-yellow/30 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <Link
                    href="/about"
                    className="text-neutral-gray-300 hover:text-primary-yellow transition-colors text-sm font-medium"
                  >
                    About
                  </Link>
                  <div className="w-px h-4 bg-neutral-gray-600"></div>
                  <Link
                    href="/contact"
                    className="text-neutral-gray-300 hover:text-primary-yellow transition-colors text-sm font-medium"
                  >
                    Contact
                  </Link>
                </div>
              </div>

              {/* Legal Pills */}
              <div className="bg-neutral-gray-800/50 backdrop-blur-sm rounded-full px-6 py-3 border border-neutral-gray-700/30 hover:border-primary-yellow/30 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <Link
                    href="/terms"
                    className="text-neutral-gray-300 hover:text-primary-yellow transition-colors text-sm font-medium"
                  >
                    Terms
                  </Link>
                  <div className="w-px h-4 bg-neutral-gray-600"></div>
                  <Link
                    href="/privacy"
                    className="text-neutral-gray-300 hover:text-primary-yellow transition-colors text-sm font-medium"
                  >
                    Privacy
                  </Link>
                </div>
              </div>
            </div>

            {/* Call to Action Section */}
            <div className="text-center mb-12">
              <h4 className="text-xl font-bold text-white mb-4">
                Ready to sell more and work less?
              </h4>
              <div className="relative group inline-block">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 via-primary-yellow to-amber-500 rounded-full opacity-70 group-hover:opacity-100 blur group-hover:blur-md transition-all duration-500"></div>
                <a
                  href="https://tally.so/r/m69ErJ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block"
                >
                  <button className="relative bg-primary-yellow text-primary-black rounded-full px-8 py-3 text-base font-semibold hover:bg-primary-yellow/90 transition-all duration-300 hover:shadow-lg">
                    Start for free today!
                  </button>
                </a>
              </div>
            </div>

            {/* Platform Badges */}
            <div className="flex items-center justify-center gap-6 mb-12">
              <div className="text-center">
                <p className="text-neutral-gray-500 text-sm mb-3">
                  Will support all major platforms
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-8 group cursor-pointer">
                    <Image
                      src="/assets/Amazon-Logo-500x281.png"
                      alt="Amazon"
                      width={48}
                      height={24}
                      className="h-full w-auto object-contain filter brightness-0 invert opacity-50 group-hover:opacity-80 transition-all duration-300"
                    />
                  </div>
                  <div className="flex items-center justify-center h-8 group cursor-pointer">
                    <Image
                      src="/assets/EBay_logo.svg"
                      alt="eBay"
                      width={40}
                      height={16}
                      className="h-full w-auto object-contain filter brightness-0 invert opacity-50 group-hover:opacity-80 transition-all duration-300"
                    />
                  </div>
                  <div className="flex items-center justify-center h-8 group cursor-pointer">
                    <Image
                      src="/assets/Etsy_logo.svg.png"
                      alt="Etsy"
                      width={40}
                      height={16}
                      className="h-full w-auto object-contain filter brightness-0 invert opacity-50 group-hover:opacity-80 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-neutral-gray-800 pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-neutral-gray-500 text-sm">
                  &copy; {new Date().getFullYear()} Tezra. All rights reserved.
                </p>

                {/* Social Links */}
                <div className="flex items-center gap-4">
                  <a
                    href="#"
                    className="w-8 h-8 bg-neutral-gray-800/50 rounded-full flex items-center justify-center text-neutral-gray-400 hover:text-primary-yellow hover:bg-primary-yellow/10 transition-all duration-300"
                    aria-label="Twitter"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-8 h-8 bg-neutral-gray-800/50 rounded-full flex items-center justify-center text-neutral-gray-400 hover:text-primary-yellow hover:bg-primary-yellow/10 transition-all duration-300"
                    aria-label="LinkedIn"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-8 h-8 bg-neutral-gray-800/50 rounded-full flex items-center justify-center text-neutral-gray-400 hover:text-primary-yellow hover:bg-primary-yellow/10 transition-all duration-300"
                    aria-label="YouTube"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
