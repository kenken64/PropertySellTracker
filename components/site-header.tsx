"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { BarChart3, Building2, Calculator, Home, LogOut, Menu, Plus, Settings, UserCircle2, X } from "lucide-react"

import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", labelKey: "dashboard", icon: Home },
  { href: "/add-property", labelKey: "addProperty", icon: Plus },
  { href: "/ssd-calculator", labelKey: "ssdCalculator", icon: Calculator },
  { href: "/hdb-resale", labelKey: "hdbResaleData", icon: BarChart3 },
  { href: "/settings", labelKey: "settings", icon: Settings },
] as const

export function SiteHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: session } = useSession()
  const tNav = useTranslations("Navigation")

  const isAuthenticated = Boolean(session?.user)
  const userName = session?.user?.name || session?.user?.email || "User"

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group inline-flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary/20">
            <Building2 className="h-5 w-5" />
          </span>
          <span className="text-base font-semibold tracking-tight sm:text-lg">PropertySellTracker</span>
        </Link>

        {isAuthenticated && (
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tNav(item.labelKey)}
                </Link>
              )
            })}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-sm md:inline-flex">
                <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                <span className="max-w-44 truncate font-medium">{userName}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="hidden md:inline-flex"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {tNav("logout")}
              </Button>
            </>
          ) : null}

          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <ThemeToggle />
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border/70 bg-background/95 px-4 py-3 md:hidden">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2">
            <div className="mb-1 sm:hidden">
              <LanguageSwitcher />
            </div>

            {isAuthenticated && navItems.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tNav(item.labelKey)}
                </Link>
              )
            })}

            {isAuthenticated ? (
              <div className="mt-2 rounded-xl border border-border/70 bg-card/70 p-3">
                <p className="truncate text-sm font-medium">{userName}</p>
                <Button
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={() => {
                    setMobileOpen(false)
                    signOut({ callbackUrl: "/login" })
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {tNav("logout")}
                </Button>
              </div>
            ) : null}
          </div>
        </nav>
      )}
    </header>
  )
}
