import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"
import { Building2 } from "lucide-react"

import "./globals.css"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ErrorBoundary } from "@/components/error-boundary"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { AuthSessionProvider } from "@/components/session-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Singapore Property Sell Tracker",
  description: "Track your Singapore property investments, SSD calculations, and profit/loss analysis",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthSessionProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <div className="flex min-h-screen flex-col">
                <SiteHeader />
                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
                  <ErrorBoundary>{children}</ErrorBoundary>
                </main>

                <footer className="border-t border-border/70 bg-background/70 backdrop-blur">
                  <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <div className="inline-flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span className="font-medium">PropertySellTracker</span>
                    </div>
                    <p>{messages.Layout.footerText}</p>
                  </div>
                </footer>
              </div>
            </ThemeProvider>
          </AuthSessionProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
