"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";

// Define the actual sections that exist on the page
const sections = [
  { name: "Platform", href: "#value-proposition", description: "AI-powered features" },
  { name: "Success Stories", href: "#testimonials", description: "Real customer results" },
  { name: "Optimization", href: "#dominate-competition", description: "Rank higher & sell more" },
  { name: "Predictions", href: "#dominate-competition-even-more", description: "Market intelligence" },
  { name: "Dashboard", href: "#leave-competition-in-dust", description: "Unified management" },
  { name: "Features", href: "#choose-tezra", description: "Complete feature set" },
];

// Enhanced animation variants with faster, smoother motion
const navVariants = {
  hidden: { y: -100, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 30, 
      mass: 0.8
    }
  }
};

const dropdownVariants = {
  hidden: { opacity: 0, y: -15, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 25, 
      mass: 0.5
    }
  },
  exit: { 
    opacity: 0, 
    y: -15, 
    scale: 0.95,
    transition: { 
      duration: 0.15, 
      ease: "easeInOut" 
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({ 
    opacity: 1, 
    x: 0,
    transition: { 
      delay: i * 0.03, 
      type: "spring", 
      stiffness: 500, 
      damping: 25
    }
  })
};

const hoverVariants = {
  rest: { scale: 1, x: 0 },
  hover: { 
    scale: 1.02, 
    x: 3,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 25
    }
  },
  tap: { 
    scale: 0.98,
    transition: { 
      type: "spring", 
      stiffness: 500, 
      damping: 30
    }
  }
};

const buttonVariants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 25
    }
  },
  tap: { 
    scale: 0.95,
    transition: { 
      type: "spring", 
      stiffness: 500, 
      damping: 30
    }
  }
};

export default function Navbar() {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle scroll to detect active section and navbar background
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setScrolled(scrollTop > 50);

      // Find the section that is currently in view with better detection
      let currentSection: string | null = null;
      
      for (const section of sections) {
        const element = document.querySelector(section.href);
        if (element) {
          const { top, bottom } = element.getBoundingClientRect();
          // More precise detection - section is active if it occupies significant viewport
          if (top <= window.innerHeight / 3 && bottom >= window.innerHeight / 3) {
            currentSection = section.href;
            break;
          }
        }
      }
      
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Enhanced dropdown handlers with better timing and focus management
  const handleMouseEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
    }
    setSectionsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => {
      setSectionsOpen(false);
      setFocusedIndex(-1);
    }, 200);
  };

  // Enhanced keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!sectionsOpen) return;

    switch (e.key) {
      case "Escape":
        setSectionsOpen(false);
        setFocusedIndex(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % sections.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex(prev => prev <= 0 ? sections.length - 1 : prev - 1);
        break;
      case "Enter":
      case " ":
        if (focusedIndex >= 0) {
          e.preventDefault();
          scrollToSection(sections[focusedIndex].href);
        }
        break;
    }
  };

  // Improved scroll function with offset for fixed navbar
  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId) as HTMLElement;
    if (element) {
      const offsetTop = element.offsetTop - 100; // Account for fixed navbar
      window.scrollTo({
        top: offsetTop,
        behavior: shouldReduceMotion ? "auto" : "smooth"
      });
    }
    setSectionsOpen(false);
    setFocusedIndex(-1);
    if (isMobile) setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSectionsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (href: string) => activeSection === href;

  return (
    <>
      {/* Desktop Navbar */}
      <motion.nav
        className={`fixed top-4 right-4 z-50 hidden md:flex items-center rounded-2xl shadow-lg px-6 py-3 border transition-all duration-300 ${
          scrolled 
            ? "bg-primary-black/95 backdrop-blur-lg border-neutral-gray-700/50" 
            : "bg-primary-black/80 backdrop-blur-sm border-neutral-gray-800/30"
        }`}
        variants={navVariants}
        initial="hidden"
        animate="visible"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center mr-8 group">
          <motion.div 
            className="flex items-center"
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            <div className="relative h-8 w-auto group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/assets/tezralogo.png"
                alt="Tezra Logo"
                width={80}
                height={32}
                className="h-8 w-auto object-contain"
                priority
              />
            </div>
          </motion.div>
        </Link>

        {/* Enhanced Features Dropdown */}
        <div
          className="relative mr-6"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onKeyDown={handleKeyDown}
          ref={dropdownRef}
        >
          <motion.button
            className="flex items-center px-4 py-2.5 text-neutral-gray-300 hover:text-white rounded-xl hover:bg-neutral-gray-800/50 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 focus:ring-offset-2 focus:ring-offset-primary-black"
            onClick={() => setSectionsOpen(!sectionsOpen)}
            variants={hoverVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            aria-haspopup="true"
            aria-expanded={sectionsOpen}
            aria-controls="features-menu"
            aria-label="Features menu"
          >
            <span className="font-medium">Features</span>
            <motion.div
              animate={{ rotate: sectionsOpen ? 180 : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="ml-2"
            >
              <ChevronDown className="h-4 w-4 group-hover:text-primary-yellow transition-colors duration-300" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {sectionsOpen && (
              <motion.div
                id="features-menu"
                role="menu"
                className="absolute left-0 mt-3 w-80 bg-primary-black/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-neutral-gray-700/50 overflow-hidden"
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="p-2">
                  {sections.map((section, index) => (
                    <motion.button
                      key={section.name}
                      role="menuitem"
                      className={`flex items-center justify-between w-full p-4 rounded-xl transition-all duration-200 group text-left focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 ${
                        isActive(section.href)
                          ? "bg-primary-yellow/15 border border-primary-yellow/20"
                          : focusedIndex === index
                          ? "bg-neutral-gray-800/70 border border-neutral-gray-600/50"
                          : "hover:bg-neutral-gray-800/50 border border-transparent"
                      }`}
                      onClick={() => scrollToSection(section.href)}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      custom={index}
                      whileHover="hover"
                      whileTap="tap"
                      tabIndex={sectionsOpen ? 0 : -1}
                      aria-label={`Navigate to ${section.name}: ${section.description}`}
                    >
                      <div className="flex-1">
                        <div className={`font-semibold transition-colors duration-200 ${
                          isActive(section.href) ? "text-primary-yellow" : "text-white group-hover:text-primary-yellow"
                        }`}>
                          {section.name}
                        </div>
                        <div className="text-xs text-neutral-gray-400 mt-0.5 group-hover:text-neutral-gray-300 transition-colors duration-200">
                          {section.description}
                        </div>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ 
                          opacity: isActive(section.href) || focusedIndex === index ? 1 : 0,
                          x: isActive(section.href) || focusedIndex === index ? 0 : -5
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <ArrowRight className={`h-4 w-4 ${
                          isActive(section.href) ? "text-primary-yellow" : "text-primary-yellow"
                        }`} />
                      </motion.div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pricing Link */}
        <Link href="/pricing" className="mr-6">
          <motion.button
            className="px-4 py-2.5 text-neutral-gray-300 hover:text-white rounded-xl hover:bg-neutral-gray-800/50 transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 focus:ring-offset-2 focus:ring-offset-primary-black"
            variants={hoverVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            Pricing
          </motion.button>
        </Link>

        {/* CTA Button */}
        <motion.div 
          className="relative group mr-4"
          variants={buttonVariants}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-yellow to-amber-400 rounded-xl opacity-75 group-hover:opacity-100 blur-sm transition-all duration-300"></div>
          <a 
            href="https://tally.so/r/m69ErJ" 
            target="_blank" 
            rel="noopener noreferrer"
            className="relative block focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2 focus:ring-offset-primary-black rounded-xl"
            aria-label="Start free trial (opens in new tab)"
          >
            <button className="relative bg-primary-yellow text-primary-black rounded-xl px-6 py-2.5 text-sm font-bold hover:bg-amber-400 transition-all duration-300 shadow-lg">
              Try Free
            </button>
          </a>
        </motion.div>

        {/* Login Button */}
        <Link href="/login">
          <motion.button
            className="px-4 py-2.5 text-neutral-gray-300 hover:text-white border border-neutral-gray-600 hover:border-neutral-gray-500 rounded-xl transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 focus:ring-offset-2 focus:ring-offset-primary-black"
            variants={hoverVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            Login
          </motion.button>
        </Link>
      </motion.nav>

      {/* Mobile Navigation - Centered and Properly Scaled */}
      <motion.nav
        className={`md:hidden fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center rounded-2xl shadow-lg px-3 py-2.5 border transition-all duration-300 max-w-[calc(100vw-2rem)] ${
          scrolled 
            ? "bg-primary-black/95 backdrop-blur-lg border-neutral-gray-700/50" 
            : "bg-primary-black/80 backdrop-blur-sm border-neutral-gray-800/30"
        }`}
        variants={navVariants}
        initial="hidden"
        animate="visible"
        role="navigation"
        aria-label="Mobile navigation"
      >
        {/* Mobile Logo */}
        <Link href="/" className="flex items-center mr-3 group">
          <motion.div 
            className="flex items-center"
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            <div className="relative h-6 w-auto group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/assets/tezralogo.png"
                alt="Tezra Logo"
                width={60}
                height={24}
                className="h-6 w-auto object-contain"
                priority
              />
            </div>
          </motion.div>
        </Link>

        {/* Mobile CTA */}
        <motion.div 
          className="relative group mr-2"
          variants={buttonVariants}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-yellow to-amber-400 rounded-xl opacity-75 group-hover:opacity-100 blur-sm transition-all duration-300"></div>
          <a 
            href="https://tally.so/r/m69ErJ" 
            target="_blank" 
            rel="noopener noreferrer"
            className="relative block focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2 focus:ring-offset-primary-black rounded-xl"
            aria-label="Start free trial (opens in new tab)"
          >
            <button className="relative bg-primary-yellow text-primary-black rounded-xl px-3 py-1.5 text-xs font-bold hover:bg-amber-400 transition-all duration-300 whitespace-nowrap">
              Try Free
            </button>
          </a>
        </motion.div>

        {/* Mobile Menu Button */}
        <motion.button
          className="p-2 text-neutral-gray-300 hover:text-primary-yellow hover:bg-neutral-gray-800/50 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 focus:ring-offset-2 focus:ring-offset-primary-black"
          onClick={() => setIsOpen(!isOpen)}
          variants={hoverVariants}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
          aria-label={isOpen ? "Close mobile menu" : "Open mobile menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </motion.div>
        </motion.button>
      </motion.nav>

      {/* Enhanced Mobile Menu Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Modal Content */}
            <motion.div
              className="md:hidden fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-sm bg-primary-black/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-neutral-gray-700/50 overflow-hidden"
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-gray-700/50">
                <div className="flex items-center">
                  <div className="relative h-6 w-auto mr-3">
                    <Image
                      src="/assets/tezralogo.png"
                      alt="Tezra Logo"
                      width={60}
                      height={24}
                      className="h-6 w-auto object-contain"
                      priority
                    />
                  </div>
                  <span className="text-white font-semibold text-sm">Menu</span>
                </div>
                <motion.button
                  className="p-2 text-neutral-gray-300 hover:text-primary-yellow hover:bg-neutral-gray-800/50 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow/50"
                  onClick={() => setIsOpen(false)}
                  variants={hoverVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </motion.button>
              </div>

              <div className="p-4 max-h-[70vh] overflow-y-auto">
                {/* Mobile Sections */}
                <div className="pb-4 border-b border-neutral-gray-700/50 mb-4">
                  <h3 className="text-xs font-bold text-primary-yellow uppercase tracking-wide mb-3 px-2">
                    Features
                  </h3>
                  <div className="space-y-1" role="group" aria-label="Feature sections">
                    {sections.map((section, index) => (
                      <motion.button
                        key={section.name}
                        role="menuitem"
                        className={`flex items-center justify-between w-full p-3 rounded-xl transition-all duration-200 group text-left focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 ${
                          isActive(section.href)
                            ? "bg-primary-yellow/15 border border-primary-yellow/20"
                            : "hover:bg-neutral-gray-800/50 border border-transparent"
                        }`}
                        onClick={() => scrollToSection(section.href)}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        custom={index}
                        whileTap="tap"
                        aria-label={`Navigate to ${section.name}: ${section.description}`}
                      >
                        <div className="flex-1">
                          <div className={`font-semibold text-sm transition-colors duration-200 ${
                            isActive(section.href) ? "text-primary-yellow" : "text-white group-hover:text-primary-yellow"
                          }`}>
                            {section.name}
                          </div>
                          <div className="text-xs text-neutral-gray-400 mt-0.5 group-hover:text-neutral-gray-300 transition-colors duration-200">
                            {section.description}
                          </div>
                        </div>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: isActive(section.href) ? 1 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ArrowRight className={`h-4 w-4 ${
                            isActive(section.href) ? "text-primary-yellow" : "text-primary-yellow"
                          }`} />
                        </motion.div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="mb-4">
                  <Link href="/pricing" className="w-full">
                    <motion.button
                      className="flex items-center justify-between w-full px-3 py-3 text-sm text-neutral-gray-300 rounded-xl hover:bg-neutral-gray-800/50 hover:text-white transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-primary-yellow/50"
                      variants={hoverVariants}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <span>Pricing</span>
                      <ArrowRight className="h-4 w-4 opacity-50" />
                    </motion.button>
                  </Link>
                </div>

                {/* Mobile Login */}
                <Link href="/login" className="w-full">
                  <motion.button
                    className="w-full border border-neutral-gray-600 text-neutral-gray-300 hover:text-white hover:border-neutral-gray-500 font-medium py-3 px-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow/50"
                    variants={hoverVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Login
                  </motion.button>
                </Link>

                {/* Mobile CTA in Modal */}
                <div className="mt-4 pt-4 border-t border-neutral-gray-700/50">
                  <motion.div 
                    className="relative group w-full"
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary-yellow to-amber-400 rounded-xl opacity-75 group-hover:opacity-100 blur-sm transition-all duration-300"></div>
                    <a 
                      href="https://tally.so/r/m69ErJ" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="relative block focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2 focus:ring-offset-primary-black rounded-xl"
                      aria-label="Start free trial (opens in new tab)"
                    >
                      <button className="relative w-full bg-primary-yellow text-primary-black rounded-xl px-4 py-3 text-sm font-bold hover:bg-amber-400 transition-all duration-300 text-center">
                        Start Free Trial
                      </button>
                    </a>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
