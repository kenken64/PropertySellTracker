"use client"

import * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { differenceInDays, parseISO } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calculator, Clock, DollarSign, Edit, TrendingDown, TrendingUp } from "lucide-react"
import {
  formatCurrency,
  formatPercent,
  calculateNetProfit,
  calculateROI,
  calculateAnnualizedReturn,
  calculateTotalCost,
  calculateBreakEvenPrice,
  calculateSSD,
  calculateCPFAccruedInterest,
  getSSDCountdown,
  calculateMortgageInterestPaid,
  calculateGrossYield,
  calculateNetYield,
  calculateSellNowProceeds,
  calculateHoldProceeds,
  getSellRecommendation,
} from "@/lib/utils"
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

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
  monthly_rental: number
  transactions: any[]
}

export default function PropertyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentValue, setCurrentValue] = useState("")
  const [monthlyRental, setMonthlyRental] = useState("")
  const [updating, setUpdating] = useState(false)
  const [appreciationRate, setAppreciationRate] = useState(3)
  const router = useRouter()

  useEffect(() => {
    fetchProperty()
  }, [id])

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/properties/${id}`)
      if (response.ok) {
        const data = await response.json()
        setProperty(data)
        setCurrentValue(data.current_value?.toString() || data.purchase_price.toString())
        setMonthlyRental((data.monthly_rental || 0).toString())
      } else if (response.status === 404) {
        router.push("/")
      }
    } catch (error) {
      console.error("Error fetching property:", error)
    } finally {
      setLoading(false)
    }
  }

  const updatePropertySnapshot = async () => {
    if (!property || !currentValue) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...property,
          current_value: parseFloat(currentValue),
          monthly_rental: parseFloat(monthlyRental) || 0,
        }),
      })

      if (response.ok) {
        const updated = await response.json()
        setProperty(updated)
      }
    } catch (error) {
      console.error("Error updating property:", error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">Loading property details...</div>
  }

  if (!property) {
    return <div className="py-8 text-center">Property not found.</div>
  }

  const totalCost = calculateTotalCost(property)
  const netProfit = calculateNetProfit(property)
  const roi = calculateROI(property)
  const annualizedReturn = calculateAnnualizedReturn(property)
  const breakEvenPrice = calculateBreakEvenPrice(property)
  const ssdInfo = getSSDCountdown(property.purchase_date)
  const salePrice = property.current_value || property.purchase_price
  const ssdAmount = calculateSSD(salePrice, property.purchase_date)
  const cpfAccruedInterest = calculateCPFAccruedInterest(property.cpf_amount, property.purchase_date)
  const mortgageInterestPaid = calculateMortgageInterestPaid(
    property.mortgage_amount,
    property.mortgage_interest_rate,
    property.mortgage_tenure,
    property.purchase_date
  )

  const annualRental = (property.monthly_rental || 0) * 12
  const annualExpenses = 3000 + annualRental * 0.01 + 300
  const grossYield = calculateGrossYield(property.monthly_rental || 0, salePrice)
  const netYield = calculateNetYield(property.monthly_rental || 0, salePrice, annualExpenses)

  const sellNowProceeds = calculateSellNowProceeds(property)
  const holdOneYearProceeds = calculateHoldProceeds(property, 12, appreciationRate)
  const holdTwoYearProceeds = calculateHoldProceeds(property, 24, appreciationRate)

  const daysToSsdFree = Math.max(0, 1095 - differenceInDays(new Date(), parseISO(property.purchase_date)))
  const monthsToSsdFree = Math.ceil(daysToSsdFree / 30.44)
  const holdSsdFreeProceeds = calculateHoldProceeds(property, monthsToSsdFree, appreciationRate)

  const sellRecommendation = getSellRecommendation({
    ...property,
    current_value: salePrice,
  })

  const projectionData = useMemo(() => {
    const data = []
    const startDate = new Date(property.purchase_date)
    const currentDate = new Date()

    data.push({ date: startDate.getFullYear().toString(), value: property.purchase_price, type: "historical" })
    data.push({ date: currentDate.getFullYear().toString(), value: salePrice, type: "current" })

    for (let i = 1; i <= 5; i++) {
      const futureDate = new Date(currentDate.getFullYear() + i, 0, 1)
      const projectedValue = salePrice * Math.pow(1 + appreciationRate / 100, i)
      data.push({ date: futureDate.getFullYear().toString(), value: projectedValue, type: "projection" })
    }

    return data
  }, [appreciationRate, property.purchase_date, property.purchase_price, salePrice])

  const sellRows = [
    { label: "Sell Now", months: 0, proceeds: sellNowProceeds },
    { label: "Hold 1 Year", months: 12, proceeds: holdOneYearProceeds },
    { label: "Hold 2 Years", months: 24, proceeds: holdTwoYearProceeds },
    { label: "Hold Until SSD-Free", months: monthsToSsdFree, proceeds: holdSsdFreeProceeds },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
      <section className="rounded-3xl border border-border/60 bg-card/75 p-5 shadow-sm backdrop-blur sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-wrap items-start gap-3 sm:gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">{property.name}</h1>
              <p className="text-sm text-muted-foreground sm:text-base">{property.address}</p>
              <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{property.type}</span>
            </div>
          </div>
          <Button variant="outline" className="w-full lg:w-auto">
            <Edit className="mr-2 h-4 w-4" />
            Edit Property
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="metric-tile">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
            <p className="text-xs text-muted-foreground">Including all costs</p>
          </CardContent>
        </Card>

        <Card className="metric-tile">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{formatCurrency(salePrice)}</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Input type="number" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} placeholder="Update value" className="h-9 text-xs" />
              <Input type="number" value={monthlyRental} onChange={(e) => setMonthlyRental(e.target.value)} placeholder="Monthly rental" className="h-9 text-xs" />
            </div>
            <Button size="sm" onClick={updatePropertySnapshot} disabled={updating} className="h-9 w-full">
              {updating ? "Updating..." : "Update Value + Rental"}
            </Button>
          </CardContent>
        </Card>

        <Card className="metric-tile">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net P&L</CardTitle>
            {netProfit >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? "profit-positive" : "profit-negative"}`}>{formatCurrency(netProfit)}</div>
            <p className="text-xs text-muted-foreground">ROI {formatPercent(roi)} | Annual {formatPercent(annualizedReturn)}</p>
          </CardContent>
        </Card>

        <Card className="metric-tile">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Break Even</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(breakEvenPrice)}</div>
            <p className="text-xs text-muted-foreground">Estimated with SSD</p>
          </CardContent>
        </Card>
      </section>

      {!ssdInfo.isExempt && (
        <Card className="border-amber-300/60 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-lg">Seller&apos;s Stamp Duty (SSD)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Current Rate</p>
                <p className="text-2xl font-bold text-amber-600">{ssdInfo.currentRate}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Days to Next Tier</p>
                <p className="text-2xl font-bold">{ssdInfo.daysToNextTier}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Next Rate</p>
                <p className="text-2xl font-bold text-emerald-500">{ssdInfo.nextRate}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">SSD Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(ssdAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 gap-1 md:grid-cols-5">
          <TabsTrigger value="overview" className="w-full">Overview</TabsTrigger>
          <TabsTrigger value="financials" className="w-full">Financials</TabsTrigger>
          <TabsTrigger value="sell-analysis" className="w-full">Sell Analysis</TabsTrigger>
          <TabsTrigger value="projections" className="w-full">Projections</TabsTrigger>
          <TabsTrigger value="transactions" className="w-full">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-semibold">{property.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Purchase Date</p>
                  <p className="font-semibold">{new Date(property.purchase_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Years Owned</p>
                  <p className="font-semibold">{ssdInfo.yearsOwned.toFixed(1)} years</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Purchase Price</p>
                  <p className="font-semibold">{formatCurrency(property.purchase_price)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Monthly Rental</p>
                  <p className="font-semibold">{formatCurrency(property.monthly_rental || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Annual Rental</p>
                  <p className="font-semibold">{formatCurrency(annualRental)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purchase Price</span>
                  <span className="font-semibold">{formatCurrency(property.purchase_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stamp Duty</span>
                  <span className="font-semibold">{formatCurrency(property.stamp_duty)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Renovation</span>
                  <span className="font-semibold">{formatCurrency(property.renovation_cost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Agent Fees</span>
                  <span className="font-semibold">{formatCurrency(property.agent_fees)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mortgage Interest (Paid)</span>
                  <span className="font-semibold">{formatCurrency(mortgageInterestPaid)}</span>
                </div>
                {property.cpf_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CPF Accrued Interest</span>
                    <span className="font-semibold">{formatCurrency(cpfAccruedInterest)}</span>
                  </div>
                )}
                <hr className="border-border" />
                <div className="flex justify-between text-base font-bold">
                  <span>Total Cost</span>
                  <span>{formatCurrency(totalCost)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financials" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Investment Returns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Investment</span>
                  <span className="font-semibold">{formatCurrency(totalCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Value</span>
                  <span className="font-semibold">{formatCurrency(salePrice)}</span>
                </div>
                <div className={`flex justify-between ${netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  <span>Net Profit/Loss</span>
                  <span className="font-semibold">{formatCurrency(netProfit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ROI</span>
                  <span className="font-semibold">{formatPercent(roi)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annualized Return</span>
                  <span className="font-semibold">{formatPercent(annualizedReturn)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rental Yield</CardTitle>
                <CardDescription>Gross and net yield based on current value and annual expense estimate.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Rental</span>
                  <span className="font-semibold">{formatCurrency(property.monthly_rental || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annual Expenses</span>
                  <span className="font-semibold">{formatCurrency(annualExpenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gross Yield</span>
                  <span className="font-semibold">{formatPercent(grossYield)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Net Yield</span>
                  <span className="font-semibold">{formatPercent(netYield)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Annual expenses estimate: maintenance S$3,000 + property tax (1% of annual value) + insurance S$300.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sell-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sell Now vs Hold</CardTitle>
              <CardDescription>Includes SSD impact, additional mortgage interest during hold, and 3% opportunity cost on sale proceeds.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Annual appreciation rate</span>
                  <span>{appreciationRate.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="0.5"
                  value={appreciationRate}
                  onChange={(e) => setAppreciationRate(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-2 py-2 font-semibold">Scenario</th>
                      <th className="px-2 py-2 font-semibold">Hold Duration</th>
                      <th className="px-2 py-2 text-right font-semibold">Projected Net Proceeds</th>
                      <th className="px-2 py-2 text-right font-semibold">Delta vs Sell Now</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellRows.map((row) => {
                      const delta = row.proceeds - sellNowProceeds
                      return (
                        <tr key={row.label} className="border-b border-border/60">
                          <td className="px-2 py-2 font-medium">{row.label}</td>
                          <td className="px-2 py-2">{row.months} months</td>
                          <td className="px-2 py-2 text-right font-semibold">{formatCurrency(row.proceeds)}</td>
                          <td className={`px-2 py-2 text-right font-semibold ${delta >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {delta >= 0 ? "+" : ""}
                            {formatCurrency(delta)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
                <p className="font-semibold">{sellRecommendation.message}</p>
                <p className="mt-1 text-muted-foreground">Best scenario: {sellRecommendation.bestScenario}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Value Projection</CardTitle>
              <CardDescription>Historical, current, and projected values using {appreciationRate.toFixed(1)}% annual growth.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectionData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} width={50} />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), "Value"]} labelFormatter={(label) => `Year: ${label}`} />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>All transactions related to this property.</CardDescription>
            </CardHeader>
            <CardContent>
              {property.transactions && property.transactions.length > 0 ? (
                <div className="space-y-2.5">
                  {property.transactions.map((transaction) => (
                    <div key={transaction.id} className="flex flex-col gap-2 rounded-xl border border-border/70 p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()} | {transaction.type}
                        </p>
                      </div>
                      <span className="font-semibold">{formatCurrency(transaction.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">No transactions recorded.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
