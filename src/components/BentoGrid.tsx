"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const features = [
  {
    title: "Unified Inventory Management",
    description: "Seamlessly manage your inventory across multiple platforms with real-time synchronization. Never worry about overselling or stock discrepancies again.",
    img: "/assets/inventory-dashboard.png",
    icon: "📦"
  },
  {
    title: "Smart Analytics Dashboard",
    description: "Track your profits, sales velocity, and market trends with our intuitive analytics. Make data-driven decisions with confidence.",
    img: "/assets/analytics-dashboard.png",
    icon: "📊"
  },
  {
    title: "AI-Powered Sales Predictions",
    description: "Leverage machine learning to forecast sales trends and optimize your pricing strategy. Stay ahead of market changes.",
    img: "/assets/predictions-graph.png",
    icon: "🎯"
  },
  {
    title: "Competitive Intelligence",
    description: "Get real-time insights into market opportunities and competitor strategies. Identify high-potential products before they trend.",
    img: "/assets/market-insights.png",
    icon: "🔍"
  },
];

const automateTexts = [
  "Everything",
  "Sourcing",
  "Listing",
];
const automateImages = [
  "/assets/automation-dashboard.png",
  "/assets/sourcing-tools.png",
  "/assets/listing-tools.png",
];

function useTypewriter(words: string[] ) {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const currentWord = words[index];
    const typingSpeed = 100; // Speed for typing
    const deletingSpeed = 50; // Speed for deleting
    const pauseTime = 1000; // Time to pause at full word

    if (isTyping && !isDeleting) {
      if (displayed.length < currentWord.length) {
        const timeout = setTimeout(() => {
          setDisplayed(currentWord.slice(0, displayed.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseTime);
        return () => clearTimeout(timeout);
      }
    }

    if (isDeleting) {
      if (displayed.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayed(displayed.slice(0, -1));
        }, deletingSpeed);
        return () => clearTimeout(timeout);
      } else {
        setIsDeleting(false);
        setIndex((i) => (i + 1) % words.length);
        setIsTyping(true);
      }
    }
  }, [displayed, index, isDeleting, isTyping, words]);

  return [displayed, index] as const;
}

const BentoCard = ({ className, children, index }: { className?: string; children: React.ReactNode; index: number }) => (
  <motion.div
    className={`bg-[#18181B] rounded-3xl p-8 shadow-xl border border-neutral-gray-200/10 backdrop-blur-sm ${className}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ 
      duration: 0.5,
      delay: index * 0.1,
      ease: "easeOut"
    }}
    whileHover={{ 
      scale: 1.02, 
      backgroundColor: "#222222",
      boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
      transition: { duration: 0.3 } 
    }}
  >
    {children}
  </motion.div>
);

export default function BentoGrid() {
  const [autoText, autoIdx] = useTypewriter(automateTexts);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("choose-tezra");
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <motion.section 
      className="w-full max-w-7xl mx-auto px-4 py-20" 
      id="choose-tezra"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.h2 
        className="text-4xl md:text-5xl font-extrabold text-primary-yellow mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Choose Tezra.
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-auto">
        {/* Top wide card */}
        <BentoCard className="md:col-span-2 h-72 flex flex-col justify-between" index={0}>
          <div>
            <motion.div 
              className="flex items-center gap-3 mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span className="text-3xl">{features[0].icon}</span>
              <h3 className="text-2xl font-bold text-white">{features[0].title}</h3>
            </motion.div>
            <motion.p 
              className="text-neutral-gray-400 font-medium mb-6 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {features[0].description}
            </motion.p>
          </div>
          <motion.div 
            className="flex justify-end"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Image src={features[0].img} alt="Inventory" width={180} height={90} className="rounded-xl object-cover w-44 h-24 shadow-lg" />
          </motion.div>
        </BentoCard>

        {/* Tall right card: Automate Everything with type effect */}
        <BentoCard className="md:row-span-3 h-full min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-[#18181B] to-[#222222]" index={1}>
          <div className="w-full flex flex-col items-center">
            <motion.h3 
              className="text-2xl md:text-3xl font-extrabold text-white mb-4 h-16 flex items-center justify-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span className="text-primary-yellow">Automate</span>
              <span className="text-white ml-2 min-w-[120px] inline-block">
                {autoText}
                <span className="animate-pulse">|</span>
              </span>
            </motion.h3>
            <motion.p 
              className="text-neutral-gray-400 font-medium mb-6 text-center max-w-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Save hours every week with our intelligent automation tools.
            </motion.p>
            <motion.div 
              className="w-full flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Image 
                src={automateImages[autoIdx]} 
                alt="Automation" 
                width={280} 
                height={220} 
                className="rounded-xl object-contain border border-neutral-gray-700 bg-neutral-gray-900/50 p-4 transition-all duration-500 hover:scale-105" 
              />
            </motion.div>
          </div>
        </BentoCard>

        {/* Middle left card */}
        <BentoCard className="h-72 flex flex-col justify-between" index={2}>
          <div>
            <motion.div 
              className="flex items-center gap-3 mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span className="text-3xl">{features[1].icon}</span>
              <h3 className="text-xl font-bold text-white">{features[1].title}</h3>
            </motion.div>
            <motion.p 
              className="text-neutral-gray-400 font-medium mb-6 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {features[1].description}
            </motion.p>
          </div>
          <motion.div 
            className="flex justify-end"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Image src={features[1].img} alt="Analytics" width={140} height={70} className="rounded-xl object-cover w-36 h-20 shadow-lg" />
          </motion.div>
        </BentoCard>

        {/* Middle right card */}
        <BentoCard className="h-72 flex flex-col justify-between" index={3}>
          <div>
            <motion.div 
              className="flex items-center gap-3 mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span className="text-3xl">{features[2].icon}</span>
              <h3 className="text-xl font-bold text-white">{features[2].title}</h3>
            </motion.div>
            <motion.p 
              className="text-neutral-gray-400 font-medium mb-6 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {features[2].description}
            </motion.p>
          </div>
          <motion.div 
            className="flex justify-end"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Image src={features[2].img} alt="Graph" width={140} height={70} className="rounded-xl object-cover w-36 h-20 shadow-lg" />
          </motion.div>
        </BentoCard>

        {/* Bottom wide card */}
        <BentoCard className="md:col-span-2 h-72 flex flex-col justify-between" index={4}>
          <div>
            <motion.div 
              className="flex items-center gap-3 mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span className="text-3xl">{features[3].icon}</span>
              <h3 className="text-xl font-bold text-white">{features[3].title}</h3>
            </motion.div>
            <motion.p 
              className="text-neutral-gray-400 font-medium mb-6 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {features[3].description}
            </motion.p>
          </div>
          <motion.div 
            className="flex justify-end"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Image src={features[3].img} alt="Product Scores" width={180} height={90} className="rounded-xl object-cover w-44 h-24 shadow-lg" />
          </motion.div>
        </BentoCard>
      </div>
    </motion.section>
  );
} 