"use client"
import { useRouter } from "next/navigation"; // ✅ ADDED
import * as React from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Settings,
  ChevronRight,
  PlusCircle,
  Search, 
  BarChart3,
  // Store,
  PersonStandingIcon,
  // DollarSign,
  DollarSignIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

import { useMediaQuery } from "hooks/use-media-query";
import { FirstTimeTooltip } from "./first-time-tooltip";
import { ResizeHandle } from "./resize-handle";
import { usePluginContext } from "../plugin/PluginContext";

interface SidebarProps {
  className?: string;
}

type NavItemType = {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string | number;
  active?: boolean;
  onClick?: () => void;
  children?: Omit<NavItemType, "children">[];
};

export function Sidebar({ className }: SidebarProps) {
  const router = useRouter(); // ✅ ADDED
  const [expanded, setExpanded] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState("/dashboard");
  const [isDragging, setIsDragging] = React.useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const width = useMotionValue(expanded ? 280 : 80);
  const springWidth = useSpring(width, { damping: 30, stiffness: 200 });
  const borderOpacity = useTransform(useMotionValue(isDragging ? 1 : 0), [0, 1], [0.08, 0.3]);

  const minWidth = 80;
  const maxWidth = 280;

  const handleDrag = (_, info) => {
    const newWidth = Math.max(minWidth, Math.min(maxWidth, width.get() + info.delta.x));
    width.set(newWidth);
  };
  const handleDragEnd = () => {
    setIsDragging(false);
    const currentWidth = width.get();
    const threshold = (minWidth + maxWidth) / 2;
    if (currentWidth < threshold) {
      width.set(minWidth);
      setExpanded(false);
    } else {
      width.set(maxWidth);
      setExpanded(true);
    }
  };

  const { installedPluginIds } = usePluginContext(); // ✅

  const pluginNavItems: NavItemType[] = [];




  React.useEffect(() => {
    if (isMobile) {
      setExpanded(false);
      width.set(minWidth);
    } else {
      setExpanded(true);
      width.set(maxWidth);
    }
  }, [isMobile, width]);

  const toggleSidebar = () => {
    if (isMobile) setMobileOpen(!mobileOpen);
    else {
      const newExpanded = !expanded;
      setExpanded(newExpanded);
      width.set(newExpanded ? maxWidth : minWidth);
    }
  };

  const handleNavigation = (href: string) => {
    setActiveItem(href);
    router.push(href); // ✅ ROUTING ENABLED
    if (isMobile) setMobileOpen(false);
  };

  const mainNavItems: NavItemType[] = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: activeItem === "/dashboard" },
    { icon: ShoppingCart, label: "Orders", href: "/orders", active: activeItem === "/orders", badge: 12 },
    { icon: Package, label: "Products", href: "/inventory", active: activeItem === "/inventory" },
    { icon: ShoppingCart, label: "Optimizer", href: "/optimizer", active: activeItem === "/optimizer" },
  ];

  // const pluginNavItems: NavItemType[] = [
  //   {
  //     icon: Search,
  //     label: "Product Finder",
  //     href: "/productFinder", // ✅ Your existing folder structure
  //     active: activeItem === "/productFinder",
  //     badge: "New",
  //   },
  //   {
  //     icon: BarChart3,
  //     label: "Analytics Pro",
  //     href: "/analytics", // You can create this page
  //     active: activeItem === "/analytics",
  //   },
  //   // {
  //   //   icon: Store,
  //   //   label: "Marketplace",
  //   //   href: "/plugin", // You can create this page
  //   //   active: activeItem === "/plugin",
  //   // },
  // ];
if (installedPluginIds.includes(1)) { // 1 = Product Finder plugin id
    pluginNavItems.push({
      icon: Search,
      label: "Product Finder",
      href: "/productFinder",
      active: activeItem === "/productFinder",
      badge: "New",
    });
  }

  pluginNavItems.push({
    icon: BarChart3,
    label: "Analytics Pro",
    href: "/analytics",
    active: activeItem === "/analytics",
  });

  
  const mobileMenuVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: "-100%", opacity: 0 },
  };

  const overlayVariants = {
    open: { opacity: 0.5 },
    closed: { opacity: 0 },
  };

  return (
    <TooltipProvider delayDuration={0}>
      {isMobile && (
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={overlayVariants}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setMobileOpen(false)}
            />
          )}
        </AnimatePresence>
      )}

      {isMobile && (
        <Button
          onClick={toggleSidebar}
          size="icon"
          variant="ghost"
          className="fixed top-4 left-4 z-50 h-10 w-10 rounded-full bg-[#09090B]/80 text-white hover:bg-[#FFC300] hover:text-[#09090B] backdrop-blur-sm border border-white/10"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}

      <motion.div
        className={cn(
          "flex flex-col h-screen bg-[#09090B] border-r relative z-50 transition-colors",
          isDragging && "shadow-[0_0_15px_rgba(255,195,0,0.15)]",
          isMobile && "fixed left-0 top-0",
          className,
        )}
        initial={false}
        style={
          isMobile
            ? undefined
            : {
                width: springWidth,
                borderColor: `rgba(255, 255, 255, ${borderOpacity.get()})`,
              }
        }
        animate={isMobile ? (mobileOpen ? "open" : "closed") : undefined}
        variants={isMobile ? mobileMenuVariants : undefined}
        transition={isMobile ? { type: "spring", stiffness: 300, damping: 30 } : undefined}
      >
        {!isMobile && <FirstTimeTooltip />}
        {!isMobile && (
          <ResizeHandle
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            className={isDragging ? "opacity-100" : undefined}
          />
        )}

        <div className="px-5 py-6 flex items-center">
          <div className="flex items-center gap-3 overflow-hidden">
            <motion.div
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFC300] to-[#FF9500] text-[#09090B] font-bold text-xl shadow-lg shadow-[#FFC300]/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              T
            </motion.div>
            <AnimatePresence>
              {(expanded || mobileOpen) && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <span className="font-semibold text-white text-lg tracking-tight">Tezra</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {/* MAIN NAV */}
          <div className="mb-6">
            {(expanded || mobileOpen) && (
              <div className="px-4 mb-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-gray-400">Main</h3>
              </div>
            )}
            <div className="space-y-1">
              {mainNavItems.map((item) => (
                <NavItem
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={item.active}
                  badge={item.badge}
                  expanded={expanded || mobileOpen}
                  onClick={() => handleNavigation(item.href)}
                />
              ))}
            </div>
          </div>

          {/* PLUGINS NAV */}
          <div className="mb-6">
            {(expanded || mobileOpen) && (
              <div className="px-4 mb-2 flex items-center justify-between">
                <h3 className="text-xs font-medium uppercase tracking-wider text-gray-400">Plugins</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 rounded-full text-gray-400 hover:text-white"
                  onClick={() => handleNavigation("/plugin")}
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only">Add Plugin</span>
                </Button>
              </div>
            )}
            <div className="space-y-1">
              {pluginNavItems.map((item) => (
                <NavItem
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={item.active}
                  badge={item.badge}
                  expanded={expanded || mobileOpen}
                  onClick={() => handleNavigation(item.href)}
                />
              ))}
            </div>
          </div>

          {/* SETTINGS NAV */}
          <div className="mb-6">
            {(expanded || mobileOpen) && (
              <div className="px-4 mb-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-gray-400">System</h3>
              </div>
            )}
            <div className="space-y-1">
              <NavItem
                icon={Settings}
                label="Settings"
                href="/settings"
                active={activeItem === "/settings"}
                expanded={expanded || mobileOpen}
                onClick={() => handleNavigation("/settings")}
              />
            </div>
          </div>
 {/* ADMIN NAV */}
          <div className="mb-6">
            {(expanded || mobileOpen) && (
              <div className="px-4 mb-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-gray-400">Admin</h3>
              </div>
            )}
            <div className="space-y-1">
              <NavItem
              icon={PersonStandingIcon} // Replace with the person icon you want to use
              label="Licence Keys "
              href="/admin/keys"
              active={activeItem === "/admin/keys"}
              expanded={expanded || mobileOpen}
              onClick={() => handleNavigation("/admin/keys")}
              />
            </div>

            <div className="space-y-1">
              <NavItem
              icon={DollarSignIcon} // Replace with the person icon you want to use
              label="Plans"
              href="/admin/keys/pricing"
              active={activeItem === "/admin/keys/pricing"}
              expanded={expanded || mobileOpen}
              onClick={() => handleNavigation("/admin/keys/pricing")}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}

interface NavItemProps extends Omit<NavItemType, "children" | "href"> {
  expanded: boolean;
  href: string;
  onClick?: () => void;
}

function NavItem({ icon: Icon, label, active, badge, expanded, onClick }: NavItemProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          onClick={onClick}
          className={cn(
            "flex items-center w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
            active
              ? "bg-gradient-to-r from-[#FFC300]/10 to-transparent text-white"
              : "text-gray-400 hover:bg-white/5 hover:text-white",
            !expanded && "justify-center",
          )}
          whileHover={{ x: expanded ? 2 : 0, scale: expanded ? 1 : 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className={cn("flex items-center justify-center", active ? "text-[#FFC300]" : "text-gray-400")}>
            <Icon className="h-5 w-5 flex-shrink-0" />
          </div>

          {expanded && (
            <>
              <span className={cn("ml-3 flex-1 truncate", active && "font-medium")}>{label}</span>
              {badge && (
                <Badge
                  variant="outline"
                  className={cn(
                    "ml-auto px-2 py-0.5 text-xs",
                    typeof badge === "string" && badge.toLowerCase() === "new"
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : "bg-[#FFC300]/10 text-[#FFC300] border-[#FFC300]/20",
                  )}
                >
                  {badge}
                </Badge>
              )}
            </>
          )}
        </motion.button>
      </TooltipTrigger>

      {!expanded && (
        <TooltipContent side="right" className="flex items-center gap-2 bg-[#1a1a1c] text-white border-[#2a2a2c]">
          <span>{label}</span>
          {badge && (
            <Badge
              variant="outline"
              className={cn(
                "px-1.5 py-0 text-xs",
                typeof badge === "string" && badge.toLowerCase() === "new"
                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                  : "bg-[#FFC300]/10 text-[#FFC300] border-[#FFC300]/20",
              )}
            >
              {badge}
            </Badge>
          )}
        </TooltipContent>
      )}
    </Tooltip>
  );
}
