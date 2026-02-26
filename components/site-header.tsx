"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import {
  BarChart3,
  Building2,
  Calculator,
  ChevronDown,
  Home,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  Settings,
  UserCircle2,
  X,
} from "lucide-react"

import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Primary nav — always visible on desktop
const primaryNav = [
  { href: "/", labelKey: "dashboard", icon: Home },
  { href: "/add-property", labelKey: "addProperty", icon: Plus },
  { href: "/hdb-resale", labelKey: "hdbResaleData", icon: BarChart3 },
] as const

// Overflow nav — shown in "More" dropdown on desktop, inline on mobile
const secondaryNav = [
  { href: "/ssd-calculator", labelKey: "ssdCalculator", icon: Calculator },
  { href: "/settings", labelKey: "settings", icon: Settings },
] as const

const allNav = [...primaryNav, ...secondaryNav]

export function SiteHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: session } = useSession()
  const tNav = useTranslations("Navigation")

  const isAuthenticated = Boolean(session?.user)
  const userName = session?.user?.name || session?.user?.email || "User"
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-4 w-4" />
          </span>
          <span className="hidden text-base font-bold tracking-tight sm:inline-block">
            PropertySellTracker
          </span>
        </Link>

        {/* Desktop nav */}
        {isAuthenticated && (
          <nav className="hidden items-center gap-1 md:flex">
            {primaryNav.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors rounded-md",
                    active
                      ? "text-foreground bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tNav(item.labelKey)}
                </Link>
              )
            })}

            {/* More dropdown for secondary items */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors rounded-md hover:text-foreground hover:bg-accent/50"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="hidden lg:inline">{tNav("more") || "More"}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {secondaryNav.map((item) => {
                  const Icon = item.icon
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {tNav(item.labelKey)}
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <div className="sm:hidden">
            <ThemeToggle />
          </div>

          {/* User menu */}
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden md:inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-accent">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {userInitial}
                  </span>
                  <span className="max-w-32 truncate">{userName}</span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    {tNav("settings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="h-4 w-4" />
                  {tNav("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-border/40 bg-background px-4 pb-4 pt-2 md:hidden">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-1">
            <div className="mb-2 sm:hidden">
              <LanguageSwitcher />
            </div>

            {isAuthenticated && (
              <>
                {allNav.map((item) => {
                  const Icon = item.icon
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {tNav(item.labelKey)}
                    </Link>
                  )
                })}

                <div className="my-2 h-px bg-border/60" />

                <div className="flex items-center gap-3 rounded-lg px-3 py-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {userInitial}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{userName}</p>
                    <p className="truncate text-xs text-muted-foreground">{session?.user?.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMobileOpen(false)
                    signOut({ callbackUrl: "/login" })
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  {tNav("logout")}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
