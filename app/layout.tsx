import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'
import { Home, Plus, Calculator, Building } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Singapore Property Sell Tracker',
  description: 'Track your Singapore property investments, SSD calculations, and profit/loss analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background">
            {/* Navigation */}
            <header className="border-b">
              <div className="container mx-auto px-4 py-4">
                <nav className="flex items-center justify-between">
                  <Link href="/" className="flex items-center space-x-2">
                    <Building className="h-6 w-6" />
                    <span className="font-bold text-xl">SG Property Tracker</span>
                  </Link>
                  
                  <div className="hidden md:flex items-center space-x-6">
                    <Link href="/" className="flex items-center space-x-1 hover:text-primary">
                      <Home className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link href="/add-property" className="flex items-center space-x-1 hover:text-primary">
                      <Plus className="h-4 w-4" />
                      <span>Add Property</span>
                    </Link>
                    <Link href="/ssd-calculator" className="flex items-center space-x-1 hover:text-primary">
                      <Calculator className="h-4 w-4" />
                      <span>SSD Calculator</span>
                    </Link>
                  </div>

                  <ThemeToggle />
                </nav>
              </div>
            </header>

            {/* Mobile Navigation */}
            <div className="md:hidden border-b bg-muted/50">
              <div className="container mx-auto px-4 py-2">
                <div className="flex items-center justify-around">
                  <Link href="/" className="flex flex-col items-center space-y-1 p-2 rounded hover:bg-accent">
                    <Home className="h-4 w-4" />
                    <span className="text-xs">Home</span>
                  </Link>
                  <Link href="/add-property" className="flex flex-col items-center space-y-1 p-2 rounded hover:bg-accent">
                    <Plus className="h-4 w-4" />
                    <span className="text-xs">Add</span>
                  </Link>
                  <Link href="/ssd-calculator" className="flex flex-col items-center space-y-1 p-2 rounded hover:bg-accent">
                    <Calculator className="h-4 w-4" />
                    <span className="text-xs">SSD Calc</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}