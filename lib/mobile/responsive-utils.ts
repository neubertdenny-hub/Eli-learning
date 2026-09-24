/**
 * Mobile Responsive Utilities - Phase 6F-C
 * Helpers für responsive Design auf allen Devices
 */

export const BREAKPOINTS = {
  xs: 320,    // iPhone SE
  sm: 375,    // iPhone 12
  md: 768,    // iPad
  lg: 1024,   // iPad Pro / Desktop
  xl: 1280,   // Desktop
}

/**
 * Touch-friendly Button Sizing
 * Apple HIG: Minimum 44x44pt for touch targets
 */
export const TOUCH_TARGET_SIZE = {
  small: "h-10 px-3",      // 40px (tight)
  medium: "h-12 px-4",     // 48px (recommended)
  large: "h-14 px-6",      // 56px (comfortable)
  extraLarge: "h-16 px-8", // 64px (very comfortable)
}

/**
 * Responsive Font Sizes
 * Mobile first approach
 */
export const RESPONSIVE_TEXT = {
  heading1: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
  heading2: "text-xl sm:text-2xl md:text-3xl lg:text-4xl",
  heading3: "text-lg sm:text-xl md:text-2xl lg:text-3xl",
  body: "text-sm sm:text-base md:text-lg",
  small: "text-xs sm:text-sm md:text-base",
}

/**
 * Responsive Spacing (Padding/Margin)
 */
export const RESPONSIVE_SPACING = {
  xs: "p-2 sm:p-3 md:p-4",
  sm: "p-3 sm:p-4 md:p-6",
  md: "p-4 sm:p-6 md:p-8",
  lg: "p-6 sm:p-8 md:p-10",
}

/**
 * Responsive Gap für Grid/Flex
 */
export const RESPONSIVE_GAP = {
  xs: "gap-2 sm:gap-3 md:gap-4",
  sm: "gap-3 sm:gap-4 md:gap-6",
  md: "gap-4 sm:gap-6 md:gap-8",
  lg: "gap-6 sm:gap-8 md:gap-10",
}

/**
 * Mobile-optimized Card Styling
 */
export const MOBILE_CARD = "rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6"

/**
 * Safe Area für notch Devices (iPhone X+)
 */
export const SAFE_AREA = {
  top: "pt-[env(safe-area-inset-top)]",
  bottom: "pb-[env(safe-area-inset-bottom)]",
  left: "pl-[env(safe-area-inset-left)]",
  right: "pr-[env(safe-area-inset-right)]",
}

/**
 * Visibility Utilities (Hide on Mobile)
 */
export const HIDE_ON_MOBILE = "hidden sm:block"
export const SHOW_ONLY_MOBILE = "sm:hidden"

/**
 * Check if device is mobile (client-side)
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false
  return window.innerWidth < BREAKPOINTS.md
}

/**
 * Get viewport width
 */
export function getViewportWidth(): number {
  if (typeof window === "undefined") return 0
  return window.innerWidth
}

/**
 * Get current breakpoint
 */
export function getCurrentBreakpoint(): "xs" | "sm" | "md" | "lg" | "xl" {
  const width = getViewportWidth()

  if (width < BREAKPOINTS.sm) return "xs"
  if (width < BREAKPOINTS.md) return "sm"
  if (width < BREAKPOINTS.lg) return "md"
  if (width < BREAKPOINTS.xl) return "lg"
  return "xl"
}
