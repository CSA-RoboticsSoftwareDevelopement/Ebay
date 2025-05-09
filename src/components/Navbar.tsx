"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";

// Define the sections for the dropdown
const sections = [
  { name: "Features", href: "#features" },
  { name: "Analytics", href: "#analytics" },
  { name: "Forecasting", href: "#forecasting" },
  { name: "Competitor Analysis", href: "#competitor-analysis" },
];

export default function Navbar() {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add event listener
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle scroll to detect active section
  useEffect(() => {
    const handleScroll = () => {

      // Find the section that is currently in view
      for (const section of sections) {
        const element = document.querySelector(section.href);
        if (element) {
          const { top, bottom } = element.getBoundingClientRect();
          if (top <= 100 && bottom >= 100) {
            setActiveSection(section.href);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dropdown hover handlers with delay
  const handleMouseEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
    }
    setSectionsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => {
      setSectionsOpen(false);
    }, 200);
  };

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: shouldReduceMotion ? "auto" : "smooth",
      });
    }
    setSectionsOpen(false);
    if (isMobile) setIsOpen(false);
  };

  // Check if a section is active
  const isActive = (href: string) => activeSection === href;

  return (
    <>
      {/* Desktop Navbar */}
      <motion.nav
        className={`fixed ${
          isMobile ? "top-4 left-1/2 -translate-x-1/2" : "top-4 right-4"
        } z-50 hidden md:flex items-center bg-[#09090B] text-gray-100 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.2)] px-5 py-2.5 border border-[#09090B]`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <Link href="/" className="flex items-center mr-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-yellow rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 576 512"
                fill="currentColor"
                className="w-4 h-4 text-primary-black"
              >
                <path d="M384 160c-17.7 0-32-14.3-32-32s14.3-32 32-32H544c17.7 0 32 14.3 32 32V288c0 17.7-14.3 32-32 32s-32-14.3-32-32V205.3L342.6 374.6c-12.5 12.5-32.8 12.5-45.3 0L192 269.3 54.6 406.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160c12.5-12.5 32.8-12.5 45.3 0L320 306.7 466.7 160H384z" />
              </svg>
            </div>
            <span className="ml-2 text-white font-semibold">Tezra</span>
          </div>
        </Link>

        {/* Sections Dropdown */}
        <div
          className="relative mr-4"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <motion.button
            className="flex items-center px-4 py-2 text-neutral-gray-300 hover:text-primary-yellow transition-colors"
            onClick={() => setSectionsOpen(!sectionsOpen)}
            whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
            aria-haspopup="true"
            aria-expanded={sectionsOpen}
            aria-controls="sections-menu"
          >
            <span>Sections</span>
            <motion.div
              animate={{ rotate: sectionsOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="ml-2 h-4 w-4" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {sectionsOpen && (
              <motion.div
                id="sections-menu"
                role="menu"
                className="absolute left-0 mt-2 w-52 bg-neutral-gray-100 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.3)] py-1 z-10 overflow-hidden border border-neutral-gray-200"
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                {sections.map((section) => (
                  <motion.a
                    key={section.name}
                    href={section.href}
                    role="menuitem"
                    className={`block px-4 py-2.5 w-full transition-colors duration-200 ${
                      isActive(section.href)
                        ? "bg-primary-yellow/10 text-primary-yellow font-medium"
                        : "text-neutral-gray-700 hover:bg-neutral-gray-200 hover:text-primary-yellow"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(section.href);
                    }}
                    whileHover={shouldReduceMotion ? {} : { x: 5 }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        scrollToSection(section.href);
                      }
                    }}
                  >
                    {section.name}
                    {isActive(section.href) && (
                      <span className="absolute right-4 h-1.5 w-1.5 rounded-full bg-primary-yellow" />
                    )}
                  </motion.a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pricing Link */}
        <Link href="/pricing" className="mr-4">
          <motion.button
            className="flex items-center px-4 py-2 text-neutral-gray-300 hover:text-primary-yellow transition-colors"
            whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
          >
            <span>Pricing</span>
            <ChevronDown className="ml-2 h-4 w-4" />
          </motion.button>
        </Link>

        {/* Sign Up Button */}
        <Link href="/signup">
          <motion.button
            className="bg-primary-yellow text-primary-black font-semibold px-6 py-2 rounded-full transition-all duration-300 hover:shadow-[0_2px_8px_rgba(255,195,0,0.4)]"
            whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            Sign Up
          </motion.button>
        </Link>
      </motion.nav>

      {/* Mobile Navbar */}
      <div className="md:hidden">
        {/* Mobile Toggle Button */}
        <motion.button
          className="fixed top-4 right-4 z-50 bg-neutral-gray-100 p-2 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.2)] border border-neutral-gray-200"
          onClick={() => setIsOpen(!isOpen)}
          whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          {isOpen ? (
            <X className="text-white" size={24} />
          ) : (
            <Menu className="text-white" size={24} />
          )}
        </motion.button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="mobile-menu"
              className="fixed inset-0 bg-primary-black z-40 flex flex-col items-center justify-center"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="flex flex-col items-center space-y-6 w-full max-w-md px-4">
                <Link href="/" className="flex items-center mb-8">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-yellow rounded-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 576 512"
                        fill="currentColor"
                        className="w-6 h-6 text-primary-black"
                      >
                        <path d="M384 160c-17.7 0-32-14.3-32-32s14.3-32 32-32H544c17.7 0 32 14.3 32 32V288c0 17.7-14.3 32-32 32s-32-14.3-32-32V205.3L342.6 374.6c-12.5 12.5-32.8 12.5-45.3 0L192 269.3 54.6 406.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160c12.5-12.5 32.8-12.5 45.3 0L320 306.7 466.7 160H384z" />
                      </svg>
                    </div>
                    <span className="ml-2 text-white text-xl font-semibold">
                      Tezra
                    </span>
                  </div>
                </Link>

                {/* Mobile Sections Dropdown */}
                <div className="relative w-full">
                  <motion.button
                    className="flex items-center justify-between w-full px-4 py-3 text-lg text-white rounded-lg hover:bg-neutral-gray-200/10 transition-colors"
                    onClick={() => setSectionsOpen(!sectionsOpen)}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                    aria-haspopup="true"
                    aria-expanded={sectionsOpen}
                    aria-controls="mobile-sections-menu"
                  >
                    <span>Sections</span>
                    <motion.div
                      animate={{ rotate: sectionsOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="ml-2 h-5 w-5" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {sectionsOpen && (
                      <motion.div
                        id="mobile-sections-menu"
                        className="mt-2 w-full rounded-lg bg-neutral-gray-200 overflow-hidden"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {sections.map((section) => (
                          <motion.a
                            key={section.name}
                            href={section.href}
                            className={`block px-4 py-3 text-base transition-colors duration-200 ${
                              isActive(section.href)
                                ? "bg-primary-yellow/10 text-primary-yellow font-medium"
                                : "text-white hover:bg-neutral-gray-300/10"
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              scrollToSection(section.href);
                            }}
                            whileHover={shouldReduceMotion ? {} : { x: 5 }}
                          >
                            {section.name}
                          </motion.a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Pricing */}
                <Link href="/pricing" className="w-full">
                  <motion.button
                    className="flex items-center justify-between w-full px-4 py-3 text-lg text-white rounded-lg hover:bg-neutral-gray-200/10 transition-colors"
                    whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                  >
                    <span>Pricing</span>
                  </motion.button>
                </Link>

                {/* Mobile Sign Up */}
                <Link href="/signup" className="w-full mt-4">
                  <motion.button
                    className="w-full bg-primary-yellow text-primary-black font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                    whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
