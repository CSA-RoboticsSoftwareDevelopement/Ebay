import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  separator?: React.ReactNode
  asChild?: boolean
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, separator = <ChevronRight className="h-4 w-4" />, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "nav"

    return (
      <Comp
        ref={ref}
        aria-label="breadcrumb"
        className={cn("flex items-center text-sm text-gray-400", className)}
        {...props}
      />
    )
  },
)
Breadcrumb.displayName = "Breadcrumb"

export interface BreadcrumbListProps extends React.HTMLAttributes<HTMLOListElement> {
  asChild?: boolean
}

const BreadcrumbList = React.forwardRef<HTMLOListElement, BreadcrumbListProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "ol"

    return <Comp ref={ref} className={cn("flex flex-wrap items-center gap-1.5", className)} {...props} />
  },
)
BreadcrumbList.displayName = "BreadcrumbList"

export interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLLIElement> {
  asChild?: boolean
}

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "li"

    return <Comp ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props} />
  },
)
BreadcrumbItem.displayName = "BreadcrumbItem"

export interface BreadcrumbLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean
}

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "a"

    return <Comp ref={ref} className={cn("transition-colors hover:text-[#FFC300]", className)} {...props} />
  },
)
BreadcrumbLink.displayName = "BreadcrumbLink"

export interface BreadcrumbPageProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean
}

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "span"

    return <Comp ref={ref} aria-current="page" className={cn("font-medium text-white", className)} {...props} />
  },
)
BreadcrumbPage.displayName = "BreadcrumbPage"

export interface BreadcrumbSeparatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean
  separator?: React.ReactNode
}

const BreadcrumbSeparator = React.forwardRef<HTMLSpanElement, BreadcrumbSeparatorProps>(
  ({ className, separator, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "span"

    return (
      <Comp ref={ref} role="presentation" aria-hidden="true" className={cn("text-gray-500", className)} {...props}>
        {separator || <ChevronRight className="h-4 w-4" />}
      </Comp>
    )
  },
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

export interface BreadcrumbEllipsisProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean
}

const BreadcrumbEllipsis = React.forwardRef<HTMLSpanElement, BreadcrumbEllipsisProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "span"

    return (
      <Comp
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={cn("flex h-9 w-9 items-center justify-center text-gray-500", className)}
        {...props}
      >
        &#8230;
      </Comp>
    )
  },
)
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis"

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
