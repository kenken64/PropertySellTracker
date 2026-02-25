"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, DollarSign, Eye, Plus, TrendingDown, TrendingUp } from "lucide-react"
import { formatCurrency, formatPercent, calculateNetProfit, calculateROI, calculateTotalCost, getSSDCountdown } from "@/lib/utils"

interface Property {
  id: number
  name: string
  address: string
  type: string
  purchase_price: number
  purchase_date: string
  current_value: number
  stamp_duty: number
  renovation_cost: number
  agent_fees: number
  mortgage_amount: number
  mortgage_interest_rate: number
  mortgage_tenure: number
  cpf_amount: number
}

export default function Dashboard() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const response = await fetch("/api/properties")
      const data = await response.json()
      setProperties(data)
    } catch (error) {
      console.error("Error fetching properties:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalInvestment = properties.reduce((sum, property) => sum + calculateTotalCost(property), 0)
  const totalCurrentValue = properties.reduce((sum, property) => sum + (property.current_value || property.purchase_price), 0)
  const totalProfit = totalCurrentValue - totalInvestment

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">Loading dashboard...</div>
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="rounded-3xl border border-border/60 bg-card/75 p-5 shadow-sm backdrop-blur sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">Property Investment Dashboard</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Monitor portfolio growth, SSD exposure, and sell-timing decisions from one place.
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/add-property">
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="metric-tile">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
          </CardContent>
        </Card>

        <Card className="metric-tile">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvestment)}</div>
          </CardContent>
        </Card>

        <Card className="metric-tile">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCurrentValue)}</div>
          </CardContent>
        </Card>

        <Card className="metric-tile">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net P&L</CardTitle>
            {totalProfit >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? "profit-positive" : "profit-negative"}`}>{formatCurrency(totalProfit)}</div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4 sm:space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Your Properties</h2>
        </div>

        {properties.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Plus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No properties yet</h3>
                  <p className="text-muted-foreground">Start tracking your Singapore property investments.</p>
                </div>
                <Button asChild>
                  <Link href="/add-property">Add Your First Property</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            {properties.map((property) => {
              const netProfit = calculateNetProfit(property)
              const roi = calculateROI(property)
              const ssdInfo = getSSDCountdown(property.purchase_date)

              return (
                <Card key={property.id} className="h-full">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <CardTitle className="truncate text-lg sm:text-xl">{property.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{property.address}</CardDescription>
                      </div>
                      <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{property.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Purchased {new Date(property.purchase_date).toLocaleDateString()}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">Purchase</p>
                        <p className="mt-1 font-semibold">{formatCurrency(property.purchase_price)}</p>
                      </div>
                      <div className="rounded-xl bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">Current</p>
                        <p className="mt-1 font-semibold">{formatCurrency(property.current_value || property.purchase_price)}</p>
                      </div>
                      <div className="rounded-xl bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">Net P&L</p>
                        <p className={`mt-1 font-semibold ${netProfit >= 0 ? "profit-positive" : "profit-negative"}`}>{formatCurrency(netProfit)}</p>
                      </div>
                      <div className="rounded-xl bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">ROI</p>
                        <p className={`mt-1 font-semibold ${roi >= 0 ? "profit-positive" : "profit-negative"}`}>{formatPercent(roi)}</p>
                      </div>
                    </div>

                    {!ssdInfo.isExempt && (
                      <div className="rounded-xl border border-amber-300/50 bg-amber-100/50 p-3 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          <span>
                            SSD {ssdInfo.currentRate}% with {ssdInfo.daysToNextTier} days to {ssdInfo.nextRate}% tier.
                          </span>
                        </div>
                      </div>
                    )}

                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/property/${property.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
