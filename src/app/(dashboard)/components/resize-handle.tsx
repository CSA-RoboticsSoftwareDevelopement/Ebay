"use client"

import type * as React from "react"
import { motion } from "framer-motion"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { PanInfo } from "framer-motion";


interface ResizeHandleProps {
  onDrag: (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
  onDragEnd: () => void;
  className?: string;
}

export function ResizeHandle({ onDrag, onDragEnd, className }: ResizeHandleProps) {
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0}
      dragMomentum={false}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      className={cn(
        "absolute -right-3 top-0 bottom-0 w-6 z-10 cursor-ew-resize flex items-center justify-center",
        className,
      )}
      initial={{ opacity: 0.6 }}
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="h-32 w-1 rounded-full bg-gradient-to-b from-transparent via-white/10 to-transparent hover:via-[#FFC300]/30 transition-colors flex items-center justify-center group">
        <motion.div
          className="bg-[#121214] border border-white/10 rounded-full p-1 shadow-lg"
          animate={{ x: [0, -2, 0, 2, 0] }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            duration: 2,
            repeatDelay: 3,
          }}
        >
          <GripVertical className="h-4 w-4 text-white/40 group-hover:text-[#FFC300]" />
        </motion.div>
      </div>
    </motion.div>
  )
}
