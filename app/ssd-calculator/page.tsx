"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calculator, Clock, Info, TrendingDown } from "lucide-react"
import { formatCurrency, formatPercent, calculateSSD, getSSDCountdown } from "@/lib/utils"

export default function SSDCalculator() {
  const [propertyPrice, setPropertyPrice] = useState("")
  const [purchaseDate, setPurchaseDate] = useState("")
  const [result, setResult] = useState<{
    ssd: number
    ssdInfo: any
    netProceeds: number
  } | null>(null)

  const calculate = () => {
    if (!propertyPrice || !purchaseDate) return

    const price = parseFloat(propertyPrice)
    const ssd = calculateSSD(price, purchaseDate)
    const ssdInfo = getSSDCountdown(purchaseDate)
    const agentFees = price * 0.02
    const netProceeds = price - ssd - agentFees

    setResult({
      ssd,
      ssdInfo,
      netProceeds,
    })
  }

  const clear = () => {
    setPropertyPrice("")
    setPurchaseDate("")
    setResult(null)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
      <section className="rounded-3xl border border-border/60 bg-card/75 p-5 shadow-sm backdrop-blur sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">SSD Calculator</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">Estimate Singapore Seller&apos;s Stamp Duty and projected net sale proceeds.</p>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calculator className="h-5 w-5" />
              Calculate SSD
            </CardTitle>
            <CardDescription>Enter your sale price and original purchase date.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">Property Selling Price (SGD)</Label>
              <Input id="price" type="number" value={propertyPrice} onChange={(e) => setPropertyPrice(e.target.value)} placeholder="e.g., 800000" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase-date">Original Purchase Date</Label>
              <Input id="purchase-date" type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
            </div>

            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <Button onClick={calculate} disabled={!propertyPrice || !purchaseDate} className="w-full sm:w-auto">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate SSD
              </Button>
              <Button variant="outline" onClick={clear} className="w-full sm:w-auto">
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Info className="h-5 w-5" />
              SSD Rates in Singapore
            </CardTitle>
            <CardDescription>Current residential SSD tiers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-xl border border-red-200/60 bg-red-50/60 p-3 text-center dark:border-red-900 dark:bg-red-950/20">
                <div className="text-2xl font-bold text-red-600">12%</div>
                <div className="text-xs text-muted-foreground">1st Year</div>
              </div>
              <div className="rounded-xl border border-orange-200/60 bg-orange-50/60 p-3 text-center dark:border-orange-900 dark:bg-orange-950/20">
                <div className="text-2xl font-bold text-orange-600">8%</div>
                <div className="text-xs text-muted-foreground">2nd Year</div>
              </div>
              <div className="rounded-xl border border-amber-200/60 bg-amber-50/60 p-3 text-center dark:border-amber-900 dark:bg-amber-950/20">
                <div className="text-2xl font-bold text-amber-600">4%</div>
                <div className="text-xs text-muted-foreground">3rd Year</div>
              </div>
              <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/60 p-3 text-center dark:border-emerald-900 dark:bg-emerald-950/20">
                <div className="text-2xl font-bold text-emerald-600">0%</div>
                <div className="text-xs text-muted-foreground">4+ Years</div>
              </div>
            </div>

            <div className="space-y-1 text-sm text-muted-foreground">
              <p>SSD applies to residential properties sold within 3 years.</p>
              <p>It is calculated on selling price or market value, whichever is higher.</p>
              <p>Always verify your final liability with IRAS or a qualified advisor.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {result && (
        <div className="space-y-4 sm:space-y-5">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Calculation Results</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Card className="border-red-300/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SSD Amount</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(result.ssd)}</div>
                <p className="text-xs text-muted-foreground">{formatPercent(result.ssdInfo.currentRate)} of selling price</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Days to Lower Rate</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{result.ssdInfo.isExempt ? "Exempt" : result.ssdInfo.daysToNextTier}</div>
                <p className="text-xs text-muted-foreground">{result.ssdInfo.isExempt ? "No SSD required" : `Next rate: ${result.ssdInfo.nextRate}%`}</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-300/50 sm:col-span-2 xl:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Est. Net Proceeds</CardTitle>
                <TrendingDown className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{formatCurrency(result.netProceeds)}</div>
                <p className="text-xs text-muted-foreground">After SSD and 2% agent fees</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Breakdown</CardTitle>
              <CardDescription>Detailed view of estimated selling costs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Selling Price</span>
                <span className="font-semibold">{formatCurrency(parseFloat(propertyPrice))}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>SSD ({formatPercent(result.ssdInfo.currentRate)})</span>
                <span className="font-semibold">-{formatCurrency(result.ssd)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Agent Fees (2%)</span>
                <span className="font-semibold">-{formatCurrency(parseFloat(propertyPrice) * 0.02)}</span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between text-base font-bold text-emerald-600">
                <span>Estimated Net Proceeds</span>
                <span>{formatCurrency(result.netProceeds)}</span>
              </div>
            </CardContent>
          </Card>

          {!result.ssdInfo.isExempt && (
            <Card className="border-amber-300/50 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Clock className="h-5 w-5 text-amber-600" />
                  SSD Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                  <div className="rounded-lg bg-background/70 p-3 text-center">
                    <div className="text-xs text-muted-foreground">Years Owned</div>
                    <div className="text-xl font-bold">{result.ssdInfo.yearsOwned.toFixed(1)}</div>
                  </div>
                  <div className="rounded-lg bg-background/70 p-3 text-center">
                    <div className="text-xs text-muted-foreground">Current Rate</div>
                    <div className="text-xl font-bold text-red-600">{formatPercent(result.ssdInfo.currentRate)}</div>
                  </div>
                  <div className="rounded-lg bg-background/70 p-3 text-center">
                    <div className="text-xs text-muted-foreground">Days to Next Tier</div>
                    <div className="text-xl font-bold">{result.ssdInfo.daysToNextTier}</div>
                  </div>
                  <div className="rounded-lg bg-background/70 p-3 text-center">
                    <div className="text-xs text-muted-foreground">Next Rate</div>
                    <div className="text-xl font-bold text-emerald-600">{formatPercent(result.ssdInfo.nextRate)}</div>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-300/60 bg-amber-100/60 p-3 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-100">
                  Waiting {result.ssdInfo.daysToNextTier} more days could save
                  <span className="font-semibold text-emerald-600"> {formatCurrency((parseFloat(propertyPrice) * (result.ssdInfo.currentRate - result.ssdInfo.nextRate)) / 100)}</span>
                  in SSD.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          <strong>Disclaimer:</strong> This tool is for estimates only. SSD calculations may vary based on property type and prevailing regulations.
          Confirm final figures with IRAS guidance and professional tax advice.
        </CardContent>
      </Card>
    </div>
  )
}
