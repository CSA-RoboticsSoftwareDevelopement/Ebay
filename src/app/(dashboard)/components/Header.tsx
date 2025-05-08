"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { motion } from "framer-motion"
import { ChevronRight, HelpCircle, Search, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMediaQuery } from "hooks/use-media-query"

interface HeaderProps {
  className?: string
  breadcrumbs?: {
    title: string
    href: string
    current?: boolean
  }[]
  title?: string
  subtitle?: string
}

export function Header({ className, breadcrumbs, title, subtitle }: HeaderProps) {
  const pathname = usePathname()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)

  // Get last breadcrumb title as the dynamic page title
  const lastCrumbTitle = breadcrumbs?.length
    ? breadcrumbs[breadcrumbs.length - 1].title
    : title || "Welcome"

  return (
    <TooltipProvider delayDuration={0}>
      <header
      
        className={cn(
          "sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/[0.01] bg-[#09090B] px-4 backdrop-blur-md",
          className,
        )}
      >
        {/* Left section: Breadcrumbs */}
        <div className="flex items-center gap-2">
          {breadcrumbs && breadcrumbs.length > 0 && !isSearchOpen && (
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-1 text-sm">
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1
                  return (
                    <li key={crumb.title} className="flex items-center">
                      {index > 0 && <ChevronRight className="mx-1 h-4 w-4 text-gray-500" />}
                      {isLast ? (
                        <span className="font-medium text-white">{crumb.title}</span>
                      ) : (
                        <a href={crumb.href} className="text-gray-400 transition-colors hover:text-[#FFC300]">
                          {crumb.title}
                        </a>
                      )}
                    </li>
                  )
                })}
              </ol>
            </nav>
          )}

          {/* Mobile/Tablet Search Input */}
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "100%" }}
              exit={{ opacity: 0, width: 0 }}
              className="relative flex-1"
            >
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="h-10 w-full rounded-xl bg-white/5 pl-10 pr-4 text-sm text-white placeholder-gray-500 border border-white/5 focus:border-[#FFC300]/50 focus:outline-none focus:ring-1 focus:ring-[#FFC300]/50"
                autoFocus
                onBlur={() => setIsSearchOpen(false)}
              />
            </motion.div>
          )}

          {/* Fallback title if no breadcrumbs and not searching */}
          {!breadcrumbs?.length && !isSearchOpen && (
            <div>
              <h1 className="text-lg font-semibold text-white">{lastCrumbTitle}</h1>
              {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
            </div>
          )}
        </div>

        {/* Right section: Actions */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Search button (mobile/tablet) */}
          {isMobile && !isSearchOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-gray-400 hover:text-white"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          {/* Desktop Search */}
          {!isMobile && (
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="h-9 w-[180px] rounded-full bg-white/5 pl-10 pr-4 text-sm text-white placeholder-gray-500 border border-white/5 focus:border-[#FFC300]/50 focus:outline-none focus:ring-1 focus:ring-[#FFC300]/50 focus:w-[240px] transition-all duration-300"
              />
            </div>
          )}

          {/* Help */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-gray-400 hover:text-white">
                <HelpCircle className="h-5 w-5" />
                <span className="sr-only">Help</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Help & Resources</TooltipContent>
          </Tooltip>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full hover:bg-white/10">
                <Avatar className="h-9 w-9 border border-white/10">
                  <AvatarImage src="/vibrant-street-market.png" alt="User" />
                  <AvatarFallback className="bg-gradient-to-br from-[#FFC300] to-[#FF9500] text-[#09090B]">
                    AM
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#121214] border-white/10 text-white">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Alex Morgan</p>
                  <p className="text-xs text-gray-400">alex@tezra.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="hover:bg-white/5 focus:bg-white/5 cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-white/5 focus:bg-white/5 cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help & Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="hover:bg-white/5 focus:bg-white/5 cursor-pointer">
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </TooltipProvider>
  )
}
