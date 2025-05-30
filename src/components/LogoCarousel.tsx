"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const logos = [
  {
    src: "/assets/Amazon-Logo-500x281.png",
    alt: "Amazon",
    width: 70,
    height: 40,
  },
  {
    src: "/assets/EBay_logo.svg",
    alt: "eBay", 
    width: 60,
    height: 24,
  },
  {
    src: "/assets/Etsy_logo.svg.png",
    alt: "Etsy",
    width: 60,
    height: 24,
  },
];

export default function LogoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % logos.length);
    }, 2000); // Change logo every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const currentLogo = logos[currentIndex];

  return (
    <div className="flex items-center justify-center h-10">
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {logos.map((logo, index) => (
            <div 
              key={logo.alt}
              className="flex items-center justify-center min-w-full h-10"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                className="h-full w-auto object-contain filter brightness-0 invert opacity-70"
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Dots indicator */}
      <div className="flex space-x-1 ml-4">
        {logos.map((_, index) => (
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-primary-yellow' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
} 