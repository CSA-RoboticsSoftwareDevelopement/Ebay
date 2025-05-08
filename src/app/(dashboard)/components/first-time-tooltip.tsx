"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FirstTimeTooltip() {
  const [isVisible, setIsVisible] = React.useState(true)
  const [hasShown, setHasShown] = React.useState(false)

  React.useEffect(() => {
    // Check if we've shown this tooltip before
    const tooltipShown = localStorage.getItem("sidebar-tooltip-shown")
    if (tooltipShown) {
      setIsVisible(false)
      setHasShown(true)
    } else {
      // Show tooltip after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true)
        // Mark as shown for future visits
        localStorage.setItem("sidebar-tooltip-shown", "true")
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setHasShown(true)
  }

  if (hasShown) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="absolute right-6 top-1/3 z-50 w-48 bg-[#121214] border border-[#FFC300]/20 rounded-lg p-3 shadow-lg"
        >
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1 h-5 w-5 text-gray-400 hover:text-white"
            onClick={handleDismiss}
          >
            <X className="h-3 w-3" />
          </Button>

          <div className="flex items-start mb-2">
            <div className="text-[#FFC300] text-lg mr-2">👉</div>
            <h4 className="text-white font-medium text-sm">Drag to resize</h4>
          </div>

          <p className="text-gray-400 text-xs">Grab this edge to resize the sidebar to your preference</p>

          <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-3 h-6 overflow-hidden">
            <div className="w-6 h-6 bg-[#121214] border border-[#FFC300]/20 rotate-45 transform -translate-x-3"></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
