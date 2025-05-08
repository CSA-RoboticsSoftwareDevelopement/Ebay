"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { ChevronDown, Menu, X } from "lucide-react"
import Image from "next/image"

// Define the sections for the dropdown
const sections = [
  { name: "Features", href: "#features" },
  { name: "Analytics", href: "#analytics" },
  { name: "Forecasting", href: "#forecasting" },
  { name: "Competitor Analysis", href: "#competitor-analysis" },
]

export default function Navbar() {
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [sectionsOpen, setSectionsOpen] = useState(false)
  const [pricingOpen, setPricingOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const closeTimeout = useRef<NodeJS.Timeout | null>(null)
  const shouldReduceMotion = useReducedMotion()

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkMobile()

    // Add event listener
    window.addEventListener("resize", checkMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Handle scroll to detect active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100 // Offset for navbar height

      // Find the section that is currently in view
      for (const section of sections) {
        const element = document.querySelector(section.href)
        if (element) {
          const { top, bottom } = element.getBoundingClientRect()
          if (top <= 100 && bottom >= 100) {
            setActiveSection(section.href)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    // Initial check
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Dropdown hover handlers with delay
  const handleMouseEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current)
    }
    setSectionsOpen(true)
  }

  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => {
      setSectionsOpen(false)
    }, 200)
  }

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth" })
    }
    setSectionsOpen(false)
    if (isMobile) setIsOpen(false)
  }

  // Check if a section is active
  const isActive = (href: string) => activeSection === href

  return (
    <>
      {/* Desktop Navbar */}
      <motion.nav
        className={`fixed ${
          isMobile ? "top-4 left-1/2 -translate-x-1/2" : "top-4 right-4"
        } z-50 hidden md:flex items-center bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-5 py-2.5`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <Link href="/" className="flex items-center mr-6">
          <Image src="/tezra-logo.png" alt="Tezra Logo" width={100} height={32} className="h-8 w-auto object-contain" />
        </Link>

        {/* Sections Dropdown */}
        <div className="relative mr-4" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <motion.button
            className="flex items-center px-4 py-2 text-gray-800 hover:text-amber-600 transition-colors"
            onClick={() => setSectionsOpen(!sectionsOpen)}
            whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
            aria-haspopup="true"
            aria-expanded={sectionsOpen}
            aria-controls="sections-menu"
          >
            <span>Sections</span>
            <motion.div animate={{ rotate: sectionsOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronDown className="ml-2 h-4 w-4" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {sectionsOpen && (
              <motion.div
                id="sections-menu"
                role="menu"
                className="absolute left-0 mt-2 w-52 bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] py-1 z-10 overflow-hidden"
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
                        ? "bg-amber-50 text-amber-600 font-medium"
                        : "text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                    }`}
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection(section.href)
                    }}
                    whileHover={shouldReduceMotion ? {} : { x: 5 }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        scrollToSection(section.href)
                      }
                    }}
                  >
                    {section.name}
                    {isActive(section.href) && (
                      <span className="absolute right-4 h-1.5 w-1.5 rounded-full bg-amber-500" />
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
            className="flex items-center px-4 py-2 text-gray-800 hover:text-amber-600 transition-colors"
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
            className="bg-amber-400 hover:bg-amber-500 text-black font-semibold px-6 py-2 rounded-full transition-all duration-300 hover:shadow-[0_2px_8px_rgba(245,158,11,0.4)]"
            whileHover={shouldReduceMotion ? {} : { scale: 1.05, backgroundColor: "rgb(245, 158, 11)" }}
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
          className="fixed top-4 right-4 z-50 bg-white p-2 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
          onClick={() => setIsOpen(!isOpen)}
          whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="mobile-menu"
              className="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="flex flex-col items-center space-y-6 w-full max-w-md px-4">
                <Link href="/" className="flex items-center mb-8">
                  <Image
                    src="/tezra-logo.png"
                    alt="Tezra Logo"
                    width={120}
                    height={38}
                    className="h-10 w-auto object-contain"
                  />
                </Link>

                {/* Mobile Sections Dropdown */}
                <div className="relative w-full">
                  <motion.button
                    className="flex items-center justify-between w-full px-4 py-3 text-lg rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setSectionsOpen(!sectionsOpen)}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                    aria-haspopup="true"
                    aria-expanded={sectionsOpen}
                    aria-controls="mobile-sections-menu"
                  >
                    <span>Sections</span>
                    <motion.div animate={{ rotate: sectionsOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                      <ChevronDown className="ml-2 h-5 w-5" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {sectionsOpen && (
                      <motion.div
                        id="mobile-sections-menu"
                        role="menu"
                        className="w-full bg-gray-50 rounded-lg mt-1 overflow-hidden"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {sections.map((section) => (
                          <motion.a
                            key={section.name}
                            href={section.href}
                            role="menuitem"
                            className={`block px-6 py-3 w-full transition-colors duration-200 ${
                              isActive(section.href)
                                ? "bg-amber-50 text-amber-600 font-medium"
                                : "text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                            }`}
                            onClick={(e) => {
                              e.preventDefault()
                              scrollToSection(section.href)
                            }}
                            whileHover={shouldReduceMotion ? {} : { x: 5 }}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                scrollToSection(section.href)
                              }
                            }}
                          >
                            {section.name}
                            {isActive(section.href) && (
                              <span className="absolute right-6 h-2 w-2 rounded-full bg-amber-500" />
                            )}
                          </motion.a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile Pricing Link */}
                <Link href="/pricing" className="w-full">
                  <motion.button
                    className="flex items-center justify-between w-full px-4 py-3 text-lg rounded-lg hover:bg-gray-50 transition-colors"
                    whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                  >
                    <span>Pricing</span>
                    <ChevronDown className="ml-2 h-5 w-5" />
                  </motion.button>
                </Link>

                {/* Mobile Sign Up Button */}
                <Link href="/signup" className="w-full px-4 mt-4">
                  <motion.button
                    className="bg-amber-400 hover:bg-amber-500 text-black font-semibold py-3 rounded-full w-full text-lg transition-all duration-300 hover:shadow-[0_2px_8px_rgba(245,158,11,0.4)]"
                    whileHover={shouldReduceMotion ? {} : { scale: 1.02, backgroundColor: "rgb(245, 158, 11)" }}
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
  )
}
