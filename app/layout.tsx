import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { AuthSessionProvider } from "@/components/session-provider"
import { Building2 } from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Singapore Property Sell Tracker",
  description: "Track your Singapore property investments, SSD calculations, and profit/loss analysis",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthSessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">{children}</main>

              <footer className="border-t border-border/70 bg-background/70 backdrop-blur">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                  <div className="inline-flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">PropertySellTracker</span>
                  </div>
                  <p>Track investment performance, SSD exposure, and sell timing with confidence.</p>
                </div>
              </footer>
            </div>
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
